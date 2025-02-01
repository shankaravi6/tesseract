// server.js
const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const app = express();
const PORT = 5000;
// Middleware
app.use(cors());
app.use(bodyParser.json()); // To parse JSON request bodies
const simpleGit = require("simple-git");
require("dotenv").config();

mongoose
  .connect(process.env.MONGO_URL_LOCAL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("Failed to connect to MongoDB", err));
const projectSchema = new mongoose.Schema(
  {
    projectName: String,
    collectionName: String,
    fields: [],
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { strict: false }
);
const Project = mongoose.model("Project", projectSchema);
// POST route to create a new project
app.post("/create-project", async (req, res) => {
  const { projectName, collectionName, fields } = req.body;
  const projectPath = path.join(__dirname, "..", "src", "pages", projectName); // Traverse up one level to get to 'src/pages'
  // Check if project folder already exists
  if (fs.existsSync(projectPath)) {
    return res.status(400).send({
      status: false,
      error: "Project already exists",
    });
  }
  fields.push({
    type: "Boolean",
    name: "active",
  });
  console.log(fields);
  const newProject = {
    projectName,
    collectionName,
    fields,
    createdAt: new Date(),
  };
  const projectInstance = new Project(newProject);
  projectInstance
    .save()
    .then((doc) => {
      console.log("Project saved successfully:", doc);
    })
    .catch((err) => {
      console.error("Error saving project:", err);
    });
  if (!projectName || !collectionName) {
    return res.status(400).send({
      status: false,
      error: "Project name and collection name are required",
    });
  }
  try {
    // Correct path to client/src/pages folder
    const projectPath = path.join(__dirname, "..", "src", "pages", projectName); // Traverse up one level to get to 'src/pages'
    // Check if project folder already exists
    if (fs.existsSync(projectPath)) {
      return res.status(400).send({
        status: false,
        error: "Project already exists",
      });
    }
    // Create the folder for the project
    fs.mkdirSync(projectPath, {
      recursive: true,
    });
    // Create All{Collection}Data.jsx
    const allDataFilePath = path.join(
      projectPath,
      `All${collectionName}Data.jsx`
    );
    const allDataContent = `
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { DataGrid } from "@mui/x-data-grid";
import {
IconButton,
Button,
Grid,
Snackbar,
Tooltip,
Box,
CircularProgress,
Typography,
} from "@mui/material";
import DriveFileRenameOutlineIcon from "@mui/icons-material/DriveFileRenameOutline";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import MuiAlert from "@mui/material/Alert";
import axios from "axios";
import LockIcon from "@mui/icons-material/Lock";
import LockOpenIcon from "@mui/icons-material/LockOpen";
import { BASE_URL, IN_URL } from "../../hooks/baseURL";
const All${collectionName}Data = () => {
const [rows, setRows] = useState([]);
const [openSnackbar, setOpenSnackbar] = useState(false);
const [snackbarMessage, setSnackbarMessage] = useState("");
const [loading, setLoading] = useState(false);
const [error, setError] = useState(null);
const [columns, setColumns] = useState([]);
const navigate = useNavigate();
useEffect(() => {
  setLoading(true);

  // Fetch both datasets
  const fetchStudentData = axios.get(\`\${BASE_URL}/api/data/${collectionName}\`);
  const fetchProjectFields = axios.get(
    \`\${IN_URL}/get_projects_data\`
  );

  Promise.all([fetchStudentData, fetchProjectFields])
    .then(([studentResponse, projectResponse]) => {
      // Student data response
      const studentData = studentResponse.data.data;
      const updatedStudentData = studentData.map((item) => ({
        ...item,
        imageUrl: item.imageName
          ? \`\${BASE_URL}/uploads/\${item.imageName}\`
          : "",
      }));

      setRows(updatedStudentData);

      // Project fields response
      const project = projectResponse.data.projectsWithoutActiveField.find(
        (project) => project.collectionName === \"${collectionName}"\
      );

      const projectFields = project?.fields || [];

      if (studentData.length > 0) {
        // Extract valid field names from project fields
        const validFieldNames = projectFields.map((field) => field.name);

        // Filter and dynamically create columns based on valid fields
        const dynamicColumns = Object.keys(studentData[0])
          .filter((key) => validFieldNames.includes(key) && key !== "__v") // Match fields with project fields
          .map((key) => {
            if (key === "_id" || key === "imageUrl") return null;
            return {
              field: key,
              headerName: key.charAt(0).toUpperCase() + key.slice(1),
              flex: 1,
            };
          })
          .filter(Boolean);

        // Add actions column
        dynamicColumns.push({
          field: "actions",
          headerName: "Actions",
          width: 150,
          renderCell: (params) => (
            <Tooltip
              title={
                params.row.active === true || params.row.active === "true"
                  ? "Mark as Inactive"
                  : "Mark as Active"
              }
            >
              <IconButton
                onClick={() =>
                  handleToggleActive(params.row._id, params.row.active)
                }
              >
                {params.row.active === true ||
                params.row.active === "true" ? (
                  <LockOpenIcon sx={{ color: "#f2f2f2" }} />
                ) : (
                  <LockIcon sx={{ color: "#f2f2f2" }} />
                )}
              </IconButton>
            </Tooltip>
          ),
        });

        setColumns(dynamicColumns);
      }
      setLoading(false);
    })
    .catch((error) => {
      console.error("Error fetching data:", error);
      setError("Failed to load data!");
      setLoading(false);
    });
}, []);
const handleToggleActive = async (id, currentStatus) => {
try {
setLoading(true);
const newStatus = !currentStatus;
const response = await axios.put(
\`\${BASE_URL}/api/data/${collectionName}/\${id}\`,
{
active: newStatus,
}
);
if (response.data.status) {
setRows((prevRows) =>
prevRows.map((row) =>
row._id === id ? { ...row, active: newStatus } : row
)
);
setSnackbarMessage(
\`Data marked as \${newStatus ? "active" : "inactive"}!\`
);
setOpenSnackbar(true);
} else {
setSnackbarMessage("Failed to update data status!");
setOpenSnackbar(true);
}
setLoading(false);
} catch (error) {
console.error("Error updating data:", error);
setSnackbarMessage("Failed to update data status!");
setOpenSnackbar(true);
setLoading(false);
}
};
const handleCloseSnackbar = () => {
setOpenSnackbar(false);
};
const handleAddData = () => {
navigate("/main/${projectName.toLowerCase()}/AddEdit${collectionName}Data/add");
};
return (
<Grid container spacing={3} sx={{ padding: 3 }}>
<Grid item xs={12}>
   <Button
   variant="contained"
   color="primary"
   startIcon={
   <AddIcon />
   }
   onClick={handleAddData}
   disabled={loading}
   >
   Add Data
   </Button>
</Grid>
<Grid item xs={12}>
   {loading ? (
   <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      height="300px"
      >
      <CircularProgress />
   </Box>
   ) : error ? (
   <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      height="300px"
      >
      <Typography color="error">{error}</Typography>
   </Box>
   ) : (
   <div style={{ height: "auto", width: "100%" }}>
   {columns.length === 0 ? (
   <Typography
   style={{
   textAlign: "center"
   }}
   variant="h4"
   color="#ff0066"
   >
   No data found
   </Typography>
   ) : (
   <DataGrid
      rows={rows}
      columns={columns}
      getRowId={(row) =>
   row._id}
   autoHeight
   onRowDoubleClick={(params) => navigate(\`/main/${projectName}/AddEdit${collectionName}Data/edit/\${params.row._id}\`)}
   />
   )}
   </div>
   )}
</Grid>
<Snackbar
   open={openSnackbar}
   autoHideDuration={6000}
   onClose={handleCloseSnackbar}
   >
   <MuiAlert
   onClose={handleCloseSnackbar}
   severity={error ? "error" : "success"}
   sx={{ width: "100%" }}
   >
   {snackbarMessage}
   </MuiAlert>
</Snackbar>
</Grid>
);
};
export default All${collectionName}Data;
`;
    fs.writeFileSync(allDataFilePath, allDataContent);
    // Create AddEdit{Collection}Data.jsx
    const addEditDataFilePath = path.join(
      projectPath,
      `AddEdit${collectionName}Data.jsx`
    );
    const addEditDataContent = `
import React, { useEffect, useState, useRef } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import axios from "axios";
import ReactQuill from "react-quill";
import {
Grid,
TextField,
Button,
Typography,
Box,
Switch,
FormControlLabel,
Snackbar,
Alert,
Dialog,
DialogActions,
DialogContent,
DialogTitle,
FormControl,
FormLabel,
RadioGroup,
Radio,
FormGroup,
Checkbox,
Autocomplete,
} from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import "react-quill/dist/quill.snow.css"; // import Quill's styles
import ArrowOutwardIcon from "@mui/icons-material/ArrowOutward";
import NorthWestIcon from "@mui/icons-material/NorthWest";
import DeleteIcon from "@mui/icons-material/Delete";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import CircularProgress from "@mui/material/CircularProgress";
import ReportIcon from "@mui/icons-material/Report";
import { BASE_URL } from "../../hooks/baseURL";
import { Calendar } from "primereact/calendar";
const AllEdit${collectionName}Data = () => {
const { id } = useParams();
const navigate = useNavigate();
const fileInputRef = useRef(null);
const [existingImage, setExistingImage] = useState("");
const [isSubmitting, setIsSubmitting] = useState(false);
const [snackbar, setSnackbar] = useState({
open: false,
message: "",
severity: "",
});
// const [aiPrompt, setAiPrompt] = useState("");
// const [loadingAI, setLoadingAI] = useState(false);
const fields = ${JSON.stringify(fields)};
const generateInitialValues = () => {
const initialValues = {};
fields.forEach((field) => {
if (field.type === "Checkbox") {
initialValues[field.name] = []; // Array for checkboxes
} else if (field.type === "Date") {
initialValues[field.name] = null; // Date value
} else {
initialValues[field.name] = "";
}
});
return initialValues;
};
const validationSchema = Yup.object(
  fields.reduce((schema, field) => {
    if (field.type === "Text" || field.type === "Long Text") {
      schema[field.name] = Yup.string().required(\`\${field.name} is required\`);
    } else if (field.type === "Select") {
      schema[field.name] = Yup.string()
        .oneOf(field.options, "Invalid selection")
        .required(\`\${field.name} is required\`);
    } else if (field.type === "Checkbox") {
      schema[field.name] = Yup.array()
        .min(1, "At least one option must be selected")
        .required(\`\${field.name} is required\`);
    } else if (field.type === "Date") {
      schema[field.name] = Yup.date()
        .nullable()
        .required(\`\${field.name} is required\`);
    } else if (field.type === "Autocomplete") {
      schema[field.name] = Yup.string()
        .oneOf(field.options, "Invalid selection")
        .required(\`\${field.name} is required\`);
    } else if (field.type === "Boolean") {
      schema[field.name] = Yup.boolean().required(
        \`\${field.name} is required\`
      );
    } else if (field.type === "Media") {
      schema[field.name] = Yup.mixed()
        .test("required", "File is required", (value) => {
          return value instanceof File; // Ensures a file is selected
        })
        .test("fileFormat", "Unsupported file format", (value) => {
          if (!value) return true; // Skip validation if empty (handled by required test)
          return ["image/jpeg", "image/png", "image/jpg"].includes(value.type);
        })
        .test("fileSize", "File size must be under 5MB", (value) => {
          if (!value) return true;
          return value.size <= 5 * 1024 * 1024;
        });
    }      
    return schema;
  }, {})
);
const [initialValues, setInitialValues] = useState(generateInitialValues());
const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
const formik = useFormik({
initialValues,
validationSchema,
enableReinitialize: true,
onSubmit: async (values) => {
setIsSubmitting(true);
const formData = new FormData();
Object.keys(values).forEach((key) => {
if (key === "active") {
formData.append(key, values[key] ? true : false);
} else if (key !== "image") {
formData.append(key, values[key]);
}
});
if (values.image) {
formData.append("image", values.image); // New image uploaded
}
if (!values.image && existingImage) {
formData.append("existingImage", existingImage); // Existing image
}
try {
const method = id ? "put" : "post";
const url = id
? \`\${BASE_URL}/api/data/\${\"${collectionName}"\}/\${id}\`
: \`\${BASE_URL}/api/data/\${\"${collectionName}"\}\`;
await axios({
method,
url,
data: formData,
headers: {
"Content-Type": "multipart/form-data",
},
});
setIsSubmitting(false);
navigate(\`/main/${projectName.toLowerCase()}/All${collectionName}Data\`);
} catch (error) {
console.error("Error submitting form:", error);
setIsSubmitting(false);
}
},
});
useEffect(() => {
if (id) {
axios
.get(\`\${BASE_URL}/api/data/\${\"${collectionName}"\}/\${id}\`)
.then((response) => {
const data = response.data.data;
const updatedValues = {};
fields.forEach((field) => {
updatedValues[field.name] = data[field.name] ?? (field.type === "boolean" ? false : "");
if (field.type === "Media" && data[field.name]) {
  setExistingImage(data[field.name]);
}
});
setInitialValues(updatedValues);
})
.catch((error) => {
console.error("Error fetching data:", error);
});
}
}, [id]);
const handleDelete = async () => {
if (!id) {
console.error("No record to delete.");
return;
}
try {
setIsSubmitting(true);
await axios.delete(\`\${BASE_URL}/api/data/\${\"${collectionName}"\}/\${id}\`);
setIsSubmitting(false);
setOpenDeleteDialog(false); 
navigate("\/main/${projectName.toLowerCase()}/All${collectionName}Data");
} catch (error) {
console.error("Error deleting record:", error);
setIsSubmitting(false);
}
};
return (
<Grid container spacing={3} sx={{ padding: 3 }}>
<Grid item xs={12}>
   <Button
   variant="contained"
   color="primary"
   startIcon={
   <NorthWestIcon />
   }
   onClick={() => navigate("\/main/${projectName.toLowerCase()}/All${collectionName}Data")}
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
width:'100%'
}}
>
<Typography variant="h5" gutterBottom align="center" sx={{ mb: 3 }}>
{id ? "Update Data" : "Add New Data"}
</Typography>
<form onSubmit={formik.handleSubmit}>
          {fields.map((field) => {
            if (field.type == "Text") {
              return (
                <Grid item xs={12} sx={{ pb: 3 }} key={field.name}>
                  <TextField
                    fullWidth
                    label={field.name.toUpperCase()}
                    name={field.name}
                    value={formik.values[field.name]}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={
                      formik.touched[field.name] &&
                      Boolean(formik.errors[field.name])
                    }
                    helperText={
                      formik.touched[field.name] && formik.errors[field.name]
                    }
                  />
                </Grid>
              );
            } else if (field.type == "Long Text") {
              return (
                <Grid item xs={12} sx={{ pb: 3 }} key={field.name}>
                  <FormLabel>{field.name.toUpperCase()}</FormLabel>
                  <ReactQuill
                    style={{ width: "100%" }}
                    value={formik.values[field.name]}
                    onChange={(value) =>
                      formik.setFieldValue(field.name, value)
                    }
                    modules={{
                      toolbar: [
                        [{ header: "1" }, { header: "2" }, { font: [] }],
                        [{ list: "ordered" }, { list: "bullet" }],
                        ["bold", "italic", "underline"],
                        ["blockquote", "code-block"],
                        [{ align: [] }],
                        ["link", "image"],
                      ],
                    }}
                  />
                  {formik.touched[field.name] && formik.errors[field.name] && (
                    <Typography variant="body2" color="error">
                      {formik.errors[field.name]}
                    </Typography>
                  )}
                </Grid>
              );
            } else if (field.type === "Select") {
              return (
                <Grid item xs={12} sx={{ pb: 3 }} key={field.name}>
                  <FormLabel>{field.name.toUpperCase()}</FormLabel>
                  <RadioGroup
                    name={field.name}
                    value={formik.values[field.name]}
                    onChange={formik.handleChange}
                  >
                    {field.options.map((option) => (
                      <FormControlLabel
                        key={option}
                        value={option}
                        control={<Radio />}
                        label={option}
                      />
                    ))}
                  </RadioGroup>
                  {formik.touched[field.name] && formik.errors[field.name] && (
                    <Typography variant="body2" color="error">
                      {formik.errors[field.name]}
                    </Typography>
                  )}
                </Grid>
              );
            } else if (field.type === "Checkbox") {
              return (
                <Grid sx={{ pb: 3 }} key={field.name}>
                  <FormLabel>{field.name.toUpperCase()}</FormLabel>
                  <br />
                  <FormGroup>
                    {field.options.map((option) => (
                      <FormControlLabel
                        key={option}
                        control={
                          <Checkbox
                            value={option}
                            checked={formik.values[field.name]?.includes(
                              option
                            )}
                            onChange={(e) => {
                              const checked = e.target.checked;
                              // Ensure the value is always treated as an array
                              const currentValue = Array.isArray(
                                formik.values[field.name]
                              )
                                ? formik.values[field.name]
                                : [];
                              const newValue = checked
                                ? [...currentValue, option] // Add the selected option
                                : currentValue.filter(
                                    (item) => item !== option
                                  ); // Remove the unselected option
                              formik.setFieldValue(field.name, newValue); // Update the form field
                            }}
                          />
                        }
                        label={option}
                      />
                    ))}
                  </FormGroup>
                  {formik.touched[field.name] && formik.errors[field.name] && (
                    <Typography variant="body2" color="error">
                      {formik.errors[field.name]}
                    </Typography>
                  )}
                </Grid>
              );
            } else if (field.type === "Autocomplete") {
              return (
                <Autocomplete
                  sx={{ pb: 3 }}
                  key={field.name}
                  options={field.options}
                  getOptionLabel={(option) => option}
                  value={formik.values[field.name]}
                  onChange={(e, value) =>
                    formik.setFieldValue(field.name, value)
                  }
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label={field.name.toUpperCase()}
                      error={
                        formik.touched[field.name] &&
                        Boolean(formik.errors[field.name])
                      }
                      helperText={
                        formik.touched[field.name] && formik.errors[field.name]
                      }
                    />
                  )}
                />
              );
            } else if (field.type === "Date") {
              return (
                <Grid item xs={12} sx={{ pb: 3 }} key={field.name}>
                  <Grid direction="column" display="flex">
                    <label>{field.name.toUpperCase()}</label>
                    <Calendar
                      style={{
                        width: "350px",
                        padding: "10px",
                        border: "1px solid #3f3f46",
                        borderRadius: "4px",
                        background: "#09090b",
                        color: "#f2f2f2",
                        fontSize: "0.8571428571428571rem",
                      }}
                      value={formik.values[field.name]}
                      onChange={(e) =>
                        formik.setFieldValue(field.name, e.value)
                      }
                      placeholder="Select a date"
                      showIcon
                    />
                    {formik.touched[field.name] &&
                      formik.errors[field.name] && (
                        <Typography variant="body2" color="error">
                          {formik.errors[field.name]}
                        </Typography>
                      )}
                  </Grid>
                </Grid>
              );
            } else if (field.type === "Media") {
              return (
                <Grid item xs={12} sx={{ pb: 3 }} key={field.name}>
                  <Typography variant="body1" gutterBottom>
                    {field.name.toUpperCase()}
                  </Typography>
                  
                  <Button
                    variant="outlined"
                    component="label"
                    htmlFor="image-upload"
                  >
                    Choose File
                    <input
                      id="image-upload"
                      type="file"
                      name={field.name}
                      accept="image/*"
                      onChange={(event) =>
                        formik.setFieldValue(
                          field.name,
                          event.currentTarget.files[0]
                        )
                      }
                      ref={fileInputRef}
                      hidden
                    />
                  </Button>
                  {formik.touched[field.name] &&
                      formik.errors[field.name] && (
                        <Typography variant="body2" color="error">
                          {formik.errors[field.name]}
                        </Typography>
                      )}
                  {formik.values[field.name] && (
                    <Typography
                      variant="body2"
                      color="textSecondary"
                      sx={{ mt: 1 }}
                    >
                      {formik.values[field.name].name}
                    </Typography>
                  )}
                  {existingImage && (
                    <Grid item xs={12} sx={{ pb: 3, pt: 3 }}>
                      <Typography variant="body1" gutterBottom>
                        CURRENT IMAGE:
                      </Typography>
                      <img
                        src={\`\${BASE_URL}/uploads/\${existingImage}\`}
                        alt="Current"
                        style={{
                          width: "150px",
                          height: "auto",
                          borderRadius: "8px",
                        }}
                      />
                    </Grid>
                  )}
                </Grid>
              );
            } else if (field.type === "Boolean") {
              return (
                <Grid item xs={12} sx={{ pb: 3 }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formik.values.active}
                        onChange={(e) =>
                          formik.setFieldValue("active", e.target.checked)
                        }
                      />
                    }
                    label="ACITVE"
                  />
                </Grid>
              );
            }
            return null; // If no field type matches
          })}
          {/* Submit Button */}
          <Grid item xs={12} gap={5} display="flex" justifyContent="center">
            <Button type="submit" variant="contained" disabled={isSubmitting}>
              <Box display="flex" gap=".5rem">
                <Typography>{id ? "Update" : "Add"}</Typography>
                <ArrowOutwardIcon />
              </Box>
            </Button>
          </Grid>
        </form>
</Box>
{id && (
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
      onClick={() =>
      setOpenDeleteDialog(true)} // Open the delete dialog
      >
      <Box display="flex" gap=".5rem">
         <Typography>Delete</Typography>
         <DeleteIcon />
      </Box>
   </Button>
</Grid>
</>
)}
<Snackbar
   open={snackbar.open}
   autoHideDuration={6000}
   onClose={() =>
   setSnackbar({ ...snackbar, open: false })}
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
{/* Delete Confirmation Dialog */}
<Dialog
   open={openDeleteDialog}
   onClose={() =>
   setOpenDeleteDialog(false)}
   >
   <DialogTitle>
      <Box
         display={"flex"}
         justifyContent={"start"}
         gap={1}
         alignItems={"center"}
         >
         Confirm Deletion 
         <ReportIcon />
      </Box>
   </DialogTitle>
   <DialogContent>
      <Typography variant="body1">
         Are you sure you want to delete this record?
      </Typography>
   </DialogContent>
   <DialogActions sx={{ pb: 3, pr: 3 }}>
   <Button onClick={() => setOpenDeleteDialog(false)} color="primary">
   Cancel
   </Button>
   <Button
      onClick={() => handleDelete()}
   color="secondary"
   variant="contained"
   >
   Delete
   </Button>
   </DialogActions>
</Dialog>
</Grid>
);
};
export default AllEdit${collectionName}Data;
`;
    fs.writeFileSync(addEditDataFilePath, addEditDataContent);
    // const git = simpleGit({
    //   baseDir: path.join(__dirname, ".."),
    // });
    // await git.add("./src/pages/*");
    // await git.commit(`Add new project: ${projectName}`);
    // await git.push("origin", "main");
    res.status(200).send({
      status: true,
      message: "Project created successfully",
      projectName,
      collectionName,
    });
  } catch (error) {
    console.error("Error creating project:", error);
    res.status(500).send({
      status: false,
      error: "Failed to create project",
    });
  }
});
app.post("/existing-project", async (req, res) => {
  const { projectName, collectionName, fields } = req.body;
  if (!projectName || !collectionName) {
    return res.status(400).send({
      status: false,
      error: "Project name and collection name are required",
    });
  }
  fields.push({
    type: "Boolean",
    name: "active",
  });
  const updateFields = {
    projectName,
    collectionName,
    fields, // New fields to update
    updatedAt: new Date(),
  };
  try {
    Project.updateOne(
      { projectName, collectionName }, // Query to find the document
      { $set: updateFields }, // Fields to update
      { upsert: true } // Add `upsert: true` to create if not found
    )
      .then(async (result) => {
        if (result.matchedCount > 0) {
          console.log("Project updated successfully:", result);
        } else {
          console.log("Project created successfully:", result);
          // Create the collection in the database if it doesn't exist
          const db = mongoose.connection.db;
          const collections = await db.listCollections().toArray();
          const collectionExists = collections.some(
            (collection) => collection.name === collectionName
          );
          if (!collectionExists) {
            await db.createCollection(collectionName);
            res.status(200).send({
              status: true,
              message: "Collection created successfully",
            });
          } else {
            res
              .status(500)
              .send({ status: false, message: "Collection already exist" });
          }
        }
      })
      .catch((err) => {
        console.error("Error updating or creating project:", err);
      });
    const projectPath = path.join(__dirname, "..", "src", "pages", projectName); // Traverse up one level to get to 'src/pages'
    console.log("Project Path:", projectPath);
    if (!fs.existsSync(projectPath)) {
      // If it doesn't exist, create the directory
      fs.mkdirSync(projectPath, {
        recursive: true,
      });
    }
    // Create All{Collection}Data.jsx
    const allDataFilePath = path.join(
      projectPath,
      `All${collectionName}Data.jsx`
    );
    const allDataContent = `
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { DataGrid } from "@mui/x-data-grid";
import {
IconButton,
Button,
Grid,
Snackbar,
Tooltip,
Box,
CircularProgress,
Typography,
} from "@mui/material";
import DriveFileRenameOutlineIcon from "@mui/icons-material/DriveFileRenameOutline";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import MuiAlert from "@mui/material/Alert";
import axios from "axios";
import LockIcon from "@mui/icons-material/Lock";
import LockOpenIcon from "@mui/icons-material/LockOpen";
import { BASE_URL, IN_URL } from "../../hooks/baseURL";
const All${collectionName}Data = () => {
const [rows, setRows] = useState([]);
const [openSnackbar, setOpenSnackbar] = useState(false);
const [snackbarMessage, setSnackbarMessage] = useState("");
const [loading, setLoading] = useState(false);
const [error, setError] = useState(null);
const [columns, setColumns] = useState([]);
const navigate = useNavigate();
useEffect(() => {
  setLoading(true);

  // Fetch both datasets
  const fetchStudentData = axios.get(\`\${BASE_URL}/api/data/${collectionName}\`);
  const fetchProjectFields = axios.get(
    \`\${IN_URL}/get_projects_data\`
  );

  Promise.all([fetchStudentData, fetchProjectFields])
    .then(([studentResponse, projectResponse]) => {
      // Student data response
      const studentData = studentResponse.data.data;
      const updatedStudentData = studentData.map((item) => ({
        ...item,
        imageUrl: item.imageName
          ? \`\${BASE_URL}/uploads/\${item.imageName}\`
          : "",
      }));

      setRows(updatedStudentData);

      // Project fields response
      // Project fields response
      const project = projectResponse.data.projectsWithoutActiveField.find(
        (project) => project.collectionName === \"${collectionName}"\
      );

      const projectFields = project?.fields || [];

      if (studentData.length > 0) {
        // Extract valid field names from project fields
        const validFieldNames = projectFields.map((field) => field.name);

        // Filter and dynamically create columns based on valid fields
        const dynamicColumns = Object.keys(studentData[0])
          .filter((key) => validFieldNames.includes(key) && key !== "__v") // Match fields with project fields
          .map((key) => {
            if (key === "_id" || key === "imageUrl") return null;
            return {
              field: key,
              headerName: key.charAt(0).toUpperCase() + key.slice(1),
              flex: 1,
            };
          })
          .filter(Boolean);

        // Add actions column
        dynamicColumns.push({
          field: "actions",
          headerName: "Actions",
          width: 150,
          renderCell: (params) => (
            <Tooltip
              title={
                params.row.active === true || params.row.active === "true"
                  ? "Mark as Inactive"
                  : "Mark as Active"
              }
            >
              <IconButton
                onClick={() =>
                  handleToggleActive(params.row._id, params.row.active)
                }
              >
                {params.row.active === true ||
                params.row.active === "true" ? (
                  <LockOpenIcon sx={{ color: "#f2f2f2" }} />
                ) : (
                  <LockIcon sx={{ color: "#f2f2f2" }} />
                )}
              </IconButton>
            </Tooltip>
          ),
        });

        setColumns(dynamicColumns);
      }
      setLoading(false);
    })
    .catch((error) => {
      console.error("Error fetching data:", error);
      setError("Failed to load data!");
      setLoading(false);
    });
}, []);
const handleToggleActive = async (id, currentStatus) => {
try {
setLoading(true);
const newStatus = !currentStatus;
const response = await axios.put(
\`\${BASE_URL}/api/data/${collectionName}/\${id}\`,
{
active: newStatus,
}
);
if (response.data.status) {
setRows((prevRows) =>
prevRows.map((row) =>
row._id === id ? { ...row, active: newStatus } : row
)
);
setSnackbarMessage(
\`Data marked as \${newStatus ? "active" : "inactive"}!\`
);
setOpenSnackbar(true);
} else {
setSnackbarMessage("Failed to update data status!");
setOpenSnackbar(true);
}
setLoading(false);
} catch (error) {
console.error("Error updating data:", error);
setSnackbarMessage("Failed to update data status!");
setOpenSnackbar(true);
setLoading(false);
}
};
const handleCloseSnackbar = () => {
setOpenSnackbar(false);
};
const handleAddData = () => {
navigate("/main/${projectName.toLowerCase()}/AddEdit${collectionName}Data/add");
};
return (
<Grid container spacing={3} sx={{ padding: 3 }}>
<Grid item xs={12}>
   <Button
   variant="contained"
   color="primary"
   startIcon={
   <AddIcon />
   }
   onClick={handleAddData}
   disabled={loading}
   >
   Add Data
   </Button>
</Grid>
<Grid item xs={12}>
   {loading ? (
   <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      height="300px"
      >
      <CircularProgress />
   </Box>
   ) : error ? (
   <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      height="300px"
      >
      <Typography color="error">{error}</Typography>
   </Box>
   ) : (
   <div style={{ height: "auto", width: "100%" }}>
   {columns.length === 0 ? (
   <Typography
   style={{
   textAlign: "center"
   }}
   variant="h4"
   color="#ff0066"
   >
   No data found
   </Typography>
   ) : (
   <DataGrid
      rows={rows}
      columns={columns}
      getRowId={(row) =>
   row._id}
   autoHeight
   onRowDoubleClick={(params) => navigate(\`/main/${projectName}/AddEdit${collectionName}Data/edit/\${params.row._id}\`)}
   />
   )}
   </div>
   )}
</Grid>
<Snackbar
   open={openSnackbar}
   autoHideDuration={6000}
   onClose={handleCloseSnackbar}
   >
   <MuiAlert
   onClose={handleCloseSnackbar}
   severity={error ? "error" : "success"}
   sx={{ width: "100%" }}
   >
   {snackbarMessage}
   </MuiAlert>
</Snackbar>
</Grid>
);
};
export default All${collectionName}Data;
`;
    fs.writeFileSync(allDataFilePath, allDataContent);
    // Create AddEdit{Collection}Data.jsx
    const addEditDataFilePath = path.join(
      projectPath,
      `AddEdit${collectionName}Data.jsx`
    );
    const addEditDataContent = `
import React, { useEffect, useState, useRef } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import axios from "axios";
import ReactQuill from "react-quill";
import {
Grid,
TextField,
Button,
Typography,
Box,
Switch,
FormControlLabel,
Snackbar,
Alert,
Dialog,
DialogActions,
DialogContent,
DialogTitle,
FormControl,
FormLabel,
RadioGroup,
Radio,
FormGroup,
Checkbox,
Autocomplete,
} from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import "react-quill/dist/quill.snow.css"; // import Quill's styles
import ArrowOutwardIcon from "@mui/icons-material/ArrowOutward";
import NorthWestIcon from "@mui/icons-material/NorthWest";
import DeleteIcon from "@mui/icons-material/Delete";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import CircularProgress from "@mui/material/CircularProgress";
import ReportIcon from "@mui/icons-material/Report";
import { BASE_URL } from "../../hooks/baseURL";
import { Calendar } from "primereact/calendar";
const AllEdit${collectionName}Data = () => {
const { id } = useParams();
const navigate = useNavigate();
const fileInputRef = useRef(null);
const [existingImage, setExistingImage] = useState("");
const [isSubmitting, setIsSubmitting] = useState(false);
const [snackbar, setSnackbar] = useState({
open: false,
message: "",
severity: "",
});
// const [aiPrompt, setAiPrompt] = useState("");
// const [loadingAI, setLoadingAI] = useState(false);
const fields = ${JSON.stringify(fields)};
const generateInitialValues = () => {
const initialValues = {};
fields.forEach((field) => {
if (field.type === "Checkbox") {
initialValues[field.name] = []; // Array for checkboxes
} else if (field.type === "Date") {
initialValues[field.name] = null; // Date value
} else {
initialValues[field.name] = "";
}
});
return initialValues;
};
const validationSchema = Yup.object(
  fields.reduce((schema, field) => {
    if (field.type === "Text" || field.type === "Long Text") {
      schema[field.name] = Yup.string().required(\`\${field.name} is required\`);
    } else if (field.type === "Select") {
      schema[field.name] = Yup.string()
        .oneOf(field.options, "Invalid selection")
        .required(\`\${field.name} is required\`);
    } else if (field.type === "Checkbox") {
      schema[field.name] = Yup.array()
        .min(1, "At least one option must be selected")
        .required(\`\${field.name} is required\`);
    } else if (field.type === "Date") {
      schema[field.name] = Yup.date()
        .nullable()
        .required(\`\${field.name} is required\`);
    } else if (field.type === "Autocomplete") {
      schema[field.name] = Yup.string()
        .oneOf(field.options, "Invalid selection")
        .required(\`\${field.name} is required\`);
    } else if (field.type === "Boolean") {
      schema[field.name] = Yup.boolean().required(
        \`\${field.name} is required\`
      );
    } else if (field.type === "Media") {
      schema[field.name] = Yup.mixed()
        .test("required", "File is required", (value) => {
          return value instanceof File; // Ensures a file is selected
        })
        .test("fileFormat", "Unsupported file format", (value) => {
          if (!value) return true; // Skip validation if empty (handled by required test)
          return ["image/jpeg", "image/png", "image/jpg"].includes(value.type);
        })
        .test("fileSize", "File size must be under 5MB", (value) => {
          if (!value) return true;
          return value.size <= 5 * 1024 * 1024;
        });
    }      
    return schema;
  }, {})
);
const [initialValues, setInitialValues] = useState(generateInitialValues());
const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
const formik = useFormik({
initialValues,
validationSchema,
enableReinitialize: true,
onSubmit: async (values) => {
setIsSubmitting(true);
const formData = new FormData();
Object.keys(values).forEach((key) => {
if (key === "active") {
formData.append(key, values[key] ? true : false);
} else if (key !== "image") {
formData.append(key, values[key]);
}
});
if (values.image) {
formData.append("image", values.image); // New image uploaded
}
if (!values.image && existingImage) {
formData.append("existingImage", existingImage); // Existing image
}
try {
const method = id ? "put" : "post";
const url = id
? \`\${BASE_URL}/api/data/\${\"${collectionName}"\}/\${id}\`
: \`\${BASE_URL}/api/data/\${\"${collectionName}"\}\`;
await axios({
method,
url,
data: formData,
headers: {
"Content-Type": "multipart/form-data",
},
});
setIsSubmitting(false);
navigate(\`/main/${projectName.toLowerCase()}/All${collectionName}Data\`);
} catch (error) {
console.error("Error submitting form:", error);
setIsSubmitting(false);
}
},
});
useEffect(() => {
if (id) {
axios
.get(\`\${BASE_URL}/api/data/\${\"${collectionName}"\}/\${id}\`)
.then((response) => {
const data = response.data.data;
const updatedValues = {};
fields.forEach((field) => {
updatedValues[field.name] = data[field.name] ?? (field.type === "boolean" ? false : "");
if (field.type === "Media" && data[field.name]) {
  setExistingImage(data[field.name]);
}
});
setInitialValues(updatedValues);
})
.catch((error) => {
console.error("Error fetching data:", error);
});
}
}, [id]);
const handleDelete = async () => {
if (!id) {
console.error("No record to delete.");
return;
}
try {
setIsSubmitting(true);
await axios.delete(\`\${BASE_URL}/api/data/\${\"${collectionName}"\}/\${id}\`);
setIsSubmitting(false);
setOpenDeleteDialog(false); 
navigate("\/main/${projectName.toLowerCase()}/All${collectionName}Data");
} catch (error) {
console.error("Error deleting record:", error);
setIsSubmitting(false);
}
};
return (
<Grid container spacing={3} sx={{ padding: 3 }}>
<Grid item xs={12}>
   <Button
   variant="contained"
   color="primary"
   startIcon={
   <NorthWestIcon />
   }
   onClick={() => navigate("\/main/${projectName.toLowerCase()}/All${collectionName}Data")}
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
width:'100%'
}}
>
<Typography variant="h5" gutterBottom align="center" sx={{ mb: 3 }}>
{id ? "Update Data" : "Add New Data"}
</Typography>
<form onSubmit={formik.handleSubmit}>
          {fields.map((field) => {
            if (field.type == "Text") {
              return (
                <Grid item xs={12} sx={{ pb: 3 }} key={field.name}>
                  <TextField
                    fullWidth
                    label={field.name.toUpperCase()}
                    name={field.name}
                    value={formik.values[field.name]}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={
                      formik.touched[field.name] &&
                      Boolean(formik.errors[field.name])
                    }
                    helperText={
                      formik.touched[field.name] && formik.errors[field.name]
                    }
                  />
                </Grid>
              );
            } else if (field.type == "Long Text") {
              return (
                <Grid item xs={12} sx={{ pb: 3 }} key={field.name}>
                  <FormLabel>{field.name.toUpperCase()}</FormLabel>
                  <ReactQuill
                    style={{ width: "100%" }}
                    value={formik.values[field.name]}
                    onChange={(value) =>
                      formik.setFieldValue(field.name, value)
                    }
                    modules={{
                      toolbar: [
                        [{ header: "1" }, { header: "2" }, { font: [] }],
                        [{ list: "ordered" }, { list: "bullet" }],
                        ["bold", "italic", "underline"],
                        ["blockquote", "code-block"],
                        [{ align: [] }],
                        ["link", "image"],
                      ],
                    }}
                  />
                  {formik.touched[field.name] && formik.errors[field.name] && (
                    <Typography variant="body2" color="error">
                      {formik.errors[field.name]}
                    </Typography>
                  )}
                </Grid>
              );
            } else if (field.type === "Select") {
              return (
                <Grid item xs={12} sx={{ pb: 3 }} key={field.name}>
                  <FormLabel>{field.name.toUpperCase()}</FormLabel>
                  <RadioGroup
                    name={field.name}
                    value={formik.values[field.name]}
                    onChange={formik.handleChange}
                  >
                    {field.options.map((option) => (
                      <FormControlLabel
                        key={option}
                        value={option}
                        control={<Radio />}
                        label={option}
                      />
                    ))}
                  </RadioGroup>
                  {formik.touched[field.name] && formik.errors[field.name] && (
                    <Typography variant="body2" color="error">
                      {formik.errors[field.name]}
                    </Typography>
                  )}
                </Grid>
              );
            } else if (field.type === "Checkbox") {
              return (
                <Grid sx={{ pb: 3 }} key={field.name}>
                  <FormLabel>{field.name.toUpperCase()}</FormLabel>
                  <br />
                  <FormGroup>
                    {field.options.map((option) => (
                      <FormControlLabel
                        key={option}
                        control={
                          <Checkbox
                            value={option}
                            checked={formik.values[field.name]?.includes(
                              option
                            )}
                            onChange={(e) => {
                              const checked = e.target.checked;
                              // Ensure the value is always treated as an array
                              const currentValue = Array.isArray(
                                formik.values[field.name]
                              )
                                ? formik.values[field.name]
                                : [];
                              const newValue = checked
                                ? [...currentValue, option] // Add the selected option
                                : currentValue.filter(
                                    (item) => item !== option
                                  ); // Remove the unselected option
                              formik.setFieldValue(field.name, newValue); // Update the form field
                            }}
                          />
                        }
                        label={option}
                      />
                    ))}
                  </FormGroup>
                  {formik.touched[field.name] && formik.errors[field.name] && (
                    <Typography variant="body2" color="error">
                      {formik.errors[field.name]}
                    </Typography>
                  )}
                </Grid>
              );
            } else if (field.type === "Autocomplete") {
              return (
                <Autocomplete
                  sx={{ pb: 3 }}
                  key={field.name}
                  options={field.options}
                  getOptionLabel={(option) => option}
                  value={formik.values[field.name]}
                  onChange={(e, value) =>
                    formik.setFieldValue(field.name, value)
                  }
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label={field.name.toUpperCase()}
                      error={
                        formik.touched[field.name] &&
                        Boolean(formik.errors[field.name])
                      }
                      helperText={
                        formik.touched[field.name] && formik.errors[field.name]
                      }
                    />
                  )}
                />
              );
            } else if (field.type === "Date") {
              return (
                <Grid item xs={12} sx={{ pb: 3 }} key={field.name}>
                  <Grid direction="column" display="flex">
                    <label>{field.name.toUpperCase()}</label>
                    <Calendar
                      style={{
                        width: "350px",
                        padding: "10px",
                        border: "1px solid #3f3f46",
                        borderRadius: "4px",
                        background: "#09090b",
                        color: "#f2f2f2",
                        fontSize: "0.8571428571428571rem",
                      }}
                      value={formik.values[field.name]}
                      onChange={(e) =>
                        formik.setFieldValue(field.name, e.value)
                      }
                      placeholder="Select a date"
                      showIcon
                    />
                    {formik.touched[field.name] &&
                      formik.errors[field.name] && (
                        <Typography variant="body2" color="error">
                          {formik.errors[field.name]}
                        </Typography>
                      )}
                  </Grid>
                </Grid>
              );
            } else if (field.type === "Media") {
              return (
                <Grid item xs={12} sx={{ pb: 3 }} key={field.name}>
                  <Typography variant="body1" gutterBottom>
                    {field.name.toUpperCase()}
                  </Typography>
                  
                  <Button
                    variant="outlined"
                    component="label"
                    htmlFor="image-upload"
                  >
                    Choose File
                    <input
                      id="image-upload"
                      type="file"
                      name={field.name}
                      accept="image/*"
                      onChange={(event) =>
                        formik.setFieldValue(
                          field.name,
                          event.currentTarget.files[0]
                        )
                      }
                      ref={fileInputRef}
                      hidden
                    />
                  </Button>
                  {formik.touched[field.name] &&
                      formik.errors[field.name] && (
                        <Typography variant="body2" color="error">
                          {formik.errors[field.name]}
                        </Typography>
                      )}
                  {formik.values[field.name] && (
                    <Typography
                      variant="body2"
                      color="textSecondary"
                      sx={{ mt: 1 }}
                    >
                      {formik.values[field.name].name}
                    </Typography>
                  )}
                  {existingImage && (
                    <Grid item xs={12} sx={{ pb: 3, pt: 3 }}>
                      <Typography variant="body1" gutterBottom>
                        CURRENT IMAGE:
                      </Typography>
                      <img
                        src={\`\${BASE_URL}/uploads/\${existingImage}\`}
                        alt="Current"
                        style={{
                          width: "150px",
                          height: "auto",
                          borderRadius: "8px",
                        }}
                      />
                    </Grid>
                  )}
                </Grid>
              );
            } else if (field.type === "Boolean") {
              return (
                <Grid item xs={12} sx={{ pb: 3 }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formik.values.active}
                        onChange={(e) =>
                          formik.setFieldValue("active", e.target.checked)
                        }
                      />
                    }
                    label="ACITVE"
                  />
                </Grid>
              );
            }
            return null; // If no field type matches
          })}
          {/* Submit Button */}
          <Grid item xs={12} gap={5} display="flex" justifyContent="center">
            <Button type="submit" variant="contained" disabled={isSubmitting}>
              <Box display="flex" gap=".5rem">
                <Typography>{id ? "Update" : "Add"}</Typography>
                <ArrowOutwardIcon />
              </Box>
            </Button>
          </Grid>
        </form>
</Box>
{id && (
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
      onClick={() =>
      setOpenDeleteDialog(true)} // Open the delete dialog
      >
      <Box display="flex" gap=".5rem">
         <Typography>Delete</Typography>
         <DeleteIcon />
      </Box>
   </Button>
</Grid>
</>
)}
<Snackbar
   open={snackbar.open}
   autoHideDuration={6000}
   onClose={() =>
   setSnackbar({ ...snackbar, open: false })}
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
{/* Delete Confirmation Dialog */}
<Dialog
   open={openDeleteDialog}
   onClose={() =>
   setOpenDeleteDialog(false)}
   >
   <DialogTitle>
      <Box
         display={"flex"}
         justifyContent={"start"}
         gap={1}
         alignItems={"center"}
         >
         Confirm Deletion 
         <ReportIcon />
      </Box>
   </DialogTitle>
   <DialogContent>
      <Typography variant="body1">
         Are you sure you want to delete this record?
      </Typography>
   </DialogContent>
   <DialogActions sx={{ pb: 3, pr: 3 }}>
   <Button onClick={() => setOpenDeleteDialog(false)} color="primary">
   Cancel
   </Button>
   <Button
      onClick={() => handleDelete()}
   color="secondary"
   variant="contained"
   >
   Delete
   </Button>
   </DialogActions>
</Dialog>
</Grid>
);
};
export default AllEdit${collectionName}Data;
`;
    fs.writeFileSync(addEditDataFilePath, addEditDataContent);
    // await git.add("./src/pages/*");
    // await git.commit(`Add existing collection: ${collectionName}`);
    // await git.push("origin", "main");
    res.status(200).send({
      status: true,
      message: "Project created successfully",
      projectName,
      collectionName,
    });
  } catch (error) {
    console.error("Error creating project:", error);
    res.status(500).send({
      status: false,
      error: "Failed to create project",
    });
  }
});
app.get("/get_projects", (req, res) => {
  try {
    const pagesPath = path.join(__dirname, "..", "src", "pages");
    // Read the directory for existing project folders
    fs.readdir(pagesPath, (err, files) => {
      if (err) {
        return res.status(500).send({
          status: false,
          error: "Failed to read projects",
        });
      }
      // Filter the directories (project folders) from the files
      const projects = files
        .filter((file) =>
          fs.lstatSync(path.join(pagesPath, file)).isDirectory()
        ) // Check if it's a directory
        .map((projectName) => {
          const projectPath = path.join(pagesPath, projectName);
          // Get all files inside the project directory
          const projectFiles = fs.readdirSync(projectPath).filter(
            (file) => fs.lstatSync(path.join(projectPath, file)).isFile() // Only include files
          );
          return {
            projectName,
            files: projectFiles,
          };
        });
      res.status(200).send({
        status: true,
        projects,
      });
    });
  } catch (error) {
    console.error("Error fetching projects:", error);
    res.status(500).send({
      status: false,
      error: "Failed to fetch projects",
    });
  }
});
app.get("/get_projects_data", async (req, res) => {
  try {
    const projects = await Project.find();
    const projectsWithoutActiveField = projects.map((project) => {
      const filteredFields = project.fields.filter(
        (field) => field.name !== "active"
      );
      return { ...project.toObject(), fields: filteredFields };
    });
    res.status(200).json({ status: true, projectsWithoutActiveField });
  } catch (error) {
    // Handle any errors that occur during the database query
    console.error("Error fetching projects:", error);
    res.status(500).json({ status: false, error: error.message });
  }
});
app.post("/delete-collection", async (req, res) => {
  const { projectName, collectionName } = req.body;
  console.log(projectName, collectionName);
  if (!projectName || !collectionName) {
    return res.status(400).json({
      status: false,
      error: "Project name and collection name are required.",
    });
  }
  try {
    // Delete the specific collection in the Project database
    const result = await Project.deleteOne({
      projectName,
      collectionName: collectionName,
    });
    const projectPath = path.join(__dirname, "..", "src", "pages", projectName);
    if (result.deletedCount > 0) {
      // Check if project folder exists and delete files related to collectionName
      if (fs.existsSync(projectPath)) {
        const files = fs.readdirSync(projectPath);
        files.forEach((file) => {
          if (file.includes(collectionName)) {
            const filePath = path.join(projectPath, file);
            fs.unlinkSync(filePath);
            console.log(`Deleted file: ${filePath}`);
          }
        });
      } else {
        console.log(`Project folder "${projectName}" does not exist.`);
      }
      // Check if the database holds a collection with the name `collectionName`
      const db = mongoose.connection.db;
      const collections = await db.listCollections().toArray();
      const collectionExists = collections.some(
        (collection) => collection.name === collectionName
      );
      if (collectionExists) {
        await db.dropCollection(collectionName);
        console.log(
          `Dropped collection "${collectionName}" from the database.`
        );
      } else {
        console.log(
          `No collection named "${collectionName}" found in the database.`
        );
      }
      res.status(200).json({
        status: true,
        message: `Project "${projectName}" containing collection "${collectionName}" has been deleted along with related files and database collection.`,
      });
    } else {
      res.status(404).json({
        status: false,
        error: `Project "${projectName}" with collection "${collectionName}" not found.`,
      });
    }
  } catch (error) {
    console.error("Error deleting project:", error);
    res.status(500).json({ status: false, error: "Error deleting project" });
  }
});
// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
