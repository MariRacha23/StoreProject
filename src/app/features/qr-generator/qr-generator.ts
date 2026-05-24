import { Component, signal } from '@angular/core';

@Component({
  selector: 'app-qr-generator',
  imports: [],
  templateUrl: './qr-generator.html',
  styleUrl: './qr-generator.css',
})
export class QrGenerator {

  public qrCodeImage = signal<string | null>(null);
  public isModalOpen = signal(false);

  toggleModal() {
    this.isModalOpen.set(!this.isModalOpen());

    if (this.isModalOpen() && !this.qrCodeImage()) {
      this.generateQR();
    }
  }

  generateQR() {
   const currentUrl = window.location.href; 
    const finalImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(currentUrl)}`;
    
    this.qrCodeImage.set(finalImageUrl);
  }
}
