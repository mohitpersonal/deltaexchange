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
import apiClient from "../api/axiosConfig";

// Dummy data for demonstration
const sampleData = [
  { id: 1, name: "Order A", status: "Open", amount: 1200 },
  { id: 2, name: "Order B", status: "Closed", amount: -800 },
  { id: 3, name: "Order C", status: "Pending", amount: 500 },
];

function OrdersPositionTable({ data }) {
  const [page, setPage] = useState(0);
  const [rowsPerPage] = useState(10);
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

function OrdersHistoryTable({ data }) {
  const [page, setPage] = useState(0);
  const [rowsPerPage] = useState(10);
  const [order, setOrder] = useState("asc");
  const [orderBy, setOrderBy] = useState("product_symbol");

  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  const sortedOrders = Array.isArray(data)
    ? [...data].sort((a, b) => {
        if (a[orderBy] < b[orderBy]) return order === "asc" ? -1 : 1;
        if (a[orderBy] > b[orderBy]) return order === "asc" ? 1 : -1;
        return 0;
      })
    : [];

  const columns = [
    "product_symbol",
    "side",
    "size",
    "order_type",
    "state",
    "average_fill_price",
    "avg_exit_price",
    "entry_price",
    "limit_price",
    "cashflow",
    "commission",
    "paid_commission",
    "pnl",
    "margin_mode",
    "bracket_order",
    "bracket_stop_loss_limit_price",
    "bracket_stop_loss_price",
    "bracket_take_profit_limit_price",
    "bracket_take_profit_price",
    "cancellation_reason",
    "stop_order_type",
    "stop_trigger_method",
    "stop_price",
    "created_at",
    "updated_at"
  ];

  // helper for state colors
  const getStateColor = (state) => {
    switch (state) {
      case "closed":
        return "blue";
      case "cancelled":
        return "orange";
      case "open":
        return "green";
      default:
        return "inherit";
    }
  };

  return (
    <TableContainer component={Paper} sx={{ mb: 2 }}>
      <Table size="small">
        <TableHead>
          <TableRow>
            {columns.map((col) => (
              <TableCell key={col}>
                <TableSortLabel
                  active={orderBy === col}
                  direction={orderBy === col ? order : "asc"}
                  onClick={() => handleRequestSort(col)}
                >
                  {col.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
                </TableSortLabel>
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {sortedOrders
            .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
            .map((row) => (
              <TableRow key={row.id}>
                {columns.map((col) => {
                  let value = row[col];
                  if (value === null || value === undefined) value = "";

                  // special styling for side
                  if (col === "side") {
                    return (
                      <TableCell key={col}>
                        <Box
                          sx={{
                            display: "inline-block",
                            px: 2,
                            py: 0.5,
                            borderRadius: "16px",
                            bgcolor: value === "buy" ? "green" : "red",
                            color: "white",
                            fontWeight: "bold",
                            textAlign: "center"
                          }}
                        >
                          {value}
                        </Box>
                      </TableCell>
                    );
                  }

                  // special styling for state
                  if (col === "state") {
                    let bg;
                    switch (value) {
                      case "closed":
                        bg = "blue";
                        break;
                      case "cancelled":
                        bg = "orange";
                        break;
                      case "open":
                        bg = "green";
                        break;
                      default:
                        bg = "grey";
                    }
                    return (
                      <TableCell key={col}>
                        <Box
                          sx={{
                            display: "inline-block",
                            px: 2,
                            py: 0.5,
                            borderRadius: "16px",
                            bgcolor: bg,
                            color: "white",
                            fontWeight: "bold",
                            textAlign: "center"
                          }}
                        >
                          {value}
                        </Box>
                      </TableCell>
                    );
                  }

                  // format dates
                  if (col === "created_at" || col === "updated_at") {
                    return (
                      <TableCell key={col}>
                        {value ? new Date(value).toLocaleString() : ""}
                      </TableCell>
                    );
                  }

                  return <TableCell key={col}>{value.toString()}</TableCell>;
                })}
              </TableRow>
            ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}


function OpenOrdersTable({ data }) {
  const [page, setPage] = useState(0);
  const [rowsPerPage] = useState(10);
  const [order, setOrder] = useState("asc");
  const [orderBy, setOrderBy] = useState("product_symbol");
  const [selected, setSelected] = useState([]);

  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

    // Row select
  const handleClick = (id) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  const isSelected = (id) => selected.includes(id);

  const sortedOrders = Array.isArray(data)
    ? [...data].sort((a, b) => {
        if (a[orderBy] < b[orderBy]) return order === "asc" ? -1 : 1;
        if (a[orderBy] > b[orderBy]) return order === "asc" ? 1 : -1;
        return 0;
      })
    : [];
  
        // Select all
  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      setSelected(sortedOrders.map((p) => p.id));
    } else {
      setSelected([]);
    }
  };

  const columns = [
    "product_symbol",
    "side",
    "size",
    "order_type",
    "state",
    "average_fill_price",
    "avg_exit_price",
    "entry_price",
    "limit_price",
    "cashflow",
    "commission",
    "paid_commission",
    "pnl",
    "margin_mode",
    "bracket_order",
    "bracket_stop_loss_limit_price",
    "bracket_stop_loss_price",
    "bracket_take_profit_limit_price",
    "bracket_take_profit_price",
    "cancellation_reason",
    "stop_order_type",
    "stop_trigger_method",
    "stop_price",
    "created_at",
    "updated_at"
  ];

  // helper for state colors
  const getStateColor = (state) => {
    switch (state) {
      case "closed":
        return "blue";
      case "cancelled":
        return "orange";
      case "open":
        return "green";
      default:
        return "inherit";
    }
  };

  return (
    <TableContainer component={Paper} sx={{ mb: 2 }}>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell padding="checkbox">
              <Checkbox
                indeterminate={selected.length > 0 && selected.length < sortedOrders.length}
                checked={sortedOrders.length > 0 && selected.length === sortedOrders.length}
                onChange={handleSelectAllClick}
              />
            </TableCell>
            {columns.map((col) => (
              <TableCell key={col}>
                <TableSortLabel
                  active={orderBy === col}
                  direction={orderBy === col ? order : "asc"}
                  onClick={() => handleRequestSort(col)}
                >
                  {col.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
                </TableSortLabel>
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {sortedOrders
            .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
            .map((row) => (
              <TableRow key={row.id}>
                <TableCell padding="checkbox">
                  <Checkbox
                    checked={isSelected(row.id)}
                    onChange={() => handleClick(row.id)}
                  />
                </TableCell>
                {columns.map((col) => {
                  let value = row[col];
                  if (value === null || value === undefined) value = "";

                  // special styling for side
                  if (col === "side") {
                    return (
                      <TableCell key={col}>
                        <Box
                          sx={{
                            display: "inline-block",
                            px: 2,
                            py: 0.5,
                            borderRadius: "16px",
                            bgcolor: value === "buy" ? "green" : "red",
                            color: "white",
                            fontWeight: "bold",
                            textAlign: "center"
                          }}
                        >
                          {value}
                        </Box>
                      </TableCell>
                    );
                  }

                  // special styling for state
                  if (col === "state") {
                    let bg;
                    switch (value) {
                      case "closed":
                        bg = "blue";
                        break;
                      case "cancelled":
                        bg = "orange";
                        break;
                      case "open":
                        bg = "green";
                        break;
                      default:
                        bg = "grey";
                    }
                    return (
                      <TableCell key={col}>
                        <Box
                          sx={{
                            display: "inline-block",
                            px: 2,
                            py: 0.5,
                            borderRadius: "16px",
                            bgcolor: bg,
                            color: "white",
                            fontWeight: "bold",
                            textAlign: "center"
                          }}
                        >
                          {value}
                        </Box>
                      </TableCell>
                    );
                  }

                  // format dates
                  if (col === "created_at" || col === "updated_at") {
                    return (
                      <TableCell key={col}>
                        {value ? new Date(value).toLocaleString() : ""}
                      </TableCell>
                    );
                  }

                  return <TableCell key={col}>{value.toString()}</TableCell>;
                })}
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
    // Dummy UPNL calculation (sum of amounts)
  const totalUPNL = sampleData.reduce((acc, curr) => acc + curr.amount, 0);

  const [tabIndex, setTabIndex] = useState(0);
  const [ordersHistory, setOrdersHistory] = useState([]);
  const [openOrders, setOpenOrders] = useState([]);

  const handleTabChange = (event, newValue) => {
    setTabIndex(newValue);
  };

  useEffect(() => {
    if (tabIndex === 0) {
      apiClient.get(`/positions/${client_id}`)
        .then((res) => {
          setPositions(res.data.result || []);
        })
        .catch((err) => console.error("Error fetching positions:", err));
    }
  }, [client_id, tabIndex]);

  useEffect(() => {
    if (tabIndex === 1) {
      apiClient.get(`/open-orders/${client_id}`)
        .then((res) => {
          setOpenOrders(res.data.orders || []);
        })
        .catch((err) => console.error("Error fetching open orders:", err));
    }
  }, [client_id, tabIndex]);

  useEffect(() => {
    if (tabIndex === 2) {
      apiClient.get(`/order-history/${client_id}`)
        .then((res) => {
          setOrdersHistory(res.data.orders || []);
        })
        .catch((err) => console.error("Error fetching order history:", err));
    }
  }, [client_id, tabIndex]);

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
           <Tabs value={tabIndex} onChange={(event, newValue) => setTabIndex(newValue)}
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
        <TabPanel value={tabIndex} index={0}>
          {/* Action Buttons + UPNL */}
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
            <Box sx={{ display: "flex", gap: 2 }}>
              {/* <Button variant="contained" sx={{ bgcolor: "#006699", color: "white" }}>
                Fetch Positions
              </Button> */}
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

        <TabPanel value={tabIndex} index={1}>
          {/* Action Buttons + UPNL */}
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
            <Box sx={{ display: "flex", gap: 2 }}>
              {/* <Button variant="contained" sx={{ bgcolor: "#006699", color: "white" }}>
                Fetch Positions
              </Button> */}
              <Button variant="contained" sx={{ bgcolor: "#cc6600", color: "white" }}>
                Close Orders
              </Button>
            </Box>
          </Box>
          <OpenOrdersTable data={openOrders} />
          <Typography variant="body1">
            This section lists all open orders for the client.
          </Typography>
        </TabPanel>

        <TabPanel value={tabIndex} index={2}>
          <OrdersHistoryTable data={ordersHistory} />
          <Typography variant="body1">
            This section displays the client's past order history.
          </Typography>
        </TabPanel>
      </Box>
    </Box>
  );
}

export default ClientDetails;