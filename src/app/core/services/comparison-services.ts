import { effect, Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ComparisonServices {
  private compareList = signal<any[]>(JSON.parse(sessionStorage.getItem('compare_items') || '[]'));
  public items = this.compareList.asReadonly();

  constructor() {
    effect(() => {
      sessionStorage.setItem('compare_items', JSON.stringify(this.compareList()));
    });
  }

  addToCompare(product: any) {
    this.compareList.update((list) => {
      if (list.find((p) => p._id === product._id)) return list;
      const newList = [...list, product];
      return newList.length > 4 ? newList.slice(1) : newList;
    });
  }

  removeFromCompare(productId: string) {
    this.compareList.update((list) => list.filter((p) => p._id !== productId));
  }

  clearAll() {
    this.compareList.set([]);
  }
}
