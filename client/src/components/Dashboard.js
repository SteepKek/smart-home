import React, { useState } from 'react';
import { Box, Container, Paper, Typography, Grid } from '@mui/material';
// import FloorPlan from './FloorPlan';

const Dashboard = () => {
  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Smart Home Dashboard
        </Typography>
        
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Paper 
              elevation={3} 
              sx={{ 
                p: 2,
                display: 'flex',
                flexDirection: 'column',
                height: 650
              }}
            >
              {/* <FloorPlan /> */}
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default Dashboard; 