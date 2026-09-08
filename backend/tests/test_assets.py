from collections.abc import Generator

import pytest
from fastapi.testclient import TestClient


class FakeStorage:
    def __init__(self) -> None:
        self.keys: set[str] = set()

    def upload(self, key: str, content: bytes, media_type: str):
        self.keys.add(key)
        return type("StorageObject", (), {"key": key, "media_type": media_type, "size_bytes": len(content)})()

    def signed_download_url(self, key: str, expires_in: int) -> str:
        assert key in self.keys
        return f"https://storage.example.test/signed/{expires_in}"

    def delete(self, key: str) -> None:
        self.keys.discard(key)


@pytest.fixture
def fake_storage(client: TestClient) -> Generator[FakeStorage, None, None]:
    storage = FakeStorage()
    client.app.state.storage_adapter = storage
    yield storage


def test_asset_upload_rejects_executable_mime(
    client: TestClient, caregiver_setup: dict, fake_storage: FakeStorage
) -> None:
    response = client.post(
        f"/v1/patients/{caregiver_setup['patient_id']}/assets",
        headers=caregiver_setup["headers"],
        files={"file": ("script.exe", b"not executable", "application/octet-stream")},
        data={"consent_recorded_at": "2026-09-09T00:00:00Z"},
    )
    assert response.status_code == 415
    assert not fake_storage.keys


def test_asset_upload_signed_url_and_delete_are_consent_and_membership_scoped(
    client: TestClient, caregiver_setup: dict, fake_storage: FakeStorage
) -> None:
    response = client.post(
        f"/v1/patients/{caregiver_setup['patient_id']}/assets",
        headers=caregiver_setup["headers"],
        files={"file": ("family-photo.png", b"synthetic asset", "image/png")},
        data={"consent_recorded_at": "2026-09-09T00:00:00Z"},
    )
    assert response.status_code == 201, response.text
    asset = response.json()
    assert asset["storage_key"].startswith(f"{caregiver_setup['family_id']}/{caregiver_setup['patient_id']}/")
    assert "family-photo" not in asset["storage_key"]

    signed = client.post(
        f"/v1/patients/{caregiver_setup['patient_id']}/assets/{asset['id']}/signed-url",
        headers=caregiver_setup["headers"],
    )
    assert signed.status_code == 200
    assert signed.json()["expires_in"] == 300

    deleted = client.delete(
        f"/v1/patients/{caregiver_setup['patient_id']}/assets/{asset['id']}",
        headers=caregiver_setup["headers"],
    )
    assert deleted.status_code == 200
    assert not fake_storage.keys

    signed_after_delete = client.post(
        f"/v1/patients/{caregiver_setup['patient_id']}/assets/{asset['id']}/signed-url",
        headers=caregiver_setup["headers"],
    )
    assert signed_after_delete.status_code == 404
