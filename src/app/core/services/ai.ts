import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class Ai {
  private http = inject(HttpClient);
  private apiKey = '';
  private apiUrl = '/api-claude/v1/messages';

 askCloude(question: string, allProducts: any[]): Observable<string> {
  const context = allProducts.map(p => 
  `- [${p.title}] | ფასი: ${p.price.current}$ | რეიტინგი: ${p.rating} | ID: ${p._id || p.id}`
).join('\n');

  const headers = new HttpHeaders({
      'x-api-key': this.apiKey,
      'anthropic-version': '2023-06-01', 
      'Content-Type': 'application/json', 
      'anthropic-dangerous-direct-browser-access': 'true'
    });

   const body = {
      model: 'claude-sonnet-4-6', 
      max_tokens: 1024,
     system: `შენ ხარ TechStore-ის ასისტენტი. 
  
  მნიშვნელოვანი წესები:
  1. **მისალმება:** თუ მომხმარებელი პირდაპირ კითხვას სვამს, ნუ მიესალმები ყოველ ჯერზე. გადადი პირდაპირ საქმეზე.
  2. **სურათები:** არავითარ შემთხვევაში არ გამოიყენო სურათები (![]()) პასუხში.
  3. **ფორმატირება:** გამოიყენე Markdown-ის სუფთა სტრუქტურა. თითოეული პროდუქტი გამოაჩინე ასე:
     
     **📦 {დასახელება}**
     ⭐ რეიტინგი: {რეიტინგი} / 5
     💰 ფასი: {ფასი} $
     🔗 [ნახვა დეტალურად](/product/{ID})
     ---
  4. **შედარება:** თუ მომხმარებელი ორ პროდუქტს ადარებს, გამოიყენე Markdown ცხრილი ფასის და რეიტინგის საჩვენებლად.
  5. **ენა:** ისაუბრე მხოლოდ ქართულად, მოკლედ და კონკრეტულად.`,
  messages: [
    { role: 'user', content: `პროდუქტები:\n${context}\n\nკითხვა: ${question}` }
  ]
};
  return this.http.post(this.apiUrl, body, { headers }).pipe(
    map((res: any) => res.content[0].text)
  );
}

}
