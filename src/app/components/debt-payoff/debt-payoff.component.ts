import { Component, ChangeDetectionStrategy, computed, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { CurrencyPipe, DecimalPipe } from '@angular/common';

@Component({
  selector: 'app-debt-payoff',
  standalone: true,
  imports: [ReactiveFormsModule, CurrencyPipe, DecimalPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section aria-labelledby="debt-heading">
      <h2 id="debt-heading">Debt Payoff Calculator</h2>
      
      <form [formGroup]="debtForm" (ngSubmit)="calculate()">
        <fieldset>
          <legend>Enter Debt Details</legend>
          
          <div>
            <label for="principal">Principal Balance ($):</label>
            <input id="principal" type="number" formControlName="principal" min="1" step="0.01" required>
          </div>
          
          <div>
            <label for="interestRate">Annual Interest Rate (%):</label>
            <input id="interestRate" type="number" formControlName="interestRate" min="0" step="0.01" required>
          </div>
          
          <div>
            <label for="monthlyPayment">Monthly Payment ($):</label>
            <input id="monthlyPayment" type="number" formControlName="monthlyPayment" min="1" step="0.01" required>
          </div>
          
          <button type="submit" [disabled]="debtForm.invalid">Calculate Payoff</button>
        </fieldset>
      </form>

      @if (hasCalculated()) {
        <article class="results">
          <h3>Payoff Summary</h3>
          <p><small><em>Amortization periods formula used: N = -log(1 - (P * r) / Pmt) / log(1 + r)</em></small></p>
          @if (isPayable()) {
            <p><strong>Time to Payoff:</strong> {{ payoffMonths() }} months ({{ (payoffMonths() / 12) | number:'1.1-1' }} years)</p>
            <p><strong>Total Interest Paid:</strong> {{ totalInterest() | currency }}</p>
            <p><strong>Total Amount Paid:</strong> {{ (principalValue() + totalInterest()) | currency }}</p>
          } @else {
            <p class="error">Your monthly payment is too low exactly cover the interest. You will never pay off this debt at this rate!</p>
          }
        </article>
      }
    </section>
  `,
  styles: [`
    
  `]
})
export class DebtPayoffComponent {
  private fb = new FormBuilder();

  debtForm = this.fb.group({
    principal: [10000, [Validators.required, Validators.min(1)]],
    interestRate: [20, [Validators.required, Validators.min(0)]],
    monthlyPayment: [250, [Validators.required, Validators.min(1)]]
  });

  hasCalculated = signal(false);
  payoffMonths = signal(0);
  totalInterest = signal(0);
  isPayable = signal(true);
  principalValue = signal(0);

  calculate() {
    if (this.debtForm.invalid) return;

    const principal = this.debtForm.value.principal || 0;
    const rate = this.debtForm.value.interestRate || 0;
    const payment = this.debtForm.value.monthlyPayment || 0;
    
    this.principalValue.set(principal);
    this.hasCalculated.set(true);

    if (rate === 0) {
      this.isPayable.set(true);
      const months = Math.ceil(principal / payment);
      this.payoffMonths.set(months);
      this.totalInterest.set(0);
      return;
    }

    const monthlyRate = rate / 100 / 12;
    
    if (payment <= principal * monthlyRate) {
      this.isPayable.set(false);
      return;
    }

    this.isPayable.set(true);
    
    // N = -log(1 - (P * r) / Pmt) / log(1 + r)
    const months = -Math.log(1 - (principal * monthlyRate) / payment) / Math.log(1 + monthlyRate);
    const totalMonths = Math.ceil(months);
    
    this.payoffMonths.set(totalMonths);
    
    // Approximate total interest 
    // A more precise loop can be done, but this gives a quick number:
    const totalPaid = totalMonths * payment;
    const lastPaymentAdj = (totalMonths * payment) - (principal * Math.pow(1+monthlyRate, totalMonths) - payment * ((Math.pow(1+monthlyRate, totalMonths)-1)/monthlyRate));
    // Since ceiling affects the exact amount paid, simpler to just run an amortization loop.
    
    let currentBalance = principal;
    let interestPaid = 0;
    let actualMonths = 0;

    while (currentBalance > 0 && actualMonths < 1000) {
      actualMonths++;
      const interest = currentBalance * monthlyRate;
      interestPaid += interest;
      
      const applyToPrincipal = payment - interest;
      currentBalance -= applyToPrincipal;
    }

    this.payoffMonths.set(actualMonths);
    this.totalInterest.set(interestPaid);
  }
}