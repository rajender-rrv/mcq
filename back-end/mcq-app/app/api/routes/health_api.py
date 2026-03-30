from fastapi import APIRouter

router = APIRouter()


@router.get("", summary="Report whether the application process is up")
async def health():
    return {"status": "ok"}
