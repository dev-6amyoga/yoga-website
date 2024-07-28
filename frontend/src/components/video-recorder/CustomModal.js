import React from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "@mui/material";

const CustomModal = ({ open, onClose }) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
    >
      <DialogTitle id="alert-dialog-title">{"Unsaved Changes"}</DialogTitle>
      <DialogContent>
        <p>If you close the browser, the recording will be lost.</p>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          Stay on Page
        </Button>
        <Button
          onClick={() => {
            window.location.reload(); // Redirect to reload the page if needed
          }}
          color="secondary"
        >
          Leave Page
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CustomModal;
