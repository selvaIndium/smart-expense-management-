from datetime import date, datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, EmailStr, Field


class UserCreate(BaseModel):
    email: EmailStr
    password: str = Field(min_length=6)


class UserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    email: EmailStr
    created_at: datetime


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class Token(BaseModel):
    access_token: str
    token_type: str


class CategoryCreate(BaseModel):
    name: str = Field(min_length=1, max_length=100)


class CategoryResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str


class ExpenseCreate(BaseModel):
    amount: float = Field(gt=0)
    description: Optional[str] = None
    expense_date: Optional[date] = None
    category_id: Optional[int] = None


class ExpenseUpdate(BaseModel):
    amount: Optional[float] = Field(default=None, gt=0)
    description: Optional[str] = None
    expense_date: Optional[date] = None
    category_id: Optional[int] = None


class ExpenseResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    amount: float
    description: Optional[str]
    expense_date: Optional[date]
    category_id: Optional[int]
    user_id: int


class BudgetCreate(BaseModel):
    amount: float = Field(gt=0)
    month: int = Field(ge=1, le=12)
    year: int = Field(ge=2000, le=2100)
    category_id: Optional[int] = None


class BudgetResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    amount: float
    month: int
    year: int
    category_id: Optional[int]
    user_id: int


class MonthlyInsight(BaseModel):
    month: int
    year: int
    total_spent: float
    budget_limit: Optional[float]
    remaining: Optional[float]
    status: str
