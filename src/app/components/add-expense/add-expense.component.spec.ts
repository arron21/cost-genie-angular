import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AddExpenseComponent } from './add-expense.component';
import { provideRouter, Router } from '@angular/router';
import { DatabaseService } from '../../services/database.service';
import { vi } from 'vitest';

describe('AddExpenseComponent', () => {
  let component: AddExpenseComponent;
  let fixture: ComponentFixture<AddExpenseComponent>;
  let mockDatabaseService: any;
  let router: Router;

  beforeEach(async () => {
    mockDatabaseService = {
      addExpense: vi.fn().mockResolvedValue(undefined)
    };

    await TestBed.configureTestingModule({
      imports: [AddExpenseComponent],
      providers: [
        provideRouter([]),
        { provide: DatabaseService, useValue: mockDatabaseService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AddExpenseComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    vi.spyOn(router, 'navigate').mockResolvedValue(true);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize the form as invalid', () => {
    expect(component.expenseForm.valid).toBe(false);
  });

  it('should mark the form as valid when valid data is provided', () => {
    component.expenseForm.patchValue({
      name: 'Groceries',
      amount: 150.50,
      frequency: 'weekly',
      type: 'need'
    });
    expect(component.expenseForm.valid).toBe(true);
  });

  it('should require a name', () => {
    const nameControl = component.expenseForm.get('name');
    nameControl?.setValue('');
    expect(nameControl?.hasError('required')).toBe(true);
  });

  it('should require an amount of 0 or greater', () => {
    const amountControl = component.expenseForm.get('amount');
    amountControl?.setValue(-10);
    expect(amountControl?.hasError('min')).toBe(true);

    amountControl?.setValue(10);
    expect(amountControl?.hasError('min')).toBe(false);
  });

  it('should save the expense via DatabaseService when form is valid', async () => {
    component.expenseForm.patchValue({
      name: 'Electric Bill',
      amount: 65,
      frequency: 'monthly',
      type: 'need'
    });

    await component.onSubmit();

    expect(mockDatabaseService.addExpense).toHaveBeenCalledWith({
      name: 'Electric Bill',
      amount: 65,
      frequency: 'monthly',
      type: 'need'
    });
  });
});
