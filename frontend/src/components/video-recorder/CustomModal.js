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

// import React, { useRef, useEffect } from "react";
// import { Modal, Button } from "@mui/material";

// const CustomModal = ({ open, onClose, onStart }) => {
//   const videoRef = useRef(null);
//   useEffect(() => {
//     const getUserMedia = async () => {
//       if (videoRef.current) {
//         try {
//           const stream = await navigator.mediaDevices.getUserMedia({
//             video: true,
//           });
//           videoRef.current.srcObject = stream;
//         } catch (err) {
//           console.error("Error accessing webcam:", err);
//         }
//       }
//     };
//     getUserMedia();
//   }, []);

//   return (
//     <Modal open={open} onClose={onClose}>
//       <div style={{ padding: 20 }}>
//         <video ref={videoRef} autoPlay playsInline style={{ width: "100%" }} />
//         <div style={{ marginTop: 20 }}>
//           <Button
//             onClick={() => {
//               onStart();
//               onClose();
//             }}
//           >
//             Start Recording
//           </Button>
//           <Button onClick={onClose} style={{ marginLeft: 10 }}>
//             Cancel
//           </Button>
//         </div>
//       </div>
//     </Modal>
//   );
// };

// export default CustomModal;
