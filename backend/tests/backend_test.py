import os
import uuid
import requests
import pytest

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "https://premium-coffee-ui-2.preview.emergentagent.com").rstrip("/")
API = f"{BASE_URL}/api"

ADMIN_EMAIL = "admin@coffeebliss.com"
ADMIN_PASSWORD = "admin123"


@pytest.fixture(scope="module")
def s():
    return requests.Session()


@pytest.fixture(scope="module")
def admin_session():
    sess = requests.Session()
    r = sess.post(f"{API}/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}, timeout=15)
    assert r.status_code == 200, f"admin login failed: {r.status_code} {r.text}"
    return sess


@pytest.fixture(scope="module")
def user_session():
    sess = requests.Session()
    email = f"TEST_user_{uuid.uuid4().hex[:8]}@example.com"
    r = sess.post(f"{API}/auth/register", json={"email": email, "password": "secret123", "name": "Test User"}, timeout=15)
    assert r.status_code == 200, f"register failed: {r.status_code} {r.text}"
    sess.email = email.lower()
    return sess


# Products
class TestProducts:
    def test_list_returns_seeded_10(self, s):
        r = s.get(f"{API}/products", timeout=15)
        assert r.status_code == 200
        data = r.json()
        assert isinstance(data, list)
        assert len(data) >= 10
        assert "id" in data[0] and "name" in data[0] and "price" in data[0]

    def test_filter_by_category(self, s):
        r = s.get(f"{API}/products", params={"category": "coffee"}, timeout=15)
        assert r.status_code == 200
        data = r.json()
        assert all(p["category"] == "coffee" for p in data)
        assert len(data) >= 1

    def test_filter_featured(self, s):
        r = s.get(f"{API}/products", params={"featured": "true"}, timeout=15)
        assert r.status_code == 200
        data = r.json()
        assert all(p["featured"] is True for p in data)
        assert len(data) >= 1


class TestTestimonials:
    def test_list(self, s):
        r = s.get(f"{API}/testimonials", timeout=15)
        assert r.status_code == 200
        data = r.json()
        assert len(data) >= 3
        assert "rating" in data[0]


# Auth
class TestAuth:
    def test_register_and_me(self, user_session):
        r = user_session.get(f"{API}/auth/me", timeout=15)
        assert r.status_code == 200
        body = r.json()
        assert body["email"] == user_session.email
        assert body["role"] == "user"
        assert "access_token" in user_session.cookies

    def test_login_admin_and_me(self, admin_session):
        r = admin_session.get(f"{API}/auth/me", timeout=15)
        assert r.status_code == 200
        assert r.json()["role"] == "admin"

    def test_login_invalid(self, s):
        r = s.post(f"{API}/auth/login", json={"email": ADMIN_EMAIL, "password": "wrong"}, timeout=15)
        assert r.status_code == 401

    def test_logout_clears(self):
        sess = requests.Session()
        r = sess.post(f"{API}/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}, timeout=15)
        assert r.status_code == 200
        r2 = sess.post(f"{API}/auth/logout", timeout=15)
        assert r2.status_code == 200
        r3 = sess.get(f"{API}/auth/me", timeout=15)
        assert r3.status_code == 401


# Admin product CRUD
class TestAdminProducts:
    def test_non_admin_cannot_create(self, user_session):
        payload = {"name": "TEST_x", "description": "x", "price": 1.0, "category": "coffee", "image": "http://x", "featured": False}
        r = user_session.post(f"{API}/products", json=payload, timeout=15)
        assert r.status_code == 403

    def test_unauth_cannot_create(self, s):
        payload = {"name": "TEST_y", "description": "y", "price": 1.0, "category": "coffee", "image": "http://x", "featured": False}
        r = s.post(f"{API}/products", json=payload, timeout=15)
        assert r.status_code == 401

    def test_admin_create_and_delete(self, admin_session):
        payload = {"name": "TEST_Mocha", "description": "test", "price": 9.99, "category": "coffee", "image": "http://x", "featured": False}
        r = admin_session.post(f"{API}/products", json=payload, timeout=15)
        assert r.status_code == 200, r.text
        pid = r.json()["id"]
        # Verify in list
        r2 = admin_session.get(f"{API}/products", timeout=15)
        assert any(p["id"] == pid for p in r2.json())
        # Delete
        r3 = admin_session.delete(f"{API}/products/{pid}", timeout=15)
        assert r3.status_code == 200
        # Verify gone
        r4 = admin_session.get(f"{API}/products", timeout=15)
        assert not any(p["id"] == pid for p in r4.json())

    def test_non_admin_cannot_delete(self, user_session):
        r = user_session.delete(f"{API}/products/nonexistent", timeout=15)
        assert r.status_code == 403


class TestContact:
    def test_submit(self, s):
        r = s.post(f"{API}/contact", json={"name": "TEST", "email": "test@example.com", "message": "hi"}, timeout=15)
        assert r.status_code == 200
        assert r.json()["ok"] is True


class TestOrders:
    def test_unauth_blocked(self, s):
        r = s.post(f"{API}/orders", json={"items": [], "total": 0}, timeout=15)
        assert r.status_code == 401

    def test_user_create_order(self, user_session):
        payload = {"items": [{"product_id": "p1", "name": "X", "price": 5.0, "quantity": 2}], "total": 10.0}
        r = user_session.post(f"{API}/orders", json=payload, timeout=15)
        assert r.status_code == 200
        assert "order_id" in r.json()
        # Verify list
        r2 = user_session.get(f"{API}/orders", timeout=15)
        assert r2.status_code == 200
        assert len(r2.json()) >= 1
