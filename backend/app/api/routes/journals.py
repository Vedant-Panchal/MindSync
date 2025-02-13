
from fastapi import APIRouter, Depends, HTTPException,Request
import httpx
from app.core.security import auth_middleware  # Import authentication middleware

router = APIRouter()

# @router.get("/random-products")
# async def get_random_products(user: dict = Depends(auth_middleware)):  # Accept user from middleware
#     # Ensure the user is authorized
#     if user["email"] != "mohammedrupawala11@gmail.com":  
#         raise HTTPException(status_code=403, detail="Forbidden: You are not allowed to access this resource")
    
#     # Make an async request to fetch random products
#     url = "https://api.freeapi.app/api/v1/public/randomproducts"
#     querystring = {
#         "page": "1", 
#         "limit": "10", 
#         "inc": "category,price,thumbnail,images,title,id", 
#         "query": "mens-watches"
#     }
#     headers = {"accept": "application/json"}
    
#     async with httpx.AsyncClient() as client:
#         response = await client.get(url, headers=headers, params=querystring)
    
#     # Return the response as JSON
#     return response.json()



@router.get("/random-products")
async def get_random_products(request: Request):
    """
    Fetch random products after authentication.
    """
    user = getattr(request.state, "user", None)  # ✅ Get user from middleware

    # ✅ Ensure user is authorized
    if not user or user.get("email") != "mohammedrupawala11@gmail.com":  
        raise HTTPException(status_code=403, detail="Forbidden: You are not allowed to access this resource")

    # ✅ Fetch random products
    url = "https://api.freeapi.app/api/v1/public/randomproducts"
    querystring = {
        "page": "1", 
        "limit": "10", 
        "inc": "category,price,thumbnail,images,title,id", 
        "query": "mens-watches"
    }
    headers = {"accept": "application/json"}

    async with httpx.AsyncClient() as client:
        response = await client.get(url, headers=headers, params=querystring)

    return response.json()
