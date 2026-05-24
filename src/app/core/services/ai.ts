import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class Ai {
  private http = inject(HttpClient);
  private apiUrl = '/api-claude/v1/messages';

  askCloude(question: string, allProducts: any[], isLoggedIn: boolean = false): Observable<string> {
    const apiKey = environment.aiApikey;
    const context = allProducts
      .map(
        (p) =>
          `- [${p.title}] | ფასი: ${p.price.current}$ | რეიტინგი: ${p.rating} | ID: ${p._id || p.id}`,
      )
      .join('\n');

    const headers = new HttpHeaders({
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'Content-Type': 'application/json',
      'anthropic-dangerous-direct-browser-access': 'true',
    });

    const body = {
      model: 'claude-sonnet-4-6',
      max_tokens: 1024,
      system: `შენ ხარ TechStore-ის ასისტენტი. 
  
ნიშვნელოვანი წესები:
1. **მისალმება:** თუ მომხმარებელი პირდაპირ კითხვას სვამს, ნუ მიესალმები ყოველ ჯერზე. გადადი პირდაპირ საქმეზე.
2. **სურათები:** არავითარ შემთხვევაში არ გამოიყენო სურათები (![]()) პასუხში.
3. **ფორმატირება:** გამოიყენე Markdown-ის სუფთა სტრუქტურა. თითოეული პროდუქტი გამოაჩინე ასე:
   **📦 {დასახელება}**
   ⭐ რეიტინგი: {რეიტინგი} / 5
   💰 ფასი: {ფასი} $
   🔗 [ნახვა დეტალურად](/product/{ID})
   ---
4. **შედარება:** თუ მომხმარებელი ორ პროდუქტს ადარებს, გამოიყენე Markdown ცხრილი ფასის და რეიტინგის საჩვენებლად.

5. **კალათაში დამატება და ყიდვა:**
   - როდესაც მომხმარებელი ითხოვს პროდუქტის ყიდვას ან კალათაში დამატებას, აუცილებლად დააკვირდი მომხმარებლის ავტორიზაციის სტატუსს (User Auth Status), რომელიც მოწოდებულია შეტყობინების დასაწყისში.
   
   - თუ User isLoggedIn = false, მაშინ პასუხში აუცილებლად უთხარი: "კალათაში პროდუქტების დასამატებლად და შესაძენად საჭიროა გაიაროთ ავტორიზაცია/რეგისტრაცია."
   
   - თუ User isLoggedIn = true, ეს ნიშნავს, რომ მომხმარებელი უკვე ავტორიზებულია! ამიტომ, რეგისტრაციის შეხსენება საერთოდ გამოტოვე. უბრალოდ უპასუხე პოზიტიურად, მაგალითად: "რა თქმა უნდა, სიამოვნებით დაგიმატებთ!" ან "პროდუქტი ემატება თქვენს კალათაში."
   
   - ორივე შემთხვევაში, პასუხის სულ ბოლო ხაზზე უცვლელად დასვი მოქმედების ტეგი სწორი ID-ით: [ACTION: ADD_TO_CART, ID: პროდუქტის_იდენტიფიკატორი]

6. **ენა:** ისაუბრე მხოლოდ ქართულად, მოკლედ და კონკრეტულად.
7. **მარაგების კონტროლი:** თუ პროდუქტის მონაცემებში მარაგი (stock ან quantity) არის 0, ან თუ პროდუქტს აწერია რომ გაყიდულია, მომხმარებელს ნუ შესთავაზებ მის კალათაში დამატებას. ურჩიე მხოლოდ ის ნივთები, რომლებიც რეალურად ხელმისაწვდომია საწყობში.`,

      messages: [
        {
          role: 'user',
          content: `[User Auth Status: isLoggedIn = ${isLoggedIn}]\n\nპროდუქტები:\n${context}\n\nკითხვა: ${question}`,
        },
      ],
    };

    return this.http
      .post(this.apiUrl, body, { headers })
      .pipe(map((res: any) => res.content[0].text));
  }
}
