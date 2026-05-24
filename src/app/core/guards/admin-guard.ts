import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { CanActivateFn, Router } from '@angular/router';

export const adminGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const platformId = inject(PLATFORM_ID);

  if (isPlatformBrowser(platformId)) {
    const userData = sessionStorage.getItem('currentUser');

    if (!userData) {
      router.navigate(['/auth/login']);
      return false;
    }

    try {
      const user = JSON.parse(userData);
      const adminEmail = 'hoxem98460@hilostar.com';

      if (user?.email?.toLowerCase() === adminEmail.toLowerCase()) {
        return true;
      } else {
        alert('Access Denied! Admins only.');
        router.navigate(['/']);
        return false;
      }
    } catch (e) {
      router.navigate(['/auth/login']);
      return false;
    }
  }

  return false;
};
