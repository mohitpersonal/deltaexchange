import React, { useState } from "react";
import {
  Box,
  Tabs,
  Tab,
  Typography,
  Breadcrumbs,
  Link,
  Avatar,
  Button,
  Checkbox,
  Chip,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  TablePagination
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import Sidebar from './Sidebar';

// Dummy data for demonstration
const sampleData = [
  { id: 1, name: "Order A", status: "Open", amount: "$1200" },
  { id: 2, name: "Order B", status: "Closed", amount: "$800" },
  { id: 3, name: "Order C", status: "Pending", amount: "$500" },
];

// Reusable Table Component
function OrdersTable({ data }) {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [selected, setSelected] = useState([]);
  const [order, setOrder] = useState("asc");
  const [orderBy, setOrderBy] = useState("name");
  // Search + filters
  const [search, setSearch] = useState("");
  const navigate = useNavigate();
  // Sorting
  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  // Sorting logic
  const sortedClients = [...sampleData].sort((a, b) => {
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

  return (
    <TableContainer component={Paper} sx={{ mb: 2 }}>
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
            {["Name", "Status", "Amount"].map((col) => (
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
          </TableRow>
        </TableHead>
        <TableBody>
          {sortedClients
            .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
            .map((row) => (
              <TableRow key={row.id} selected={isSelected(row.id)}>
                <TableCell padding="checkbox">
                  <Checkbox
                    checked={isSelected(row.id)}
                    onChange={() => handleClick(row.id)}
                  />
                </TableCell>
                <TableCell>{row.name}</TableCell>
                <TableCell>{getStatusChip(row.status)}</TableCell>
                <TableCell>{row.amount}</TableCell>
              </TableRow>
            ))}
        </TableBody>
      </Table>
    </TableContainer>

  );
}

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

function ClientDetails() {
  const [value, setValue] = useState(0);
  const navigate = useNavigate();

  const handleChange = (event, newValue) => {
    setValue(newValue);
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
              <Link underline="hover" color="inherit" href="/clients">
                Clients
              </Link>
              <Typography color="white">Client Details</Typography>
            </Breadcrumbs>
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <Avatar sx={{ mr: 1, bgcolor: "secondary.main" }}>M</Avatar>
              <Typography variant="body1">Mohit (Admin)</Typography>
            </Box>
          </Box>

          {/* Action Buttons */}
          <Box sx={{ display: "flex", gap: 2, mt: 3 }}>
            <Button variant="contained" sx={{ bgcolor: "#006699", color: "white" }} onClick={() => navigate("/place-order")}>Place Order</Button>
            <Button variant="contained" sx={{ bgcolor: "#0099cc", color: "white" }}>Fetch Wallet Balance</Button>
            <Button variant="contained" sx={{ bgcolor: "#cc6600", color: "white" }}>Fetch Positions</Button>
            {/* <Button variant="contained" sx={{ bgcolor: "#990000", color: "white" }}>Close All Positions</Button> */}
          </Box>
        </Box>

      {/* Tabs */}
      <Paper sx={{ borderBottom: 1, borderColor: "divider" }}>
        <Tabs
          value={value}
          onChange={handleChange}
          aria-label="client details tabs"
          indicatorColor="primary"
          textColor="primary"
        >
          <Tab label="Order Position" />
          <Tab label="Open Order" />
          <Tab label="Order History" />
        </Tabs>
      </Paper>

      {/* Tab Panels */}
      <TabPanel value={value} index={0}>
        <OrdersTable data={sampleData} />
        <Typography variant="body1">
          This section shows the client’s current order positions.
        </Typography>
      </TabPanel>

      <TabPanel value={value} index={1}>
        <OrdersTable data={sampleData} />
        <Typography variant="body1">
          This section lists all open orders for the client.
        </Typography>
      </TabPanel>

      <TabPanel value={value} index={2}>
        <OrdersTable data={sampleData} />
        <Typography variant="body1">
          This section displays the client's past order history.
        </Typography>
      </TabPanel>
    </Box>
  </Box>
  );
}

export default ClientDetails;