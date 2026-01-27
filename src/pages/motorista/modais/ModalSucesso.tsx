import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogActions,
  Button,
  Typography
} from '@mui/material';

interface ModalSucessoProps {
  open: boolean;
  onClose: () => void;
  title: string;
}

const ModalSucesso: React.FC<ModalSucessoProps> = ({
  open,
  onClose,
  title
}) => {
  return (
    <Dialog open={open} onClose={onClose}>
     <DialogTitle>
        <Typography color="text.primary" fontWeight={600}>
          {title}
        </Typography>
      </DialogTitle>
      <DialogActions>
        <Button onClick={onClose}>OK</Button>
      </DialogActions>
    </Dialog>
  );
};

export default ModalSucesso;