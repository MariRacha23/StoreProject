import { Routes } from '@angular/router';
import { adminGuard } from './core/guards/admin-guard';

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
{ 
  path: 'admin', 
  loadComponent: () => import('./features/admin/admin').then(m => m.Admin),
  canActivate: [adminGuard] 
},
{
  path: 'compare',
  loadComponent: () => import('./features/comparison/comparison').then(m => m.Comparison),
},
    { path: '**', redirectTo: '' }
];
