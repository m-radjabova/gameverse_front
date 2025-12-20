import { Dialog, DialogContent, DialogActions, Box, Typography, Button, IconButton } from "@mui/material";
import { FaCheckCircle, FaTimes } from "react-icons/fa";



function AllPaidModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      PaperProps={{
        sx: {
          borderRadius: 3,
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
          overflow: 'hidden',
          position: 'relative',
        }
      }}
    >
      {/* Header qismi */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #4CAF50 0%, #2E7D32 100%)',
          color: 'white',
          py: 2,
          px: 3,
          position: 'relative',
        }}
      >
        <IconButton
          onClick={onClose}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            color: 'white',
            '&:hover': {
              backgroundColor: 'rgba(255,255,255,0.1)',
            }
          }}
        >
          <FaTimes />
        </IconButton>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box
            sx={{
              width: 50,
              height: 50,
              borderRadius: '50%',
              backgroundColor: 'rgba(255,255,255,0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <FaCheckCircle size={24} />
          </Box>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              All Debts Paid!
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              Congratulations on clearing all debts
            </Typography>
          </Box>
        </Box>
      </Box>

      <DialogContent sx={{ py: 3, px: 3 }}>
        <Box sx={{ textAlign: 'center', py: 2 }}>
          <Box
            sx={{
              width: 80,
              height: 80,
              borderRadius: '50%',
              backgroundColor: 'rgba(76, 175, 80, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
            }}
          >
            <FaCheckCircle size={36} color="#4CAF50" />
          </Box>
          
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 1, color: '#2E7D32' }}>
            🎉 Outstanding!
          </Typography>
          
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            All debts have been fully paid. You're debt-free!
          </Typography>

          <Box
            sx={{
              backgroundColor: '#F0F9F0',
              borderRadius: 2,
              p: 2,
              border: '1px solid #C8E6C9',
              textAlign: 'left',
            }}
          >
            <Typography variant="body2" sx={{ fontWeight: 500, color: '#2E7D32', mb: 1 }}>
              💡 Suggestions:
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.9rem' }}>
              • Start saving for future goals<br />
              • Consider investment opportunities<br />
              • Build an emergency fund<br />
              • Plan your next financial milestone
            </Typography>
          </Box>
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3, pt: 0 }}>
        <Button
          onClick={onClose}
          variant="contained"
          fullWidth
          sx={{
            borderRadius: 2,
            py: 1.5,
            textTransform: 'none',
            fontWeight: 700,
            fontSize: '1rem',
            background: 'linear-gradient(135deg, #4CAF50 0%, #2E7D32 100%)',
            boxShadow: '0 4px 12px rgba(76, 175, 80, 0.3)',
            '&:hover': {
              boxShadow: '0 6px 16px rgba(76, 175, 80, 0.4)',
              transform: 'translateY(-1px)',
            },
            transition: 'all 0.3s ease',
          }}
        >
          Continue
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default AllPaidModal;