from typing import Any, Optional

def success_response(
    data: Any = None,
    message: str = "Success",
    status_code: int = 200
):
    return {
        "status": "success",
        "message": message,
        "data": data
    }

def error_response(
    message: str = "Error",
    status_code: int = 400,
    errors: Any = None
):
    return {
        "status": "error",
        "message": message,
        "errors": errors
    }

def paginated_response(
    data: Any,
    total: int,
    skip: int,
    limit: int,
    message: str = "Success"
):
    return {
        "status": "success",
        "message": message,
        "data": data,
        "pagination": {
            "total": total,
            "skip": skip,
            "limit": limit,
            "has_more": (skip + limit) < total
        }
    }