# Budgeting Framework: The 50-30-20 Rule

## Core Logic & Calculation
The model is based on **Net Income** (take-home pay).
- **Calculation:** Total Earnings - Taxes = Disposable Income.
- **Note:** Do not exclude insurance or 401k contributions from income; these are categorized within the budget.

## Allocation Breakdown

### A. Needs (50%)
*Non-negotiable expenses required for basic living.*
- **Criteria:** Payments that, if skipped, would lead to severe consequences.
- **Includes:**
  - Housing (Rent/Mortgage)
  - Utilities (Water, Electricity, Gas)
  - Transportation (Car payments, Insurance, Fuel, Public Transit)
  - Groceries (Basic food)
  - Minimum Debt Payments (The absolute minimum required by creditors)

### B. Wants (30%)
*Discretionary spending for lifestyle choices.*
- **Criteria:** Items or services that improve quality of life but are not strictly necessary.
- **Includes:**
  - Dining out / Takeout
  - Entertainment (Movies, Concerts)
  - Subscriptions (Netflix, Spotify, Gym)
  - Travel & Vacations
  - Upgrade purchases (e.g., a newer phone when the current one works)

### C. Savings & Extra Debt (20%)
*Future-focused financial health.*
- **Criteria:** Allocations that build wealth or reduce long-term liabilities.
- **Includes:**
  - Emergency Fund (3-6 months of expenses)
  - Retirement Contributions (401k, IRA)
  - Investment Accounts
  - Accelerated Debt Payments (Payments made *above* the minimum)

## Implementation Protocol for AI Agents
1. **Income Input:** Identify monthly net income.
2. **Transaction Analysis:** Tag historical spending into `Need`, `Want`, or `Save`.
3. **Threshold Check:**
   - If `Needs > 50%`: Flag for expense reduction or income increase.
   - If `Wants > 30%`: Identify non-essential subscriptions or lifestyle habits to cut.
   - If `Savings < 20%`: Prioritize "paying yourself first" before allocating to "Wants".

---
**Data Source:** UNFCU Financial Wellness Program