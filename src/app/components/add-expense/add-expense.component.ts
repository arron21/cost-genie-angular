import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { DatabaseService } from '../../services/database.service';

@Component({
  selector: 'app-add-expense',
  imports: [ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section aria-labelledby="add-expense-heading">
      <h2 id="add-expense-heading">Add Expense</h2>
      <form [formGroup]="expenseForm" (ngSubmit)="onSubmit()">
        <fieldset>
          <legend>Expense Details</legend>
          <div>
            <label for="expenseName">Expense Name</label>
            <input id="expenseName" type="text" formControlName="name" required />
          </div>
          <div>
            <label for="expenseAmount">Amount</label>
            <input id="expenseAmount" type="number" formControlName="amount" required min="0" step="0.01" />
          </div>
          <div>
            <label for="expenseFrequency">Frequency</label>
            <select id="expenseFrequency" formControlName="frequency" required>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="quarterly">Quarterly</option>
              <option value="annually">Annually</option>
            </select>
          </div>
          <fieldset>
            <legend>Need vs Want</legend>
            <label>
              <input type="radio" formControlName="type" value="need" /> Need
            </label>
            <label>
              <input type="radio" formControlName="type" value="want" /> Want
            </label>
          </fieldset>
        </fieldset>
        <button type="submit" [disabled]="expenseForm.invalid">Add Expense</button>
      </form>
    </section>
  `
})
export class AddExpenseComponent {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly databaseService = inject(DatabaseService);

  expenseForm = this.fb.group({
    name: ['', Validators.required],
    amount: this.fb.control<number | null>(null, [Validators.required, Validators.min(0)]),
    frequency: ['monthly', Validators.required],
    type: ['need', Validators.required]
  });

  async onSubmit() {
    if (this.expenseForm.valid) {
      const formValue = this.expenseForm.getRawValue();
      await this.databaseService.addExpense({
        name: formValue.name!,
        amount: formValue.amount!,
        frequency: formValue.frequency!,
        type: formValue.type!
      });
      this.expenseForm.reset();
      this.router.navigate(['/expenses']);
    }
  }
}
