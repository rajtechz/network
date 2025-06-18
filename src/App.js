import React, { useState, useContext } from "react";
import {
  CssBaseline,
  Box,
  useMediaQuery,
  CircularProgress,
  Typography,
} from "@mui/material";
import { Routes, Route, Navigate } from "react-router-dom";
import Header from "./Component/Header/header";
import Sidebar from "./Component/Sidebar/sidebar";
import Review_batches from "./Component/Review batches/review_batches";
import Approval from "./Component/Approval/approval";
import Vendor_name from "./Component/Vandor Name/vendor_name";
import InvoiceTemplate from "./Component/InvoiceTemplate/Invoice_template";

import HoldCase from "./Component/Hold Cases/HoldCases";
import Concern from "./Component/Concern/concern";
import BankReject from "./Component/BankReject/BankReject";
import Login from "./Component/Login/Login";
import Unauthorized from "./Component/Unauthorized";
import ProtectedRoute from "./Component/ProtectedRoute";
import "../node_modules/bootstrap/dist/css/bootstrap.min.css";
import { ToastContainer } from "react-toastify";
import { AuthContext } from "./context/AuthContext";
import EditData from "./Component/Review batches/EditData";
import PartialApproval from "./Component/PartialApproval/PartialApproval";
import VendorBatchPage from "./Component/Vandor Name/VendorBatchPage";
import ReviewBatchPage from "./Component/Review batches/ReviewBatchPage";
import ApprovalBatchPage from "./Component/Approval/ApprovalBatchPage";
import GetNetworkReject from "./Component/getnetworkReject/GetNetworkReject";
import SendBackByApproval from "./Component/SendBackByApproval/SendBackByApproval";
import PartialDetailPage from "./Component/PartialApproval/PartialDetailPage";
import SendbackDetailPage from "./Component/SendBackByApproval/SendBackDetailPage";
import RejectedCasePage from "./Component/ReajectedCases/RejectedCasePage";
import Reajectedcases from "./Component/ReajectedCases/Reajectedcases";
import QueryCases from "./Component/Query case/QueryCases";
import QueryCasePage from "./Component/Query case/QuaryCasePage";
import HoldCasesPage from "./Component/Hold Cases/HoldCasesPage";
import NetworkRejectPage from "./Component/getnetworkReject/NetworkRejectPage";

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const isMobile = useMediaQuery("(max-width: 768px)");
  const { loading, user } = useContext(AuthContext); // Access loading state

  const toggleSidebar = () => {
    setSidebarOpen((prev) => !prev);
  };

  // Render a loading indicator while checking localStorage
  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>Loading...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      <CssBaseline />
      <ToastContainer position="top-right" autoClose={3000} />
      <Routes>
        {/* Public Route */}
        <Route path="/login" element={<Login />} />
        <Route path="/unauthorized" element={<Unauthorized />} />

        {/* Protected Routes */}
        <Route
          path="/"
          element={
            <ProtectedRoute
              element={
                <>
                  <Header open={sidebarOpen} toggleSidebar={toggleSidebar} />
                  <Sidebar open={sidebarOpen} toggleSidebar={toggleSidebar} />
                  <Box
                    component="main"
                    sx={{
                      flexGrow: 1,
                      marginLeft: sidebarOpen && !isMobile ? "0px" : 0,
                      width: "100%",
                      marginTop: "64px",
                      overflowX: "scroll",
                      transition: "margin 0.3s ease-in-out",
                    }}
                  >
                    <Review_batches />
                  </Box>
                </>
              }
              allowedRoles={["NetworkSubAdmin", "NetworkAdmin"]} // Allow both roles
            />
          }
        />
        <Route
          path="/ReviewBatchPage"
          element={
            <ProtectedRoute
              element={
                <>
                  <Header open={sidebarOpen} toggleSidebar={toggleSidebar} />
                  <Sidebar open={sidebarOpen} toggleSidebar={toggleSidebar} />
                  <Box
                    component="main"
                    sx={{
                      flexGrow: 1,
                      marginLeft: sidebarOpen && !isMobile ? "0px" : 0,
                      width: "100%",
                      marginTop: "64px",
                      overflowX: "scroll",
                      transition: "margin 0.3s ease-in-out",
                    }}
                  >
                    <ReviewBatchPage />
                  </Box>
                </>
              }
              allowedRoles={["NetworkSubAdmin", "NetworkAdmin"]} // Allow both roles
            />
          }
        />
        <Route
          path="/approval"
          element={
            <ProtectedRoute
              element={
                <>
                  <Header open={sidebarOpen} toggleSidebar={toggleSidebar} />
                  <Sidebar open={sidebarOpen} toggleSidebar={toggleSidebar} />
                  <Box
                    component="main"
                    sx={{
                      flexGrow: 1,
                      marginLeft: sidebarOpen && !isMobile ? "0px" : 0,
                      width: "100%",
                      marginTop: "64px",
                      transition: "margin 0.3s ease-in-out",
                    }}
                  >
                    <Approval />
                  </Box>
                </>
              }
              allowedRoles={["NetworkSubAdmin", "NetworkAdmin"]}
            />
          }
        />
        <Route
          path="/approvalBatchPage"
          element={
            <ProtectedRoute
              element={
                <>
                  <Header open={sidebarOpen} toggleSidebar={toggleSidebar} />
                  <Sidebar open={sidebarOpen} toggleSidebar={toggleSidebar} />
                  <Box
                    component="main"
                    sx={{
                      flexGrow: 1,
                      marginLeft: sidebarOpen && !isMobile ? "0px" : 0,
                      width: "100%",
                      marginTop: "64px",
                      transition: "margin 0.3s ease-in-out",
                    }}
                  >
                    <ApprovalBatchPage />
                  </Box>
                </>
              }
              allowedRoles={["NetworkAdmin"]}
            />
          }
        />
        <Route
          path="/vendor-name"
          element={
            <ProtectedRoute
              element={
                <>
                  <Header open={sidebarOpen} toggleSidebar={toggleSidebar} />
                  <Sidebar open={sidebarOpen} toggleSidebar={toggleSidebar} />
                  <Box
                    component="main"
                    sx={{
                      flexGrow: 1,
                      marginLeft: sidebarOpen && !isMobile ? "0px" : 0,
                      width: "100%",
                      marginTop: "64px",
                      transition: "margin 0.3s ease-in-out",
                    }}
                  >
                    <Vendor_name />
                  </Box>
                </>
              }
              allowedRoles={["NetworkSubAdmin", "NetworkAdmin"]} // Restrict to NetworkAdmin
            />
          }
        />
        <Route
          path="/vendorBatchPage"
          element={
            <ProtectedRoute
              element={
                <>
                  <Header open={sidebarOpen} toggleSidebar={toggleSidebar} />
                  <Sidebar open={sidebarOpen} toggleSidebar={toggleSidebar} />
                  <Box
                    component="main"
                    sx={{
                      flexGrow: 1,
                      marginLeft: sidebarOpen && !isMobile ? "0px" : 0,
                      width: "100%",
                      marginTop: "64px",
                      transition: "margin 0.3s ease-in-out",
                    }}
                  >
                    <VendorBatchPage />
                  </Box>
                </>
              }
              allowedRoles={["NetworkSubAdmin", "NetworkAdmin"]}
            />
          }
        />
        <Route
          path="/invoice-template"
          element={
            <ProtectedRoute
              element={
                <>
                  <Header open={sidebarOpen} toggleSidebar={toggleSidebar} />
                  <Sidebar open={sidebarOpen} toggleSidebar={toggleSidebar} />
                  <Box
                    component="main"
                    sx={{
                      flexGrow: 1,
                      marginLeft: sidebarOpen && !isMobile ? "0px" : 0,
                      width: "100%",
                      marginTop: "64px",
                      transition: "margin 0.3s ease-in-out",
                    }}
                  >
                    <InvoiceTemplate />
                  </Box>
                </>
              }
              allowedRoles={["NetworkSubAdmin", "NetworkAdmin"]}
            />
          }
        />
        <Route
          path="/Edit-data"
          element={
            <ProtectedRoute
              element={
                <>
                  <Header open={sidebarOpen} toggleSidebar={toggleSidebar} />
                  <Sidebar open={sidebarOpen} toggleSidebar={toggleSidebar} />
                  <Box
                    component="main"
                    sx={{
                      flexGrow: 1,
                      marginLeft: sidebarOpen && !isMobile ? "0px" : 0,
                      width: "100%",
                      marginTop: "64px",
                      transition: "margin 0.3s ease-in-out",
                    }}
                  >
                    <EditData />
                  </Box>
                </>
              }
              allowedRoles={["NetworkSubAdmin", "NetworkAdmin"]}
            />
          }
        />
        <Route
          path="/reajected-cases"
          element={
            <ProtectedRoute
              element={
                <>
                  <Header open={sidebarOpen} toggleSidebar={toggleSidebar} />
                  <Sidebar open={sidebarOpen} toggleSidebar={toggleSidebar} />
                  <Box
                    component="main"
                    sx={{
                      flexGrow: 1,
                      marginLeft: sidebarOpen && !isMobile ? "0px" : 0,
                      width: "100%",
                      marginTop: "64px",
                      transition: "margin 0.3s ease-in-out",
                    }}
                  >
                    <Reajectedcases />
                  </Box>
                </>
              }
              allowedRoles={["NetworkSubAdmin", "NetworkAdmin"]}
            />
          }
        />
        <Route
          path="/reajectedcasesPage"
          element={
            <ProtectedRoute
              element={
                <>
                  <Header open={sidebarOpen} toggleSidebar={toggleSidebar} />
                  <Sidebar open={sidebarOpen} toggleSidebar={toggleSidebar} />
                  <Box
                    component="main"
                    sx={{
                      flexGrow: 1,
                      marginLeft: sidebarOpen && !isMobile ? "0px" : 0,
                      width: "100%",
                      marginTop: "64px",
                      transition: "margin 0.3s ease-in-out",
                    }}
                  >
                    <RejectedCasePage />
                  </Box>
                </>
              }
              allowedRoles={["NetworkSubAdmin", "NetworkAdmin"]}
            />
          }
        />
        <Route
          path="/query-case"
          element={
            <ProtectedRoute
              element={
                <>
                  <Header open={sidebarOpen} toggleSidebar={toggleSidebar} />
                  <Sidebar open={sidebarOpen} toggleSidebar={toggleSidebar} />
                  <Box
                    component="main"
                    sx={{
                      flexGrow: 1,
                      marginLeft: sidebarOpen && !isMobile ? "0px" : 0,
                      width: "100%",
                      marginTop: "64px",
                      transition: "margin 0.3s ease-in-out",
                    }}
                  >
                    <QueryCases/>
                  </Box>
                </>
              }
              allowedRoles={["NetworkSubAdmin", "NetworkAdmin"]}
            />
          }
        />
        <Route
          path="/queryCasesPage"
          element={
            <ProtectedRoute
              element={
                <>
                  <Header open={sidebarOpen} toggleSidebar={toggleSidebar} />
                  <Sidebar open={sidebarOpen} toggleSidebar={toggleSidebar} />
                  <Box
                    component="main"
                    sx={{
                      flexGrow: 1,
                      marginLeft: sidebarOpen && !isMobile ? "0px" : 0,
                      width: "100%",
                      marginTop: "64px",
                      transition: "margin 0.3s ease-in-out",
                    }}
                  >
                    <QueryCasePage/>
                  </Box>
                </>
              }
              allowedRoles={["NetworkSubAdmin", "NetworkAdmin"]}
            />
          }
        />
        <Route
          path="/hold-case"
          element={
            <ProtectedRoute
              element={
                <>
                  <Header open={sidebarOpen} toggleSidebar={toggleSidebar} />
                  <Sidebar open={sidebarOpen} toggleSidebar={toggleSidebar} />
                  <Box
                    component="main"
                    sx={{
                      flexGrow: 1,
                      marginLeft: sidebarOpen && !isMobile ? "0px" : 0,
                      width: "100%",
                      marginTop: "64px",
                      transition: "margin 0.3s ease-in-out",
                    }}
                  >
                    <HoldCase />
                  </Box>
                </>
              }
              allowedRoles={["NetworkSubAdmin", "NetworkAdmin"]}
            />
          }
        />
        <Route
          path="/holdCasesPage"
          element={
            <ProtectedRoute
              element={
                <>
                  <Header open={sidebarOpen} toggleSidebar={toggleSidebar} />
                  <Sidebar open={sidebarOpen} toggleSidebar={toggleSidebar} />
                  <Box
                    component="main"
                    sx={{
                      flexGrow: 1,
                      marginLeft: sidebarOpen && !isMobile ? "0px" : 0,
                      width: "100%",
                      marginTop: "64px",
                      transition: "margin 0.3s ease-in-out",
                    }}
                  >
                    <HoldCasesPage />
                  </Box>
                </>
              }
              allowedRoles={["NetworkSubAdmin", "NetworkAdmin"]}
            />
          }
        />
        <Route
          path="/concern"
          element={
            <ProtectedRoute
              element={
                <>
                  <Header open={sidebarOpen} toggleSidebar={toggleSidebar} />
                  <Sidebar open={sidebarOpen} toggleSidebar={toggleSidebar} />
                  <Box
                    component="main"
                    sx={{
                      flexGrow: 1,
                      marginLeft: sidebarOpen && !isMobile ? "0px" : 0,
                      width: "100%",
                      marginTop: "64px",
                      transition: "margin 0.3s ease-in-out",
                    }}
                  >
                    <Concern />
                  </Box>
                </>
              }
              allowedRoles={["NetworkSubAdmin", "NetworkAdmin"]}
            />
          }
        />
        <Route
          path="/bankReject"
          element={
            <ProtectedRoute
              element={
                <>
                  <Header open={sidebarOpen} toggleSidebar={toggleSidebar} />
                  <Sidebar open={sidebarOpen} toggleSidebar={toggleSidebar} />
                  <Box
                    component="main"
                    sx={{
                      flexGrow: 1,
                      marginLeft: sidebarOpen && !isMobile ? "0px" : 0,
                      width: "100%",
                      marginTop: "64px",
                      transition: "margin 0.3s ease-in-out",
                    }}
                  >
                    <BankReject />
                  </Box>
                </>
              }
              allowedRoles={["NetworkSubAdmin", "NetworkAdmin"]}
            />
          }
        />
        <Route
          path="/partialApproval"
          element={
            <ProtectedRoute
              element={
                <>
                  <Header open={sidebarOpen} toggleSidebar={toggleSidebar} />
                  <Sidebar open={sidebarOpen} toggleSidebar={toggleSidebar} />
                  <Box
                    component="main"
                    sx={{
                      flexGrow: 1,
                      marginLeft: sidebarOpen && !isMobile ? "0px" : 0,
                      width: "100%",
                      marginTop: "64px",
                      transition: "margin 0.3s ease-in-out",
                    }}
                  >
                    <PartialApproval />
                  </Box>
                </>
              }
              allowedRoles={["NetworkSubAdmin", "NetworkAdmin"]}
            />
          }
        />
        <Route
          path="/partialDetailPage"
          element={
            <ProtectedRoute
              element={
                <>
                  <Header open={sidebarOpen} toggleSidebar={toggleSidebar} />
                  <Sidebar open={sidebarOpen} toggleSidebar={toggleSidebar} />
                  <Box
                    component="main"
                    sx={{
                      flexGrow: 1,
                      marginLeft: sidebarOpen && !isMobile ? "0px" : 0,
                      width: "100%",
                      marginTop: "64px",
                      transition: "margin 0.3s ease-in-out",
                    }}
                  >
                    <PartialDetailPage />
                  </Box>
                </>
              }
              allowedRoles={["NetworkSubAdmin", "NetworkAdmin"]}
            />
          }
        />
        <Route
          path="/sendBackByapproval"
          element={
            <ProtectedRoute
              element={
                <>
                  <Header open={sidebarOpen} toggleSidebar={toggleSidebar} />
                  <Sidebar open={sidebarOpen} toggleSidebar={toggleSidebar} />
                  <Box
                    component="main"
                    sx={{
                      flexGrow: 1,
                      marginLeft: sidebarOpen && !isMobile ? "0px" : 0,
                      width: "100%",
                      marginTop: "64px",
                      transition: "margin 0.3s ease-in-out",
                    }}
                  >
                    <SendBackByApproval />
                  </Box>
                </>
              }
              allowedRoles={["NetworkSubAdmin", "NetworkAdmin"]}
            />
          }
        />
        <Route
          path="/sendBackdetailPage"
          element={
            <ProtectedRoute
              element={
                <>
                  <Header open={sidebarOpen} toggleSidebar={toggleSidebar} />
                  <Sidebar open={sidebarOpen} toggleSidebar={toggleSidebar} />
                  <Box
                    component="main"
                    sx={{
                      flexGrow: 1,
                      marginLeft: sidebarOpen && !isMobile ? "0px" : 0,
                      width: "100%",
                      marginTop: "64px",
                      transition: "margin 0.3s ease-in-out",
                    }}
                  >
                    <SendbackDetailPage />
                  </Box>
                </>
              }
              allowedRoles={["NetworkSubAdmin", "NetworkAdmin"]}
            />
          }
        />
        <Route
          path="/networkRejectedCases"
          element={
            <ProtectedRoute
              element={
                <>
                  <Header open={sidebarOpen} toggleSidebar={toggleSidebar} />
                  <Sidebar open={sidebarOpen} toggleSidebar={toggleSidebar} />
                  <Box
                    component="main"
                    sx={{
                      flexGrow: 1,
                      marginLeft: sidebarOpen && !isMobile ? "0px" : 0,
                      width: "100%",
                      marginTop: "64px",
                      transition: "margin 0.3s ease-in-out",
                    }}
                  >
                    <GetNetworkReject />
                  </Box>
                </>
              }
              allowedRoles={["NetworkSubAdmin", "NetworkAdmin"]}
            />
          }
        />
        <Route
          path="/networkRejectPage"
          element={
            <ProtectedRoute
              element={
                <>
                  <Header open={sidebarOpen} toggleSidebar={toggleSidebar} />
                  <Sidebar open={sidebarOpen} toggleSidebar={toggleSidebar} />
                  <Box
                    component="main"
                    sx={{
                      flexGrow: 1,
                      marginLeft: sidebarOpen && !isMobile ? "0px" : 0,
                      width: "100%",
                      marginTop: "64px",
                      transition: "margin 0.3s ease-in-out",
                    }}
                  >
                    <NetworkRejectPage />
                  </Box>
                </>
              }
              allowedRoles={["NetworkSubAdmin", "NetworkAdmin"]}
            />
          }
        />

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Box>
  );
}

export default App;
