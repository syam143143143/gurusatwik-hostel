import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const platformId = inject(PLATFORM_ID);

  // During SSR, don't redirect.
  if (!isPlatformBrowser(platformId)) {
    return true;
  }

  // Browser: check localStorage.
  if (authService.isLoggedIn()) {
    return true;
  }

  return router.createUrlTree(['/login']);
};
