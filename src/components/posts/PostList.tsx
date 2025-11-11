import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Box,
  Typography,
  Button,
} from "@mui/material";
import type { Post } from "../../types/types";
import { FaEdit, FaTrash } from "react-icons/fa";
import usePosts from "../../hooks/usePosts";
import { useState } from "react";
import PostModal from "./PostForm";
import { useNavigate } from "react-router-dom";

function PostList() {
  const { posts, addPost, updatePost, deletePost } = usePosts();
  const [open, setOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const navigate = useNavigate();

  const handleCreatePost = () => {
    setSelectedPost(null);
    setOpen(true);
  };

  const handleEditPost = (post: Post) => {
    setSelectedPost(post);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedPost(null);
  };

  const handleSubmit = (post: Post) => {
    if (post.id) {
      updatePost(post);
    } else {
      addPost(post);
    }
    handleClose();
  };

  const handleDeletePost = (id: number) => {
    if (window.confirm("Are you sure you want to delete this post?")) {
      deletePost(id);
    }
  };

  return (
    <TableContainer component={Paper}>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={4}
        p={2}
      >
        <Button variant="contained" onClick={() => navigate(-1)}>Back</Button>
        <Typography variant="h4" component="h1">
          Post Management
        </Typography>
        <Button variant="contained" onClick={handleCreatePost} size="large">
          Create Post
        </Button>
      </Box>
      <Table sx={{ minWidth: 650 }} aria-label="post table">
        <TableHead>
          <TableRow>
            <TableCell>
              <strong>ID</strong>
            </TableCell>
            <TableCell>
              <strong>Title</strong>
            </TableCell>
            <TableCell>
              <strong>Body</strong>
            </TableCell>
            <TableCell>
              <strong>User ID</strong>
            </TableCell>
            <TableCell>
              <strong>Actions</strong>
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {posts.map((post) => (
            <TableRow
              key={post.id}
              sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
            >
              <TableCell component="th" scope="row">
                {post.id}
              </TableCell>
              <TableCell>
                <Typography 
                  variant="body1" 
                  sx={{ 
                    maxWidth: 200, 
                    overflow: "hidden", 
                    textOverflow: "ellipsis", 
                    whiteSpace: "nowrap" 
                  }}
                >
                  {post.title}
                </Typography>
              </TableCell>
              <TableCell>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    maxWidth: 300, 
                    overflow: "hidden", 
                    textOverflow: "ellipsis", 
                    whiteSpace: "nowrap" 
                  }}
                >
                  {post.body}
                </Typography>
              </TableCell>
              <TableCell>{post.user_id}</TableCell>
              <TableCell>
                <Box display="flex" gap={1}>
                  <IconButton
                    color="primary"
                    onClick={() => handleEditPost(post)}
                    size="small"
                  >
                    <FaEdit />
                  </IconButton>
                  <IconButton
                    color="error"
                    onClick={() => handleDeletePost(post.id!)}
                    size="small"
                  >
                    <FaTrash />
                  </IconButton>
                </Box>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <PostModal
        isOpen={open} 
        onClose={handleClose} 
        onSubmit={handleSubmit} 
        editingPost={selectedPost}
      />
    </TableContainer>
  );
}

export default PostList;