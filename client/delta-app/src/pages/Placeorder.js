import React, { useState } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  MenuItem,
  RadioGroup,
  FormControlLabel,
  Radio,
  Breadcrumbs,
  Link,
  Avatar
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import Sidebar from './Sidebar';

const drawerWidth = 240;

function Placeorder() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    coinname: "",
    expiry: "",
    strikeselection: "",
    callsputs: "",
    quantitytype: "",
    quantityabs: "",
    quantityper: "",
    quantityunit: "",
    trigprice: "",
    triglimit: "",
    slprice: "",
    slpricelimit: "",
    ordertype: "Buy",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === "quantitytype") {
      setFormData((prev) => ({
        ...prev,
        quantitytype: value,
        quantityabs: value === "absolute" ? prev.quantityabs : "",
        quantityper: value === "percentages" ? prev.quantityper : "",
      }));
      return;
    }

    if (name === "coinname") {
      setFormData((prev) => ({
        ...prev,
        coinname: value,
        quantityunit: value === "Bitcoin" ? "btc" : value === "Etherium" ? "eth" : prev.quantityunit,
      }));
      return;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Add Form Submit logic here if needed   
    navigate("/clients"); // Navigate to Clients page
  };

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar />
      {/* Main Content */}
      <Box component="main" sx={{ flexGrow: 1 }}>
        {/* Light blue header */}
        <Box
          sx={{
            height: "15vh",
            backgroundColor: "#0e68a475", // light blue
            color: "white",
            p: 3,
          }}
        >
          {/* Overlay content */}
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Breadcrumbs aria-label="breadcrumb" sx={{ color: "white" }}>
              <Link underline="hover" color="inherit" href="/">
                Home
              </Link>
              <Typography color="white">Placeorder</Typography>
            </Breadcrumbs>
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <Avatar sx={{ mr: 1, bgcolor: "secondary.main" }}>M</Avatar>
              <Typography variant="body1">Welcome Admin</Typography>
            </Box>
          </Box>
        </Box>
        
        {/* Outer wrapper with margin from all sides */}
        <Box
          sx={{
            p: 4,              // padding inside the form card
            m: 4,              // margin around the form
            maxWidth: 800,     // limit width
            backgroundColor: "white",
            borderRadius: 2,
            boxShadow: 3,
          }}
        >
          <Box display="flex" flexDirection="column" gap={3}>
            {/* Row 1 */}
            <Box display="flex" gap={2}>
              <TextField
                label="Coin Name"
                name="coinname"
                select
                value={formData.coinname}
                onChange={handleChange}
                sx={{ flex: 1 }}   // reduced size, half width
              >
                <MenuItem value="Bitcoin">Bitcoin</MenuItem>
                <MenuItem value="Etherium">Etherium</MenuItem>
              </TextField>

              <TextField
                label="Expiry"
                name="expiry"
                select
                value={formData.expiry}
                onChange={handleChange}
                sx={{ flex: 1 }}   // reduced size, half width
              >
                <MenuItem value="1">1 Day</MenuItem>
                <MenuItem value="3">3 Day</MenuItem>
                <MenuItem value="7">7 Day</MenuItem>
              </TextField>
            </Box>

            {/* Row 2 */}
            <Box display="flex" gap={2}>
              <TextField
                label="Strike Selection"
                name="strikeselection"
                select
                value={formData.strikeselection}
                onChange={handleChange}
                sx={{ flex: 1 }}
              >
                <MenuItem value="Low">Low</MenuItem>
                <MenuItem value="Medium">Medium</MenuItem>
                <MenuItem value="High">High</MenuItem>
              </TextField>

              <TextField
                label="Calls OR Puts"
                name="callsputs"
                select
                value={formData.callsputs}
                onChange={handleChange}
                sx={{ flex: 1 }}
              >
                <MenuItem value="CE">Calls</MenuItem>
                <MenuItem value="PE">Puts</MenuItem>
              </TextField>
            </Box>

            {/* Row 3 */}
            <Box display="flex" gap={2}>
              <TextField
                label="Quantity Type"
                name="quantitytype"
                select
                value={formData.quantitytype}
                onChange={handleChange}
                sx={{ flex: 1 }}
              >
                <MenuItem value="absolute">Absolute</MenuItem>
                <MenuItem value="percentages">Percentages</MenuItem>
              </TextField>

              {/* Show Absolute Quantity only if selected */}
                {formData.quantitytype === "absolute" && (
                  <TextField
                    label="Quantity"
                    name="quantityabs"
                    type="number"
                    value={formData.quantityabs}
                    onChange={handleChange}
                    sx={{ flex: 1 }}
                    inputProps={{ step: "any" }}
                  />
                )}

                {formData.quantitytype === "absolute" && (
                  <TextField
                    label="Quantity Percent"
                    name="quantityper"
                    select
                    value={formData.quantityper}
                    onChange={handleChange}
                    sx={{ flex: 1 }}
                  >
                    <MenuItem value="10">10%</MenuItem>
                    <MenuItem value="25">25%</MenuItem>
                    <MenuItem value="50">50%</MenuItem>
                    <MenuItem value="75">75%</MenuItem>
                    <MenuItem value="100">100%</MenuItem>
                  </TextField>
                )}
            </Box>

            {/* Row 4 */}
            <Box display="flex" gap={2} alignItems="center">
              <TextField
                label="Quantity Unit"
                name="quantityunit"
                select
                value={formData.quantityunit}
                onChange={handleChange}
                sx={{ flex: 1 }}
              >
                <MenuItem value="lot">Lot</MenuItem>
                <MenuItem value="usd">USD</MenuItem>
                <MenuItem value="btc">BTC</MenuItem>
                <MenuItem value="eth">ETH</MenuItem>
              </TextField>
            </Box>

            {/* Row 5 */}
            <Box display="flex" gap={2} alignItems="center">
              <TextField
                label="Trigger price"
                name="trigprice"
                value={formData.trigprice}
                sx={{ flex: 1 }}
              >
              </TextField>

              <TextField
                label="Trigger Price Limit"
                name="triglimit"
                value={formData.triglimit}
                sx={{ flex: 1 }}
              >
              </TextField>
            </Box>

            {/* Row 6 */}
            <Box display="flex" gap={2} alignItems="center">
              <TextField
                label="StopLoss Price"
                name="slprice"
                value={formData.slprice}
                sx={{ flex: 1 }}
              >
              </TextField>

              <TextField
                label="StopLoss Price Limit"
                name="slpricelimit"
                value={formData.slpricelimit}
                sx={{ flex: 1 }}
              >
              </TextField>
            </Box>
            <Box display="flex" gap={2} alignItems="center">
              <RadioGroup
                row
                name="ordertype"
                value={formData.ordertype}
                onChange={handleChange}
              >
                <FormControlLabel value="Buy" control={<Radio />} label="Buy" />
                <FormControlLabel value="Sell" control={<Radio />} label="Sell" />
              </RadioGroup>
            </Box>

            {/* Actions */}
            <Box display="flex" gap={2} justifyContent="center" mt={2}>
              <Button variant="contained" color="primary" onClick={handleSubmit}>
                Submit Order
              </Button>
              <Button variant="outlined" onClick={() => navigate("/clients")}>
                Back
              </Button>
            </Box>
          </Box>
        </Box>


      </Box>
    </Box>
  );
}

export default Placeorder;