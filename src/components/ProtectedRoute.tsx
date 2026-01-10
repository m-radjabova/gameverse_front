import { Navigate } from "react-router-dom";
import useContextPro from "../hooks/useContextPro";
import { Box, LinearProgress, Typography } from "@mui/material";

interface Props {
  children: React.ReactNode;
}

function ProtectedRoute({ children }: Props) {
  const { state: { shop, isLoading } } = useContextPro();

  if (isLoading) {
    return (
      <Box
        sx={{
          height: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        }}
      >
        <Box sx={{ width: "100%", maxWidth: 600, px: 4 }}>
          <LinearProgress
            sx={{
              height: 6,
              borderRadius: 3,
              bgcolor: "rgba(255, 255, 255, 0.2)",
              "& .MuiLinearProgress-bar": {
                background: "linear-gradient(90deg, #fff 0%, rgba(255, 255, 255, 0.8) 100%)",
              },
            }}
          />
          <Typography
            variant="h5"
            sx={{
              textAlign: "center",
              mt: 4,
              color: "white",
              fontWeight: 600,
            }}
          >
            Loading...
          </Typography>
        </Box>
      </Box>
    );
  }

  if (!shop) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

export default ProtectedRoute;