import { ComponentFixture, TestBed } from '@angular/core/testing';
import { IncomeFormComponent } from './income-form.component';
import { DatabaseService } from '../../services/database.service';
import { signal } from '@angular/core';
import { vi } from 'vitest';

describe('IncomeFormComponent', () => {
  let component: IncomeFormComponent;
  let fixture: ComponentFixture<IncomeFormComponent>;
  let mockDatabaseService: any;

  beforeEach(async () => {
    mockDatabaseService = {
      saveIncome: vi.fn(),
      incomeData: signal({ monthlyIncome: 1000 })
    };

    await TestBed.configureTestingModule({
      imports: [IncomeFormComponent],
      providers: [
        { provide: DatabaseService, useValue: mockDatabaseService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(IncomeFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize the form with monthlyIncome control', () => {
    expect(component.incomeForm.contains('monthlyIncome')).toBe(true);
  });

  it('should invalidate form when monthlyIncome is negative', () => {
    const control = component.incomeForm.get('monthlyIncome');
    control?.setValue(-50);
    expect(control?.hasError('min')).toBe(true);
    expect(component.incomeForm.valid).toBe(false);
  });

  it('should call DatabaseService.saveIncome when onSubmit is called and form is valid', () => {
    mockDatabaseService.saveIncome.mockResolvedValue();
    
    component.incomeForm.setValue({ monthlyIncome: 2000 });
    component.onSubmit();

    expect(mockDatabaseService.saveIncome).toHaveBeenCalledWith(2000);
  });
});
