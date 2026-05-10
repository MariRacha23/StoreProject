import { inject, Injectable, signal } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Injectable({
  providedIn: 'root',
})
export class LanguageService {
  private translate = inject(TranslateService);
  
public currentLang = signal('en');

 constructor() {
  this.translate.addLangs(['en', 'ka']);
    this.translate.setDefaultLang('en');
    
    const savedLang = localStorage.getItem('lang') as 'en' | 'ka';
    const finalLang = savedLang || 'en';
    
    this.translate.use(finalLang);
    this.currentLang.set(finalLang);
  }

  changeLang(lang: 'en' | 'ka') {
    this.translate.use(lang).subscribe(() => {
      this.currentLang.set(lang);
      localStorage.setItem('lang', lang); 
    });
  }
}
