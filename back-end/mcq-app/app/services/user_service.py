# app/services/user_service.py

from fastapi import HTTPException
from sqlalchemy.exc import IntegrityError

from app.core.security import hash_password
from app.models.models import User
from app.repositories.user_repo import UserRepository


class UserService:

    @staticmethod
    async def create_user(db, data: dict):
        payload = dict(data)
        password = payload.pop("password")
        payload["password_hash"] = hash_password(password)
        payload["email"] = str(payload["email"]).lower().strip()
        user = User(**payload)
        try:
            return await UserRepository.create(db, user)
        except IntegrityError:
            await db.rollback()
            raise HTTPException(
                status_code=409,
                detail="Username or email already registered",
            )

    @staticmethod
    async def list_users(db):
        return await UserRepository.list_all(db)

    @staticmethod
    async def get_user(db, user_id: int):
        return await UserRepository.get_by_id(db, user_id)

    @staticmethod
    async def update_user(db, user_id: int, data: dict):
        user = await UserRepository.get_by_id(db, user_id)
        if user is None:
            return None
        payload = dict(data)
        if "password" in payload and payload["password"] is not None:
            payload["password_hash"] = hash_password(payload.pop("password"))
        if payload.get("email") is not None:
            payload["email"] = str(payload["email"]).lower().strip()
        try:
            return await UserRepository.update(db, user, payload)
        except IntegrityError:
            await db.rollback()
            raise HTTPException(
                status_code=409,
                detail="Username or email already in use",
            )

    @staticmethod
    async def delete_user(db, user_id: int) -> bool:
        user = await UserRepository.get_by_id(db, user_id)
        if user is None:
            return False
        await UserRepository.delete(db, user)
        return True