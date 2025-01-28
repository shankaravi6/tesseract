import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Grid,
  Typography,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Snackbar,
  Alert,
} from "@mui/material";
import { Formik, Field, Form } from "formik";
import * as Yup from "yup";
import { useLocation, useNavigate } from "react-router-dom";
import NorthWestIcon from "@mui/icons-material/NorthWest";
import BorderColorIcon from "@mui/icons-material/BorderColor";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import DeleteIcon from "@mui/icons-material/Delete";
import ReportIcon from "@mui/icons-material/Report";
import axios from "axios";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import AutoModeIcon from '@mui/icons-material/AutoMode';
import CircularProgress from "@mui/material/CircularProgress";
import { BASE_URL, IN_URL } from "../hooks/baseURL";

const FieldData = () => {
  const [openDialog, setOpenDialog] = useState(false);
  const [fieldType, setFieldType] = useState("");
  const [fieldName, setFieldName] = useState("");
  const [options, setOptions] = useState(""); // New state for options
  const [fields, setFields] = useState([]);
  const [editIndex, setEditIndex] = useState(null); // New state to track which field is being edited

  const location = useLocation();
  const [projectName, setProjectName] = useState("");
  const [collectionName, setCollectionName] = useState("");
  const [isExisting, setIsExisting] = useState(false);
  const [isUpdate, setIsUpdate] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);

  const [isAILoading, setIsAILoading] = useState(false);


  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "",
  });

  const navigate = useNavigate();

  useEffect(() => {
    if (location.state && location.state.isUpdate) {
      const { projectName, collectionName, fields } = location.state;
      setProjectName(projectName);
      setCollectionName(collectionName);
      setFields(fields);
      setIsUpdate(true);
    }
  }, []);

  useEffect(() => {
    console.log("FieldData component rendered");
    console.log(location.search.replace("?", ""));
    const getProjectNameFromURL = location.search.replace("?", "");

    if (getProjectNameFromURL) {
      setProjectName(getProjectNameFromURL);
      setIsExisting(true);
    }
  }, [location.search]);

  const handleDeleteField = (index) => {
    const updatedFields = fields.filter((_, i) => i !== index); // Remove field at the specific index
    setFields(updatedFields); // Update the fields state
  };

  const handleEditField = (index) => {
    const fieldToEdit = fields[index];
    setFieldType(fieldToEdit.type);
    setFieldName(fieldToEdit.name);
    setOptions(fieldToEdit.options ? fieldToEdit.options.join(", ") : ""); // Pre-fill options if any
    setEditIndex(index); // Set the index of the field being edited
    setOpenDialog(true);
  };

  const [aiPrompt, setAiPrompt] = useState("");
  const [aiResponse, setAiResponse] = useState();
  const handleAISubmit = async () => {
    if (!aiPrompt.trim()) {
      setSnackbar({
        open: true,
        message: "Please enter your prompt",
        severity: "error",
      });
      return;
    }
  
    setIsAILoading(true); // Start loading
    const request = { prompt: aiPrompt };
  
    try {
      const response = await axios.post(
        `${BASE_URL}/api/gen-fields`,
        request
      );
      console.log(response.data.data.content);
      const aiGenFields = JSON.parse(response.data.data.content);
      console.log(aiGenFields);
      setFields(aiGenFields);
      setAiPrompt(""); // Reset prompt
      setSnackbar({
        open: true,
        message: "Fields generated successfully!",
        severity: "success",
      });
    } catch (error) {
      console.error(error);
      setSnackbar({
        open: true,
        message: "Failed to generate fields. Please try again.",
        severity: "error",
      });
    } finally {
      setIsAILoading(false); // End loading
    }
  };
  

  const handleSubmit = (values, fields) => {
    const payload = { ...values, fields };
    console.log("Form submitted:", payload);

    const apiUrl =
      isExisting || isUpdate
        ? `${IN_URL}/existing-project`
        : `${IN_URL}/create-project`;

    fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    })
      .then((response) => response.json())
      .then((data) => {
        const snackbarMessage =
          data.status === true
            ? isUpdate
              ? "Collection updated successfully"
              : "Collection created successfully"
            : isUpdate
            ? data.error
            : data.error;

        const snackbarSeverity = data.status === true ? "success" : "error";

        setSnackbar({
          open: true,
          message: snackbarMessage,
          severity: snackbarSeverity,
        });

        // Navigate to /home and pass the snackbar state
        navigate("/main/home", {
          state: {
            snackbar: {
              open: true,
              message: snackbarMessage,
              severity: snackbarSeverity,
            },
          },
        });
      })
      .catch((error) => {
        setSnackbar({
          open: true,
          message: "An error occurred. Please try again.",
          severity: "error",
        });

        // Navigate to /home and pass the snackbar state in case of error
        navigate("/main/home", {
          state: {
            snackbar: {
              open: true,
              message: "An error occurred. Please try again.",
              severity: "error",
            },
          },
        });
      });
  };

  const handleOpenDialog = (type, index = null) => {
    setFieldType(type);
    setEditIndex(index); // Set the index if editing, null if adding new field
    if (index !== null) {
      const fieldToEdit = fields[index];
      setFieldName(fieldToEdit.name);
      setOptions(fieldToEdit.options ? fieldToEdit.options.join(", ") : ""); // Pre-fill options if any
    } else {
      setFieldName(""); // Reset name for new field
      setOptions(""); // Reset options for new field
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setFieldName(""); // Reset name when closing dialog
    setOptions(""); // Reset options when closing dialog
    setEditIndex(null); // Reset the editIndex when closing dialog
  };

  const handleAddField = () => {
    if (fieldName.trim()) {
      const fieldData = { type: fieldType, name: fieldName.trim() };
      if (
        ["Select", "Checkbox", "Autocomplete"].includes(fieldType) &&
        options.trim()
      ) {
        fieldData.options = options.split(",").map((option) => option.trim()); // Split options into an array
      }
      setFields([...fields, fieldData]);
      console.log(fields)
    }
    handleCloseDialog();
  };

  const handleUpdateField = () => {
    if (fieldName.trim()) {
      const updatedField = { type: fieldType, name: fieldName.trim() };
      if (
        ["Select", "Checkbox", "Autocomplete"].includes(fieldType) &&
        options.trim()
      ) {
        updatedField.options = options
          .split(",")
          .map((option) => option.trim());
      }

      const updatedFields = [...fields];
      updatedFields[editIndex] = updatedField; // Replace the edited field
      setFields(updatedFields); // Update the fields state
    }
    handleCloseDialog();
  };

  const handleDeleteCollection = async (projectName, collectionName) => {
    const reqData = { projectName, collectionName };
    try {
      const response = await axios.post(
        `${IN_URL}/delete-collection`,
        reqData
      );
      console.log(response);
      if (response.data.status === true) {
        navigate("/main/home", {
          state: {
            snackbar: {
              open: true,
              message:
                response.data.status === true
                  ? "Collection deleted successfully!"
                  : "Failed to delete collection. Try again.",
              severity: "success",
            },
          },
        });
      } else {
        navigate("/main/home", {
          state: {
            snackbar: {
              open: true,
              message: "An error occurred. Please try again.",
              severity: "error",
            },
          },
        });
      }
    } catch (error) {
      navigate("/main/home", {
        state: {
          snackbar: {
            open: true,
            message: "An error occurred. Please try again.",
            severity: "error",
          },
        },
      });
    }
  };

  return (
    <Grid container spacing={3} sx={{ padding: 3 }}>
      <Grid item xs={12}>
        <Button
          variant="contained"
          color="primary"
          startIcon={<NorthWestIcon />}
          onClick={() => navigate("/main/home")}
        >
          Back
        </Button>
      </Grid>
      <Box
        sx={{
          p: 3,
          border: "1px solid #ddd",
          borderRadius: 2,
          mx: "auto",
          m: 3,
          boxShadow: 2,
          width: "100%",
        }}
      >
        <Formik
          initialValues={{
            projectName: projectName,
            collectionName: collectionName,
          }}
          validationSchema={Yup.object({
            projectName: Yup.string().required("Project name is required"),
            collectionName: Yup.string().required(
              "Collection name is required"
            ),
            fields: Yup.array().min(
              1,
              "You must add at least one field to the collection"
            ),
          })}
          onSubmit={(values) => handleSubmit(values, fields)}
          enableReinitialize
        >
          {({ errors, touched }) => (
            <Form>
              <Box display="flex" flexDirection="column" gap={2}>
                <Typography variant="h3">Project Details</Typography>
                <Box display="flex" gap={3}>
                  <Field
                    name="projectName"
                    label="Project Name"
                    as={TextField}
                    variant="outlined"
                    fullWidth
                    InputProps={{
                      readOnly: isExisting || isUpdate,
                    }}
                    error={touched.projectName && Boolean(errors.projectName)}
                    helperText={touched.projectName && errors.projectName}
                  />
                  <Field
                    name="collectionName"
                    label="Collection Name"
                    as={TextField}
                    variant="outlined"
                    fullWidth
                    InputProps={{
                      readOnly: isUpdate,
                    }}
                    error={
                      touched.collectionName && Boolean(errors.collectionName)
                    }
                    helperText={touched.collectionName && errors.collectionName}
                  />
                </Box>

                {isUpdate ? (
                  <></>
                ) : (
                  <>
                    
                  <Typography variant="h3" sx={{ pt: 3 }}>
                        Genereate fileds with AI <AutoAwesomeIcon />
                      </Typography>
                    <Grid
                      display="flex"
                      flexDirection="row"
                      gap="1rem"
                      width="50%"
                    >
                      <TextField
                        fullWidth
                        placeholder="Enter your prompt... (Library management data)"
                        value={aiPrompt}
                        onChange={(e) => setAiPrompt(e.target.value)}
                      />
                      <Button
                        onClick={() => handleAISubmit()}
                        sx={{
                          background: "#ff0066",
                          color: "#f2f2f2",
                          border: "unset",
                        }}
                      >
                       {isAILoading ? <CircularProgress size={20} sx={{ color: "#fff" }} /> : <AutoModeIcon />}
                      </Button>
                    </Grid>
                  </>
                )}

                <Typography variant="h3" sx={{ pt: 3 }}>
                  Fields Details
                </Typography>
                <Box display="flex" gap={3}>
                  {[
                    "Text",
                    "Long Text",
                    "Media",
                    "Select",
                    "Checkbox",
                    "Autocomplete",
                    "Date",
                  ].map((type) => (
                    <Button key={type} onClick={() => handleOpenDialog(type)}>
                      {type}
                    </Button>
                  ))}
                </Box>
                {fields.length > 0 && (
                  <TableContainer component={Paper} sx={{ mt: 3 }}>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Field Name</TableCell>
                          <TableCell>Field Type</TableCell>
                          <TableCell>Options</TableCell>
                          <TableCell>Actions</TableCell> {/* Actions column */}
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {fields.map((field, index) => (
                          <TableRow key={index}>
                            <TableCell>{field.name}</TableCell>
                            <TableCell>{field.type}</TableCell>
                            <TableCell>
                              {field.options ? field.options.join(", ") : "N/A"}
                            </TableCell>
                            <TableCell sx={{ display: "flex", gap: "1rem" }}>
                              <Button
                                endIcon={<BorderColorIcon />}
                                variant="outlined"
                                color="primary"
                                onClick={() => handleEditField(index)} // Edit field at the specific index
                              >
                                Edit
                              </Button>
                              <Button
                                endIcon={<DeleteForeverIcon />}
                                variant="outlined"
                                color="error"
                                onClick={() => handleDeleteField(index)} // Delete field at the specific index
                              >
                                Delete
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
                {fields.length === 0 && (
                  <Typography variant="body1" color="error">
                    You must add at least one field to the collection.
                  </Typography>
                )}
                <Button
                  type="submit"
                  color="primary"
                  variant="contained"
                  sx={{ mt: 3 }}
                  disabled={fields.length === 0}
                >
                  {isUpdate ? "Update" : "Create"}
                </Button>
              </Box>
            </Form>
          )}
        </Formik>

        <Dialog open={openDialog} onClose={handleCloseDialog}>
          <Grid container width={"350px"} flexDirection={"column"} xs={12}>
            <DialogTitle>
              {editIndex !== null
                ? `Edit ${fieldType} Field`
                : `Add ${fieldType} Field`}
            </DialogTitle>
            <DialogContent>
              <TextField
                autoFocus
                margin="dense"
                label="Field Name"
                fullWidth
                variant="outlined"
                value={fieldName}
                onChange={(e) => setFieldName(e.target.value)}
              />
              {["Select", "Checkbox", "Autocomplete"].includes(fieldType) && (
                <TextField
                  margin="dense"
                  label="Options (comma separated)"
                  fullWidth
                  variant="outlined"
                  value={options}
                  onChange={(e) => setOptions(e.target.value)}
                />
              )}
            </DialogContent>
            <DialogActions sx={{ pb: 3, pr: 3 }}>
              <Button onClick={handleCloseDialog} color="secondary">
                Cancel
              </Button>
              <Button
                onClick={
                  editIndex !== null ? handleUpdateField : handleAddField
                }
                color="primary"
                variant="contained"
              >
                {editIndex !== null ? "Update" : "Add"}
              </Button>
            </DialogActions>
          </Grid>
        </Dialog>
      </Box>

      {isUpdate && (
        <>
          <Grid item xs={12} gap={5} display="flex" justifyContent="start">
            <Typography variant="h3" color="#ff0066">
              Danger Zone
            </Typography>
          </Grid>
          <Grid item xs={12} gap={5} display="flex" justifyContent="start">
            <Button
              type="button"
              variant="contained"
              onClick={() => setOpenDeleteDialog(true)}
            >
              <Box display="flex" gap=".5rem">
                <Typography>Delete Collection</Typography>
                <DeleteIcon />
              </Box>
            </Button>
          </Grid>
        </>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={openDeleteDialog}
        onClose={() => setOpenDeleteDialog(false)}
      >
        <DialogTitle>
          <Box
            display={"flex"}
            justifyContent={"start"}
            gap={1}
            alignItems={"center"}
          >
            Confirm Deletion <ReportIcon />
          </Box>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1">
            Are you sure you want to delete this collection?
          </Typography>
        </DialogContent>
        <DialogActions sx={{ pb: 3, pr: 3 }}>
          <Button onClick={() => setOpenDeleteDialog(false)} color="primary">
            Cancel
          </Button>
          <Button
            onClick={() => handleDeleteCollection(projectName, collectionName)}
            color="secondary"
            variant="contained"
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Grid>
  );
};

export default FieldData;
