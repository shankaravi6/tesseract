import React, { useState } from "react";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Button,
} from "@mui/material";

const CreateProjectModal = ({ open, onClose, onCreate }) => {
  const [projectName, setProjectName] = useState("");
  const [collectionName, setCollectionName] = useState("");

  const handleSubmit = () => {
    if (projectName && collectionName) {
      onCreate(projectName, collectionName);
      setProjectName("");
      setCollectionName("");
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Create New Project</DialogTitle>
      <DialogContent>
        <TextField
          fullWidth
          label="Project Name"
          variant="outlined"
          value={projectName}
          onChange={(e) => setProjectName(e.target.value)}
          margin="normal"
        />
        <TextField
          fullWidth
          label="Collection Name"
          variant="outlined"
          value={collectionName}
          onChange={(e) => setCollectionName(e.target.value)}
          margin="normal"
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          Cancel
        </Button>
        <Button onClick={handleSubmit} color="primary">
          Create
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CreateProjectModal;
