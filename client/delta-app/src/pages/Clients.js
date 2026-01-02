import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Breadcrumbs,
  Link,
  Avatar,
  Paper,
  Button,
  Snackbar, 
  Alert,
  Checkbox,
  Chip,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  TablePagination,
  MenuItem,
  Dialog,DialogTitle,DialogContent,DialogActions
} from "@mui/material";
import Sidebar from './Sidebar';
import { useNavigate } from "react-router-dom";
import { BASE_URL } from '../config';
import axios from 'axios';
import apiClient from "../api/axiosConfig";

const drawerWidth = 240;

// ---------------- Function 2: Modal Form ----------------
function ClientForm({ open, onClose, onSave, initialValues }) {
  const [groups, setGroups] = useState([]); 
  const [marginModes, setMarginModes] = useState([]);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState(
    initialValues || {
          name: "",
          number: "",
          email: "",
          group: "",
          margin: "",
          apiKey: "",
          apiSecret: ""
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  useEffect(() => {
    if (open) {
      const fetchData = async () => {
        try {
          const [groupsRes, marginRes] = await Promise.all([
            apiClient.get("/clients/groups"),
            apiClient.get("/clients/margin_mode"),
          ]);

          setGroups(groupsRes.data);
          setMarginModes(marginRes.data);
        } catch (err) {
          if (err.response?.status === 401) {
            // Token expired/invalid → handled by interceptor, but you can show message
            setError("Session expired. Please log in again.");
          } else {
            setError(err.response?.data?.message || "Failed to fetch data");
          }
        }
      };

      fetchData();
    }
  }, [open]);
  
  useEffect(() => { if (initialValues) { 
      setFormData(initialValues); } }, 
    [initialValues]);

   const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await apiClient.post(`${BASE_URL}/clients/add_client`, formData);
      onSave(formData);
      onClose();
      setFormData({
        name: "",
        number: "",
        email: "",
        group: "",
        margin: "",
        apiKey: "",
        apiSecret: ""
      });
    } catch (error) {
      console.error("Error adding client:", error);
      alert("Failed to add client.");
    }
  };

    return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="md"   // modal width (sm, md, lg, xl)
    >
      <DialogTitle>Add Client</DialogTitle>

      <DialogContent dividers>
        <TextField
          label="Name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          fullWidth
          margin="normal"
          variant="outlined"
        />
        <TextField
          label="Mobile No."
          name="number"
          value={formData.number}
          onChange={handleChange}
          fullWidth
          margin="normal"
          variant="outlined"
        />
        <TextField
          label="Email ID"
          name="email"
          value={formData.email}
          onChange={handleChange}
          fullWidth
          margin="normal"
          variant="outlined"
        />
        <TextField
          label="API Key"
          name="apiKey"
          value={formData.apiKey}
          onChange={handleChange}
          fullWidth
          margin="normal"
          variant="outlined"
        />
        <TextField
          label="API Secret"
          name="apiSecret"
          value={formData.apiSecret}
          onChange={handleChange}
          fullWidth
          margin="normal"
          variant="outlined"
        />
        <TextField
          select
          label="Group"
          name="group"
          value={formData.group}
          onChange={handleChange}
          fullWidth
          margin="normal"
          variant="outlined"
        >
          {groups.map((g) => (
            <MenuItem key={g.group_id} value={g.group_id}>
              {g.group_name}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          select
          label="Margin Mode"
          name="margin"
          value={formData.margin}
          onChange={handleChange}
          fullWidth
          margin="normal"
          variant="outlined"
        >
          {marginModes.map((m) => (
            <MenuItem key={m.margin_mode_id} value={m.margin_mode_id}>
              {m.margin_mode}
            </MenuItem>
          ))}
        </TextField>
      </DialogContent>

      <DialogActions>
        <Button variant="outlined" color="secondary" onClick={onClose}>
          Close
        </Button>
        <Button
          variant="contained"
          color="primary"
          onClick={handleSubmit}
          disabled={!formData.name || !formData.email}
        >
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );    
}

function Clients() {
    // State
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [selected, setSelected] = useState([]);
  const [order, setOrder] = useState("asc");
  const [orderBy, setOrderBy] = useState("name");
  const [editingClient, setEditingClient] = useState(null);

  // Search + filters
  const [search, setSearch] = useState("");
  const [groupFilter, setGroupFilter] = useState("");
  const [marginmodeFilter, setMarginModeFilter] = useState("");

  const navigate = useNavigate();

  const [clients, setClients] = useState([]);
  const [openForm, setOpenForm] = useState(false);
  const [error, setError] = useState("");

  const fetchClients = async () => {
    try {
      const res = await apiClient.get("/clients"); // token auto-attached
      setClients(res.data); // adjust based on backend response
    } catch (err) {
      // Handle token-related errors
      if (err.response && err.response.status === 401) {
        setError("Session expired. Please log in again.");
        localStorage.removeItem("token"); // clear token
        navigate("/login"); // redirect to login
      } else {
        setError(err.response?.data?.message || "Failed to fetch clients");
      }
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const [groups, setGroups] = useState([]);
  const [marginModes, setMarginModes] = useState([]);

  useEffect(() => {
    const fetchFilters = async () => {
      try {
        // Run both requests in parallel
        const [groupsRes, marginRes] = await Promise.all([
          apiClient.get("/clients/groups"),
          apiClient.get("/clients/margin_mode"),
        ]);

        setGroups(groupsRes.data);
        setMarginModes(marginRes.data);
      } catch (err) {
        if (err.response?.status === 401) {
          // Token expired or invalid
          setError("Session expired. Please log in again.");
          localStorage.removeItem("token");
          navigate("/login"); // redirect to login
        } else {
          setError(err.response?.data?.message || "Failed to load filters");
        }
      }
    };

    fetchFilters();
  }, [navigate]);

  // Sorting
  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  // Filter logic
  const filteredClients = Array.isArray(clients)
  ? clients.filter((c) => {
      const matchesSearch =
        (c.name?.toLowerCase() || "").includes(search.toLowerCase()) ||
        (c.email?.toLowerCase() || "").includes(search.toLowerCase());

      const matchesGroup = groupFilter ? c.group_name === groupFilter : true;
      const matchesMarginMode = marginmodeFilter ? c.margin_mode === marginmodeFilter : true;

      return matchesSearch && matchesGroup && matchesMarginMode;
    })
  : [];


  // Sorting logic
  const sortedClients = [...filteredClients].sort((a, b) => {
    if (a[orderBy] < b[orderBy]) return order === "asc" ? -1 : 1;
    if (a[orderBy] > b[orderBy]) return order === "asc" ? 1 : -1;
    return 0;
  });

  // ✅ Select All (across all pages)
  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      setSelected(sortedClients.map((c) => c.client_id)); // use client_id consistently
    } else {
      setSelected([]);
    }
  };

  // ✅ Toggle single row
  const handleClick = (id) => {
    const selectedIndex = selected.indexOf(id);
    let newSelected = [];

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, id);
    } else {
      newSelected = newSelected.concat(
        selected.slice(0, selectedIndex),
        selected.slice(selectedIndex + 1)
      );
    }

    setSelected(newSelected);
  };

  // ✅ Helper
  const isSelected = (id) => selected.indexOf(id) !== -1;

  // Status chip
  const getStatusChip = (status) => {
    let color = "default";
    if (status === "Active") color = "success";
    else if (status === "Inactive") color = "error";
    else if (status === "Pending") color = "warning";
    return <Chip label={status} color={color} size="small" />;
  };

  // Modal handlers
  const handleOpenForm = (clients = null) => { 
    setEditingClient(clients); 
    setOpenForm(true); 
  };

  const handleCloseForm = () => { 
    setOpenForm(false); 
    setEditingClient(null); 
  };

  const handleSave = (updatedClient) => { 
    if (editingClient) { 
      // Edit mode: update existing client 
      setClients((prev) => 
        prev.map((c) => (c.id === editingClient.id ? { ...c, ...updatedClient } : c)) 
    ); 
  } else { 
    // Add mode: create new client 
      setClients((prev) => 
        [...prev, { id: Date.now(), ...updatedClient }]); 
    } 
  };

  const [errorAlert, setErrorAlert] = useState({ open: false, message: "" }); // For Error msg notifications
  const [successAlert, setSuccessAlert] = useState({ open: false, message: "" }); // For Success msg notifications

  const handleFetchWalletBalances = () => {
  apiClient.get("/wallet-balances")
    .then((res) => {
      const { results, errors } = res.data;

      setClients((prevClients) =>
        prevClients.map((client) => {
          const updated = results.find((c) => c.client_name === client.name);
          return updated
            ? {
                ...client,
                wallet_balance_inr: updated.wallet_balance_inr,
                wallet_balance_usd: updated.wallet_balance_usd,
              }
            : client;
        })
      );

      if (errors && errors.length > 0) {
        const failedNames = errors.map(e => e.client_name).join(", ");
        setErrorAlert({
          open: true,
          message: `Error fetching wallet balances for: ${failedNames}`
        });
      }
    })
    .catch((err) => {
      setErrorAlert({
        open: true,
        message: "API call failed: " + err.message
      });
    });
};

  const handleProductLists = async () => {
    try {
      await apiClient.get("/product_lists");
      setSuccessAlert({
        open: true,
        message: "Products list updated successfully!"
      });
      setTimeout(() => setSuccessAlert({ open: false, message: "" }), 4000);
    } catch (err) {
      setErrorAlert({
        open: true,
        message: "API call failed: " + err.message
      });
      setTimeout(() => setErrorAlert({ open: false, message: "" }), 4000);
    }
  };


  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar />
      <Box component="main" sx={{ flexGrow: 1 }}>
        {/* Header */}
        <Box
          sx={{
            height: "25vh",
            backgroundColor: "#0e68a475",
            color: "white",
            p: 3,
          }}
        >
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Breadcrumbs aria-label="breadcrumb" sx={{ color: "white" }}>
              <Link underline="hover" color="inherit" href="/">
                Home
              </Link>
              <Typography color="white">Clients</Typography>
            </Breadcrumbs>
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <Avatar sx={{ mr: 1, bgcolor: "secondary.main" }}>M</Avatar>
              <Typography variant="body1">Mohit (Admin)</Typography>
            </Box>
          </Box>

          {/* Action Buttons */}
          <Box sx={{ display: "flex", gap: 2, mt: 3 }}>
            <Button
              variant="contained"
              sx={{ bgcolor: "#003366", color: "white" }}
              onClick={handleOpenForm}
            >
              Add Client
            </Button>
            <ClientForm open={openForm} onClose={handleCloseForm} onSave={handleSave} />
            <Button 
              variant="contained" 
              sx={{ bgcolor: "#006699", color: "white" }} 
              
              onClick={() => { 
                if (selected.length === 0) { alert("Please select at least one client"); return; }
                
                const selectedClients = sortedClients.filter(c => selected.includes(c.client_id) ).map(c => ({ id: c.client_id, name: c.name })); 
                navigate("/place-order", { state: { selectedClients } }); }} 
            > 
              Place Order 
            </Button>

            <Button variant="contained" sx={{ bgcolor: "#0099cc", color: "white" }} onClick={handleFetchWalletBalances}>
              Fetch Wallet Balance
            </Button>
            
            {/* Snackbar Alert */}
            <Snackbar
              open={errorAlert.open}
              autoHideDuration={4000}   // disappears after 4 seconds
              onClose={() => setErrorAlert({ ...errorAlert, open: false })}
              anchorOrigin={{ vertical: "top", horizontal: "center" }}
            >
              <Alert
                onClose={() => setErrorAlert({ ...errorAlert, open: false })}
                severity="error"
                sx={{ width: "100%" }}
              >
                {errorAlert.message}
              </Alert>
            </Snackbar>

            <Button variant="contained" sx={{ bgcolor: "#cc6600", color: "white" }}>
              Fetch Positions
            </Button>

            <Button variant="contained" sx={{ bgcolor: "#7000cccd", color: "white" }} onClick={handleProductLists}>
              Update Product Lists
            </Button>
            
             {/* Success Snackbar */}
            <Snackbar open={successAlert.open} autoHideDuration={4000} onClose={() => setSuccessAlert({ ...successAlert, open: false })}
              anchorOrigin={{ vertical: "top", horizontal: "center" }}
            >
              <Alert onClose={() => setSuccessAlert({ ...successAlert, open: false })}
                severity="success" // green
                sx={{ width: "100%" }}
              >
                {successAlert.message}
              </Alert>
            </Snackbar>

            {/* Error Snackbar */}
            <Snackbar open={errorAlert.open} autoHideDuration={4000} onClose={() => setErrorAlert({ ...errorAlert, open: false })}
              anchorOrigin={{ vertical: "top", horizontal: "center" }}
            >
              <Alert onClose={() => setErrorAlert({ ...errorAlert, open: false })}
                severity="error" // red
                sx={{ width: "100%" }}
              >
                {errorAlert.message}
              </Alert>
            </Snackbar>
          </Box>
        </Box>

        {/* Content area */}
        <Box sx={{ p: 4 }}>
          <Paper>
            {/* Search + Filters */}
            <Box display="flex" gap={2} p={2}>
              <TextField
                label="Search"
                variant="outlined"
                size="small"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                sx={{ width: 250 }}
              />
              <TextField
                label="Group"
                select
                variant="outlined"
                size="small"
                value={groupFilter}
                onChange={(e) => setGroupFilter(e.target.value)}
                sx={{ width: 150 }}
              >
                {groups.map((g) => (
                  <MenuItem key={g.group_id} value={g.group_name}>
                    {g.group_name}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                label="Margin Mode"
                select
                variant="outlined"
                size="small"
                value={marginmodeFilter}
                onChange={(e) => setMarginModeFilter(e.target.value)}
                sx={{ width: 150 }}
              >
                {marginModes.map((m) => (
                  <MenuItem key={m.margin_mode_id} value={m.margin_mode}>
                    {m.margin_mode}
                  </MenuItem>
                ))}
              </TextField>
            </Box>

            {/* Table */}
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell padding="checkbox">
                      <Checkbox
                        indeterminate={selected.length > 0 && selected.length < sortedClients.length}
                        checked={sortedClients.length > 0 && selected.length === sortedClients.length}
                        onChange={handleSelectAllClick}
                      />
                    </TableCell>
                    {["name", "email", "group", "margin mode", "wallet balance", "m2m daily"].map((col) => (
                      <TableCell key={col}>
                        <TableSortLabel
                          active={orderBy === col}
                          direction={orderBy === col ? order : "asc"}
                          onClick={() => handleRequestSort(col)}
                        >
                          {col.charAt(0).toUpperCase() + col.slice(1)}
                        </TableSortLabel>
                      </TableCell>
                    ))}
                    <TableCell align="center">Actions</TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {sortedClients
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((client) => (
                      <TableRow key={client.client_id} selected={isSelected(client.client_id)}>
                        <TableCell padding="checkbox">
                          <Checkbox
                            checked={isSelected(client.client_id)}
                            onChange={() => handleClick(client.client_id)}
                          />
                        </TableCell>
                        <TableCell>
                          <Link
                            to={`/clients/client-details/${client.client_id}`}   // ✅ dynamic path
                            style={{
                              color: "blue",
                              textDecoration: "none",
                              cursor: "pointer",
                            }}
                            onClick={(e) => {
                              e.preventDefault();
                              navigate(`/clients/client-details/${client.client_id}`); // ✅ navigate with client_id
                            }}
                          >
                            {client.name}
                          </Link>
                          </TableCell>
                        <TableCell>{client.email}</TableCell>
                        <TableCell>{client.group_name}</TableCell>
                        <TableCell>{client.margin_mode}</TableCell>
                        <TableCell>{client.wallet_balance}</TableCell>
                        <TableCell>{getStatusChip(client.m2m_daily)}</TableCell>
                        <TableCell align="center">
                          <Button
                            variant="contained"
                            size="small"
                            sx={{ bgcolor: "#003366", color: "white" }}
                            onClick={() => handleOpenForm(clients)}
                          >
                            Edit
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </TableContainer>

            {/* Pagination */}
            <TablePagination
              component="div"
              count={sortedClients.length}
              page={page}
              onPageChange={(e, newPage) => setPage(newPage)}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={(e) => {
                setRowsPerPage(parseInt(e.target.value, 10));
                setPage(0);
              }}
              rowsPerPageOptions={[3, 5, 10]}
            />
          </Paper>
        </Box>
      </Box>
    </Box>
  );
}



export default Clients;