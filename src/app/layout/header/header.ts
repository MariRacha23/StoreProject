import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { Auth } from '../../core/auth/auth';
import { CartService } from '../../core/services/cart.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { TranslateModule } from '@ngx-translate/core';
import { LanguageService } from '../../shared/services/language.service';

@Component({
  selector: 'app-header',
  imports: [RouterModule, CommonModule,TranslateModule],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header implements OnInit {
  public authService = inject(Auth);
  private router = inject(Router);
  private cartService = inject(CartService);
  public langService = inject(LanguageService);

  public cartCount = toSignal(this.cartService.cartCount$, { initialValue: 0 });


  ngOnInit() {
    this.cartService.updateCartCount();
  }
  switchLanguage(lang: 'en' | 'ka') {
    this.langService.changeLang(lang);
  }

  logout() {
    sessionStorage.removeItem('user_token');
    this.authService.currentUser.set(null);
    this.router.navigate(['/auth/login']);
  }
}
