import { Box, Button, Grid, Typography, useTheme } from "@mui/material";
import React from "react";
import ArrowOutwardIcon from "@mui/icons-material/ArrowOutward";
import Spline from "@splinetool/react-spline";
import { useNavigate } from "react-router-dom";

const LandingPage = ({ onGetStartedClick }) => {
  const { palette } = useTheme();

  const navigate = useNavigate();

  return (
    <Grid
      container
      sx={{
        background: palette.background.default,
        width: "100%",
        minHeight: "100vh",
        flexDirection: "column",
        padding:{xs:".5rem", sm:"0rem"}
      }}
    >
      <Grid item xs={12}>
        <Box
          className="flex w-full justify-between items-center"
          sx={{
            padding: { xs: "20px", md: "35px 50px 0 50px" },
            flexDirection: { xs: "column", sm: "row" },
            justifyContent: { xs: "center", sm: "space-between" },
          }}
        >
          <Box>
            <Typography variant="h3">Tesseract CMS</Typography>
          </Box>
          <Box>
            <Button
              endIcon={<ArrowOutwardIcon />}
              variant="outlined"
              onClick={onGetStartedClick}
              sx={{
                marginTop: { xs: "20px", sm: "0" },
              }}
            >
              <Typography onClick={() => navigate('/process')} variant="h6">Get Started</Typography>
            </Button>
          </Box>
        </Box>
      </Grid>

      <Grid item xs={12} sx={{ padding: { xs: "10px", sm: "20px 20px" } }}>
        <Box
          className="flex flex-col-reverse md:flex-row justify-between items-center flex-1 p-5 md:p-10"
          sx={{
            padding: { xs: "0px 10px", md: "0px 35px" },
            flexDirection: { xs: "column-reverse", md: "row" },
          }}
        >
          <Box sx={{ width: { xs: "100%", md: "50%" }, padding: {xs: "25px 0", md:"15px 0", sm:"15px 0"} }}>
            <Typography className="text-justify" variant="h1" sx={{ fontSize: { xs: "2rem", md: "3rem" } }}>
            <span>AI-Powered</span> Dynamic Content Management System
            </Typography>
            <Typography
              sx={{
                mt: 4,
                color: palette.text.secondary,
                fontSize: { xs: "1.2rem", sm: "1.5rem" },
              }}
              variant="h4"
              className="text-justify"
            >
              Build, customize, and optimize content effortlessly. Leverage AI
              to automate workflows, enhance user engagement, and deliver
              personalized experiences.
            </Typography>
            <Typography color="#ff0066" variant="h5" sx={{ mt: 4, fontSize: { xs: "1.25rem", sm: "1.3rem" } }}>
              Start with [Smart]
            </Typography>
          </Box>
          <Box
            sx={{
              width: { xs: "100%", md: "50%" },
              height: { xs: "500px", sm: "500px", md: "500px" },
            }}
          >
            <Spline scene="https://prod.spline.design/vW6SyJm0sNJ6d2e2/scene.splinecode" />
          </Box>
        </Box>
      </Grid>

      <Grid item xs={12}>
        <Box
          className="flex w-full justify-between items-center"
          sx={{
            padding: { xs: "20px 10px", sm: "0px 45px 5px 45px" },
            flexDirection: { xs: "column", sm: "row" },
            alignItems: "center",
          }}
        >
          <Box>
            <Typography color="#52525b" sx={{ fontSize: { xs: "0.8rem", sm: "1rem" } }}>
              @ Copyright by <a href="http://silo-app.netlify.app/">SILO</a>
            </Typography>
          </Box>
          <Box className="flex p-5" gap="1rem" sx={{ flexDirection: { xs: "row", sm: "row" } }}>
            <Typography color="#52525b" sx={{ fontSize: { xs: "0.8rem", sm: "1rem" } }}>
              Privacy Policy
            </Typography>
            <Typography color="#52525b" sx={{ fontSize: { xs: "0.8rem", sm: "1rem" } }}>
              Terms of Use
            </Typography>
          </Box>
        </Box>
      </Grid>
    </Grid>
  );
};

export default LandingPage;
