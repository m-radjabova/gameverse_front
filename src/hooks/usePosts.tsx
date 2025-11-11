import { useEffect, useState } from "react";
import apiClient from "../apiClient/apiClient";
import type { Post } from "../types/types";

function usePosts() {
  const [posts, setPosts] = useState<Post[]>([]);

  useEffect(() => {
    getPosts();
  }, []);

  const getPosts = async () => {
    try {
      const response = await apiClient.get("/posts");
      setPosts(response.data);
    } catch (error) {
      console.error("Error fetching posts:", error);
    }
  };

  const addPost = async (post: Post) => {
    try {
      const response = await apiClient.post("/posts", post);
      setPosts([...posts, response.data]);
    } catch (error) {
      console.error("Error adding post:", error);
    }
  };

  const updatePost = async (post: Post) => {
    try {
      const response = await apiClient.put(`/posts/${post.id}`, post);
      setPosts(posts.map((u) => (u.id === post.id ? response.data : u)));
    } catch (error) {
      console.error("Error updating post:", error);
    }
  };

  const deletePost = async (id: number) => {
    try {
      await apiClient.delete(`/posts/${id}`);
      setPosts(posts.filter((post) => post.id !== id));
    } catch (error) {
      console.error("Error deleting post:", error);
    }
  };

  return { posts, addPost, updatePost, deletePost };
}

export default usePosts;
