import React from "react";
import {
  Box,
  Breadcrumbs,
  Link,
  Typography,
  Avatar,
  Menu,
  MenuItem,
} from "@mui/material";

export default function Header({ breadcrumbs, user, onLogout }) {
  const [anchorEl, setAnchorEl] = React.useState(null);

  const handleMenuOpen = (event) => setAnchorEl(event.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);

  return (
    <Box
      sx={{
        height: "25vh",
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
        {/* Breadcrumbs */}
        <Breadcrumbs aria-label="breadcrumb" sx={{ color: "white" }}>
          {breadcrumbs.map((crumb, idx) =>
            crumb.href ? (
              <Link
                key={idx}
                underline="hover"
                color="inherit"
                href={crumb.href}
              >
                {crumb.label}
              </Link>
            ) : (
              <Typography key={idx} color="white">
                {crumb.label}
              </Typography>
            )
          )}
        </Breadcrumbs>

        {/* User Section */}
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <Avatar sx={{ mr: 1, bgcolor: "secondary.main" }}>
            {user?.username?.[0]?.toUpperCase() || "U"}
          </Avatar>
          <Typography
            variant="body1"
            sx={{ cursor: "pointer" }}
            onClick={handleMenuOpen}
          >
            {user?.username || "User"}
          </Typography>

          {/* Dropdown Menu */}
          <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
            <MenuItem
              onClick={() => {
                handleMenuClose();
                onLogout();
              }}
            >
              Logout
            </MenuItem>
          </Menu>
        </Box>
      </Box>
    </Box>
  );
}
