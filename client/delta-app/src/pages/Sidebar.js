import React, { useState } from "react";
import {
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Typography,
  IconButton,
  Box
} from "@mui/material";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import DashboardIcon from "@mui/icons-material/Dashboard";
import PeopleIcon from "@mui/icons-material/People";
import MenuIcon from "@mui/icons-material/Menu";
import { NavLink, useLocation } from "react-router-dom";

const drawerWidth = 240;

const menuItems = [
  { text: "Dashboard", icon: <DashboardIcon />, path: "/dashboard" },
  { text: "Clients", icon: <PeopleIcon />, path: "/clients" }
];

function Sidebar({ children }) {
  const location = useLocation();
  const [open, setOpen] = useState(true);
  const [openSidebar, setOpenSidebar] = useState(true);
  const toggleDrawer = () => setOpen(!open);

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      {/* Sidebar */}
      {/* Sidebar Drawer */}
      <Drawer
        variant="permanent"
        open={openSidebar}
        sx={{
          width: open ? drawerWidth : 60,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: {
            width: open ? drawerWidth : 60,
            transition: "width 0.3s",
            boxSizing: "border-box",
            backgroundColor: "#f5f5f5",
          },
        }}
      >
        <Box sx={{ p: 2, display: "flex", justifyContent: open ? "space-between" : "center" }}>
          {open && <Typography variant="h6" fontWeight="bold">Admin Panel</Typography>}
          <IconButton onClick={() => setOpen(!open)}>
            {open ? <ChevronLeftIcon /> : <MenuIcon />}
          </IconButton>
        </Box>
        <List>
          {menuItems.map((item) => (
            <ListItem
              button
              key={item.text}
              component={NavLink}
              to={item.path}
              style={({ isActive }) => ({
                backgroundColor: isActive ? "#e3f2fd" : "transparent",
                color: isActive ? "#1976d2" : "inherit",
              })}
            >
              <ListItemIcon sx={{ color: "inherit" }}>{item.icon}</ListItemIcon>
              {open && <ListItemText primary={item.text} />}
            </ListItem>
          ))}
        </List>
      </Drawer>
    </Box>
  );
}

export default Sidebar;
