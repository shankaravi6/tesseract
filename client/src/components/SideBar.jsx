import * as React from "react";
import { styled, useTheme } from "@mui/material/styles";
import Box from "@mui/material/Box";
import MuiDrawer from "@mui/material/Drawer";
import MuiAppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import List from "@mui/material/List";
import CssBaseline from "@mui/material/CssBaseline";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import MenuIcon from "@mui/icons-material/Menu";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Collapse from "@mui/material/Collapse";
import RocketLaunchIcon from "@mui/icons-material/RocketLaunch";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";
import Home from "../pages/Home";
import BackupTableIcon from "@mui/icons-material/BackupTable";
import CottageIcon from "@mui/icons-material/Cottage";
import { Suspense } from "react";
import Field from "../pages/Field";
import AddBoxIcon from "@mui/icons-material/AddBox";
import { IN_URL } from "../hooks/baseURL";
const FallbackLoader = () => <div>Loading...</div>;

// Dynamic import function considering project and component names
const dynamicImport = (projectName, componentName) => {
  return React.lazy(() => import(`../pages/${projectName}/${componentName}`));
};

const drawerWidth = 240;

const openedMixin = (theme) => ({
  width: drawerWidth,
  transition: theme.transitions.create("width", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen,
  }),
  overflowX: "hidden",
});

const closedMixin = (theme) => ({
  transition: theme.transitions.create("width", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  overflowX: "hidden",
  width: `calc(${theme.spacing(7)} + 1px)`,
  [theme.breakpoints.up("sm")]: {
    width: `calc(${theme.spacing(8)} + 1px)`,
  },
});

const DrawerHeader = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-end",
  padding: theme.spacing(0, 1),
  ...theme.mixins.toolbar,
}));

const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== "open",
})(({ theme, open }) => ({
  zIndex: theme.zIndex.drawer + 1,
  transition: theme.transitions.create(["width", "margin"], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  ...(open && {
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(["width", "margin"], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
}));

const Drawer = styled(MuiDrawer, {
  shouldForwardProp: (prop) => prop !== "open",
})(({ theme, open }) => ({
  width: drawerWidth,
  flexShrink: 0,
  whiteSpace: "nowrap",
  boxSizing: "border-box",
  ...(open && {
    ...openedMixin(theme),
    "& .MuiDrawer-paper": openedMixin(theme),
  }),
  ...(!open && {
    ...closedMixin(theme),
    "& .MuiDrawer-paper": closedMixin(theme),
  }),
  // ...openedMixin(theme),
  // "& .MuiDrawer-paper": openedMixin(theme), //Always Open
}));

export default function MiniDrawer() {
  const theme = useTheme();
  const [open, setOpen] = useState(false);
  const [refineOpen, setRefineOpen] = useState({});
  const [projects, setProjects] = useState([]);


  const handleDrawerOpen = () => setOpen(true);
  const handleDrawerClose = () => setOpen(false);

  const handleRefineClick = (projectName) => {
    setRefineOpen((prev) => ({
      ...prev,
      [projectName]: !prev[projectName],
    }));
  };

  const getProjects = async () => {
    const res = await axios.get(`${IN_URL}/get_projects`);
    const result = res.data.projects;
    setProjects(result);
  };

  useEffect(() => {
    getProjects();
  }, []);


  return (
    <>
      <Box sx={{ display: "flex" }}>
        <CssBaseline />
        <AppBar position="fixed" open={open}>
          <Toolbar>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              onClick={handleDrawerOpen}
              edge="start"
              sx={{
                marginRight: 5,
                ...(open && { display: "none" }),
              }}
            >
              <MenuIcon sx={{ color: "#f2f2f2" }} />
            </IconButton>
            <Typography letterSpacing={2} variant="h6" noWrap component="div">
              <Link to='/'>Tesseract CMS</Link>
            </Typography>
          </Toolbar>
        </AppBar>
        <Drawer variant="permanent" open={open}>
          <DrawerHeader>
            <IconButton onClick={handleDrawerClose}>
              {theme.direction === "rtl" ? (
                <ChevronRightIcon sx={{ color: "#f2f2f2" }} />
              ) : (
                <ChevronLeftIcon sx={{ color: "#f2f2f2" }} />
              )}
            </IconButton>
          </DrawerHeader>
          <Divider />
          <List component="div" disablePadding>
            <ListItemButton component={Link} to="/main/home">
              <ListItemIcon>
                <CottageIcon sx={{ color: "#f2f2f2", fontSize:"26px" }} />
              </ListItemIcon>
              <ListItemText primary="Home" />
            </ListItemButton>
          </List>
          <List>
            {projects.map((data) => (
              <React.Fragment key={data.projectName}>
                <ListItem disablePadding>
                  <ListItemButton
                    onClick={() => handleRefineClick(data.projectName)}
                  >
                    <ListItemIcon>
                      {/* <RocketLaunchIcon sx={{ color: "#f2f2f2" }} /> */}
                      <Typography
                        variant="h3"
                        sx={{ color: "#f2f2f2", fontWeight: "bolder" }}
                      >
                        {data.projectName.substring(0, 2)}
                      </Typography>
                    </ListItemIcon>
                    <ListItemText primary={data.projectName} />
                    {refineOpen[data.projectName] ? (
                      <ExpandLess />
                    ) : (
                      <ExpandMore />
                    )}
                  </ListItemButton>
                </ListItem>
                <Collapse
                  in={refineOpen[data.projectName]}
                  timeout="auto"
                  unmountOnExit
                >
                  <List component="div" disablePadding>
                    {data.files
                      .filter((file) => !file.includes("AddEdit")) // Exclude files containing "AddEdit"
                      .map((file) => {
                        const Component = dynamicImport(
                          data.projectName,
                          file.replace(".jsx", "")
                        );
                        const pathName = `/main/${data.projectName.toLowerCase()}/${file.replace(
                          ".jsx",
                          ""
                        )}`;

                        return (
                          <ListItemButton
                            key={file}
                            component={Link}
                            to={pathName}
                          >
                            <ListItemIcon>
                              <BackupTableIcon sx={{ color: "#f2f2f2" }} />
                            </ListItemIcon>
                            <ListItemText primary={file.replace(".jsx", "")} />
                          </ListItemButton>
                        );
                      })}
                    <ListItemButton
                      component={Link}
                      to={{
                        pathname: "/main/field",
                        search: data.projectName,
                      }}
                    >
                      <ListItemIcon>
                        <AddBoxIcon sx={{ color: "#f2f2f2" }} />
                      </ListItemIcon>
                      <ListItemText primary="Add New Collection" />
                    </ListItemButton>
                  </List>
                </Collapse>
              </React.Fragment>
            ))}
          </List>
        </Drawer>
        <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
          <DrawerHeader />
          <Routes>
            {/* <Route path="/" element={<Home />} /> */}
            <Route path="/home" element={<Home />} />
            <Route path="/field" element={<Field />} />
            {projects.map((project) =>
              project.files.map((file) => {
                const Component = dynamicImport(
                  project.projectName,
                  file.replace(".jsx", "")
                );
                const pathName = `/${project.projectName.toLowerCase()}/${file.replace(
                  ".jsx",
                  ""
                )}`;
                const fileName = `${file.replace(".jsx",
                  "")}`

                const projectName = project.projectName.toLowerCase();
                

                return (
                  <React.Fragment key={file}>
                    <Route
                      path={pathName}
                      element={
                        <Suspense fallback={<FallbackLoader />}>
                          <Component />
                        </Suspense>
                      }
                    />
                    <Route
                      path={`/${projectName}/${fileName}/add`}
                      element={
                        <Suspense fallback={<FallbackLoader />}>
                          <Component />
                        </Suspense>
                      }
                    />
                    <Route
                      path={`/${projectName}/${fileName}/edit/:id`}
                      element={
                        <Suspense fallback={<FallbackLoader />}>
                          <Component />
                        </Suspense>
                      }
                    />
                  </React.Fragment>
                );
              })
            )}
          </Routes>
        </Box>
      </Box>
    </>
  );
}
