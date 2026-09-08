from __future__ import annotations

import json
from dataclasses import dataclass
from urllib.error import HTTPError, URLError
from urllib.parse import quote, urlparse
from urllib.request import Request, urlopen


class StorageAdapterError(RuntimeError):
    """A redacted, user-safe storage failure."""


@dataclass(frozen=True)
class StorageObject:
    key: str
    media_type: str
    size_bytes: int
    checksum_sha256: str | None = None


class SupabaseStorageAdapter:
    """Small server-only adapter for the private Supabase Storage bucket."""

    def __init__(self, supabase_url: str | None, service_role_key: str | None, bucket: str) -> None:
        supabase_url_value = supabase_url or ""
        parsed = urlparse(supabase_url_value)
        self._base_url = (
            f"{supabase_url_value.rstrip('/')}/storage/v1"
            if parsed.scheme in {"http", "https"} and parsed.netloc and not parsed.query and not parsed.fragment
            else None
        )
        self._service_role_key = service_role_key
        self.bucket = bucket

    def upload(self, key: str, content: bytes, media_type: str) -> StorageObject:
        response = self._request(
            "POST",
            f"/object/{quote(self.bucket, safe='')}/{quote(key, safe='/')}",
            body=content,
            content_type=media_type,
            extra_headers={"x-upsert": "false"},
        )
        self._raise_for_status(response)
        return StorageObject(key=key, media_type=media_type, size_bytes=len(content))

    def exists(self, key: str) -> bool:
        response = self._request("HEAD", f"/object/{quote(self.bucket, safe='')}/{quote(key, safe='/')}")
        return response.status == 200

    def signed_download_url(self, key: str, expires_in: int) -> str:
        response = self._request(
            "POST",
            f"/object/sign/{quote(self.bucket, safe='')}/{quote(key, safe='/')}",
            body=json.dumps({"expiresIn": expires_in}).encode("utf-8"),
            content_type="application/json",
        )
        payload = self._read_json(response)
        signed_url = payload.get("signedURL")
        if not isinstance(signed_url, str) or not signed_url:
            raise StorageAdapterError("Storage did not return a signed URL")
        if signed_url.startswith("/") and self._base_url:
            return f"{self._base_url}{signed_url}"
        return signed_url

    def delete(self, key: str) -> None:
        response = self._request(
            "DELETE",
            f"/object/{quote(self.bucket, safe='')}/{quote(key, safe='/')}",
        )
        self._raise_for_status(response)

    def _request(
        self,
        method: str,
        path: str,
        *,
        body: bytes | None = None,
        content_type: str | None = None,
        extra_headers: dict[str, str] | None = None,
    ) -> _StorageResponse:
        if not self._base_url or not self._service_role_key:
            raise StorageAdapterError("Private storage is not configured")
        headers = {
            "Authorization": f"Bearer {self._service_role_key}",
            "apikey": self._service_role_key,
        }
        if content_type:
            headers["Content-Type"] = content_type
        if extra_headers:
            headers.update(extra_headers)
        request = Request(f"{self._base_url}{path}", data=body, headers=headers, method=method)
        try:
            with urlopen(request, timeout=15) as response:  # nosec B310
                return _StorageResponse(response.status, response.read())
        except HTTPError as exc:
            return _StorageResponse(exc.code, exc.read())
        except URLError as exc:
            raise StorageAdapterError("Storage service is unavailable") from exc

    @staticmethod
    def _raise_for_status(response: _StorageResponse) -> None:
        if not 200 <= response.status < 300:
            raise StorageAdapterError(f"Storage request failed with status {response.status}")

    @classmethod
    def _read_json(cls, response: _StorageResponse) -> dict[str, object]:
        cls._raise_for_status(response)
        try:
            payload = json.loads(response.body.decode("utf-8"))
        except (UnicodeDecodeError, json.JSONDecodeError) as exc:
            raise StorageAdapterError("Storage returned an invalid response") from exc
        if not isinstance(payload, dict):
            raise StorageAdapterError("Storage returned an invalid response")
        return payload


@dataclass(frozen=True)
class _StorageResponse:
    status: int
    body: bytes
