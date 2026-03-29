# app/services/user_service.py

from app.models.models import User
from app.repositories.user_repo import UserRepository

class UserService:

    @staticmethod
    async def create_user(db, data):
        user = User(**data)
        return await UserRepository.create(db, user)

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
        return await UserRepository.update(db, user, data)

    @staticmethod
    async def delete_user(db, user_id: int) -> bool:
        user = await UserRepository.get_by_id(db, user_id)
        if user is None:
            return False
        await UserRepository.delete(db, user)
        return True