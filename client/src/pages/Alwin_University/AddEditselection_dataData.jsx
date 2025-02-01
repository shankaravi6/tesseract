
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
const AllEditselection_dataData = () => {
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
const fields = [{"type":"Select","name":"gender","options":["Male","Female"]},{"type":"Select","name":"Nation","options":["Indian","Others"]},{"type":"Boolean","name":"active"}];
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
      schema[field.name] = Yup.string().required(`${field.name} is required`);
    } else if (field.type === "Select") {
      schema[field.name] = Yup.string()
        .oneOf(field.options, "Invalid selection")
        .required(`${field.name} is required`);
    } else if (field.type === "Checkbox") {
      schema[field.name] = Yup.array()
        .min(1, "At least one option must be selected")
        .required(`${field.name} is required`);
    } else if (field.type === "Date") {
      schema[field.name] = Yup.date()
        .nullable()
        .required(`${field.name} is required`);
    } else if (field.type === "Autocomplete") {
      schema[field.name] = Yup.string()
        .oneOf(field.options, "Invalid selection")
        .required(`${field.name} is required`);
    } else if (field.type === "Boolean") {
      schema[field.name] = Yup.boolean().required(
        `${field.name} is required`
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
? `${BASE_URL}/api/data/${"selection_data"}/${id}`
: `${BASE_URL}/api/data/${"selection_data"}`;
await axios({
method,
url,
data: formData,
headers: {
"Content-Type": "multipart/form-data",
},
});
setIsSubmitting(false);
navigate(`/main/alwin_university/Allselection_dataData`);
} catch (error) {
console.error("Error submitting form:", error);
setIsSubmitting(false);
}
},
});
useEffect(() => {
if (id) {
axios
.get(`${BASE_URL}/api/data/${"selection_data"}/${id}`)
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
await axios.delete(`${BASE_URL}/api/data/${"selection_data"}/${id}`);
setIsSubmitting(false);
setOpenDeleteDialog(false); 
navigate("/main/alwin_university/Allselection_dataData");
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
   onClick={() => navigate("/main/alwin_university/Allselection_dataData")}
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
                        src={`${BASE_URL}/uploads/${existingImage}`}
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
export default AllEditselection_dataData;
