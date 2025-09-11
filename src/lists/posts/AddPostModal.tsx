import { Box, Button, Modal, Select, TextField, Typography, MenuItem, InputLabel, FormControl } from "@mui/material"
import { useEffect } from "react";
import { useForm, type FieldValues } from "react-hook-form";
import useUsers from "../../hooks/useUsers";


interface Props {
    isOpen: boolean;
    setOpen: (isOpen: boolean) => void;
    createPost: (data: FieldValues) => void;
    updatePost: (id: number, data: FieldValues) => void;
    editPost?: FieldValues | null;
}

function AddPostModal({isOpen, setOpen, createPost, updatePost, editPost}: Props) {
    const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm();
    const {users} = useUsers();

    useEffect(() => {
        if (editPost) {
            reset(editPost);
        } else {
            reset({userId: "", title: "", body: ""});
        }
    }, [editPost, reset]);

    const onSubmit = (data: FieldValues) => {
        if (editPost) {
            updatePost(editPost.id, data);
        } else {
            createPost(data);
        }
        setOpen(false);
        reset({userId: "", title: "", body: ""});
    }

    const handleClose = () => {
        reset();
        setOpen(false);
    }


    return (
        <Modal
            open={isOpen}
            onClose={handleClose}
            aria-labelledby="modal-modal-title"
            aria-describedby="modal-modal-description"
        >
            <Box sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: 400,
                bgcolor: 'background.paper',
                boxShadow: 24,
                p: 4,
                borderRadius: 2
            }}>
                <Typography id="modal-modal-title" variant="h6" component="h2" sx={{ mb: 2 }}>
                    {editPost ? "Edit Post" : "Create Post"}
                </Typography>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <FormControl fullWidth sx={{ mb: 2 }}>
                        <InputLabel id="user-select-label">User</InputLabel>
                        <Select
                            labelId="user-select-label"
                            label="User"
                            defaultValue={editPost?.userId || ""}
                            {...register("userId", { required: "User is required" })}
                            error={!!errors.userId}
                        >
                            {users.map(user => (
                                <MenuItem key={user.id} value={user.id}>
                                    {user.name}
                                </MenuItem>
                            ))}
                        </Select>
                        {errors.userId && (
                            <Typography variant="caption" color="error">
                                {errors.userId.message as string}
                            </Typography>
                        )}
                    </FormControl>
                    
                    <TextField
                        fullWidth
                        label="Title"
                        variant="outlined"
                        sx={{ mb: 2 }}
                        {...register("title", { required: "Title is required" })}
                        error={!!errors.title}
                        helperText={errors.title?.message as string}
                    />
                    
                    <TextField
                        fullWidth
                        multiline
                        rows={4}
                        label="Body"
                        variant="outlined"
                        sx={{ mb: 2 }}
                        {...register("body", { required: "Body is required" })}
                        error={!!errors.body}
                        helperText={errors.body?.message as string}
                    />
                    
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                        <Button onClick={handleClose} variant="outlined">
                            Cancel
                        </Button>
                        <Button 
                            type="submit" 
                            variant="contained" 
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? "Saving..." : (editPost ? "Update" : "Create")}
                        </Button>
                    </Box>
                </form>
            </Box>
        </Modal>
    )
}

export default AddPostModal