import React from "react";
import { Box, Grid, Paper, Typography } from "@mui/material";
import Sidebar from "./Sidebar"; // use layout wrapper

function StatBox({ title, value }) {
  return (
    <Paper
      elevation={3}
      sx={{
        p: 3,
        textAlign: "center",
        borderRadius: 2,
        backgroundColor: "#f9f9f9",
      }}
    >
      <Typography variant="h6" gutterBottom>
        {title}
      </Typography>
      <Typography variant="h4" fontWeight="bold" color="primary">
        {value}
      </Typography>
    </Paper>
  );
}

export default function Dashboard() {
  // Dummy values — replace with API/state later
  const stats = {
    clients: 120,
    openPosition: 45,
    openOrders: 32,
    dailyTransactions: "$15,000",
  };

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar />
      {/* Main Content */}
        <Box component="main" sx={{ flexGrow: 1 }}>
            <Typography variant="h5" fontWeight="bold" gutterBottom>
                Dashboard Overview
            </Typography>
        
            <Grid container spacing={3}>
                <Grid item xs={12} sm={6} md={3}>
                <StatBox title="Total No. of Clients" value={stats.clients} />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                <StatBox title="Total Open Position" value={stats.openPosition} />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                <StatBox title="Total Open Orders" value={stats.openOrders} />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                <StatBox
                    title="Total Daily Transactions Amount"
                    value={stats.dailyTransactions}
                />
                </Grid>
            </Grid>
        </Box>
    </Box>
  );
}