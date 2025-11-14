export interface User {
  id: number;
  username: string;
  email: string;
  address: {
    street: string;
    city: string;
  };
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

export interface Comment {
  id: number;
  name: string;
  email: string;
  body: string;
  postId: number;
}