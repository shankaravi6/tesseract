
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
const Allselection_dataData = () => {
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
  const fetchStudentData = axios.get(`${BASE_URL}/api/data/selection_data`);
  const fetchProjectFields = axios.get(
    `${IN_URL}/get_projects_data`
  );

  Promise.all([fetchStudentData, fetchProjectFields])
    .then(([studentResponse, projectResponse]) => {
      // Student data response
      const studentData = studentResponse.data.data;
      const updatedStudentData = studentData.map((item) => ({
        ...item,
        imageUrl: item.imageName
          ? `${BASE_URL}/uploads/${item.imageName}`
          : "",
      }));

      setRows(updatedStudentData);

      // Project fields response
      // Project fields response
      const project = projectResponse.data.projectsWithoutActiveField.find(
        (project) => project.collectionName === "selection_data"      );

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
`${BASE_URL}/api/data/selection_data/${id}`,
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
`Data marked as ${newStatus ? "active" : "inactive"}!`
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
navigate("/main/alwin_university/AddEditselection_dataData/add");
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
   onRowDoubleClick={(params) => navigate(`/main/Alwin_University/AddEditselection_dataData/edit/${params.row._id}`)}
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
export default Allselection_dataData;
