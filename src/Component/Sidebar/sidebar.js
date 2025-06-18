import React from "react";
import { useState, useContext } from "react";
import topLogo from "../images/headerimg.png";
import CancelIcon from "@mui/icons-material/Cancel";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import PauseCircleOutlineIcon from "@mui/icons-material/PauseCircleOutline";
import UndoIcon from "@mui/icons-material/Undo";
import BlockIcon from "@mui/icons-material/Block";
import HourglassBottomIcon from "@mui/icons-material/HourglassBottom";
import PendingActionsIcon from "@mui/icons-material/PendingActions";
import ReportProblemIcon from "@mui/icons-material/ReportProblem";
import PendingIcon from "@mui/icons-material/Pending";

import ReportProblemOutlinedIcon from "@mui/icons-material/ReportProblemOutlined";
import {
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  useMediaQuery,
  Box,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import "../../Component/common-css.css";
import { NavLink } from "react-router-dom";
import { ShoppingBag as ProductIcon } from "@mui/icons-material";
import { AuthContext } from "../../context/AuthContext";

const Sidebar = ({ open, toggleSidebar }) => {
  const [openCollapse, setOpenCollapse] = useState(null);
  const isMobile = useMediaQuery("(max-width: 768px)");
  const drawerWidth = 250;
  const { user } = useContext(AuthContext);

  const handleMenuClick = () => {
    if (isMobile) {
      toggleSidebar(false);
    }
  };

  const handleCollapseToggle = (menu) => {
    setOpenCollapse(openCollapse === menu ? null : menu);
  };

  return (
    <Drawer
      className="header_and_sidebar_only_for_index"
      variant={isMobile ? "temporary" : "persistent"}
      open={open}
      sx={{
        width: open ? drawerWidth : 0,
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          width: drawerWidth,
          boxSizing: "border-box",
          position: "fixed",
          left: 0,
          top: "0px",
          height: "100vh",
          transition: "width 0.3s ease-in-out",
        },
      }}
    >
      <Box
        sx={{
          textAlign: "center",
          padding: "20px",
        }}
        className="sidebar_list_item"
      >
        <img
          src={topLogo}
          alt="Logo"
          style={{ width: "150px", height: "auto" }}
        />
      </Box>
      <List>
        {(user?.role === "NetworkAdmin" ||
          user?.role === "NetworkSubAdmin") && (
          <>
            <ListItem
              component={NavLink}
              to="/"
              onClick={handleMenuClick}
              sx={{
                "&.active, &.Mui-selected": {
                  backgroundColor: "red",
                  color: "white",
                  "& .MuiListItemText-root, & .MuiTypography-root": {
                    color: "white",
                  },
                  "& .MuiListItemIcon-root": { color: "white" },
                },
                color: "inherit",
              }}
            >
              <ListItemIcon style={{ minWidth: "40px" }}>
                <ProductIcon />
              </ListItemIcon>
              <ListItemText primary="Review Batch" />
            </ListItem>

            <ListItem
              component={NavLink}
              to="/approval"
              onClick={handleMenuClick}
              sx={{
                "&.active, &.Mui-selected": {
                  backgroundColor: "red",
                  color: "white",
                  "& .MuiListItemText-root, & .MuiTypography-root": {
                    color: "white",
                  },
                  "& .MuiListItemIcon-root": { color: "white" },
                },
                color: "inherit",
              }}
            >
              <ListItemIcon style={{ minWidth: "40px" }}>
                <PendingIcon />
              </ListItemIcon>
              <ListItemText primary="Pending Approval" />
            </ListItem>
            <ListItem
              component={NavLink}
              to="/partialApproval"
              onClick={handleMenuClick}
              sx={{
                "&.active, &.Mui-selected": {
                  backgroundColor: "red",
                  color: "white",
                  "& .MuiListItemText-root, & .MuiTypography-root": {
                    color: "white",
                  },
                  "& .MuiListItemIcon-root": { color: "white" },
                },
                color: "inherit",
              }}
            >
              <ListItemIcon style={{ minWidth: "40px" }}>
                <HourglassBottomIcon />
              </ListItemIcon>
              <ListItemText primary="Partial Approval" />
            </ListItem>
            <ListItem
              component={NavLink}
              to="/sendBackByapproval"
              onClick={handleMenuClick}
              sx={{
                "&.active, &.Mui-selected": {
                  backgroundColor: "red",
                  color: "white",
                  "& .MuiListItemText-root, & .MuiTypography-root": {
                    color: "white",
                  },
                  "& .MuiListItemIcon-root": { color: "white" },
                },
                color: "inherit",
              }}
            >
              <ListItemIcon style={{ minWidth: "40px" }}>
                <UndoIcon />
              </ListItemIcon>
              <ListItemText primary="Back From Approval" />
            </ListItem>
            <ListItem
              component={NavLink}
              to="/reajected-cases"
              onClick={handleMenuClick}
              sx={{
                "&.active, &.Mui-selected": {
                  backgroundColor: "red",
                  color: "white",
                  "& .MuiListItemText-root, & .MuiTypography-root": {
                    color: "white",
                  },
                  "& .MuiListItemIcon-root": { color: "white" },
                },
                color: "inherit",
              }}
            >
              <ListItemIcon style={{ minWidth: "40px" }}>
                <CancelIcon />
              </ListItemIcon>
              <ListItemText primary="Rejected Cases" />
            </ListItem>

            <ListItem
              component={NavLink}
              to="/query-case"
              onClick={handleMenuClick}
              sx={{
                "&.active, &.Mui-selected": {
                  backgroundColor: "red",
                  color: "white",
                  "& .MuiListItemText-root, & .MuiTypography-root": {
                    color: "white",
                  },
                  "& .MuiListItemIcon-root": { color: "white" },
                },
                color: "inherit",
              }}
            >
              <ListItemIcon style={{ minWidth: "40px" }}>
                <HelpOutlineIcon />
              </ListItemIcon>
              <ListItemText primary="Query Cases" />
            </ListItem>

            <ListItem
              component={NavLink}
              to="/hold-case"
              onClick={handleMenuClick}
              sx={{
                "&.active, &.Mui-selected": {
                  backgroundColor: "red",
                  color: "white",
                  "& .MuiListItemText-root, & .MuiTypography-root": {
                    color: "white",
                  },
                  "& .MuiListItemIcon-root": { color: "white" },
                },
                color: "inherit",
              }}
            >
              <ListItemIcon style={{ minWidth: "40px" }}>
                <PauseCircleOutlineIcon />
              </ListItemIcon>
              <ListItemText primary="Hold Cases" />
            </ListItem>

            <ListItem
              component={NavLink}
              to="/concern"
              onClick={handleMenuClick}
              sx={{
                "&.active, &.Mui-selected": {
                  backgroundColor: "red",
                  color: "white",
                  "& .MuiListItemText-root, & .MuiTypography-root": {
                    color: "white",
                  },
                  "& .MuiListItemIcon-root": { color: "white" },
                },
                color: "inherit",
              }}
            >
              <ListItemIcon style={{ minWidth: "40px" }}>
                <ReportProblemIcon />
              </ListItemIcon>
              <ListItemText primary="Concerns" />
            </ListItem>

            <ListItem
              component={NavLink}
              to="/bankReject"
              onClick={handleMenuClick}
              sx={{
                "&.active, &.Mui-selected": {
                  backgroundColor: "red",
                  color: "white",
                  "& .MuiListItemText-root, & .MuiTypography-root": {
                    color: "white",
                  },
                  "& .MuiListItemIcon-root": { color: "white" },
                },
                color: "inherit",
              }}
            >
              <ListItemIcon style={{ minWidth: "40px" }}>
                <BlockIcon />
              </ListItemIcon>
              <ListItemText primary="Bank Reject" />
            </ListItem>

            <ListItem
              component={NavLink}
              to="/networkRejectedCases"
              onClick={handleMenuClick}
              sx={{
                "&.active, &.Mui-selected": {
                  backgroundColor: "red",
                  color: "white",
                  "& .MuiListItemText-root, & .MuiTypography-root": {
                    color: "white",
                  },
                  "& .MuiListItemIcon-root": { color: "white" },
                },
                color: "inherit",
              }}
            >
              <ListItemIcon style={{ minWidth: "40px" }}>
                <CancelIcon />
              </ListItemIcon>
              <ListItemText primary="Network Rejected " />
            </ListItem>
          </>
        )}

        {/* {user?.role === "NetworkAdmin" && (
        )} */}
      </List>
    </Drawer>
  );
};

export default Sidebar;
