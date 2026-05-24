import { Component, OnInit, signal } from '@angular/core';
import { RouterModule, RouterOutlet } from '@angular/router';
import { Header } from './layout/header/header';
import { Footer } from './layout/footer/footer';
import { ToastComponent } from './shared/components/toast-component/toast-component';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-root',
  imports: [RouterModule, RouterOutlet, Header, Footer, ToastComponent,TranslateModule],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App  implements OnInit {
  protected readonly title = signal('StoreProject');
  ngOnInit(): void {
  const savedTheme = sessionStorage.getItem('theme');
  if (savedTheme === 'dark') {
    document.body.classList.add('dark-theme');
  } else {
    document.body.classList.remove('dark-theme');
  }
}
}
