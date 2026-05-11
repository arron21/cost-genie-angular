import { Routes } from '@angular/router';

export const routes: Routes = [
    {
        path: '',
        redirectTo: 'income',
        pathMatch: 'full'
    },
    {
        path: 'income',
        loadComponent: () => import('./components/income-form/income-form.component').then(m => m.IncomeFormComponent)
    },
    {
        path: 'expenses',
        loadComponent: () => import('./components/expenses/expenses.component').then(m => m.ExpensesComponent)
    },
    {
        path: 'summary',
        loadComponent: () => import('./components/summary/summary.component').then(m => m.SummaryComponent) 
    }, {
        path: 'add-expense',
        loadComponent: () => import('./components/add-expense/add-expense.component').then(m => m.AddExpenseComponent)
    }
];
