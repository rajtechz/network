// src/Component/Unauthorized.js
import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const Unauthorized = () => {
  const navigate = useNavigate();

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto', mt: 10, textAlign: 'center' }}>
      <Typography
        variant="h4"
        gutterBottom
        backgroundColor="#FF6B6B"
        p={3}
        color="#fff"
        borderRadius={2}
      >
        401 - Unauthorized Access
      </Typography>
      <Typography variant="body1" mb={3}>
        You are not authorized to access this page. Please log in with the correct credentials.
      </Typography>
      <Button
        variant="contained"
        color="primary"
        sx={{ backgroundColor: '#BF125D' }}
        size="large"
        onClick={() => navigate('/login')}
      >
        Back to Login
      </Button>
    </Box>
  );
};

export default Unauthorized;
