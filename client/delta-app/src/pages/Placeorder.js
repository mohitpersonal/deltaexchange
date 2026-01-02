import React, { useEffect, useState } from "react";
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
import { useNavigate, useLocation } from "react-router-dom";
import Sidebar from './Sidebar';
import { BASE_URL } from '../config';
import axios from 'axios';
import apiClient from "../api/axiosConfig";

const drawerWidth = 240;

function Placeorder() {
  const location = useLocation(); 
  const { selectedClients } = location.state || { selectedClients: [] };
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  
  // ✅ Dropdown states
  const [coinNames, setCoinNames] = useState([]);
  const [expiries, setExpiries] = useState([]);
  
  const [strikeSelections, setStrikeSelections] = useState([]);

  const [callsPuts, setCallsPuts] = useState([]);
  const [quantityTypes, setQuantityTypes] = useState([]);
  const [percentages, setPercentages] = useState([]);
  const [lots, setLots] = useState([]);

  const [error, setError] = useState("");
  // ✅ Form state
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
    ordertype: "",
  });

  // ✅ Fetch dropdown values from DB
  useEffect(() => {
    // run all requests in parallel
    Promise.all([
      apiClient.get("/place-order/coinname"),
      apiClient.get("/place-order/calls-puts"),
      apiClient.get("/place-order/expiry"),
      apiClient.get("/place-order/qty-type"),
      apiClient.get("/place-order/qty-percent"),
      apiClient.get("/place-order/qty-unit"),
    ])
      .then(([coinRes, callsRes, expiryRes, qtyTypeRes, qtyPercentRes, qtyUnitRes]) => {
        setCoinNames(coinRes.data);
        setCallsPuts(callsRes.data);
        setExpiries(expiryRes.data);
        setQuantityTypes(qtyTypeRes.data);
        setPercentages(qtyPercentRes.data);
        setLots(qtyUnitRes.data);
      })
      .catch((err) => {
        console.error("Error fetching place-order data:", err);
        setError({
          open: true,
          message: err.response?.data?.message || "Failed to fetch place-order data",
        });
      });
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "quantitytype") {
      setFormData((prev) => ({
        ...prev,
        quantitytype: value,
        quantityabs: value.toLowerCase() === "absolute" ? prev.quantityabs : "",
        quantityper: value.toLowerCase() === "percentages" ? prev.quantityper : "",
      }));
      return;
    }

    if (name === "callsputs") {
      apiClient
        .get("/place-order/strike-selection", { params: { contract_type: value } })
        .then((res) => setStrikeSelections(res.data))
        .catch((err) => {
          console.error("Error fetching strike selections:", err);
          setError({
            open: true,
            message: err.response?.data?.message || "Failed to fetch strike selections",
          });
        });
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
          {/* ✅ Show selected clients */}
          <Typography variant="h6" sx={{ mb: 2 }}>
            Clients:{" "}
            {selectedClients.length > 0
              ? selectedClients.map(c => `${c.name}`).join(", ")
              : "No clients selected"}
          </Typography>

          <Box display="flex" flexDirection="column" gap={3}>
            {/* Coin Name + Expiry */}
            <Box display="flex" gap={2}>
              <TextField label="Coin Name" name="coinname" select value={formData.coinname} onChange={handleChange} sx={{ flex: 1 }} >
                {coinNames.map((coin) => (
                  <MenuItem key={coin.id} value={coin.name}>{coin.name}</MenuItem>
                ))}
              </TextField>
              
              <TextField label="Calls OR Puts" name="callsputs" select value={formData.callsputs} onChange={handleChange} sx={{ flex: 1 }} >
                {callsPuts.map((cp) => (
                  <MenuItem key={cp.id} value={cp.name}>{cp.name}</MenuItem>
                ))}
              </TextField>
              
            </Box>

            {/* Strike Selection + Calls/Puts */}
            <Box display="flex" gap={2}>
              <TextField
                label="Strike Selection"
                name="strikeselection"
                select
                value={formData.strikeselection}
                onChange={handleChange}
                sx={{ flex: 1 }}
              >
                {(strikeSelections || []).map((s) => (
                  <MenuItem key={s.id} value={s.id}>
                    {s.name}
                  </MenuItem>
                ))}
              </TextField>

              <TextField label="Expiry" name="expiry" select value={formData.expiry} onChange={handleChange} sx={{ flex: 1 }} >
                {expiries.map((exp, idx) => (
                  <MenuItem key={idx} value={exp}>{exp}</MenuItem>
                ))}
              </TextField>
            </Box>

            {/* Quantity Type */}
            <Box display="flex" gap={2}>
              <TextField label="Quantity Type" name="quantitytype" select value={formData.quantitytype} onChange={handleChange} sx={{ flex: 1 }} >
                {quantityTypes.map((qt) => (
                  <MenuItem key={qt.id} value={qt.name}>{qt.name}</MenuItem>
                ))}
              </TextField>
            
              <TextField
                label="Quantity Lots"
                name="quantityabs"
                select
                value={formData.quantityabs || lots[0]?.name}   // default to first lot id
                onChange={handleChange}
                sx={{ flex: 1 }}
              >
                {lots.map((lot) => (
                  <MenuItem key={lot.id} value={lot.id}>
                    {lot.name}
                  </MenuItem>
                ))}
              </TextField>


              {formData.quantitytype.toLowerCase() === "absolute" && (
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

              {formData.quantitytype.toLowerCase() === "percentages" && (
                <TextField label="Quantity Percent" name="quantityper" select value={formData.quantityper} onChange={handleChange} sx={{ flex: 1 }} >
                  {percentages.map((p) => (
                    <MenuItem key={p.id} value={p.name}>{p.name}%</MenuItem>
                  ))}
                </TextField>
              )}
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