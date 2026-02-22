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
  const [coinNames, setCoinNames] = useState([]);
  const [expiry, setExpiries] = useState([]);
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
    quantitylots: "",   // separate field for lots
    trigprice: "",
    triglimit: "",
    slprice: "",
    slpricelimit: "",
    ordertype: "",
  });

  // ✅ Fetch dropdown values from DB
  useEffect(() => {
    Promise.all([
      apiClient.get("/place-order/coinname"),
      apiClient.get("/place-order/calls-puts"),
      apiClient.get("/place-order/qty-type"),
      apiClient.get("/place-order/qty-percent"),
      apiClient.get("/place-order/qty-unit"),
    ])
      .then(([coinRes, callsRes, qtyTypeRes, qtyPercentRes, qtyUnitRes]) => {
        setCoinNames(coinRes.data);
        setCallsPuts(callsRes.data);
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

    setFormData((prev) => {
      const updated = { ...prev, [name]: value };

      // Handle Quantity Type (Absolute / Percentages from API)
      if (name === "quantitytype") {
        updated.quantityabs = value.toLowerCase() === "absolute" ? prev.quantityabs : "";
        updated.quantityper = value.toLowerCase() === "percentages" ? prev.quantityper : "";
      }

      // When callsputs changes, fetch strike selections
      if (name === "callsputs" && updated.callsputs) {
        apiClient
          .get("/place-order/strike-selection", {
            params: { contract_type: updated.callsputs },
          })
          .then((res) => setStrikeSelections(res.data))
          .catch((err) => {
            console.error("Error fetching strike selections:", err);
            setError({
              open: true,
              message: err.response?.data?.message || "Failed to fetch strike selections",
            });
          });
      }

      // When both callsputs and strikeselection are set, fetch expiry
      if (updated.callsputs && updated.strikeselection) {
        apiClient
          .get("/place-order/expiry", {
            params: {
              strikeSelections: updated.strikeselection,
              contract_type: updated.callsputs,
            },
          })
          .then((res) => setExpiries(res.data))
          .catch((err) => {
            console.error("Error fetching expiry:", err);
            setError({
              open: true,
              message: err.response?.data?.message || "Failed to fetch expiry",
            });
          });
      }

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
            { label: "Place-Order" }
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
              <Autocomplete
                sx={{ flex: 1 }}
                options={strikeSelections}
                getOptionLabel={(option) => option?.name ?? ""}
                isOptionEqualToValue={(option, value) =>
                  (option?.name || "") === (value?.name || "")
                }
                value={
                  strikeSelections.find((s) => (s?.name || "") === formData.strikeselection) ||
                  null
                }
                onChange={(event, newValue) => {
                  const nextName = newValue ? newValue.name : "";
                  setFormData((prev) => ({ ...prev, strikeselection: nextName }));

                  if (formData.callsputs && newValue) {
                    apiClient
                      .get("/place-order/expiry", {
                        params: {
                          strikeSelections: newValue.name,
                          contract_type: formData.callsputs,
                        },
                      })
                      .then((res) => setExpiries(res.data))
                      .catch((err) =>
                        setError(err.response?.data?.message || "Failed to fetch expiry")
                      );
                  }
                }}
                filterOptions={(options, params) => {
                  const input = (params.inputValue || "").trim().toLowerCase();
                  if (input.length < 2) return options;
                  return options.filter((opt) =>
                    (opt?.name || "").toLowerCase().startsWith(input)
                  );
                }}
                renderInput={(params) => (
                  <TextField {...params} label="Strike Selection" sx={{ flex: 1 }} />
                )}
              />

              <TextField
                label="Expiry"
                name="expiry"
                select
                value={formData.expiry}
                onChange={handleChange}
                sx={{ flex: 1 }}
              >
                {(expiry || []).map((e) => (
                  <MenuItem key={e.id} value={e.id}>
                    {e.name || ""}
                  </MenuItem>
                ))}
              </TextField>
            </Box>

            {/* Quantity Type */}
            <Box display="flex" gap={2}>
              <TextField
                label="Quantity Type"
                name="quantitytype"
                select
                value={formData.quantitytype || ""}
                onChange={handleChange}
                sx={{ flex: 1 }}
              >
                {quantityTypes.map((qt) => (
                  <MenuItem key={qt.id} value={(qt.name || "").toLowerCase()}>
                    {qt.name || ""}
                  </MenuItem>
                ))}
              </TextField>

              {(formData.quantitytype || "").toLowerCase() === "absolute" && (
                <TextField
                  label="Quantity"
                  name="quantityabs"
                  type="number"
                  value={formData.quantityabs || ""}
                  onChange={handleChange}
                  sx={{ flex: 1 }}
                  inputProps={{ step: "any" }}
                />
              )}

              {(formData.quantitytype || "").toLowerCase() === "percentages" && (
                <TextField
                  label="Quantity Percent"
                  name="quantityper"
                  select
                  value={formData.quantityper || ""}
                  onChange={handleChange}
                  sx={{ flex: 1 }}
                >
                  {percentages.map((p) => (
                    <MenuItem key={p.id} value={p.name || ""}>
                      {(p.name || "")}%
                    </MenuItem>
                  ))}
                </TextField>
              )}
            </Box>


            {/* Trigger + StopLoss */}
            {/* <Box display="flex" gap={2}>
              <TextField label="Trigger Price" name="trigprice" value={formData.trigprice} onChange={handleChange} sx={{ flex: 1 }} />
              <TextField label="Trigger Price Limit" name="triglimit" value={formData.triglimit} onChange={handleChange} sx={{ flex: 1 }} />
            </Box>

            <Box display="flex" gap={2}>
              <TextField label="StopLoss Price" name="slprice" value={formData.slprice} onChange={handleChange} sx={{ flex: 1 }} />
              <TextField label="StopLoss Price Limit" name="slpricelimit" value={formData.slpricelimit} onChange={handleChange} sx={{ flex: 1 }} />
            </Box> */}

            {/* Order Type */}
            <Box display="flex" gap={2}>
              <TextField
                  label="Quantity Lots"
                  name="quantitylots"
                  select
                  value={formData.quantitylots || ""}
                  onChange={handleChange}
                  sx={{ flex: 1 }}
                >
                  {lots.map((qu) => (
                    <MenuItem key={qu.id} value={(qu.name || "").toLowerCase()}>
                      {qu.name || ""}
                    </MenuItem>
                  ))}
                </TextField>

              <RadioGroup row name="ordertype" value={formData.ordertype} onChange={handleChange} sx={{ flex: 1 }}>
                <FormControlLabel value="Buy" control={<Radio />} label="Buy" />
                <FormControlLabel value="Sell" control={<Radio />} label="Sell" />
              </RadioGroup>
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