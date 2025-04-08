from fastapi import Request
from fastapi.responses import JSONResponse
import logging
from typing import Optional


class APIException(Exception):
    def __init__(
        self,
        status_code: int,
        message: str,
        error_code: Optional[str] = None,
        detail: Optional[str] = None,
        hint: Optional[str] = None,
    ):
        self.status_code = status_code
        self.message = message
        self.error_code = error_code
        self.detail = detail
        self.hint = hint


async def api_exception_handler(request: Request, exc: APIException):
    error_response = {
        "error": {
            "message": exc.message,
            "code": exc.error_code,
            "detail": exc.detail,
            "hint": exc.hint,
        }
    }
    logging.error(f"APIException: {error_response}")
    return JSONResponse(status_code=exc.status_code, content=error_response)


async def generic_exception_handler(request: Request, exc: Exception):
    logging.critical(f"Unhandled Exception: {exc}")
    return JSONResponse(
        status_code=500,
        content={
            "error": {
                "message": "Internal server error.",
                "code": "INTERNAL_ERROR",
                "detail": str(exc),
            }
        },
    )
