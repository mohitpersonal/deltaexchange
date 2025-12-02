import React, { useState } from "react";
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Link,
  Paper,
} from "@mui/material";
import { useNavigate } from "react-router-dom";

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Username:", username);
    console.log("Password:", password);
    // Add authentication logic here if needed
    
    navigate("/clients"); // Navigate to Clients page
  };

  return (
    <Container maxWidth="sm">
      <Paper elevation={6} sx={{ padding: 4, marginTop: 8, borderRadius: 3 }}>
        {/* Header */}
        <Box textAlign="center" mb={3}>
          <Typography variant="h4" fontWeight="bold" color="primary">
            Welcome 👋
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Log in to continue
          </Typography>
        </Box>

        {/* Form */}
        <Box component="form" onSubmit={handleSubmit} noValidate>
          <TextField
            label="Username"
            variant="outlined"
            fullWidth
            margin="normal"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <TextField
            label="Password"
            type="password"
            variant="outlined"
            fullWidth
            margin="normal"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Button
            type="submit"
            variant="contained"
            fullWidth
            sx={{ mt: 2, py: 1.5 }}
          >
            Login
          </Button>
        </Box>
        
      </Paper>
    </Container>
  );
}

export default Login;
