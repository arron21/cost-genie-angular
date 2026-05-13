import { Component, ChangeDetectionStrategy, computed, inject } from '@angular/core';
import { CurrencyPipe, PercentPipe } from '@angular/common';
import { DatabaseService, Expense } from '../../services/database.service';
import { InvestmentPotentialComponent } from '../investment-potential/investment-potential.component';

@Component({
  selector: 'app-summary',
  imports: [CurrencyPipe, PercentPipe, InvestmentPotentialComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section aria-labelledby="summary-heading">
      <h2 id="summary-heading">Summary</h2>
      <article>
        <h3>Financial Overview (Annual)</h3>
        <p><strong>Yearly Income:</strong> {{ yearlyIncome() | currency }}</p>
        <p><strong>Total Yearly Expenses:</strong> {{ yearlyExpenses() | currency }}</p>
        <p><strong>Remaining Balance:</strong> <span [class.negative]="balance() < 0">{{ balance() | currency }}</span></p>

        <h3>Expenses Breakdown</h3>
        <ul>
          <li><strong>Needs:</strong> {{ needsPercentage() | percent:'1.0-1' }} ({{ yearlyNeeds() | currency }})</li>
          <li><strong>Wants:</strong> {{ wantsPercentage() | percent:'1.0-1' }} ({{ yearlyWants() | currency }})</li>
        </ul>

        <h3>Budgeting Tips (50/30/20 Rule)</h3>
        <ul>
          @for (tip of budgetTips(); track $index) {
            <li>{{ tip }}</li>
          }
          @if (budgetTips().length === 0) {
            <li>Great job! Your budget looks well-balanced according to the 50/30/20 rule.</li>
          }
        </ul>

        <app-investment-potential [balance]="balance()" />
      </article>
    </section>
  `,
  styles: [`
    .negative {
      color: #dc3545;
      font-weight: bold;
    }
  `]
})
export class SummaryComponent {
  private readonly databaseService = inject(DatabaseService);

  readonly yearlyIncome = computed(() => {
    const monthlyIncome = this.databaseService.incomeData().monthlyIncome || 0;
    return monthlyIncome * 12;
  });

  private calculateYearly(expenses: Expense[]): number {
    return expenses.reduce((total, expense) => {
      let multiplier = 1;
      switch (expense.frequency) {
        case 'daily': multiplier = 365; break;
        case 'weekly': multiplier = 52; break;
        case 'monthly': multiplier = 12; break;
        case 'quarterly': multiplier = 4; break;
        case 'annually': multiplier = 1; break;
      }
      return total + (expense.amount * multiplier);
    }, 0);
  }

  readonly yearlyExpenses = computed(() => this.calculateYearly(this.databaseService.expensesData()));

  readonly yearlyNeeds = computed(() => 
    this.calculateYearly(this.databaseService.expensesData().filter(e => e.type === 'need'))
  );

  readonly yearlyWants = computed(() => 
    this.calculateYearly(this.databaseService.expensesData().filter(e => e.type === 'want'))
  );

  readonly needsPercentage = computed(() => 
    this.yearlyExpenses() === 0 ? 0 : this.yearlyNeeds() / this.yearlyExpenses()
  );

  readonly wantsPercentage = computed(() => 
    this.yearlyExpenses() === 0 ? 0 : this.yearlyWants() / this.yearlyExpenses()
  );

  readonly balance = computed(() => this.yearlyIncome() - this.yearlyExpenses());

  readonly budgetTips = computed(() => {
    const tips: string[] = [];
    const income = this.yearlyIncome();
    
    if (income <= 0) {
      return ['Please enter a monthly income greater than 0 to receive budgeting tips.'];
    }

    const needsRatio = this.yearlyNeeds() / income;
    const wantsRatio = this.yearlyWants() / income;
    const savingsRatio = this.balance() / income;

    if (needsRatio > 0.5) {
      tips.push('Your needs exceed 50% of your income. Consider finding ways to reduce fixed expenses or increase your income.');
    }
    
    if (wantsRatio > 0.3) {
      tips.push('Your wants exceed 30% of your income. Look for non-essential subscriptions or lifestyle habits to cut.');
    }
    
    if (savingsRatio < 0.2) {
      tips.push('Your savings (remaining balance) are below 20% of your income. Prioritize "paying yourself first" before allocating to wants.');
    }

    return tips;
  });
}
