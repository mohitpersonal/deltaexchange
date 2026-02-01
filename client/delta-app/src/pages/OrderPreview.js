import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Box,
  Typography,
  Button,
  Paper,
  Breadcrumbs,
  Link,
  Avatar,
} from "@mui/material";
import axios from "axios";
import Sidebar from "./Sidebar";
import { BASE_URL } from "../config";
import apiClient from "../api/axiosConfig";

function OrderPreview() {
  const location = useLocation();
  const navigate = useNavigate();

  // safely destructure with defaults
  //const { formData = {}, selectedClients = [] } = location.state || {};
  const [formData, setFormData] = useState(location.state?.formData || {});
  const [selectedClients] = useState(location.state?.selectedClients || []);
  const [extraData, setExtraData] = useState(null);

  useEffect(() => {
    console.log("Form Data received in preview:", formData);
    console.log("Selected Clients received in preview:", selectedClients);

    if (formData.expiry) {
      apiClient
        .get("/place-order/order-preview-lists", {
          params: { expiry: formData.expiry },
        })
        .then((res) => {
          console.log("Extra data response:", res.data); // debug
          setExtraData(res.data);

          // Merge symbol into formData
          if (res.data?.symbol) {
            // If formData is managed via state, update it here
            setFormData((prev) => ({
              ...prev,
              symbol: res.data.symbol
            }));
          }
        })
        .catch((err) => console.error("Error fetching extra preview:", err));
    }
  }, [formData.expiry, selectedClients]);

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar />
      {/* Main Content */}
      <Box component="main" sx={{ flexGrow: 1 }}>
        {/* Header */}
        <Box
          sx={{
            height: "15vh",
            backgroundColor: "#0e68a475",
            color: "white",
            p: 3,
          }}
        >
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
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

        <Box sx={{ p: 4 }}>
          <Typography variant="h5" gutterBottom>
            Order Preview
          </Typography>

          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Product & Order Details
            </Typography>

            <ul style={{ margin: 0, paddingLeft: "20px" }}>
              <li>
                <strong>Clients Lists:</strong>{" "}
                {selectedClients.length > 0
                  ? selectedClients
                      .map((c) => `${c.name}`)
                      .join(", ")
                  : "No clients selected"}
              </li>
              <li>
                <strong>Symbol:</strong> {extraData?.symbol || "Loading..."}
              </li>
              <li>
                <strong>Coin:</strong> {formData.coinname || "N/A"}
              </li>
              <li>
                <strong>Calls/Puts:</strong> {formData.callsputs || "N/A"}
              </li>
              <li>
                <strong>Strike:</strong> {formData.strikeselection || "N/A"}
              </li>
              <li>
                <strong>Expiry:</strong>{" "}
                {extraData?.settlement_time || formData.expiry || "Loading..."}
              </li>
              <li>
                <strong>Quantity Type:</strong> {formData.quantitytype || "N/A"}
              </li>
              <li>
                <strong>Quantity:</strong>{" "}
                {formData.quantitytype === "absolute"
                  ? formData.quantityabs
                  : `${formData.quantityper || 0}%`}
              </li>
              <li>
                <strong>Trigger Price:</strong> {formData.trigprice || "N/A"}
              </li>
              <li>
                <strong>Trigger Limit:</strong> {formData.triglimit || "N/A"}
              </li>
              <li>
                <strong>Order Type:</strong> {formData.ordertype || "N/A"}
              </li>
              <li>
                <strong>StopLoss Price:</strong> {formData.slprice || "N/A"}
              </li>
              <li>
                <strong>StopLoss Limit:</strong> {formData.slpricelimit || "N/A"}
              </li>
            </ul>
          </Paper>

          {/* Actions */}
          <Box sx={{ mt: 4, display: "flex", gap: 2 }}>
            <Button
              variant="contained"
              color="primary"
              onClick={() => {
                const confirmed = window.confirm("Are you sure you want to place this order?");
                if (confirmed) {
                  axios.post(
                    `${BASE_URL}/place-order/placed-order`,
                    {
                      formData,
                      selectedClients
                    },
                    {
                      headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`, // or however you store your token
                        "Content-Type": "application/json"
                      }
                    }
                  )
                  .then((res) => {
                    console.log("Order submitted successfully:", res.data);
                    // navigate("/orders/success");
                  })
                  .catch((err) => {
                    console.error("Error submitting order:", err);
                    alert("Failed to submit order. Please try again.");
                  });
                }
              }}
            >
              Confirm & Submit
            </Button>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

export default OrderPreview;