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
  Avatar,
  Autocomplete
} from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";
import Sidebar from './Sidebar';
import Header from './Header';
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
  const [orderType, setOrderType] = useState([]);
  const [error, setError] = useState("");

  // ✅ Form state
  const [formData, setFormData] = useState({
    ordertype: "",
  });

  // ✅ Fetch dropdown values from DB
  useEffect(() => {
    Promise.all([
      apiClient.get("/place-bracket-order/order-type"),
    ])
      .then(([orderType]) => {
        setOrderType(orderType.data);
      })
      .catch((err) => {
        console.error("Error fetching place-bracket-order data:", err);
        setError({
          open: true,
          message: err.response?.data?.message || "Failed to fetch place-bracket-order data",
        });
      });
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => {
      const updated = { ...prev, [name]: value };

      // Handle Quantity Type (Absolute / Percentages from API)
      if (name === "quantitytype") {
        updated.quantityabs = value.toLowerCase() === "absolute" ? prev.quantityabs : "";
        updated.quantityper = value.toLowerCase() === "percentages" ? prev.quantityper : "";
      }

      // When callsputs changes, fetch strike selections
      // if (name === "callsputs" && updated.callsputs) {
      //   apiClient
      //     .get("/place-order/strike-selection", {
      //       params: { contract_type: updated.callsputs },
      //     })
      //     .then((res) => setStrikeSelections(res.data))
      //     .catch((err) => {
      //       console.error("Error fetching strike selections:", err);
      //       setError({
      //         open: true,
      //         message: err.response?.data?.message || "Failed to fetch strike selections",
      //       });
      //     });
      // }

      // When both callsputs and strikeselection are set, fetch expiry
      // if (updated.callsputs && updated.strikeselection) {
      //   apiClient
      //     .get("/place-order/expiry", {
      //       params: {
      //         strikeSelections: updated.strikeselection,
      //         contract_type: updated.callsputs,
      //       },
      //     })
      //     .then((res) => setExpiries(res.data))
      //     .catch((err) => {
      //       console.error("Error fetching expiry:", err);
      //       setError({
      //         open: true,
      //         message: err.response?.data?.message || "Failed to fetch expiry",
      //       });
      //     });
      // }

      return updated;
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Add Form Submit logic here if needed   
    navigate("/clients"); // Navigate to Clients page
  };

  const [selectedClientsLists, setSelectedClientsLists] = useState([]); 
  const handlePreview = () => { 
    navigate("/order-preview", { 
    state: { formData, selectedClients }, // 👈 pass values here 
    }); 
  };
  

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar />
      {/* Main Content */}
      <Box component="main" sx={{ flexGrow: 1 }}>
        {/* Header */}
        <Header
          breadcrumbs={[
            { label: "Home", href: "/clients" },
            { label: "Clients",href: "/clients" },
            { label: "Place-Bracket-Order" }
          ]}
          user={{ username: "Admin1" }}
          onLogout={() => {
            console.log("Logging out...");
          }}
        />
        
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
            {/* Order Type */}
            <Box display="flex" gap={2}>
              <TextField label="Order Type" name="ordertype" select value={formData.orderType} onChange={handleChange} sx={{ flex: 1 }} >
                {orderType.map((ot) => (
                  <MenuItem key={ot.id} value={ot.name}>{ot.name}</MenuItem>
                ))}
              </TextField>
              
              {/* <TextField label="Calls OR Puts" name="callsputs" select value={formData.callsputs} onChange={handleChange} sx={{ flex: 1 }} >
                {callsPuts.map((cp) => (
                  <MenuItem key={cp.id} value={cp.name}>{cp.name}</MenuItem>
                ))}
              </TextField> */}
              
            </Box>

            {/* Trigger + StopLoss */}
            <Box display="flex" gap={2}>
              <TextField label="Trigger Price" name="trigprice" value={formData.trigprice} onChange={handleChange} sx={{ flex: 1 }} />
              <TextField label="Trigger Price Limit" name="triglimit" value={formData.triglimit} onChange={handleChange} sx={{ flex: 1 }} />
            </Box>

            <Box display="flex" gap={2}>
              <TextField label="StopLoss Price" name="slprice" value={formData.slprice} onChange={handleChange} sx={{ flex: 1 }} />
              <TextField label="StopLoss Price Limit" name="slpricelimit" value={formData.slpricelimit} onChange={handleChange} sx={{ flex: 1 }} />
            </Box>

            {/* Actions */}
            <Box display="flex" gap={2} justifyContent="center" mt={2}>
              <Button
                variant="contained"
                color="primary"
                onClick={handlePreview}
              >
                Preview Order
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