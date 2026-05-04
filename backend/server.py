from dotenv import load_dotenv
from pathlib import Path

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / ".env")

import os
import uuid
import logging
import bcrypt
import jwt
from datetime import datetime, timezone, timedelta
from typing import List, Optional

from fastapi import FastAPI, APIRouter, HTTPException, Request, Response, Depends
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, Field, EmailStr

# ---------------- Mongo ----------------
mongo_url = os.environ["MONGO_URL"]
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ["DB_NAME"]]

JWT_ALGO = "HS256"

app = FastAPI(title="Coffee Bliss API")
api = APIRouter(prefix="/api")

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("coffee-bliss")


# ---------------- Helpers ----------------
def hash_password(pw: str) -> str:
    return bcrypt.hashpw(pw.encode(), bcrypt.gensalt()).decode()


def verify_password(pw: str, hashed: str) -> bool:
    try:
        return bcrypt.checkpw(pw.encode(), hashed.encode())
    except Exception:
        return False


def jwt_secret() -> str:
    return os.environ["JWT_SECRET"]


def make_access_token(user_id: str, email: str) -> str:
    payload = {
        "sub": user_id,
        "email": email,
        "exp": datetime.now(timezone.utc) + timedelta(days=1),
        "type": "access",
    }
    return jwt.encode(payload, jwt_secret(), algorithm=JWT_ALGO)


def make_refresh_token(user_id: str) -> str:
    payload = {
        "sub": user_id,
        "exp": datetime.now(timezone.utc) + timedelta(days=7),
        "type": "refresh",
    }
    return jwt.encode(payload, jwt_secret(), algorithm=JWT_ALGO)


def set_auth_cookies(response: Response, access: str, refresh: str):
    response.set_cookie("access_token", access, httponly=True, secure=False,
                        samesite="lax", max_age=60 * 60 * 24, path="/")
    response.set_cookie("refresh_token", refresh, httponly=True, secure=False,
                        samesite="lax", max_age=60 * 60 * 24 * 7, path="/")


def public_user(u: dict) -> dict:
    return {
        "id": u["id"],
        "email": u["email"],
        "name": u.get("name", ""),
        "role": u.get("role", "user"),
    }


async def get_current_user(request: Request) -> dict:
    token = request.cookies.get("access_token")
    if not token:
        auth = request.headers.get("Authorization", "")
        if auth.startswith("Bearer "):
            token = auth[7:]
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        payload = jwt.decode(token, jwt_secret(), algorithms=[JWT_ALGO])
        if payload.get("type") != "access":
            raise HTTPException(status_code=401, detail="Invalid token type")
        user = await db.users.find_one({"id": payload["sub"]}, {"_id": 0})
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        return user
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")


async def require_admin(user: dict = Depends(get_current_user)) -> dict:
    if user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    return user


# ---------------- Schemas ----------------
class RegisterIn(BaseModel):
    email: EmailStr
    password: str = Field(min_length=6)
    name: str = Field(min_length=1)


class LoginIn(BaseModel):
    email: EmailStr
    password: str


class ProductIn(BaseModel):
    name: str
    description: str
    price: float
    category: str  # coffee | beverages | desserts
    image: str
    featured: bool = False


class ProductOut(ProductIn):
    id: str


class ContactIn(BaseModel):
    name: str
    email: EmailStr
    message: str


class OrderItem(BaseModel):
    product_id: str
    name: str
    price: float
    quantity: int
    image: Optional[str] = None


class OrderIn(BaseModel):
    items: List[OrderItem]
    total: float


# ---------------- Auth Routes ----------------
@api.post("/auth/register")
async def register(data: RegisterIn, response: Response):
    email = data.email.lower()
    if await db.users.find_one({"email": email}):
        raise HTTPException(status_code=400, detail="Email already registered")
    user = {
        "id": str(uuid.uuid4()),
        "email": email,
        "name": data.name,
        "password_hash": hash_password(data.password),
        "role": "user",
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.users.insert_one(user)
    set_auth_cookies(response,
                     make_access_token(user["id"], email),
                     make_refresh_token(user["id"]))
    return public_user(user)


@api.post("/auth/login")
async def login(data: LoginIn, response: Response):
    email = data.email.lower()
    user = await db.users.find_one({"email": email}, {"_id": 0})
    if not user or not verify_password(data.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    set_auth_cookies(response,
                     make_access_token(user["id"], email),
                     make_refresh_token(user["id"]))
    return public_user(user)


@api.post("/auth/logout")
async def logout(response: Response):
    response.delete_cookie("access_token", path="/")
    response.delete_cookie("refresh_token", path="/")
    return {"ok": True}


@api.get("/auth/me")
async def me(user: dict = Depends(get_current_user)):
    return public_user(user)


# ---------------- Products ----------------
@api.get("/products", response_model=List[ProductOut])
async def list_products(category: Optional[str] = None, featured: Optional[bool] = None):
    query = {}
    if category and category != "all":
        query["category"] = category
    if featured is not None:
        query["featured"] = featured
    items = await db.products.find(query, {"_id": 0}).to_list(500)
    return items


@api.post("/products", response_model=ProductOut)
async def create_product(data: ProductIn, _admin: dict = Depends(require_admin)):
    doc = data.model_dump()
    doc["id"] = str(uuid.uuid4())
    await db.products.insert_one(doc.copy())
    return {**doc}


@api.delete("/products/{product_id}")
async def delete_product(product_id: str, _admin: dict = Depends(require_admin)):
    res = await db.products.delete_one({"id": product_id})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Not found")
    return {"ok": True}


@api.put("/products/{product_id}", response_model=ProductOut)
async def update_product(product_id: str, data: ProductIn, _admin: dict = Depends(require_admin)):
    doc = data.model_dump()
    res = await db.products.update_one({"id": product_id}, {"$set": doc})
    if res.matched_count == 0:
        raise HTTPException(status_code=404, detail="Not found")
    return {"id": product_id, **doc}


# ---------------- Testimonials ----------------
@api.get("/testimonials")
async def list_testimonials():
    items = await db.testimonials.find({}, {"_id": 0}).to_list(100)
    return items


# ---------------- Contact ----------------
@api.post("/contact")
async def contact_submit(data: ContactIn):
    doc = data.model_dump()
    doc["id"] = str(uuid.uuid4())
    doc["created_at"] = datetime.now(timezone.utc).isoformat()
    await db.contact_messages.insert_one(doc.copy())
    return {"ok": True, "id": doc["id"]}


# ---------------- Orders ----------------
@api.post("/orders")
async def create_order(data: OrderIn, user: dict = Depends(get_current_user)):
    doc = {
        "id": str(uuid.uuid4()),
        "user_id": user["id"],
        "items": [i.model_dump() for i in data.items],
        "total": data.total,
        "status": "pending",
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.orders.insert_one(doc.copy())
    return {"ok": True, "order_id": doc["id"]}


@api.get("/orders")
async def list_my_orders(user: dict = Depends(get_current_user)):
    items = await db.orders.find({"user_id": user["id"]}, {"_id": 0}).to_list(100)
    return items


@api.get("/")
async def root():
    return {"service": "Coffee Bliss API", "ok": True}


app.include_router(api)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[os.environ.get("FRONTEND_URL", "http://localhost:3000")],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------------- Seeding ----------------
SAMPLE_PRODUCTS = [
    {
        "name": "Espresso Classico", "description": "A pure shot of single-origin Ethiopian espresso with rich crema.",
        "price": 3.50, "category": "coffee", "featured": True,
        "image": "https://images.unsplash.com/photo-1634709170162-23a76022e9c9?crop=entropy&cs=srgb&fm=jpg&q=85",
    },
    {
        "name": "Velvet Cappuccino", "description": "Double espresso, silky steamed milk, and a cocoa dusting.",
        "price": 4.75, "category": "coffee", "featured": True,
        "image": "https://images.unsplash.com/photo-1660144128596-ee0e16e1d100?crop=entropy&cs=srgb&fm=jpg&q=85",
    },
    {
        "name": "Honey Oat Latte", "description": "Espresso, steamed oat milk, and raw wildflower honey.",
        "price": 5.25, "category": "coffee", "featured": True,
        "image": "https://images.unsplash.com/photo-1660144128607-7111bfaa5613?crop=entropy&cs=srgb&fm=jpg&q=85",
    },
    {
        "name": "Cold Brew Noir", "description": "18-hour slow steeped with dark chocolate notes. Served over ice.",
        "price": 4.95, "category": "coffee", "featured": False,
        "image": "https://images.unsplash.com/photo-1660144102328-68974117f580?crop=entropy&cs=srgb&fm=jpg&q=85",
    },
    {
        "name": "Matcha Cloud", "description": "Ceremonial grade matcha with lightly sweetened oat foam.",
        "price": 5.50, "category": "beverages", "featured": True,
        "image": "https://images.unsplash.com/photo-1515823064-d6e0c04616a7?crop=entropy&cs=srgb&fm=jpg&q=85",
    },
    {
        "name": "Rose Hibiscus Tea", "description": "A floral tisane with wild hibiscus and damask rose petals.",
        "price": 4.25, "category": "beverages", "featured": False,
        "image": "https://images.unsplash.com/photo-1597481499750-3e6b22637e12?crop=entropy&cs=srgb&fm=jpg&q=85",
    },
    {
        "name": "Spiced Chai", "description": "House-blend masala chai with cardamom, clove, and steamed milk.",
        "price": 4.50, "category": "beverages", "featured": False,
        "image": "https://images.unsplash.com/photo-1571934811356-5cc061b6821f?crop=entropy&cs=srgb&fm=jpg&q=85",
    },
    {
        "name": "Brown Butter Cookie", "description": "Sea-salted brown butter, Valrhona chocolate chunks. Baked daily.",
        "price": 3.75, "category": "desserts", "featured": False,
        "image": "https://images.unsplash.com/photo-1499636136210-6f4ee915583e?crop=entropy&cs=srgb&fm=jpg&q=85",
    },
    {
        "name": "Pistachio Croissant", "description": "Laminated 27-layer pastry filled with Sicilian pistachio cream.",
        "price": 5.95, "category": "desserts", "featured": True,
        "image": "https://images.unsplash.com/photo-1555507036-ab1f4038808a?crop=entropy&cs=srgb&fm=jpg&q=85",
    },
    {
        "name": "Tiramisù Jar", "description": "Espresso-soaked ladyfingers, mascarpone, cocoa. Served in glass.",
        "price": 6.50, "category": "desserts", "featured": False,
        "image": "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?crop=entropy&cs=srgb&fm=jpg&q=85",
    },
]

SAMPLE_TESTIMONIALS = [
    {
        "name": "Sophia Arden", "rating": 5,
        "comment": "The Velvet Cappuccino is my daily ritual. The ambience and attention to detail are unmatched in the city.",
        "avatar": "https://images.unsplash.com/photo-1672462478040-a5920e2c23d8?crop=entropy&cs=srgb&fm=jpg&q=85",
    },
    {
        "name": "Marcus Whitfield", "rating": 5,
        "comment": "I came for the espresso and stayed for the pistachio croissant. Bliss is the only word that fits.",
        "avatar": "https://images.unsplash.com/photo-1635088047149-0d698fb5f849?crop=entropy&cs=srgb&fm=jpg&q=85",
    },
    {
        "name": "Elena Rossi", "rating": 5,
        "comment": "A quiet corner, the honey oat latte, and a good book. This is my weekend therapy.",
        "avatar": "https://images.unsplash.com/photo-1592234789031-94bf65f630ed?crop=entropy&cs=srgb&fm=jpg&q=85",
    },
]


@app.on_event("startup")
async def on_startup():
    # Indexes
    await db.users.create_index("email", unique=True)
    await db.products.create_index("id", unique=True)
    await db.orders.create_index("user_id")

    # Admin seed
    admin_email = os.environ.get("ADMIN_EMAIL", "admin@coffeebliss.com").lower()
    admin_password = os.environ.get("ADMIN_PASSWORD", "admin123")
    existing = await db.users.find_one({"email": admin_email})
    if existing is None:
        await db.users.insert_one({
            "id": str(uuid.uuid4()),
            "email": admin_email,
            "name": "Coffee Bliss Admin",
            "password_hash": hash_password(admin_password),
            "role": "admin",
            "created_at": datetime.now(timezone.utc).isoformat(),
        })
        logger.info("Seeded admin user: %s", admin_email)
    elif not verify_password(admin_password, existing.get("password_hash", "")):
        await db.users.update_one(
            {"email": admin_email},
            {"$set": {"password_hash": hash_password(admin_password), "role": "admin"}},
        )

    # Seed products
    if await db.products.count_documents({}) == 0:
        docs = []
        for p in SAMPLE_PRODUCTS:
            docs.append({**p, "id": str(uuid.uuid4())})
        await db.products.insert_many(docs)
        logger.info("Seeded %d products", len(docs))

    # Seed testimonials
    if await db.testimonials.count_documents({}) == 0:
        docs = [{**t, "id": str(uuid.uuid4())} for t in SAMPLE_TESTIMONIALS]
        await db.testimonials.insert_many(docs)


@app.on_event("shutdown")
async def on_shutdown():
    client.close()
