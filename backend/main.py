from database import Base, engine
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import budgets, categories, expenses, users

app = FastAPI(title="Smart Expense Management API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

Base.metadata.create_all(bind=engine)

app.include_router(users.router)
app.include_router(categories.router)
app.include_router(expenses.router)
app.include_router(budgets.router)