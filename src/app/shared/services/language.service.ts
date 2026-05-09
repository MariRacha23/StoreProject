import { inject, Injectable, signal } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Injectable({
  providedIn: 'root',
})
export class LanguageService {
  private translate = inject(TranslateService);
  
public currentLang = signal('en');

 constructor() {
  const translate = inject(TranslateService); 
  translate.addLangs(['en', 'ka']);
  translate.setDefaultLang('en');
  translate.use('en');
}

  changeLang(lang: 'en' | 'ka') {
    this.translate.use(lang).subscribe(() => {
      this.currentLang.set(lang);
    });
  }
}
