from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import extract, func
from typing import List
from database import get_db
import models
import schemas
import auth

router = APIRouter(prefix="/budgets", tags=["Budgets"])


@router.post("/", response_model=schemas.BudgetResponse, status_code=201)
def create_budget(
    data: schemas.BudgetCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    if not (1 <= data.month <= 12):
        raise HTTPException(status_code=400, detail="Month must be between 1 and 12")

    budget = models.Budget(
        month=data.month,
        year=data.year,
        amount=data.amount,
        category_id=data.category_id,
        user_id=current_user.id
    )
    db.add(budget)
    db.commit()
    db.refresh(budget)
    return budget


@router.get("/", response_model=List[schemas.BudgetResponse])
def list_budgets(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    return db.query(models.Budget).filter(models.Budget.user_id == current_user.id).all()


@router.delete("/{budget_id}", status_code=204)
def delete_budget(
    budget_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    budget = db.query(models.Budget).filter(
        models.Budget.id == budget_id,
        models.Budget.user_id == current_user.id
    ).first()

    if not budget:
        raise HTTPException(status_code=404, detail="Budget not found")

    db.delete(budget)
    db.commit()


@router.get("/insight/{year}/{month}", response_model=schemas.MonthlyInsight)
def monthly_insight(
    year: int,
    month: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    total_spent = db.query(func.sum(models.Expense.amount)).filter(
        models.Expense.user_id == current_user.id,
        extract("month", models.Expense.expense_date) == month,
        extract("year",  models.Expense.expense_date) == year
    ).scalar() or 0.0

    budget = db.query(models.Budget).filter(
        models.Budget.user_id == current_user.id,
        models.Budget.month == month,
        models.Budget.year == year,
        models.Budget.category_id == None
    ).first()

    if budget:
        remaining = budget.amount - total_spent
        status    = "Under budget" if remaining >= 0 else "Over budget"
        return schemas.MonthlyInsight(
            month=month,
            year=year,
            total_spent=round(total_spent, 2),
            budget_limit=budget.amount,
            remaining=round(remaining, 2),
            status=status
        )
    else:
        return schemas.MonthlyInsight(
            month=month,
            year=year,
            total_spent=round(total_spent, 2),
            budget_limit=None,
            remaining=None,
            status="No budget set for this month"
        )
