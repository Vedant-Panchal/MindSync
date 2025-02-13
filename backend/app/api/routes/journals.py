# from fastapi import APIRouter, Depends, HTTPException
# import httpx
# import requests
# from app.core.security import auth_middleware  # Import authentication middleware

# router = APIRouter()

# @router.get("/random-products")
# async def get_random_products(user: dict = Depends(auth_middleware)):  # Accept user from middleware
#     if user.get("email") != "mohammedrupawala11@gmail.com":  
#         raise HTTPException(status_code=403, detail="Forbidden: You are not allowed to access this resource")
#     url = "https://api.freeapi.app/api/v1/public/randomproducts"
#     querystring = {"page":"1","limit":"10","inc":"category%2Cprice%2Cthumbnail%2Cimages%2Ctitle%2Cid","query":"mens-watches"}
#     headers = {"accept": "application/json"}
#     response = requests.get(url, headers=headers, params=querystring)

#     return (response.json())


from fastapi import APIRouter, Depends, HTTPException
import httpx
from app.core.security import auth_middleware  # Import authentication middleware

router = APIRouter()

@router.get("/random-products")
async def get_random_products(user: dict = Depends(auth_middleware)):  # Accept user from middleware
    # Ensure the user is authorized
    if user.get("email") != "mohammedrupawala11@gmail.com":  
        raise HTTPException(status_code=403, detail="Forbidden: You are not allowed to access this resource")
    
    # Make an async request to fetch random products
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
    
    # Return the response as JSON
    return response.json()
