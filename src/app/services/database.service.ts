import { Injectable, signal } from '@angular/core';

export interface IncomeData {
  monthlyIncome: number | null;
}

export interface Expense {
  id?: number;
  name: string;
  amount: number;
  frequency: string;
  type: string;
}

@Injectable({
  providedIn: 'root'
})
export class DatabaseService {
  private readonly DB_NAME = 'CostGenieDB';
  private readonly DB_VERSION = 2; // Bumped version
  private readonly STORE_NAME = 'settings';
  private readonly EXPENSES_STORE = 'expenses';
  
  readonly incomeData = signal<IncomeData>({ monthlyIncome: null });
  readonly expensesData = signal<Expense[]>([]);
  private dbPromise: Promise<IDBDatabase>;

  constructor() {
    this.dbPromise = this.initDB();
    this.loadData();
  }

  private initDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.DB_NAME, this.DB_VERSION);

      request.onerror = () => {
        console.error('IndexedDB Error:', request.error);
        reject(request.error);
      };

      request.onsuccess = () => resolve(request.result);

      request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(this.STORE_NAME)) {
          db.createObjectStore(this.STORE_NAME);
        }
        if (!db.objectStoreNames.contains(this.EXPENSES_STORE)) {
          db.createObjectStore(this.EXPENSES_STORE, { keyPath: 'id', autoIncrement: true });
        }
      };
    });
  }

  private async loadData(): Promise<void> {
    try {
      const db = await this.dbPromise;
      await this.loadIncome(db);
      await this.loadExpenses(db);
    } catch (e) {
      console.error('Failed to load data from IndexedDB', e);
    }
  }

  private loadIncome(db: IDBDatabase): Promise<void> {
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(this.STORE_NAME, 'readonly');
      const store = transaction.objectStore(this.STORE_NAME);
      const request = store.get('monthlyIncome');

      request.onsuccess = () => {
        if (request.result !== undefined) {
          this.incomeData.set({ monthlyIncome: request.result });
        }
        resolve();
      };
      
      request.onerror = () => reject(request.error);
    });
  }

  private loadExpenses(db: IDBDatabase): Promise<void> {
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(this.EXPENSES_STORE, 'readonly');
      const store = transaction.objectStore(this.EXPENSES_STORE);
      const request = store.getAll();

      request.onsuccess = () => {
        this.expensesData.set(request.result || []);
        resolve();
      };
      
      request.onerror = () => reject(request.error);
    });
  }

  async saveIncome(monthlyIncome: number): Promise<void> {
    try {
      const db = await this.dbPromise;
      return new Promise((resolve, reject) => {
        const transaction = db.transaction(this.STORE_NAME, 'readwrite');
        const store = transaction.objectStore(this.STORE_NAME);
        const request = store.put(monthlyIncome, 'monthlyIncome');

        request.onsuccess = () => {
          this.incomeData.set({ monthlyIncome });
          resolve();
        };

        request.onerror = () => reject(request.error);
      });
    } catch (e) {
      console.error('Failed to save data to IndexedDB', e);
    }
  }

  async addExpense(expense: Omit<Expense, 'id'>): Promise<void> {
    try {
      const db = await this.dbPromise;
      return new Promise((resolve, reject) => {
        const transaction = db.transaction(this.EXPENSES_STORE, 'readwrite');
        const store = transaction.objectStore(this.EXPENSES_STORE);
        const request = store.add(expense);

        request.onsuccess = () => {
          this.expensesData.update(expenses => [...expenses, { ...expense, id: request.result as number }]);
          resolve();
        };

        request.onerror = () => reject(request.error);
      });
    } catch (e) {
      console.error('Failed to add expense to IndexedDB', e);
    }
  }

  async deleteExpense(id: number): Promise<void> {
    try {
      const db = await this.dbPromise;
      return new Promise((resolve, reject) => {
        const transaction = db.transaction(this.EXPENSES_STORE, 'readwrite');
        const store = transaction.objectStore(this.EXPENSES_STORE);
        const request = store.delete(id);

        request.onsuccess = () => {
          this.expensesData.update(expenses => expenses.filter(e => e.id !== id));
          resolve();
        };

        request.onerror = () => reject(request.error);
      });
    } catch (e) {
      console.error('Failed to delete expense', e);
    }
  }

  async updateExpense(expense: Expense): Promise<void> {
    try {
      const db = await this.dbPromise;
      return new Promise((resolve, reject) => {
        const transaction = db.transaction(this.EXPENSES_STORE, 'readwrite');
        const store = transaction.objectStore(this.EXPENSES_STORE);
        const request = store.put(expense);

        request.onsuccess = () => {
          this.expensesData.update(expenses =>
            expenses.map(e => (e.id === expense.id ? expense : e))
          );
          resolve();
        };

        request.onerror = () => reject(request.error);
      });
    } catch (e) {
      console.error('Failed to update expense', e);
    }
  }
}
