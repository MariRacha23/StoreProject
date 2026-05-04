import { Routes } from '@angular/router';

export const routes: Routes = [
    {
        path: '',
        loadComponent: () => import('./features/products/products-list.component/products-list.component').then(m => m.ProductsListComponent)
    },
  { 
    path: 'auth/login', 
    loadComponent: () => import('./features/auth/login/login').then(m => m.Login) 
  },
  { 
    path: 'auth/register', 
    loadComponent: () => import('./features/auth/register/register').then(m => m.Register) 
  },
  { 
    path: 'auth/profile', 
    loadComponent: () => import('./features/auth/profile/profile').then(m => m.Profile) 
  },
  { 
  path: 'product/:id', 
  loadComponent: () => import('./features/products/product-detail/product-detail').then(m => m.ProductDetail)
},
{
  path: 'cart',
  loadComponent: () => import('./features/cart/cart').then(m => m.Cart) 
},
    { path: '**', redirectTo: '' }
];
