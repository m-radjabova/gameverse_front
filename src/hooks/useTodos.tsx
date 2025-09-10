import { useEffect, useState } from "react";
import apiClient from "../apiClient/apiClient";
import type { Todos } from "../types/types";

function useTodos() {
    const [todos, setTodos] = useState<Todos[]>([]);
    const [page, setPage] = useState(1)
    const [pageSize, setPageSize] = useState(10)
    const [limit, setLimit] = useState(7)

    useEffect(() => {
        getTodos();
    }, [page, limit]);

    function getTodos() {
        apiClient.get(`/todos?_page=${page}&_limit=${limit}`)
        .then((res) => {
            setPageSize(Math.floor(res.headers["x-total-count"] / limit)); 
            setTodos(res.data);
        })
        .catch((error) => {
            console.error('Error fetching users:', error);
        })
    }

  return { todos, page, setPage, pageSize, limit, setLimit };
}

export default useTodos