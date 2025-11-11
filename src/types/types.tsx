export interface User {
  id: number;
  username: string;
  email: string;
  age: number;
  phone_number: string;
  address: string;
}

export interface Post {
  id: number;
  title: string;
  body: string;
  user_id: number;
}

export interface Todo {
  id: number;
  title: string;
  completed: boolean;
  user_id: number;
}