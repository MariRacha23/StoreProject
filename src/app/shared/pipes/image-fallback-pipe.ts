import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'imageFallback',
})
export class ImageFallbackPipe implements PipeTransform {
  transform(value: string | undefined, categoryName: string = ''): string {
   if (value && !value.includes('alta.ge') && !value.includes('imgur.com')) {
    return value;
  }

  const category = categoryName ? categoryName.toLowerCase() : '';

  if (category.includes('laptop') || category.includes('pc')) {
    return 'img/msi-katana-15-hx_65wp.jpg';
  } 
  
  if (category.includes('phone') || category.includes('mobile') || category.includes('iphone')) {
    return 'img/iphone.jpg'; 
  }

  return 'img/msi-katana-15-hx_65wp.jpg';
  }
}
