import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class QrService {
  private http = inject(HttpClient);

  generateQR(siteUrl: string) {
    return this.http.get(`https://api.everrest.educata.dev/qrcode?url=${siteUrl}`, {
      responseType: 'blob',
    });
  }
}
