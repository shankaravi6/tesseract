import React from 'react';
import TimelapseIcon from '@mui/icons-material/Timelapse';
import { Button, Typography } from '@mui/material';

const ProcessPage = () => {
  return (
    <div style={{color:"#fafafa", background:"#18181b"}} className="min-h-screen flex flex-col items-center justify-center p-6">
      {/* Main Content */}
      <div className="flex flex-col justify-center items-center gap-5 text-center max-w-2xl">
        {/* Heading */}
        <h1 className="text-4xl md:text-6xl font-bold mb-6">
          Work in Progress
        </h1>

        {/* Subheading */}
        <p className="text-lg md:text-xl mb-8" style={{color:"#d4d4d8"}}>
          We're crafting something amazing for you. Please check back soon!
        </p>

        {/* Animated Spinner */}
        <div className="flex justify-center mb-8">
            <TimelapseIcon style={{fontSize:"5.5rem"}}/>
        </div>

        {/* Call-to-Action Button */}
        <Button
          className="bg-white text-black font-semibold transition duration-300"
        >
            <Typography style={{padding:"0px 15px"}} variant="h6">Get Started</Typography>
        </Button>
      </div>

      {/* Footer */}
      <footer className="absolute bottom-6 text-sm text-gray-400">
        &copy; 2024 Tesseract CMS. All rights reserved.
      </footer>
    </div>
  );
};

export default ProcessPage;