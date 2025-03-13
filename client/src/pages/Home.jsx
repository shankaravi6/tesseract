import {
  Box,
  Button,
  Card,
  Grid,
  Typography,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
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
import React, { useEffect, useState } from "react";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import { Formik, Field, Form } from "formik";
import * as Yup from "yup";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import BorderColorIcon from "@mui/icons-material/BorderColor";
import { IN_URL } from "../hooks/baseURL";

// Validation schema with Yup
const validationSchema = Yup.object({
  projectName: Yup.string().required("Project name is required"),
  collectionName: Yup.string().required("Collection name is required"),
});

const Home = () => {
  const [openModal, setOpenModal] = useState(false);
  const [allProjects, setAllProjects] = useState([]);

  const navigate = useNavigate();
  const location = useLocation();

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "",
  });

  useEffect(() => {
    if (location.state?.snackbar) {
      setSnackbar(location.state.snackbar);
    }
  }, [location.state]);

  const handleClickOpen = () => {
    navigate("/main/field");
  };

  const handleClose = () => {
    setOpenModal(false);
  };

  const fetchAllProjects = async () => {
    try {
      const res = await axios.get(`${IN_URL}/get_projects_data`);
      const result = res.data;
      setAllProjects(groupProjectsByName(result.projectsWithoutActiveField));
    } catch (error) {
      console.error("Error fetching projects:", error);
    }
  };

  // Helper function to group projects by `projectName`
  const groupProjectsByName = (projects) => {
    const grouped = {};

    projects.forEach((project) => {
      // Initialize group if it doesn't exist
      if (!grouped[project.projectName]) {
        grouped[project.projectName] = {
          projectName: project.projectName,
          collections: [],
        };
      }

      // Handle collectionName as a string
      grouped[project.projectName].collections.push({
        collectionName: project.collectionName,
        fields: project.fields,
      });
    });

    return Object.values(grouped); // Convert grouped object back to an array
  };

  useEffect(() => {
    fetchAllProjects();
  }, []);

  useEffect(() => {
    if (location.pathname === "/") {
      console.log("Navigated to home, refreshing...");
      window.location.reload();
    }
  }, [location.pathname]);

  const handleSubmit = async (values) => {
    try {
      await axios.post(`${IN_URL}/create_project`, values);
      window.location.reload();
      fetchAllProjects(); // Refresh the project list after adding a new one
      handleClose();
    } catch (error) {
      console.error("Error creating project:", error);
    }
  };

  return (
    <Grid container spacing={5} sx={{ padding: 3 }}>
      <Grid item xs={12} lg={5}>
        <Card sx={{ p: 3, width: "100%", borderRadius: "4px" }}>
          <Typography variant="h3">Create New Project</Typography>
          <Typography variant="h6" sx={{ pt: 3 }}>
            An intuitive CMS for easy website management, allowing users to
            create, edit, and organize content without technical skills.
          </Typography>
          <Button sx={{ mt: 3 }} variant="contained" onClick={handleClickOpen}>
            <Box display="flex" gap=".5rem">
              <Typography>Create</Typography>
              <AddCircleIcon />
            </Box>
          </Button>
        </Card>
      </Grid>

      {/* Display Table for Projects */}
      <Grid item xs={12} lg={7}>
        <TableContainer component={Paper}>
          <Typography
            variant="h4"
            sx={{ padding: "16px", textAlign: "center" }}
            gutterBottom
          >
            All Projects & Collections
          </Typography>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Project Name</TableCell>
                <TableCell>Collection Name</TableCell>
                <TableCell>Fields</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {allProjects?.length > 0 ? (
                allProjects.map((project, projectIndex) => {
                  const rowSpan = project.collections.length; // Calculate the number of rows for this project

                  return (
                    <React.Fragment key={projectIndex}>
                      {project.collections.map(
                        (collection, collectionIndex) => (
                          <TableRow key={collectionIndex}>
                            {/* Render the Project Name only for the first collection row */}
                            {collectionIndex === 0 && (
                              <TableCell rowSpan={project.collections.length}>
                                <Typography variant="h6">
                                  {project.projectName}
                                </Typography>
                              </TableCell>
                            )}
                            <TableCell>{collection.collectionName}</TableCell>
                            <TableCell>
                              {collection.fields
                                .map((field) => `${field.name} (${field.type})`)
                                .join(", ")}
                            </TableCell>
                            <TableCell>
                              <Button
                                endIcon={<BorderColorIcon />}
                                variant="contained"
                                color="primary"
                                onClick={() =>
                                  navigate(`/main/field`, {
                                    state: {
                                      projectName: project.projectName,
                                      collectionName: collection.collectionName,
                                      fields: collection.fields,
                                      isUpdate: true,
                                    },
                                  })
                                }
                              >
                                Edit
                              </Button>
                            </TableCell>
                          </TableRow>
                        )
                      )}
                    </React.Fragment>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={4} align="center">
                    No collections found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Grid>

      {/* Modal for project creation */}
      <Dialog open={openModal} onClose={handleClose}>
        <DialogTitle>Create New Project</DialogTitle>
        <DialogContent sx={{ width: "350px" }}>
          <Formik
            initialValues={{ projectName: "", collectionName: "" }}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
          >
            {({ values, errors, touched }) => (
              <Form>
                <Box display="flex" flexDirection="column" gap={2}>
                  <Field
                    name="projectName"
                    label="Project Name"
                    as={TextField}
                    variant="outlined"
                    fullWidth
                    error={touched.projectName && Boolean(errors.projectName)}
                    helperText={touched.projectName && errors.projectName}
                  />
                  <Field
                    name="collectionName"
                    label="Collection Name"
                    as={TextField}
                    variant="outlined"
                    fullWidth
                    error={
                      touched.collectionName && Boolean(errors.collectionName)
                    }
                    helperText={touched.collectionName && errors.collectionName}
                  />
                  <DialogActions>
                    <Button onClick={handleClose} color="primary">
                      Cancel
                    </Button>
                    <Button type="submit" color="primary" variant="contained">
                      Create
                    </Button>
                  </DialogActions>
                </Box>
              </Form>
            )}
          </Formik>
        </DialogContent>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={5000}
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

export default Home;
