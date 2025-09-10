import { useEffect, useState } from "react";
import apiClient from "../apiClient/apiClient";
import type { Post } from "../types/types";

function usePosts() {
    const [posts, setPosts] = useState<Post[]>([]);
    const [page, setPage] = useState(1)
    const [pageSize, setPageSize] = useState(10)
    const [limit, setLimit] = useState(7)

    useEffect(() => {
        getPosts();
    }, []);

    const getPosts = async () => {
        try {
            const response = await apiClient.get(`/posts?_page=${page}&_limit=${limit}`);
            setPageSize(Math.floor(response.headers["x-total-count"] / limit));
            setPosts(response.data);  
        } catch (error) {
            console.error('Error fetching users:', error);
        }
    };


  return { posts, page, setPage, pageSize, limit, setLimit };
}

export default usePosts