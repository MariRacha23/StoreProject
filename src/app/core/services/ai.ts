import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class Ai {
  private http = inject(HttpClient);
  private apiKey = '';
  private apiUrl = 'https://platform.claude.com/dashboard/api/v1/claude';

  askCloude(question: string, products: any[]): Observable<string> {
    const context = products.map(p => 
      `- ${p.title}: ფასი ${p.price}$, რეიტინგი ${p.rating}, ბრენდი ${p.brand}`
    ).join('\n');

    const headers = new HttpHeaders({
      'x-api-key': this.apiKey,
      'anthropic-version': '2023-06-01', 
      'Content-Type': 'application/json',
      'dangerouslyAllowBrowser': 'true' 
    });

    const body = {
      model: 'claude-3-5-sonnet-20240620', 
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: `შენ ხარ ტექნიკის მაღაზიის ასისტენტი. 
          აი ჩვენი პროდუქტები:
          ${context}
          
          მომხმარებელი გეკითხება: ${prompt}
          უპასუხე მოკლედ, ქართულად და დაეხმარე არჩევაში.`
        }
      ]
    };

    return this.http.post(this.apiUrl, body, { headers }).pipe(
      map((res: any) => res.content[0].text)
    );
  
  }

}
