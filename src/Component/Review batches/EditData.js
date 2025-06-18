

import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  TextField,
  FormControl,
  Grid,
  Typography,
  Button,
  Container,
  Box,
  InputAdornment,
} from "@mui/material";
import { Lock } from "@mui/icons-material";

const EditData = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { invoice, remarks } = location.state || {};
  const [invoiceData, setInvoiceData] = useState({
    aA_Number: "",
    batchNo: "",
    brand: "",
    closureDate: "",
    creationDate: "",
    customerName: "",
    imeiNumber: "",
    invoiceStatus: "",
    isChecked: false,
    makeModel: "",
    repairCharges: "",
    serviceCharges: "",
    sellingPartner: "",
    serviceType: "",
    total: "",
    remarks: "",
  });
  const [uploadedFile, setUploadedFile] = useState(null);

  useEffect(() => {
    if (invoice) {
      setInvoiceData({
        aA_Number: invoice.aA_Number || "",
        batchNo: invoice.batchNo || "",
        brand: invoice.brand || "",
        closureDate: invoice.closureDate || "",
        creationDate: invoice.creationDate || "",
        customerName: invoice.customerName || "",
        imeiNumber: invoice.imeiNumber || "",
        invoiceStatus: invoice.invoiceStatus || "",
        isChecked: invoice.isChecked || false,
        makeModel: invoice.makeModel || "",
        repairCharges: invoice.repairCharges || "",
        sellingPartner: invoice.sellingPartner || "",
        serviceType: invoice.serviceType || "",
        total: invoice.total || "",
        remarks: remarks || invoice.comment || "",
      });
    }
  }, [invoice, remarks]);

  useEffect(() => {
    console.log("Invoice:", invoice);
    console.log("Remarks:", remarks || invoice?.comment);
  }, [invoice, remarks]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setInvoiceData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type === "application/pdf") {
      setUploadedFile(file);
    } else {
      alert("Please upload a valid PDF file.");
      setUploadedFile(null);
    }
  };

  const handleSubmit = () => {
  sessionStorage.setItem("editedInvoice", JSON.stringify(invoiceData));
  navigate(-1);
  };

  
  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Box
        sx={{ p: 4, backgroundColor: "#f9f9f9", borderRadius: 2, boxShadow: 3 }}
      >
        <Typography
          variant="h5"
          gutterBottom
          style={{
            textAlign: "center",
            fontWeight: "bold",
            textDecoration: "underline",
          }}
        >
          Edit Details
        </Typography>
        <Grid container spacing={4} className="mt-1">
          <Grid item xs={12} sm={6} md={4}>
            <FormControl fullWidth>
              <TextField
                label="AA Number"
                name="aA_Number"
                value={invoiceData.aA_Number}
                onChange={handleChange}
                variant="outlined"
                fullWidth
                disabled
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <Lock sx={{ fontSize: 16, color: "#555" }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  "& .MuiInputBase-root": {
                    backgroundColor: "#e0e0e0",
                  },
                  "& .MuiInputBase-input": {
                    color: "#000000",
                  },
                  "& .MuiInputBase-input::placeholder": {
                    color: "#000000",
                    opacity: 1,
                  },
                  "& .MuiInputBase-input.Mui-disabled": {
                    color: "#000000",
                    WebkitTextFillColor: "#000000",
                  },
                }}
              />
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <FormControl fullWidth>
              <TextField
                label="Batch No"
                name="batchNo"
                value={invoiceData.batchNo}
                onChange={handleChange}
                variant="outlined"
                fullWidth
                disabled
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <Lock sx={{ fontSize: 16, color: "#555" }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  "& .MuiInputBase-root": {
                    backgroundColor: "#e0e0e0",
                  },
                  "& .MuiInputBase-input": {
                    color: "#000000",
                  },
                  "& .MuiInputBase-input::placeholder": {
                    color: "#000000",
                    opacity: 1,
                  },
                  "& .MuiInputBase-input.Mui-disabled": {
                    color: "#000000",
                    WebkitTextFillColor: "#000000",
                  },
                }}
              />
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <FormControl fullWidth>
              <TextField
                label="Brand"
                name="brand"
                value={invoiceData.brand}
                onChange={handleChange}
                variant="outlined"
                fullWidth
                disabled
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <Lock sx={{ fontSize: 16, color: "#555" }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  "& .MuiInputBase-root": {
                    backgroundColor: "#e0e0e0",
                  },
                  "& .MuiInputBase-input": {
                    color: "#000000",
                  },
                  "& .MuiInputBase-input::placeholder": {
                    color: "#000000",
                    opacity: 1,
                  },
                  "& .MuiInputBase-input.Mui-disabled": {
                    color: "#000000",
                    WebkitTextFillColor: "#000000",
                  },
                }}
              />
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <FormControl fullWidth>
              <TextField
                label="Closure Date"
                name="closureDate"
                value={invoiceData.closureDate}
                onChange={handleChange}
                variant="outlined"
                fullWidth
                disabled
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <Lock sx={{ fontSize: 16, color: "#555" }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  "& .MuiInputBase-root": {
                    backgroundColor: "#e0e0e0",
                  },
                  "& .MuiInputBase-input": {
                    color: "#000000",
                  },
                  "& .MuiInputBase-input::placeholder": {
                    color: "#000000",
                    opacity: 1,
                  },
                  "& .MuiInputBase-input.Mui-disabled": {
                    color: "#000000",
                    WebkitTextFillColor: "#000000",
                  },
                }}
              />
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <FormControl fullWidth>
              <TextField
                label="Creation Date"
                name="creationDate"
                value={invoiceData.creationDate}
                onChange={handleChange}
                variant="outlined"
                fullWidth
                disabled
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <Lock sx={{ fontSize: 16, color: "#555" }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  "& .MuiInputBase-root": {
                    backgroundColor: "#e0e0e0",
                  },
                  "& .MuiInputBase-input": {
                    color: "#000000",
                  },
                  "& .MuiInputBase-input::placeholder": {
                    color: "#000000",
                    opacity: 1,
                  },
                  "& .MuiInputBase-input.Mui-disabled": {
                    color: "#000000",
                    WebkitTextFillColor: "#000000",
                  },
                }}
              />
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <FormControl fullWidth>
              <TextField
                label="Customer Name"
                name="customerName"
                value={invoiceData.customerName}
                onChange={handleChange}
                variant="outlined"
                fullWidth
                disabled
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <Lock sx={{ fontSize: 16, color: "#555" }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  "& .MuiInputBase-root": {
                    backgroundColor: "#e0e0e0",
                  },
                  "& .MuiInputBase-input": {
                    color: "#000000",
                  },
                  "& .MuiInputBase-input::placeholder": {
                    color: "#000000",
                    opacity: 1,
                  },
                  "& .MuiInputBase-input.Mui-disabled": {
                    color: "#000000",
                    WebkitTextFillColor: "#000000",
                  },
                }}
              />
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <FormControl fullWidth>
              <TextField
                label="IMEI Number"
                name="imeiNumber"
                value={invoiceData.imeiNumber}
                onChange={handleChange}
                variant="outlined"
                fullWidth
                disabled
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <Lock sx={{ fontSize: 16, color: "#555" }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  "& .MuiInputBase-root": {
                    backgroundColor: "#e0e0e0",
                  },
                  "& .MuiInputBase-input": {
                    color: "#000000",
                  },
                  "& .MuiInputBase-input::placeholder": {
                    color: "#000000",
                    opacity: 1,
                  },
                  "& .MuiInputBase-input.Mui-disabled": {
                    color: "#000000",
                    WebkitTextFillColor: "#000000",
                  },
                }}
              />
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <FormControl fullWidth>
              <TextField
                label="Invoice Status"
                name="invoiceStatus"
                value={invoiceData.invoiceStatus}
                onChange={handleChange}
                variant="outlined"
                fullWidth
                disabled
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <Lock sx={{ fontSize: 16, color: "#555" }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  "& .MuiInputBase-root": {
                    backgroundColor: "#e0e0e0",
                  },
                  "& .MuiInputBase-input": {
                    color: "#000000",
                  },
                  "& .MuiInputBase-input::placeholder": {
                    color: "#000000",
                    opacity: 1,
                  },
                  "& .MuiInputBase-input.Mui-disabled": {
                    color: "#000000",
                    WebkitTextFillColor: "#000000",
                  },
                }}
              />
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <FormControl fullWidth>
              <TextField
                label="Make Model"
                name="makeModel"
                value={invoiceData.makeModel}
                onChange={handleChange}
                variant="outlined"
                fullWidth
                disabled
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <Lock sx={{ fontSize: 16, color: "#555" }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  "& .MuiInputBase-root": {
                    backgroundColor: "#e0e0e0",
                  },
                  "& .MuiInputBase-input": {
                    color: "#000000",
                  },
                  "& .MuiInputBase-input::placeholder": {
                    color: "#000000",
                    opacity: 1,
                  },
                  "& .MuiInputBase-input.Mui-disabled": {
                    color: "#000000",
                    WebkitTextFillColor: "#000000",
                  },
                }}
              />
            </FormControl>
          </Grid>
        
          <Grid item xs={12} sm={6} md={4}>
            <FormControl fullWidth>
              <TextField
                label="Selling Partner"
                name="sellingPartner"
                value={invoiceData.sellingPartner}
                onChange={handleChange}
                variant="outlined"
                fullWidth
                disabled
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <Lock sx={{ fontSize: 16, color: "#555" }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  "& .MuiInputBase-root": {
                    backgroundColor: "#e0e0e0",
                  },
                  "& .MuiInputBase-input": {
                    color: "#000000",
                  },
                  "& .MuiInputBase-input::placeholder": {
                    color: "#000000",
                    opacity: 1,
                  },
                  "& .MuiInputBase-input.Mui-disabled": {
                    color: "#000000",
                    WebkitTextFillColor: "#000000",
                  },
                }}
              />
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <FormControl fullWidth>
              <TextField
                label="Service Type"
                name="serviceType"
                value={invoiceData.serviceType}
                onChange={handleChange}
                variant="outlined"
                fullWidth
                disabled
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <Lock sx={{ fontSize: 16, color: "#555" }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  "& .MuiInputBase-root": {
                    backgroundColor: "#e0e0e0",
                  },
                  "& .MuiInputBase-input": {
                    color: "#000000",
                  },
                  "& .MuiInputBase-input::placeholder": {
                    color: "#000000",
                    opacity: 1,
                  },
                  "& .MuiInputBase-input.Mui-disabled": {
                    color: "#000000",
                    WebkitTextFillColor: "#000000",
                  },
                }}
              />
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <FormControl fullWidth>
              <TextField
                label="Total"
                name="total"
                value={invoiceData.total}
                onChange={handleChange}
                variant="outlined"
                fullWidth
                disabled
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <Lock sx={{ fontSize: 16, color: "#555" }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  "& .MuiInputBase-root": {
                    backgroundColor: "#e0e0e0",
                  },
                  "& .MuiInputBase-input": {
                    color: "#000000",
                  },
                  "& .MuiInputBase-input::placeholder": {
                    color: "#000000",
                    opacity: 1,
                  },
                  "& .MuiInputBase-input.Mui-disabled": {
                    color: "#000000",
                    WebkitTextFillColor: "#000000",
                  },
                }}
              />
            </FormControl>
          </Grid>
            <Grid item xs={12} sm={6} md={4}>
            <FormControl fullWidth>
              <TextField
                label="Repair Charges"
                name="repairCharges"
                value={invoiceData.repairCharges}
                onChange={handleChange}
                variant="outlined"
                fullWidth
                sx={{
                  "& .MuiInputBase-root": {
                    backgroundColor: "#fff",
                  },
                  "& .MuiInputBase-input": {
                    color: "#000000",
                  },
                  "& .MuiInputBase-input::placeholder": {
                    color: "#000000",
                    opacity: 1,
                  },
                }}
              />
            </FormControl>
          </Grid>
             <Grid item xs={12} sm={6} md={4}>
            <FormControl fullWidth>
              <TextField
                label="Service Charges"
                name="serviceCharges"
                value={invoiceData.serviceCharges}
                onChange={handleChange}
                variant="outlined"
                fullWidth
                sx={{
                  "& .MuiInputBase-root": {
                    backgroundColor: "#fff",
                  },
                  "& .MuiInputBase-input": {
                    color: "#000000",
                  },
                  "& .MuiInputBase-input::placeholder": {
                    color: "#000000",
                    opacity: 1,
                  },
                }}
              />
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <FormControl fullWidth>
              <TextField
                label="Remarks"
                name="remarks"
                value={invoiceData.remarks}
                onChange={handleChange}
                variant="outlined"
                fullWidth
                multiline
                rows={4}
                sx={{
                  "& .MuiInputBase-root": {
                    backgroundColor: "#fff",
                  },
                  "& .MuiInputBase-input": {
                    color: "#000000",
                  },
                  "& .MuiInputBase-input::placeholder": {
                    color: "#000000",
                    opacity: 1,
                  },
                }}
              />
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <FormControl fullWidth>
              <Typography variant="body1" sx={{ mb: 1 }}>
                Upload PDF
              </Typography>
              <input
                type="file"
                accept="application/pdf"
                onChange={handleFileChange}
                style={{
                  padding: "10px",
                  border: "1px solid #c4c4c4",
                  borderRadius: "4px",
                  backgroundColor: "#fff",
                }}
              />
              <Typography variant="body2" sx={{ mt: 1, color: "#555" }}>
                {uploadedFile ? uploadedFile.name : "No file selected"}
              </Typography>
            </FormControl>
          </Grid>
        </Grid>
        <Box
          mt={4}
          sx={{
            display: "flex",
            gap: 2,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <button
            onClick={() => navigate(-1)}
            type="button"
            className="btn btn-primary d-flex align-items-center"
            style={{
              backgroundColor: "#8000d7",
              border: "none",
              padding: "10px 50px",
              borderRadius: "8px",
              fontWeight: "500",
              fontSize: "16px",
              color: "white",
            }}
          >
            <span className="ms-2">Cancel</span>
          </button>
          <button
            onClick={handleSubmit}
            type="button"
            className="btn btn-primary d-flex align-items-center"
            style={{
              backgroundColor: "#8000d7",
              border: "none",
              padding: "10px 50px",
              borderRadius: "8px",
              fontWeight: "500",
              fontSize: "16px",
              color: "white",
            }}
          >
            <span className="ms-2">Submit</span>
          </button>
        </Box>
      </Box>
    </Container>
  );
};

export default EditData;