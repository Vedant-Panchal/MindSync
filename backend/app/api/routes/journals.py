
from fastapi import APIRouter, Request,status
import httpx
from app.core.exceptions import APIException

router = APIRouter()

@router.get("/random-products")
async def get_random_products(request: Request):
    user = getattr(request.state, "user", None)

    if not user:  
        raise APIException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            message="You are not authorized to access this resource",
            detail="Please login to access this resource"
        )
    
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
