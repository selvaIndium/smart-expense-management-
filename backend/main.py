from database import Base, get_db, engine

from fastapi import FastAPI
import models

app = FastAPI()
Base.metadata.create_all(bind = engine)


