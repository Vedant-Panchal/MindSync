from fastapi import Depends, Request, HTTPException

async def auth_dependency(request: Request):
    """
    Extracts authenticated user from request state (set by middleware).
    """
    user = getattr(request.state, "user", None)
    
    if not user:
        raise HTTPException(status_code=401, detail="Unauthorized: Authentication required")
    
    return user
