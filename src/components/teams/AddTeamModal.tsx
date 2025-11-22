
import useTeams from "../../hooks/useTeams";
import { 
  Drawer,
  Box,
  TextField
} from "@mui/material";
import ModalHeader from "../projects/add_modal/ModalHeader";
import { Controller, useForm } from "react-hook-form";
import FormField from "../projects/add_modal/FromField";
import { inputStyles } from "../../utils";
import SubmitButton from "../projects/add_modal/SubmitButton";
import { IoMdCheckmarkCircle } from "react-icons/io";
import { PeopleFill } from "react-bootstrap-icons";

interface AddTeamModalProps {
  openAddModal: boolean;
  handleCloseModal: () => void;
}

function AddTeamModal({ openAddModal, handleCloseModal }: AddTeamModalProps) {
  const { addTeam } = useTeams();

  const { handleSubmit, formState: { errors }, control, reset } = useForm({
    defaultValues: {
      name: ''
    }
  });

  const onSubmit = (data: { name: string }) => {
      addTeam({ 
        name: data.name
      });
    reset();
    handleCloseModal();
  };

  const handleClose = () => {
    reset();
    handleCloseModal();
  };

  return (
    <Drawer
      className="status-modal-drawer"
      anchor="right"
      open={openAddModal}
      onClose={handleClose}
    >
      <Box className="status-modal-container" sx={{ p: 3, width: 700 }}>
        <ModalHeader 
          onClose={handleClose} 
          title="Create Team"
        />

        <Box
          component="form"
          onSubmit={handleSubmit(onSubmit)}
          sx={{ flex: 1, display: "flex", flexDirection: "column", gap: 3 }}
        >
          <Controller
            name="name"
            control={control}
            rules={{ required: "Name is required" }}
            render={({ field }) => (
              <FormField
                icon={<PeopleFill style={{ color: "#6366f1", fontSize: "1.1rem" }} />}
                label="Name"
                error={errors.name?.message as string}
              >
                <TextField
                  {...field}
                  fullWidth
                  placeholder="Enter team name..."
                  error={!!errors.name}
                  helperText={errors.name?.message}
                  sx={inputStyles}
                />
              </FormField>
            )}
          />
          
          <SubmitButton
            startIcon={<IoMdCheckmarkCircle />}
          >
            Create Team
          </SubmitButton>
        </Box>
      </Box>
    </Drawer>
  )
}

export default AddTeamModal;