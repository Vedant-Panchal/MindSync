
from fastapi import APIRouter, Depends, HTTPException,Request
import httpx

router = APIRouter()

@router.get("/random-products")
async def get_random_products(request: Request):
    user = getattr(request.state, "user", None)

    if not user or user.get("email") != "dvijoza@gmail.com":  
        raise HTTPException(status_code=403, detail="Forbidden: You are not allowed to access this resource")
    
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
