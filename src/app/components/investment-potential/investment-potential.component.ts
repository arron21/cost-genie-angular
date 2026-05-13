import { Component, ChangeDetectionStrategy, input, computed } from '@angular/core';
import { CurrencyPipe } from '@angular/common';

@Component({
  selector: 'app-investment-potential',
  standalone: true,
  imports: [CurrencyPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (investmentProjections().length > 0) {
      <h3>Investment Potential (7% Annual Return)</h3>
      <p>By investing your positive remaining balance ({{ balance() | currency }}) at the end of each year:</p>
      <p><small><em>Compound Interest Formula used: A = P(1 + r)<sup>t</sup></em></small></p>
      <table>
        <thead>
          <tr>
            <th scope="col">Year</th>
            <th scope="col">Total Value</th>
            <th scope="col">Total Earned Interest</th>
          </tr>
        </thead>
        <tbody>
          @for (proj of investmentProjections(); track proj.year) {
            <tr>
              <td>{{ proj.year }}</td>
              <td>{{ proj.totalValue | currency }}</td>
              <td>{{ proj.earnedInterest | currency }}</td>
            </tr>
          }
        </tbody>
      </table>
    }
  `,
  styles: [`
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 1rem;
    }
    th, td {
      border: 1px solid #ccc;
      padding: 0.5rem;
      text-align: right;
    }
    th:first-child, td:first-child {
      text-align: left;
    }
  `]
})
export class InvestmentPotentialComponent {
  balance = input.required<number>();

  readonly investmentProjections = computed(() => {
    const annualInvestment = this.balance();
    if (annualInvestment <= 0) return [];
    
    const rate = 0.07; // 7% average annual return
    const projections = [];
    let principal = 0;
    
    // Project over 15 years
    for (let year = 1; year <= 15; year++) {
      principal += annualInvestment; // Add contribution at the end of the year
      const totalValue = principal * Math.pow(1 + rate, 1); // Compounded for that year
      principal = totalValue; // Next year's starting balance

      const totalContributed = annualInvestment * year;
      const earnedInterest = totalValue - totalContributed;

      projections.push({ 
        year, 
        totalValue, 
        earnedInterest 
      });
    }

    return projections;
  });
}