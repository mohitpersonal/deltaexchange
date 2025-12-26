import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
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
  TableSortLabel
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import Sidebar from './Sidebar';
import { BASE_URL } from '../config';

// Dummy data for demonstration
const sampleData = [
  { id: 1, name: "Order A", status: "Open", amount: 1200 },
  { id: 2, name: "Order B", status: "Closed", amount: -800 },
  { id: 3, name: "Order C", status: "Pending", amount: 500 },
];

function OrdersPositionTable({ data }) {
  const [page, setPage] = useState(0);
  const [rowsPerPage] = useState(5);
  const [selected, setSelected] = useState([]);
  const [order, setOrder] = useState("asc");
  const [orderBy, setOrderBy] = useState("product_symbol");

  // Sorting
  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  // Sorting logic
  const sortedPositions = [...data].sort((a, b) => {
    if (a[orderBy] < b[orderBy]) return order === "asc" ? -1 : 1;
    if (a[orderBy] > b[orderBy]) return order === "asc" ? 1 : -1;
    return 0;
  });

  // Select all
  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      setSelected(sortedPositions.map((p) => p.product_id));
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

  return (
    <TableContainer component={Paper} sx={{ mb: 2 }}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell padding="checkbox">
              <Checkbox
                indeterminate={selected.length > 0 && selected.length < sortedPositions.length}
                checked={sortedPositions.length > 0 && selected.length === sortedPositions.length}
                onChange={handleSelectAllClick}
              />
            </TableCell>
            {["product_symbol", "entry_price", "size"].map((col) => (
              <TableCell key={col}>
                <TableSortLabel
                  active={orderBy === col}
                  direction={orderBy === col ? order : "asc"}
                  onClick={() => handleRequestSort(col)}
                >
                  {col.replace("_", " ").replace(/\b\w/g, (c) => c.toUpperCase())}
                </TableSortLabel>
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {sortedPositions
            .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
            .map((row) => (
              <TableRow key={row.product_id} selected={isSelected(row.product_id)}>
                <TableCell padding="checkbox">
                  <Checkbox
                    checked={isSelected(row.product_id)}
                    onChange={() => handleClick(row.product_id)}
                  />
                </TableCell>
                <TableCell>{row.product_symbol}</TableCell>
                <TableCell>{row.entry_price}</TableCell>
                <TableCell>{row.size}</TableCell>
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
  const { client_id } = useParams();
  const [value, setValue] = useState(0);
  const navigate = useNavigate();

  const [positions, setPositions] = useState([]);
  const [activeTab, setActiveTab] = useState("positions"); // default tab

  useEffect(() => {
    if (activeTab === "positions") {
      fetch(`${BASE_URL}/positions/${client_id}`)
        .then((res) => res.json())
        .then((data) => {
          setPositions(data.result || []);
        })
        .catch((err) => console.error("Error fetching positions:", err));
    }
  }, [client_id, activeTab]);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  // Dummy UPNL calculation (sum of amounts)
  const totalUPNL = sampleData.reduce((acc, curr) => acc + curr.amount, 0);

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
            <Tab label="Order Position" onClick={() => setActiveTab("positions")} />
            <Tab label="Open Order" />
            <Tab label="Order History" />
          </Tabs>
        </Paper>

        {/* Tab Panels */}
        <TabPanel value={value} index={0}>
          {/* Action Buttons + UPNL */}
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
            <Box sx={{ display: "flex", gap: 2 }}>
              <Button variant="contained" sx={{ bgcolor: "#006699", color: "white" }}>
                Fetch Positions
              </Button>
              <Button variant="contained" sx={{ bgcolor: "#cc6600", color: "white" }}>
                Close All Positions
              </Button>
            </Box>
            <Typography
              variant="h6"
              sx={{
                fontWeight: "bold",
                color: totalUPNL < 0 ? "error.main" : "success.main"
              }}
            >
              Total UPNL: {totalUPNL}
            </Typography>
          </Box>

          <OrdersPositionTable data={positions}/>
          <Typography variant="body1">
            This section shows the client’s current order positions.
          </Typography>
        </TabPanel>

        <TabPanel value={value} index={1}>
          <OrdersPositionTable data={sampleData} />
          <Typography variant="body1">
            This section lists all open orders for the client.
          </Typography>
        </TabPanel>

        <TabPanel value={value} index={2}>
          <OrdersPositionTable data={sampleData} />
          <Typography variant="body1">
            This section displays the client's past order history.
          </Typography>
        </TabPanel>
      </Box>
    </Box>
  );
}

export default ClientDetails;