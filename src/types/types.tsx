export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  roles: string[]
}


export interface Category {
  id: string;
  name: string;
  createdAt: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  oldPrice: number; 
  categoryId: string;
  imageUrl: string;
  weight: string;
  rating: number;
  createdAt: string;
  quantity: number;
}

export interface CarouselItem {
  id: string;
  title1: string;
  title2: string;
  descreption: string;
  imgUrl: string;
  createdAt: string;
}
