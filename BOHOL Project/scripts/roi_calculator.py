#!/usr/bin/env python3
"""
roi_calculator.py - ROI calculation engine for different scenarios
Supports: cash purchase, financed purchase, multiple villa investments, etc.
Outputs JSON for HTML artifact display.

Scenarios:
- Single villa, cash
- Single villa, 70% financed
- Dual villas, partial finance
- Custom investment amount
"""

import json
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parent.parent
OUTPUT_FILE = PROJECT_ROOT / "artifacts" / "roi_calculations.json"

# Configuration
VILLA_PRICE = 28_000_000
MONTHLY_INCOME = 395_000
DEFAULT_LTV = 0.70  # 70% loan-to-value
DEFAULT_RATE = 0.06  # 6% annual interest
APPRECIATION_ANNUAL = 0.04  # 4% annual property appreciation

def calculate_cash_purchase():
    """Single villa, cash payment."""
    scenarios = {}

    for year in range(1, 11):
        months = year * 12
        total_income = MONTHLY_INCOME * months
        property_value = VILLA_PRICE * (1 + APPRECIATION_ANNUAL) ** year
        total_wealth = VILLA_PRICE + total_income + (property_value - VILLA_PRICE)
        roi_percent = ((total_wealth - VILLA_PRICE) / VILLA_PRICE) * 100

        scenarios[f"Year_{year}"] = {
            "cumulative_income": total_income,
            "property_value": round(property_value),
            "total_wealth": round(total_wealth),
            "roi_percent": round(roi_percent, 1),
            "annual_income": round(MONTHLY_INCOME * 12)
        }

    return {
        "scenario": "Single Villa - Cash Purchase",
        "initial_investment": VILLA_PRICE,
        "down_payment": VILLA_PRICE,
        "loan_amount": 0,
        "monthly_payment": 0,
        "net_monthly_cashflow": MONTHLY_INCOME,
        "scenarios": scenarios
    }

def calculate_financed_purchase():
    """Single villa, 70% financed."""
    down_payment = VILLA_PRICE * (1 - DEFAULT_LTV)
    loan_amount = VILLA_PRICE * DEFAULT_LTV

    # Standard amortization: 15-year fixed
    total_months = 180  # 15 years
    monthly_rate = DEFAULT_RATE / 12
    monthly_payment = (loan_amount * monthly_rate * (1 + monthly_rate) ** total_months) / ((1 + monthly_rate) ** total_months - 1)

    scenarios = {}
    balance = loan_amount

    for year in range(1, 11):
        # Calculate balance after this many payments using standard formula
        payments_made = year * 12
        if payments_made < total_months:
            balance = loan_amount * ((1 + monthly_rate) ** total_months - (1 + monthly_rate) ** payments_made) / ((1 + monthly_rate) ** total_months - 1)
        else:
            balance = 0

        property_value = VILLA_PRICE * (1 + APPRECIATION_ANNUAL) ** year
        cumulative_income = MONTHLY_INCOME * year * 12
        cumulative_payments = monthly_payment * year * 12
        net_cashflow = (MONTHLY_INCOME - monthly_payment) * year * 12
        total_wealth = down_payment + net_cashflow + (property_value - VILLA_PRICE)
        roi_percent = ((total_wealth - down_payment) / down_payment) * 100

        scenarios[f"Year_{year}"] = {
            "cumulative_income": round(cumulative_income),
            "cumulative_payments": round(cumulative_payments),
            "net_cashflow": round(net_cashflow),
            "loan_balance": round(balance),
            "property_value": round(property_value),
            "total_wealth": round(total_wealth),
            "roi_percent": round(roi_percent, 1)
        }

    return {
        "scenario": "Single Villa - 70% Financed",
        "initial_investment": VILLA_PRICE,
        "down_payment": round(down_payment),
        "loan_amount": round(loan_amount),
        "monthly_gross_income": MONTHLY_INCOME,
        "monthly_loan_payment": round(monthly_payment),
        "net_monthly_cashflow": round(MONTHLY_INCOME - monthly_payment),
        "loan_term_years": 15,
        "interest_rate": f"{DEFAULT_RATE * 100:.1f}%",
        "scenarios": scenarios
    }

def calculate_dual_villa():
    """Two villas, combined financing."""
    total_investment = VILLA_PRICE * 2
    bulk_discount = 800_000
    effective_investment = total_investment - bulk_discount
    down_payment = effective_investment * (1 - DEFAULT_LTV)
    loan_amount = effective_investment * DEFAULT_LTV
    monthly_combined_income = MONTHLY_INCOME * 2

    # Standard amortization for the full loan amount
    total_months = 180  # 15 years
    monthly_rate = DEFAULT_RATE / 12
    monthly_payment = (loan_amount * monthly_rate * (1 + monthly_rate) ** total_months) / ((1 + monthly_rate) ** total_months - 1)

    scenarios = {}

    for year in range(1, 11):
        cumulative_income = monthly_combined_income * year * 12
        cumulative_payments = monthly_payment * year * 12
        net_cashflow = (monthly_combined_income - monthly_payment) * year * 12

        property_value = (VILLA_PRICE * (1 + APPRECIATION_ANNUAL) ** year) * 2
        total_wealth = down_payment + net_cashflow + ((property_value - total_investment) + bulk_discount)
        roi_percent = ((total_wealth - down_payment) / down_payment) * 100

        scenarios[f"Year_{year}"] = {
            "cumulative_income": round(cumulative_income),
            "cumulative_payments": round(cumulative_payments),
            "net_cashflow": round(net_cashflow),
            "property_value": round(property_value),
            "total_wealth": round(total_wealth),
            "roi_percent": round(roi_percent, 1)
        }

    return {
        "scenario": "Dual Villas - 70% Financed",
        "initial_investment": round(total_investment),
        "bulk_discount": bulk_discount,
        "effective_investment": round(effective_investment),
        "down_payment": round(down_payment),
        "loan_amount": round(loan_amount),
        "monthly_gross_income": monthly_combined_income,
        "monthly_loan_payment": round(monthly_payment),
        "net_monthly_cashflow": round(monthly_combined_income - monthly_payment),
        "scenarios": scenarios
    }

def main():
    OUTPUT_FILE.parent.mkdir(parents=True, exist_ok=True)

    print("[ROI_CALCULATOR] Computing ROI scenarios...")

    calculations = {
        "generated_at": Path(__file__).stat().st_mtime,
        "scenarios": [
            calculate_cash_purchase(),
            calculate_financed_purchase(),
            calculate_dual_villa()
        ]
    }

    # Write JSON
    with open(OUTPUT_FILE, "w") as f:
        json.dump(calculations, f, indent=2)

    print(f"[OUTPUT] {OUTPUT_FILE}")

    # Print summary
    for scenario in calculations['scenarios']:
        year_10 = scenario['scenarios']['Year_10']
        print(f"\n{scenario['scenario']}")
        print(f"  Down Payment: PHP {scenario['down_payment']:,}")
        print(f"  Year 10 ROI: {year_10['roi_percent']}%")
        print(f"  Year 10 Total Wealth: PHP {year_10['total_wealth']:,}")

if __name__ == "__main__":
    main()
