from fastapi import FastAPI, Depends
from sqlalchemy.orm import Session
from database import SessionLocal, engine
import models
from fastapi.middleware.cors import CORSMiddleware


models.Base.metadata.create_all(bind=engine)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# CREATE
@app.post("/users/")
def create_user(username: str,email: str, password = "123456", created_on = "2026-03-13 13:51:03.698699",is_active = "True",  db: Session = Depends(get_db)):
    user = models.User(username=username, password=password, email=email, created_on=created_on, is_active=is_active)
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


# READ
@app.get("/users/")
def get_users(db: Session = Depends(get_db)):
    return db.query(models.User).filter(models.User.is_active == "True").all()
    #return db.query("select * from accounts").all()

# UPDATE
@app.put("/users/{user_id}")
def update_user(user_id: int, username: str, email: str, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.user_id == user_id).first()
    user.username = username
    user.email = email
    db.commit()
    return user


# DELETE
@app.delete("/users/{user_id}")
def delete_user(user_id: int, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.user_id == user_id).first()
    user.is_active = "False"
    db.commit()
    return {"message": "Deleted"}