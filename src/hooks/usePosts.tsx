import { useEffect, useState } from "react";
import apiClient from "../apiClient/apiClient";
import type { Post } from "../types/types";
import { toast } from "react-toastify";
import type { FieldValues } from "react-hook-form";

function usePosts() {
    const [posts, setPosts] = useState<Post[]>([]);
    const [page, setPage] = useState(1);
    const [selectedUser, setSelectedUser] = useState<number | "">("");
    const [hasMore, setHasMore] = useState(true);
    const limit = 10;

    useEffect(() => {
        getPosts(page);
    }, [page, selectedUser]);

    const getPosts = (pageNumber: number) => {
        let url = `/posts?_page=${pageNumber}&_limit=${limit}`;
        if (selectedUser !== "") url += `&userId=${selectedUser}`;

        apiClient.get<Post[]>(url)
          .then((res) => {
            if (res.data.length < limit){
              setHasMore(false);
            }
            if (pageNumber === 1) {
              setPosts(res.data);
            } else {
              setPosts((prev) => [...prev, ...res.data]);
            }
          })
          .catch((error) => {
            console.error("Error fetching posts:", error);
          });
    };

    const loadMore = () => setPage((prev) => prev + 1);

    const createPost = (data: FieldValues) => {
        apiClient.post('/posts', data)
          .then((res) => {
            setPosts([res.data, ...posts]);
            toast.success('Post created successfully!');
          })
          .catch((error) => {
            console.error('Error creating post:', error);
          });
    }

    const updatePost = async (id: number, data: FieldValues) => {
      try {
        const res = await apiClient.put(`/posts/${id}`, data);
        const updatedPosts = posts.map(post => post.id === id ? res.data : post);
        setPosts(updatedPosts);
        toast.success("Post updated successfully");
        return res.data;
      } catch (err) {
        console.log(err);
        toast.error("Error updating post");
        throw err;
      }
    }

    const deletePost = async (id: number) => {
        try {
          await apiClient.delete(`/posts/${id}`);
          setPosts(posts.filter(post => post.id !== id));
          toast.success("Post deleted successfully");
        } catch (err) {
          console.log(err);
          toast.error("Error deleting post");
        }
    }

  return { posts,createPost, updatePost, deletePost, setSelectedUser, selectedUser, loadMore, hasMore};
}

export default usePosts;