FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /app

COPY requirements.lock ./
RUN python -m pip install --no-cache-dir --upgrade pip \
    && python -m pip install --no-cache-dir -r requirements.lock

COPY app ./app
COPY alembic.ini ./
COPY alembic ./alembic

RUN useradd --create-home --shell /usr/sbin/nologin mente \
    && chown -R mente:mente /app
USER mente

EXPOSE 8000
# Run `alembic upgrade head` as a separately authorized release step with the
# migration credential. The runtime process must not own schema migrations.
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
