FROM python:3.11

ENV POETRY_NO_INTERACTION=1 \
	POETRY_VIRTUALENVS_IN_PROJECT=1 \
	POETRY_VIRTUALENVS_CREATE=1 \
	PYTHONUNBUFFERED="true"

# Install Poetry
RUN pip install poetry==2.0.1

# Setup work directory
WORKDIR /app

# Copy pyproject and lock files first (leverage Docker layer caching)
COPY pyproject.toml poetry.lock* /app/

# Install project dependencies (without installing the package itself)
RUN --mount=type=cache,target=/root/.cache/pypoetry poetry install --without dev

COPY . /app

ENV PATH="/app/.venv/bin:$PATH"
# Expose FastAPI port
EXPOSE 8000

CMD ["fastapi", "run", "./app/main.py", "--port", "8000","--workers","2"]