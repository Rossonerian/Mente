from collections import defaultdict, deque
from threading import Lock
from time import monotonic

from fastapi import HTTPException, Request, status


class FixedWindowRateLimiter:
    """Small in-process limiter for a single-instance MVP deployment."""

    def __init__(self) -> None:
        self._attempts: dict[str, deque[float]] = defaultdict(deque)
        self._lock = Lock()

    def check(self, key: str, limit: int, window_seconds: int = 60) -> None:
        now = monotonic()
        cutoff = now - window_seconds
        with self._lock:
            attempts = self._attempts[key]
            while attempts and attempts[0] <= cutoff:
                attempts.popleft()
            if len(attempts) >= limit:
                retry_after = max(1, round(window_seconds - (now - attempts[0])))
                raise HTTPException(
                    status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                    detail="Too many attempts; try again shortly",
                    headers={"Retry-After": str(retry_after)},
                )
            attempts.append(now)


def enforce_rate_limit(request: Request, bucket: str, limit: int) -> None:
    client_host = request.client.host if request.client else "unknown"
    request.app.state.rate_limiter.check(f"{bucket}:{client_host}", limit)
