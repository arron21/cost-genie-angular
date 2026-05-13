import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { DatabaseService } from '../../services/database.service';

@Component({
  selector: 'app-income-form',
  imports: [ReactiveFormsModule, CurrencyPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="income-form-container">
      <h2>Monthly Income Setup</h2>
      <form [formGroup]="incomeForm" (ngSubmit)="onSubmit()">
        <fieldset>
          <legend>Enter Income</legend>
        <div class="form-group">
          <label for="monthlyIncome">Monthly Income:</label>
          <input 
            id="monthlyIncome" 
            type="number" 
            formControlName="monthlyIncome" 
            placeholder="Enter your monthly income" 
            min="0"
          />
        </div>
        <button type="submit" [disabled]="incomeForm.invalid">Save</button>
        </fieldset>
      </form>
      
      @if (savedIncome() !== null) {
        <p class="success-msg">Currently saved income: {{ savedIncome() | currency }}</p>
      }
    </div>
  `,
  styles: [`
   
  `]
})
export class IncomeFormComponent {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly databaseService = inject(DatabaseService);

  readonly incomeForm = this.fb.group({
    monthlyIncome: [
      this.databaseService.incomeData().monthlyIncome ?? 0, 
      [Validators.required, Validators.min(0)]
    ]
  });

  protected readonly savedIncome = () => this.databaseService.incomeData().monthlyIncome;

  onSubmit(): void {
    if (this.incomeForm.valid) {
      this.databaseService.saveIncome(this.incomeForm.getRawValue().monthlyIncome);
    }
  }
}
