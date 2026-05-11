import { Component, ChangeDetectionStrategy, inject, signal, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CurrencyPipe, PercentPipe } from '@angular/common';
import { DatabaseService, Expense } from '../../services/database.service';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';

@Component({
  selector: 'app-expenses',
  imports: [RouterLink, CurrencyPipe, PercentPipe, ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section aria-labelledby="expenses-heading">
      <h2 id="expenses-heading">Expenses</h2>
      <nav aria-label="Expenses navigation">
        <a routerLink="/add-expense">Add New Expense</a>
      </nav>
      <article>
        <h3>Expense List</h3>
        @if (expenses().length === 0) {
          <p>No expenses recorded yet.</p>
        } @else {
          <ul>
            @for (expense of expenses(); track expense.id) {
              <li>
                @if (editingId() === expense.id) {
                  <form [formGroup]="editForm" (ngSubmit)="saveEdit(expense)">
                    <input type="text" formControlName="name" placeholder="Name" required />
                    <input type="number" formControlName="amount" placeholder="Amount" step="0.01" min="0" required />
                    <select formControlName="frequency">
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                      <option value="quarterly">Quarterly</option>
                      <option value="annually">Annually</option>
                    </select>
                    <select formControlName="type">
                      <option value="need">Need</option>
                      <option value="want">Want</option>
                    </select>
                    <button type="submit" [disabled]="editForm.invalid">Save</button>
                    <button type="button" (click)="cancelEdit()">Cancel</button>
                  </form>
                } @else {
                  <span>
                    {{ expense.name }} - {{ expense.amount | currency }} ({{ expense.frequency }})
                    - Yearly Impact: {{ getYearlyImpact(expense) | currency }} ({{ getPercentage(expense) | percent:'1.0-2' }})
                    - {{ expense.type }}
                  </span>
                  <button (click)="startEdit(expense)">Edit</button>
                  <button (click)="deleteExpense(expense.id!)">Delete</button>
                }
              </li>
            }
          </ul>
        }
      </article>
    </section>
  `,
  styles: [`
    ul { list-style: none; padding: 0; }
    li { margin-bottom: 1rem; border-bottom: 1px solid #ccc; padding-bottom: 0.5rem; }
    button { margin-left: 0.5rem; }
    form { display: flex; gap: 0.5rem; flex-wrap: wrap; }
  `]
})
export class ExpensesComponent {
  private readonly databaseService = inject(DatabaseService);
  private readonly fb = inject(FormBuilder);
  
  readonly expenses = this.databaseService.expensesData;
  readonly editingId = signal<number | null>(null);

  editForm = this.fb.group({
    name: ['', Validators.required],
    amount: this.fb.control<number | null>(null, [Validators.required, Validators.min(0)]),
    frequency: ['monthly', Validators.required],
    type: ['need', Validators.required]
  });

  readonly yearlyIncome = computed(() => {
    return (this.databaseService.incomeData().monthlyIncome || 0) * 12;
  });

  getYearlyImpact(expense: Expense): number {
    let multiplier = 1;
    switch (expense.frequency) {
      case 'daily': multiplier = 365; break;
      case 'weekly': multiplier = 52; break;
      case 'monthly': multiplier = 12; break;
      case 'quarterly': multiplier = 4; break;
      case 'annually': multiplier = 1; break;
    }
    return expense.amount * multiplier;
  }

  getPercentage(expense: Expense): number {
    const totalExpenses = this.databaseService.expensesData().reduce((acc, e) => acc + this.getYearlyImpact(e), 0);
    return totalExpenses === 0 ? 0 : this.getYearlyImpact(expense) / totalExpenses;
  }

  deleteExpense(id: number) {
    if (confirm('Are you sure you want to delete this expense?')) {
      this.databaseService.deleteExpense(id);
    }
  }

  startEdit(expense: Expense) {
    this.editingId.set(expense.id!);
    this.editForm.patchValue({
      name: expense.name,
      amount: expense.amount,
      frequency: expense.frequency,
      type: expense.type
    });
  }

  cancelEdit() {
    this.editingId.set(null);
    this.editForm.reset();
  }

  async saveEdit(expense: Expense) {
    if (this.editForm.valid) {
      const val = this.editForm.getRawValue();
      await this.databaseService.updateExpense({
        ...expense,
        name: val.name!,
        amount: val.amount!,
        frequency: val.frequency!,
        type: val.type!
      });
      this.cancelEdit();
    }
  }
}

