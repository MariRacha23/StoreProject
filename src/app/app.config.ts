import { ApplicationConfig, importProvidersFrom, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, HttpClient } from '@angular/common/http';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TRANSLATE_HTTP_LOADER_CONFIG, TranslateHttpLoader } from '@ngx-translate/http-loader';
import { routes } from './app.routes';
import { provideMarkdown } from 'ngx-markdown';

export function HttpLoaderFactory(http: HttpClient) {
return new (TranslateHttpLoader as any)(http, './i18n/', '.json');
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(),
    provideMarkdown(),

    {
      provide: TRANSLATE_HTTP_LOADER_CONFIG,
      useValue: { prefix: './i18n/', suffix: '.json' }
    },

    importProvidersFrom(
      TranslateModule.forRoot({
        loader: {
          provide: TranslateLoader,
          useFactory: HttpLoaderFactory,
          deps: [HttpClient]
        }
      })
    )
  ]
};