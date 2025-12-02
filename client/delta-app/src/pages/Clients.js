import React, { useState } from "react";
import {
  Box,
  Typography,
  Breadcrumbs,
  Link,
  Avatar,
  Paper,
  Button,
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
  Dialog, DialogTitle, DialogContent, DialogActions
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import Sidebar from './Sidebar';
import { useNavigate } from "react-router-dom";

const drawerWidth = 240;

const initialClients = [
  { name: "Alice Johnson", email: "alice@example.com", group_name: "Active", margin_mode: "isolated", wallet_balance: "1212121", m2m_daily: "23432" },
  { name: "Bob Smith", email: "bob@example.com", group_name: "Inactive", margin_mode: "isolated", wallet_balance: "3432342", m2m_daily: "12311" },
  { name: "Charlie Lee", email: "charlie@example.com", group_name: "Active", margin_mode: "profile", wallet_balance: "12312312", m2m_daily: "12322" },
];

function Clients() {
  // const [openSidebar, setOpenSidebar] = useState(true);
  const [open, setOpen] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [selected, setSelected] = useState([]);
  const [order, setOrder] = useState("asc");
  const [orderBy, setOrderBy] = useState("name");
  // Search + filters
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [roleFilter, setRoleFilter] = useState("");

  const navigate = useNavigate();
  const [newClient, setNewClient] = useState({
    name: "",
    number: "",
    email: "",
    group: "",
    margin: "",
    apiKey: "",
  });
  // Sorting
  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  // Filter logicfilteredClients
  const filteredClients = initialClients.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter ? c.status === statusFilter : true;
    const matchesRole = roleFilter ? c.role === roleFilter : true;
    return matchesSearch && matchesStatus && matchesRole;
  });

  // Sorting logic
  const sortedClients = [...filteredClients].sort((a, b) => {
    if (a[orderBy] < b[orderBy]) return order === "asc" ? -1 : 1;
    if (a[orderBy] > b[orderBy]) return order === "asc" ? 1 : -1;
    return 0;
  });

  // Select all
  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      setSelected(sortedClients.map((c) => c.id));
    } else {
      setSelected([]);
    }
  };

  // Row select
  const handleClick = (id) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  const isSelected = (id) => selected.includes(id);

  // Status chip
  const getStatusChip = (status) => {
    let color = "default";
    if (status === "Active") color = "success";
    else if (status === "Inactive") color = "error";
    else if (status === "Pending") color = "warning";
    return <Chip label={status} color={color} size="small" />;
  };

  // Modal handlers
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewClient((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    console.log("New Client:", newClient);
    // Here you can push to clientsData or call API
    handleClose();
  };

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar />
      {/* Main Content */}
      <Box component="main" sx={{ flexGrow: 1 }}>
        {/* Light blue header */}
        <Box
          sx={{
            height: "25vh",
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
              <Typography color="white">Clients</Typography>
            </Breadcrumbs>
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <Avatar sx={{ mr: 1, bgcolor: "secondary.main" }}>M</Avatar>
              <Typography variant="body1">Mohit (Admin)</Typography>
            </Box>
          </Box>

          {/* Action Buttons */}
          <Box sx={{ display: "flex", gap: 2, mt: 3 }}>
            <Button variant="contained" sx={{ bgcolor: "#003366", color: "white" }} onClick={handleOpen} >Add Client</Button>
            <Button variant="contained" sx={{ bgcolor: "#006699", color: "white" }} onClick={() => navigate("/place-order")}>Place Order</Button>
            <Button variant="contained" sx={{ bgcolor: "#0099cc", color: "white" }}>Fetch Wallet Balance</Button>
            <Button variant="contained" sx={{ bgcolor: "#cc6600", color: "white" }}>Fetch Positions</Button>
            {/* <Button variant="contained" sx={{ bgcolor: "#990000", color: "white" }}>Close All Positions</Button> */}
          </Box>
        </Box>

        {/* Content area */}
        <Box sx={{ p: 4 }}>
          {/* Table */}
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
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                sx={{ width: 150 }}
              >
                <MenuItem value="Active">Active</MenuItem>
                <MenuItem value="Inactive">Inactive</MenuItem>
                <MenuItem value="Pending">Pending</MenuItem>
              </TextField>
              <TextField
                label="Margin Mode"
                select
                variant="outlined"
                size="small"
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                sx={{ width: 150 }}
              >
                <MenuItem value="1">Isolated</MenuItem>
                <MenuItem value="2">Profile</MenuItem>
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
                    {[ "name", "email", "group", "margin mode", "wallet balance", "m2m daily"].map((col) => (
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
                      <TableRow key={client.id} selected={isSelected(client.id)}>
                        <TableCell padding="checkbox">
                          <Checkbox
                            checked={isSelected(client.id)}
                            onChange={() => handleClick(client.id)}
                          />
                        </TableCell>
                        <TableCell>
                          <Link
                            to="/client-details"
                            style={{
                              color: "blue",
                              textDecoration: "none",
                              cursor: "pointer",
                            }}
                            onClick={(e) => {
                              e.preventDefault(); // prevent default navigation
                              navigate("/client-details");
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
                            onClick={handleOpen}
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


            {/* Modal Dialog */}
            <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
              <DialogTitle>Add New Client</DialogTitle>
              <DialogContent dividers>
                <Box display="flex" flexDirection="column" gap={2}>
                  <TextField
                    label="Name"
                    name="name"
                    value={newClient.name}
                    onChange={handleChange}
                    fullWidth
                  />
                  <TextField
                    label="No."
                    name="number"
                    type="number"
                    value={newClient.number}
                    onChange={handleChange}
                    fullWidth
                  />
                  <TextField
                    label="Email ID"
                    name="email"
                    type="email"
                    value={newClient.email}
                    onChange={handleChange}
                    fullWidth
                  />
                  <TextField
                    label="Group Name"
                    name="group"
                    select
                    value={newClient.group}
                    onChange={handleChange}
                    fullWidth
                  >
                    <MenuItem value="Admin">Admin</MenuItem>
                    <MenuItem value="User">User</MenuItem>
                    <MenuItem value="Manager">Manager</MenuItem>
                  </TextField>
                  <TextField
                    label="Margin"
                    name="margin"
                    select
                    value={newClient.margin}
                    onChange={handleChange}
                    fullWidth
                  >
                    <MenuItem value="Low">Low</MenuItem>
                    <MenuItem value="Medium">Medium</MenuItem>
                    <MenuItem value="High">High</MenuItem>
                  </TextField>
                  <TextField
                    label="API Key"
                    name="apiKey"
                    value={newClient.apiKey}
                    onChange={handleChange}
                    fullWidth
                  />
                </Box>
              </DialogContent>
              <DialogActions>
                <Button onClick={handleClose}>Cancel</Button>
                <Button variant="contained" color="primary" onClick={handleSave}>
                  Save
                </Button>
              </DialogActions>
            </Dialog>
          </Paper>
        </Box>

      </Box>
    </Box>
  );
}

export default Clients;