"""Run both real HTTP services against disposable synthetic data; never dial."""

import argparse
import json
import os
import secrets
import socket
import sqlite3
import subprocess
import sys
import tempfile
import time
from contextlib import closing
from datetime import datetime, timezone
from pathlib import Path
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen

ROOT = Path(__file__).resolve().parents[1]


def serve_backend():
    sys.path.insert(0, str(ROOT / "backend"))
    import uvicorn
    from app.config import Settings
    from app.main import create_app
    from app.security import SupabaseTokenError, VerifiedSupabaseClaims
    settings = Settings(_env_file=None)
    app = create_app(settings)
    class SyntheticVerifier:
        def verify(self, token):
            if token != "synthetic-smoke-token":
                raise SupabaseTokenError("Invalid synthetic token")
            return VerifiedSupabaseClaims("71d1a67f-a892-4ef1-b06d-489c69b455d0", "synthetic@example.com", "authenticated")
    app.state.caregiver_token_verifier = SyntheticVerifier()
    uvicorn.run(app, host="127.0.0.1", port=int(os.environ["SMOKE_PORT"]), access_log=False)


def free_port():
    with socket.socket() as sock:
        sock.bind(("127.0.0.1", 0))
        return sock.getsockname()[1]


def request(base, path, payload=None, headers=None, method=None):
    req = Request(base + path, data=json.dumps(payload).encode() if payload is not None else None,
                  headers={"Content-Type": "application/json", **(headers or {})}, method=method)
    try:
        with urlopen(req, timeout=10) as response:
            return response.status, json.load(response)
    except HTTPError as error:
        raw = error.read()
        try:
            return error.code, json.loads(raw)
        except ValueError:
            return error.code, {"detail": "Non-JSON error response"}


def wait_ready(base, process):
    for _ in range(150):
        if process.poll() is not None:
            raise RuntimeError("Synthetic service exited before becoming ready")
        try:
            if request(base, "/health")[0] == 200:
                return
        except (URLError, OSError):
            pass
        time.sleep(.1)
    raise RuntimeError("Synthetic service startup timed out")


def run_smoke(bot):
    bot = bot.resolve()
    bot_python = bot / ".venv" / ("Scripts/python.exe" if os.name == "nt" else "bin/python")
    if not bot_python.is_file():
        raise RuntimeError("Call-bot virtual environment is missing")
    results = []
    with tempfile.TemporaryDirectory(prefix="mente-callbot-smoke-") as directory:
        work = Path(directory)
        backend_port, bot_port = free_port(), free_port()
        backend_base, bot_base = f"http://127.0.0.1:{backend_port}", f"http://127.0.0.1:{bot_port}"
        key, operator = secrets.token_urlsafe(36), secrets.token_urlsafe(36)
        env = os.environ.copy()
        # Override all environment-specific boundaries, and run the backend away from any real .env.
        env.update({"ENVIRONMENT": "test", "DATABASE_URL": f"sqlite:///{(work / 'mente.db').as_posix()}",
                    "MIGRATION_DATABASE_URL": "", "AUTO_CREATE_TABLES": "true", "SUPABASE_URL": "",
                    "SUPABASE_PUBLISHABLE_KEY": "", "SUPABASE_SERVICE_ROLE_KEY": "", "CALL_BOT_API_KEY": key,
                    "SMOKE_PORT": str(backend_port)})
        env.pop("DEVELOPMENT_ADMIN_CODE", None)
        env.pop("DEVELOPMENT_PATIENT_ID", None)
        bot_env = os.environ.copy()
        bot_env.update({"MENTE_API_BASE_URL": backend_base + "/v1", "MENTE_CALL_BOT_KEY": key,
                        "SERVICE_A_TRIGGER_AUTH_TOKEN": operator, "SERVICE_A_DATABASE_PATH": str(work / 'bot.sqlite3'),
                        "SERVICE_A_REAL_CALLS_ENABLED": "false", "SERVICE_A_SCHEDULER_ENABLED": "false",
                        "TWILIO_ACCOUNT_SID": "", "TWILIO_AUTH_TOKEN": "", "TWILIO_PUBLIC_BASE_URL": ""})
        children = []
        logs = []
        try:
            for command, cwd, child_env, name in [
                ([sys.executable, str(Path(__file__).resolve()), "--serve-smoke-backend"], work, env, "backend"),
                ([str(bot_python), "-m", "uvicorn", "app.main:app", "--host", "127.0.0.1", "--port", str(bot_port), "--no-access-log"], bot, bot_env, "bot"),
            ]:
                log = (work / f"{name}.log").open("w", encoding="utf-8")
                logs.append(log)
                children.append(subprocess.Popen(command, cwd=cwd, env=child_env, stdout=log, stderr=log,
                    creationflags=subprocess.CREATE_NO_WINDOW if os.name == "nt" else 0))
            wait_ready(backend_base, children[0])
            wait_ready(bot_base, children[1])
            caregiver = {"Authorization": "Bearer synthetic-smoke-token"}
            operator_headers = {"X-Service-A-Trigger-Token": operator}
            bot_headers = {"X-Call-Bot-Key": key}
            assert request(backend_base, "/v1/auth/profile", {"display_name": "Synthetic caregiver"}, caregiver)[0] == 201
            status, family = request(backend_base, "/v1/families", {"name": "Synthetic integration family"}, caregiver)
            assert status == 201
            status, patient = request(backend_base, f"/v1/families/{family['id']}/patients",
                {"preferred_name": "Synthetic patient", "phone_e164": "+15551234567", "timezone": "Asia/Kolkata"}, caregiver)
            assert status == 201
            patient_id = patient["id"]
            memory = {"memory_type": "PERSON", "prompt_text": "Who is your synthetic sibling?", "accepted_answers": ["Synthetic sibling"],
                      "consent_recorded_at": datetime.now(timezone.utc).isoformat()}
            status, saved = request(backend_base, f"/v1/patients/{patient_id}/memories", memory, caregiver)
            assert status == 201
            status, _inactive = request(backend_base, f"/v1/patients/{patient_id}/memories", {**memory, "active": False}, caregiver)
            assert status == 201
            status, ctx = request(backend_base, f"/v1/integrations/call-bot/patients/{patient_id}/context", headers=bot_headers)
            assert status == 200 and [m["id"] for m in ctx["memories"]] == [saved["id"]]
            results.append("Mente patient context and consent/active filtering")
            schedule = {"local_time": "09:00", "timezone": "Asia/Kolkata", "days_of_week": list(range(7)), "language_code": "en-IN", "active": True}
            assert request(backend_base, f"/v1/patients/{patient_id}/call-schedule", schedule, caregiver, "PUT")[0] == 200
            assert request(bot_base, "/v1/mente/status", headers=operator_headers)[1]["active_schedule_count"] == 1
            assert request(bot_base, "/v1/calls/trigger", {"patient_id": patient_id}, operator_headers)[0] == 503
            results.append("Shared integration authentication; real dialing disabled")
            # Responses need not be accurate: prove actual memory metrics and backend calculation over HTTP.
            body = {"patient_id": patient_id, "session_id": "mock-synthetic-http", "responses": ["yes", "wrong", "wrong", "wrong"]}
            status, call = request(bot_base, "/v1/calls/mock", body, operator_headers)
            assert status == 200 and call["delivery"]["state"] == "SENT"
            backend_id = call["delivery"]["backend_session_id"]
            with closing(sqlite3.connect(work / "bot.sqlite3")) as db:
                payload = json.loads(db.execute("SELECT payload_json FROM mente_outbox WHERE session_id=?", (body["session_id"],)).fetchone()[0])
            assert payload["patient_id"] == patient_id and payload["external_id"] == body["session_id"]
            # A second deterministic call reaches every memory without depending on shuffled prompt order.
            skipped = {"patient_id": patient_id, "session_id": "mock-synthetic-memory", "responses": ["yes", *("skip" for _ in range(8))]}
            assert request(bot_base, "/v1/calls/mock", skipped, operator_headers)[1]["delivery"]["state"] == "SENT"
            with closing(sqlite3.connect(work / "bot.sqlite3")) as db:
                prompts = [r[0] for r in db.execute("SELECT prompt FROM call_questions WHERE session_id=?", (skipped["session_id"],))]
            assert memory["prompt_text"] in prompts
            status, replay = request(backend_base, "/v1/integrations/call-bot/sessions", payload, bot_headers)
            assert status == 200 and replay["id"] == backend_id
            assert request(backend_base, "/v1/integrations/call-bot/sessions", {**payload, "termination_reason": "CHANGED"}, bot_headers)[0] == 409
            status, overview = request(backend_base, f"/v1/patients/{patient_id}/overview", headers=caregiver)
            assert status == 200 and any(s["id"] == backend_id and s["source"] == "CALL" for s in overview["recent_sessions"])
            assert request(bot_base, "/v1/calls/mock", body, operator_headers)[1] == call
            results.append("Actual memory plan, result delivery, backend overview, idempotent replay/conflict")
            assert request(backend_base, f"/v1/patients/{patient_id}/notification-preferences", {"reminders_paused": True}, caregiver, "PUT")[0] == 200
            assert request(bot_base, "/v1/mente/status", headers=operator_headers)[1]["active_schedule_count"] == 0
            assert request(bot_base, "/v1/calls/due", {}, operator_headers)[1] == []
            results.append("Paused reminders disappear from authoritative schedules")
        except Exception:
            for log in logs:
                log.flush()
            for name in ("backend", "bot"):
                path = work / f"{name}.log"
                if path.exists():
                    print(path.read_text(encoding="utf-8")[-2000:], file=sys.stderr)
            raise
        finally:
            for child in reversed(children):
                if os.name == "nt" and child.poll() is None:
                    # Windows venv launchers have child interpreters. Stop only this owned process tree.
                    subprocess.run(["taskkill", "/PID", str(child.pid), "/T", "/F"], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, check=False)
                else:
                    child.terminate()
                try:
                    child.wait(timeout=10)
                except subprocess.TimeoutExpired:
                    child.kill()
                    child.wait(timeout=10)
            for log in logs:
                log.close()
    print(json.dumps({"status": "PASS", "checks": results, "real_calls": 0, "real_domain_writes": 0}, indent=2))


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--serve-smoke-backend", action="store_true", help=argparse.SUPPRESS)
    parser.add_argument("--bot-path", type=Path, default=ROOT.parent / "call bot" / "mdoner-service-a-call-bot")
    args = parser.parse_args()
    if args.serve_smoke_backend:
        serve_backend()
    else:
        run_smoke(args.bot_path)
