export interface Product {
  _id: string;
  title: string;
  description: string;
  price: {
    current: number;
    currency: string;
    beforeDiscount: number;
    discountPercentage: number;
  };
  thumbnail: string;
  images: string[];
  rating: number;
  stock: number;
  brand: string;
  category: {
    id: string;
    name: string;
    image: string;
  };
}

export interface ProductResponse {
  products: Product[];
  total: number;
  limit: number;
  skip: number;
  page: number;
}
