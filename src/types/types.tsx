export interface UserForSql {
  id: number;
  email: string;
  phone_number: string;
  full_name: string;
}

export interface ReqUserForSql {
  email: string;
  phone_number: string;
  full_name: string;
}


export interface Post {
  id: number;
  title: string;
  body: string;
  user_id: number;
}

export interface ReqPost {
  title: string;
  body: string;
  user_id: number;
}

export interface Comment{
  comment_id: number;
  name: string;
  email: string;
  body: string;
  post_id: number;
}

export interface ReqComment{
  name: string;
  email: string;
  body: string;
  post_id: number;
}

export interface Todo{
  todo_id: number;
  title: string;
  completed: boolean;
  user_id: number;
}

export interface ReqTodo{
  title: string;
  completed: boolean;
  user_id: number;
}

export interface Details {
  name: string;
}

export interface Car {
  car_id: number;
  model: string;
  color: string;
  year: string;
  details: Details[];
}

export interface ReqCar {
  model: string;
  color: string;
  year: string;
  details: Details[];
}
