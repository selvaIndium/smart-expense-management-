from datetime import date, datetime
from typing import Optional

from pydantic import BaseModel, EmailStr


class UserCreate(BaseModel):
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    id: int
    email: EmailStr
    created_at: datetime

    class Config:
        orm_mode = True


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class Token(BaseModel):
    access_token: str
    token_type: str


class CategoryCreate(BaseModel):
    name: str


class CategoryResponse(BaseModel):
    id: int
    name: str

    class Config:
        orm_mode = True


class ExpenseCreate(BaseModel):
    amount: float
    description: Optional[str] = None
    expense_date: Optional[date] = None
    category_id: Optional[int] = None


class ExpenseUpdate(BaseModel):
    amount: Optional[float] = None
    description: Optional[str] = None
    expense_date: Optional[date] = None
    category_id: Optional[int] = None


class ExpenseResponse(BaseModel):
    id: int
    amount: float
    description: Optional[str]
    expense_date: Optional[date]
    category_id: Optional[int]
    user_id: int

    class Config:
        orm_mode = True


class BudgetCreate(BaseModel):
    amount: float
    month: int
    year: int
    category_id: Optional[int] = None


class BudgetResponse(BaseModel):
    id: int
    amount: float
    month: int
    year: int
    category_id: Optional[int]
    user_id: int

    class Config:
        orm_mode = True


class MonthlyInsight(BaseModel):
    month: int
    year: int
    total_spent: float
    budget_limit: Optional[float]
    remaining: Optional[float]
    status: str
