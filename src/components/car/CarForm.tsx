import React, { useEffect } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import type { Car, Details, ReqCar } from "../../types/types";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  IconButton,
  Chip,
  Typography,
  Paper,
  Divider,
  InputAdornment,
  FormHelperText,
  Tooltip,
} from "@mui/material";
import {
  FaCar,
  FaPlus,
  FaTrash,
  FaPalette,
  FaCalendarAlt,
  FaCog,
  FaTimes,
} from "react-icons/fa";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ReqCar) => void;
  editingCar: Car | null;
}

interface CarFormData {
  model: string;
  color: string;
  year: string;
  details: Array<{ detail_id?: number; name: string; id?: string | number }>;
}

const CarModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onSubmit,
  editingCar,
}) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    control,
    watch,
  } = useForm<CarFormData>({
    defaultValues: {
      model: "",
      color: "",
      year: "",
      details: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    name: "details",
    control: control,
  });

  const formatDateToYear = (date: string): string => {
    if (!date) return "";
    if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return date.split("-")[0];
    }
    return date;
  };

  useEffect(() => {
    if (editingCar) {
      reset({
        model: editingCar.model,
        color: editingCar.color,
        year: editingCar.year,
        details: editingCar.details.map((d) => ({
          name: d.name,
        })),
      });
    } else {
      reset({
        model: "",
        color: "",
        year: "",
        details: [],
      });
    }
  }, [editingCar, reset, isOpen]);

  const validateYear = (value: string) => {
    if (!value) return "Year is required";
    const year = new Date(value).getFullYear();
    const currentYear = new Date().getFullYear();
    if (isNaN(year)) return "Please enter a valid date";
    if (year < 1886 || year > currentYear + 1) {
      return `Please enter a year between 1886 and ${currentYear + 1}`;
    }
    return true;
  };

  const submitHandler = (data: CarFormData) => {
    const formattedDetails: Details[] = data.details
      .filter((d) => d.name.trim() !== "")
      .map((d) => ({
        name: d.name.trim(),
      }));

    const reqCar: ReqCar = {
      model: data.model.trim(),
      color: data.color.trim(),
      year: data.year,
      details: formattedDetails,
    };

    onSubmit(reqCar);
    reset();
  };

  const addDetail = () => {
    const newDetail = {
      detail_id: 0,
      name: "",
      id: `temp-${Date.now()}`,
    };
    append(newDetail);
  };

  const removeDetail = (index: number) => {
    remove(index);
  };

  const getColorPreview = () => {
    const color = watch("color");
    if (!color) return null;
    
    return (
      <Box
        sx={{
          width: 24,
          height: 24,
          borderRadius: "50%",
          bgcolor: color,
          border: "2px solid",
          borderColor: "divider",
          ml: 1,
          boxShadow: 1,
        }}
      />
    );
  };

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          overflow: "hidden",
        },
      }}
    >
      <DialogTitle
        sx={{
          bgcolor: "primary.main",
          color: "white",
          py: 3,
          px: 4,
        }}
      >
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box display="flex" alignItems="center" gap={2}>
            <FaCar size={24} />
            <Typography variant="h5" fontWeight="bold">
              {editingCar ? "Update Car" : "Add New Car"}
            </Typography>
          </Box>
          <IconButton
            onClick={onClose}
            size="small"
            sx={{
              color: "white",
              "&:hover": { bgcolor: "rgba(255,255,255,0.1)" },
            }}
          >
            <FaTimes />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ p: 4 }}>
        <form onSubmit={handleSubmit(submitHandler)}>
          <Box sx={{ mb: 3, mt: 2 }} >
            <TextField
              fullWidth
              label="Car Model"
              variant="outlined"
              error={!!errors.model}
              helperText={errors.model?.message}
              placeholder="e.g., Toyota Camry, BMW X5"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <FaCar color="#666" />
                  </InputAdornment>
                ),
              }}
              {...register("model", {
                required: "Model is required",
                minLength: {
                  value: 2,
                  message: "Model must be at least 2 characters",
                },
              })}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                },
              }}
            />
          </Box>

          {/* Color and Year Fields - Side by Side */}
          <Box sx={{ display: "flex", gap: 3, mb: 3 }}>
            {/* Color Field */}
            <Box sx={{ flex: 1 }}>
              <TextField
                fullWidth
                label="Color"
                variant="outlined"
                error={!!errors.color}
                helperText={errors.color?.message}
                placeholder="e.g., #FF0000 or Red"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <FaPalette color="#666" />
                    </InputAdornment>
                  ),
                  endAdornment: getColorPreview(),
                }}
                {...register("color", {
                  required: "Color is required",
                  minLength: {
                    value: 2,
                    message: "Color must be at least 2 characters",
                  },
                })}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2,
                  },
                }}
              />
              {watch("color") && !errors.color && (
                <FormHelperText sx={{ ml: 2, mt: 0.5 }}>
                  Color preview shown
                </FormHelperText>
              )}
            </Box>

            {/* Year Field */}
            <Box sx={{ flex: 1 }}>
              <TextField
                fullWidth
                label="Manufacturing Year"
                type="date"
                variant="outlined"
                error={!!errors.year}
                helperText={errors.year?.message}
                InputLabelProps={{ shrink: true }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <FaCalendarAlt color="#666" />
                    </InputAdornment>
                  ),
                }}
                {...register("year", {
                  required: "Year is required",
                  validate: validateYear,
                })}
                inputProps={{
                  max: `${new Date().getFullYear() + 1}-12-31`,
                  min: "1886-01-01",
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2,
                  },
                }}
              />
              {watch("year") && (
                <FormHelperText sx={{ ml: 2, mt: 0.5 }}>
                  Selected year: {formatDateToYear(watch("year"))}
                </FormHelperText>
              )}
            </Box>
          </Box>

          {/* Details Section */}
          <Box sx={{ mb: 3 }}>
            <Paper
              variant="outlined"
              sx={{
                p: 3,
                borderRadius: 2,
                bgcolor: "grey.50",
              }}
            >
              <Box display="flex" alignItems="center" gap={1} mb={2}>
                <FaCog color="#666" />
                <Typography variant="h6" fontWeight="medium">
                  Car Features & Details
                </Typography>
              </Box>

              <Divider sx={{ mb: 3 }} />

              {fields.length > 0 ? (
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, mb: 2 }}>
                  {fields.map((field, index) => (
                    <Box
                      key={field.id}
                      sx={{
                        flex: "1 1 calc(50% - 8px)",
                        minWidth: "200px",
                      }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                        }}
                      >
                        <TextField
                          fullWidth
                          size="small"
                          placeholder="Enter feature (e.g., Sunroof, Leather seats)"
                          variant="outlined"
                          {...register(`details.${index}.name` as const, {
                            minLength: {
                              value: 2,
                              message: "Detail must be at least 2 characters",
                            },
                          })}
                          sx={{
                            "& .MuiOutlinedInput-root": {
                              borderRadius: 1.5,
                            },
                          }}
                        />
                        <Tooltip title="Remove feature">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => removeDetail(index)}
                            sx={{
                              bgcolor: "error.light",
                              color: "white",
                              "&:hover": { bgcolor: "error.main" },
                              borderRadius: 1,
                              minWidth: "36px",
                              width: "36px",
                              height: "36px",
                            }}
                          >
                            <FaTrash size={12} />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </Box>
                  ))}
                </Box>
              ) : (
                <Box
                  sx={{
                    textAlign: "center",
                    py: 4,
                    bgcolor: "white",
                    borderRadius: 2,
                    border: "2px dashed",
                    borderColor: "divider",
                    mb: 2,
                  }}
                >
                  <FaCog size={48} color="#9e9e9e" />
                  <Typography variant="body1" color="textSecondary" mt={2}>
                    No features added yet
                  </Typography>
                  <Typography variant="body2" color="textSecondary" mt={1}>
                    Add features like sunroof, navigation, etc.
                  </Typography>
                </Box>
              )}

              <Box>
                <Button
                  startIcon={<FaPlus />}
                  onClick={addDetail}
                  variant="outlined"
                  color="primary"
                  sx={{
                    borderRadius: 2,
                    textTransform: "none",
                    px: 3,
                  }}
                >
                  Add Feature
                </Button>
              </Box>

              {/* Feature Chips Preview */}
              {fields.length > 0 && (
                <Box mt={3}>
                  <Typography variant="subtitle2" color="textSecondary" mb={1}>
                    Feature Preview:
                  </Typography>
                  <Box display="flex" gap={1} flexWrap="wrap">
                    {fields.map((field, index) => {
                      const value = watch(`details.${index}.name`);
                      if (!value?.trim()) return null;
                      
                      return (
                        <Chip
                          key={index}
                          label={value}
                          size="small"
                          sx={{
                            bgcolor: (theme) => {
                              const colors = [
                                theme.palette.secondary.light,
                                theme.palette.info.light,
                                theme.palette.success.light,
                                theme.palette.warning.light,
                                theme.palette.error.light,
                              ];
                              return colors[index % colors.length];
                            },
                            color: "white",
                            fontWeight: "medium",
                          }}
                        />
                      );
                    })}
                  </Box>
                </Box>
              )}
            </Paper>
          </Box>

          {/* Form Actions */}
          <DialogActions sx={{ px: 0, pt: 2 }}>
            <Box sx={{ display: "flex", gap: 2, width: "100%" }}>
              <Button
                onClick={onClose}
                variant="outlined"
                sx={{
                  flex: 1,
                  borderRadius: 2,
                  py: 1.5,
                  textTransform: "none",
                  fontWeight: "bold",
                  fontSize: "1rem",
                }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                sx={{
                  flex: 1,
                  borderRadius: 2,
                  py: 1.5,
                  textTransform: "none",
                  fontWeight: "bold",
                  fontSize: "1rem",
                  bgcolor: "primary.main",
                  "&:hover": {
                    bgcolor: "primary.dark",
                  },
                  "&:disabled": {
                    bgcolor: "grey.400",
                    color: "white",
                  },
                }}
                disabled={!watch("model") || !watch("color") || !watch("year")}
              >
                {editingCar ? "Update Car" : "Create Car"}
              </Button>
            </Box>
          </DialogActions>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CarModal;