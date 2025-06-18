import React, { useState, useRef, useEffect, useCallback } from "react";
import { Table, Form, Modal, Button } from "react-bootstrap";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FaEye, FaDownload, FaTrash, FaUpload, FaEdit } from "react-icons/fa";
import Papa from "papaparse";
import { useNavigate, useLocation } from "react-router-dom";
import { saveAs } from "file-saver";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const BASE_URL = "https://mintflix.live:8086/api/Auto";

const VendorBatchPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const fileInputRef = useRef();
  const modalFileInputRef = useRef();

  const { selectedInvoices = [], vendorName = "" } = location.state || {};

  console.log("Selected Invoices:", selectedInvoices);
  // State declarations
  const [invoices, setInvoices] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isGSTApplied, setIsGSTApplied] = useState(false);
  const [apiData, setApiData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [previousInvoices, setPreviousInvoices] = useState([]);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [fileType, setFileType] = useState("");
  const [invoiceNo, setInvoiceNo] = useState("");
  const [caseCount, setCaseCount] = useState("");
  const [invoiceDate, setInvoiceDate] = useState("");
  const [invoiceAmount, setInvoiceAmount] = useState("");
  const [amountError, setAmountError] = useState("");
  const [hoveredRow, setHoveredRow] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({
    invoiceNo: false,
    invoiceDate: false,
    invoiceAmount: false,
    caseCount: false,
    uploadedFile: false,
    remarks: {},
  });
  const [showModal, setShowModal] = useState(false);
  const [editIndex, setEditIndex] = useState(null);
  const [editingInvoice, setEditingInvoice] = useState(null);
  const [editedCharges, setEditedCharges] = useState({
    repairCharges: "0.00",
    serviceCharges: "0.00",
    remarks: "",
    file: null,
    fileName: "",
  });

  // Initialize invoices and handle session storage
  useEffect(() => {
    const saved = sessionStorage.getItem("editedInvoice");
    if (saved) {
      const edited = JSON.parse(saved);
      setInvoices((prev) => {
        const updated = [...prev];
        const index = updated.findIndex(
          (inv) => inv.aA_Number === edited.aA_Number
        );
        if (index !== -1) {
          updated[index] = { ...updated[index], ...edited };
        }
        return updated;
      });
      sessionStorage.removeItem("editedInvoice");
    }
  }, []);

  // Initialize invoices from selectedInvoices
  useEffect(() => {
    const initializedInvoices = selectedInvoices.map((invoice) => ({
      ...invoice,
      isChecked: invoice.isChecked !== undefined ? invoice.isChecked : true,
      remarks: invoice.remarks || "",
      RemarkFile: null,
      repairCharges: invoice.repairCharges
        ? parseFloat(invoice.repairCharges).toFixed(2)
        : "0.00",
      serviceCharges: invoice.serviceCharges
        ? parseFloat(invoice.serviceCharges).toFixed(2)
        : "0.00",
      total: invoice.total
        ? parseFloat(invoice.total).toFixed(2)
        : (
            parseFloat(invoice.repairCharges || 0) +
            parseFloat(invoice.serviceCharges || 0)
          ).toFixed(2),
    }));
    setInvoices(initializedInvoices);
  }, [selectedInvoices]);

  // Constants
  const itemsPerPage = 10;
  const totalPages = Math.ceil(invoices.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentInvoices = invoices.slice(indexOfFirstItem, indexOfLastItem);
  const selectedAAno = invoices.filter((invoice) => invoice.isChecked);

  // Calculate amounts
  const totalRepairCharges = currentInvoices.reduce((total, invoice) => {
    const cleanedAmount = invoice.repairCharges?.toString().replace(/,/g, "");
    const amount = parseFloat(cleanedAmount);
    return total + (isNaN(amount) ? 0 : amount);
  }, 0);

  const totalServiceCharges = currentInvoices.reduce((total, invoice) => {
    const cleanedAmount = invoice.serviceCharges?.toString().replace(/,/g, "");
    const amount = parseFloat(cleanedAmount);
    return total + (isNaN(amount) ? 0 : amount);
  }, 0);

  const grossAmount = totalRepairCharges + totalServiceCharges;

  const gstAmount = isGSTApplied
    ? (totalServiceCharges * 0.18).toFixed(2)
    : (0).toFixed(2);

  const finalAmount = isGSTApplied
    ? (grossAmount + parseFloat(gstAmount)).toFixed(2)
    : grossAmount.toFixed(2);

  // Pagination handlers
  const handleNext = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrevious = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  // API data fetching
  const areArraysEqual = (arr1, arr2) => {
    if (arr1.length !== arr2.length) return false;
    return arr1.every(
      (item, index) => item.aA_Number === arr2[index].aA_Number
    );
  };

  useEffect(() => {
    if (currentInvoices.length === 0) return;

    if (!areArraysEqual(currentInvoices, previousInvoices)) {
      setLoading(true);
      const aaNumbers = currentInvoices
        .map((invoice) => invoice.aA_Number)
        .join(",");
      fetch(`${BASE_URL}/GetGadgetCaseDetailsByAA?aaNumbers=${aaNumbers}`)
        .then((response) => response.json())
        .then((responseData) => {
          if (Array.isArray(responseData.dataItems)) {
            setApiData([...responseData.dataItems]);
          } else {
            setApiData([]);
          }
        })
        .catch((error) => {
          console.error("Error fetching API data:", error);
          setApiData([]);
        })
        .finally(() => setLoading(false));

      setPreviousInvoices(currentInvoices);
    }
  }, [currentInvoices, previousInvoices]);



  const normalize = (value) =>
  (value ? value.toString().trim() : "").toLowerCase();

  // const normalize = (value) =>
  //   (value ? value.toString().trim() : "").toLowerCase();

  // const getRowClassName = useCallback(
  //   (invoice) => {
  //     if (!Array.isArray(apiData) || apiData.length === 0) return "row-red";

  //     const matchedData = apiData.find(
  //       (item) => item.aA_Number === invoice.aA_Number
  //     );
  //     if (!matchedData) return "row-red";

  //     if (
  //       normalize(matchedData.serviceType) !== normalize(invoice.serviceType) ||
  //       normalize(matchedData.repairCharges) !==
  //         normalize(invoice.repairCharges) ||
  //       normalize(matchedData.serviceCharges) !==
  //         normalize(invoice.serviceCharges) ||
  //       normalize(matchedData.total) !== normalize(invoice.total)
  //     ) {
  //       return "row-yellow";
  //     }

  //     return "row-green";
  //   },
  //   [apiData]
  // );



const getRowClassName = useCallback(
  (invoice) => {
    // If apiData is empty or not an array, mark row as red
    if (!Array.isArray(apiData) || apiData.length === 0) {
      return "row-red";
    }

    // Find matching API data by aA_Number
    const matchedData = apiData.find(
      (item) => item.aA_Number === invoice.aA_Number
    );

    // If no matching aA_Number is found, mark row as red
    if (!matchedData) {
      return "row-red";
    }

    // Compare fields for yellow row condition
    const isServiceTypeMismatch =
      normalize(matchedData.serviceType) !== normalize(invoice.serviceType);
    const isRepairChargesMismatch =
      parseFloat(matchedData.repairCharges || 0).toFixed(2) !==
      parseFloat(invoice.repairCharges || 0).toFixed(2);
    const isServiceChargesMismatch =
      parseFloat(matchedData.serviceCharges || 0).toFixed(2) !==
      parseFloat(invoice.serviceCharges || 0).toFixed(2);
    const isSellingPartnerMismatch =
      normalize(matchedData.sellingPartner || "") !==
      normalize(invoice.sellingPartner || "");

    // If any of the fields mismatch, mark row as yellow
    if (
      isServiceTypeMismatch ||
      isRepairChargesMismatch ||
      isServiceChargesMismatch ||
      isSellingPartnerMismatch
    ) {
      return "row-yellow";
    }

    // If all fields match, mark row as green
    return "row-green";
  },
  [apiData]
);




  // const getDifferencesData = (invoice) => {
  //   const matchedData = apiData.find(
  //     (item) => item.aA_Number === invoice.aA_Number
  //   );
  //   if (!matchedData)
  //     return [
  //       { field: "AA Number", table: invoice.aA_Number, api: "Not Found" },
  //     ];

  //   const differences = [];

  //   if (normalize(matchedData.serviceType) !== normalize(invoice.serviceType)) {
  //     differences.push({
  //       field: "Service Type",
  //       table: invoice.serviceType || "-",
  //       api: matchedData.serviceType || "-",
  //     });
  //   }
  //   if (
  //     normalize(matchedData.repairCharges) !== normalize(invoice.repairCharges)
  //   ) {
  //     differences.push({
  //       field: "Repair Charges",
  //       table: invoice.repairCharges || "-",
  //       api: matchedData.repairCharges || "-",
  //     });
  //   }
  //   if (
  //     normalize(matchedData.serviceCharges) !==
  //     normalize(invoice.serviceCharges)
  //   ) {
  //     differences.push({
  //       field: "Service Charges",
  //       table: invoice.serviceCharges || "-",
  //       api: matchedData.serviceCharges || "-",
  //     });
  //   }
  //   if (normalize(matchedData.total) !== normalize(invoice.total)) {
  //     differences.push({
  //       field: "Total",
  //       table: invoice.total || "-",
  //       api: matchedData.total || "-",
  //     });
  //   }

  //   return differences.length > 0 ? differences : [];
  // };




  const getDifferencesData = (invoice) => {
  const matchedData = apiData.find(
    (item) => item.aA_Number === invoice.aA_Number
  );
  if (!matchedData)
    return [
      { field: "AA Number", table: invoice.aA_Number, api: "Not Found" },
    ];

  const differences = [];

  if (normalize(matchedData.serviceType) !== normalize(invoice.serviceType)) {
    differences.push({
      field: "Service Type",
      table: invoice.serviceType || "-",
      api: matchedData.serviceType || "-",
    });
  }
  if (
    parseFloat(matchedData.repairCharges || 0).toFixed(2) !==
    parseFloat(invoice.repairCharges || 0).toFixed(2)
  ) {
    differences.push({
      field: "Repair Charges",
      table: invoice.repairCharges || "-",
      api: matchedData.repairCharges || "-",
    });
  }
  if (
    parseFloat(matchedData.serviceCharges || 0).toFixed(2) !==
    parseFloat(invoice.serviceCharges || 0).toFixed(2)
  ) {
    differences.push({
      field: "Service Charges",
      table: invoice.serviceCharges || "-",
      api: matchedData.serviceCharges || "-",
    });
  }
  if (
    normalize(matchedData.sellingPartner || "") !==
    normalize(invoice.sellingPartner || "")
  ) {
    differences.push({
      field: "Selling Partner",
      table: invoice.sellingPartner || "-",
      api: matchedData.sellingPartner || "-",
    });
  }

  return differences.length > 0 ? differences : [];
};
  const handleCheckboxChange = (invoiceId) => {
    setInvoices((prev) =>
      prev.map((invoice) =>
        invoice.aA_Number === invoiceId
          ? { ...invoice, isChecked: !invoice.isChecked }
          : invoice
      )
    );
  };

  const handleDelete = (index) => {
    const updatedInvoices = invoices.filter((_, i) => i !== index);
    setInvoices(updatedInvoices);
    if (updatedInvoices.length === 0) {
      navigate("/");
    }
  };

  const handleClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const extension = file.name.split(".").pop().toLowerCase();
    setFileType(extension);
    setUploadedFile(file);
    setFieldErrors((prev) => ({ ...prev, uploadedFile: false }));

    if (extension === "csv") {
      Papa.parse(file, {
        header: true,
        complete: ({ data }) => {
          const row = data[0];
          setInvoiceNo(row["Invoice No"] || "");
          setInvoiceDate(row["Invoice Date"] || "");
          setInvoiceAmount(row["Invoice Amount"] || "");
          setCaseCount(row["Case Count"] || "");
        },
        error: (err) => {
          console.error("CSV parsing error:", err);
          toast.error("Failed to parse CSV file.");
        },
      });
    }
  };

  const handleModalFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setEditedCharges((prev) => ({
        ...prev,
        file,
        fileName: file.name,
      }));
    }
  };

  const downloadCSV = () => {
    const headers = [
      "AA Number",
      "IMEI Number",
      "Creation Date",
      "Closure Date",
      "Customer Name",
      "Service Type",
      "Brand",
      "Make Model",
      "Repair Charges",
      "Service Charges",
      "Total",
      "Remarks",
      "Remark File",
    ];

    const today = new Date().toLocaleDateString("en-GB");
    const data = currentInvoices.map((invoice) => ({
      aaNumber: invoice.aA_Number || "",
      imeiNumber: invoice.imeiNumber || "",
      creationDate: today,
      closureDate: "",
      customerName: invoice.customerName || "",
      serviceType: invoice.serviceType || "",
      brand: invoice.brand || "",
      makeModel: invoice.makeModel || "",
      repairCharges: invoice.repairCharges || "0.00",
      serviceCharges: invoice.serviceCharges || "0.00",
      total: invoice.total || "0.00",
      remarks: invoice.remarks || "",
      remarkFile: invoice.RemarkFile ? invoice.RemarkFile.name : "",
    }));

    const csv = Papa.unparse({
      fields: headers,
      data: data.map((row) => Object.values(row)),
    });

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, "invoice-list.csv");
  };

  const handleEditClick = (index, invoice) => {
    setEditIndex(index);
    setEditingInvoice(invoice);
    setEditedCharges({
      repairCharges: invoice.repairCharges || "0.00",
      serviceCharges: invoice.serviceCharges || "0.00",
      remarks: invoice.remarks || "",
      file: invoice.RemarkFile || null,
      fileName: invoice.RemarkFile ? invoice.RemarkFile.name : "",
    });
    setShowModal(true);
  };

  const handleSaveEdit = () => {
    const parsedRepairCharges = parseFloat(editedCharges.repairCharges);
    const parsedServiceCharges = parseFloat(editedCharges.serviceCharges);
    const remarks = editedCharges.remarks.trim();

    if (
      isNaN(parsedRepairCharges) ||
      parsedRepairCharges < 0 ||
      isNaN(parsedServiceCharges) ||
      parsedServiceCharges < 0
    ) {
      toast.error("Charges must be valid non-negative numbers.");
      return;
    }

    const isYellowRow = getRowClassName(editingInvoice) === "row-yellow";
    if (isYellowRow && !remarks) {
      setFieldErrors((prev) => ({
        ...prev,
        remarks: { ...prev.remarks, [editingInvoice.aA_Number]: true },
      }));
      toast.error("Remarks are required for mismatched data.");
      return;
    }

    const updatedInvoices = [...invoices];
    updatedInvoices[editIndex] = {
      ...updatedInvoices[editIndex],
      repairCharges: parsedRepairCharges.toFixed(2),
      serviceCharges: parsedServiceCharges.toFixed(2),
      total: (parsedRepairCharges + parsedServiceCharges).toFixed(2),
      remarks: remarks,
      RemarkFile: editedCharges.file || updatedInvoices[editIndex].RemarkFile,
    };

    setInvoices(updatedInvoices);
    setFieldErrors((prev) => ({
      ...prev,
      remarks: { ...prev.remarks, [editingInvoice.aA_Number]: false },
    }));
    setShowModal(false);
    setEditIndex(null);
    setEditingInvoice(null);
    setEditedCharges({
      repairCharges: "0.00",
      serviceCharges: "0.00",
      remarks: "",
      file: null,
      fileName: "",
    });
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditIndex(null);
    setEditingInvoice(null);
    setEditedCharges({
      repairCharges: "0.00",
      serviceCharges: "0.00",
      remarks: "",
      file: null,
      fileName: "",
    });
    if (editingInvoice) {
      setFieldErrors((prev) => ({
        ...prev,
        remarks: { ...prev.remarks, [editingInvoice.aA_Number]: false },
      }));
    }
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditedCharges((prev) => ({ ...prev, [name]: value }));
    if (name === "remarks" && editingInvoice) {
      setFieldErrors((prev) => ({
        ...prev,
        remarks: { ...prev.remarks, [editingInvoice.aA_Number]: !value.trim() },
      }));
    }
  };

  const handleSubmit = async () => {
    try {
      const selected = invoices.filter((inv) => inv.isChecked);
      if (selected.length === 0) {
        toast.error("Please select at least one invoice.");
        return;
      }

      const newErrors = {
        invoiceNo: !invoiceNo.trim(),
        invoiceDate: !invoiceDate,
        invoiceAmount:
          !invoiceAmount.trim() ||
          isNaN(parseFloat(invoiceAmount)) ||
          parseFloat(invoiceAmount) <= 0,
        caseCount:
          !caseCount.trim() ||
          isNaN(parseInt(caseCount)) ||
          parseInt(caseCount) <= 0,
        uploadedFile: false, // Invoice file is optional
        remarks: fieldErrors.remarks,
      };

      let hasRemarkError = false;
      selected.forEach((invoice) => {
        const isYellowRow = getRowClassName(invoice) === "row-yellow";
        const isRemarkEmpty = !invoice.remarks?.trim();
        if (isYellowRow && isRemarkEmpty) {
          newErrors.remarks[invoice.aA_Number] = true;
          hasRemarkError = true;
        } else {
          newErrors.remarks[invoice.aA_Number] = false;
        }
      });

      setFieldErrors(newErrors);

      if (newErrors.invoiceNo) toast.error("Invoice No is required.");
      if (newErrors.invoiceDate) toast.error("Invoice Date is required.");
      if (newErrors.invoiceAmount)
        toast.error("Invoice Amount must be a valid positive number.");
      if (newErrors.caseCount)
        toast.error("Case Count must be a valid positive number.");
      if (hasRemarkError)
        toast.error(
          "Remarks are required for all yellow rows (mismatched data)."
        );

      if (
        newErrors.invoiceNo ||
        newErrors.invoiceDate ||
        newErrors.invoiceAmount ||
        newErrors.caseCount ||
        hasRemarkError
      ) {
        return;
      }

      const today = new Date().toISOString().split("T")[0];
      if (invoiceDate > today) {
        setFieldErrors((prev) => ({ ...prev, invoiceDate: true }));
        toast.error("Invoice Date cannot be a future date.");
        return;
      }

      if (parseInt(caseCount) !== selected.length) {
        toast.error(
          "Case Count does not match the number of selected services."
        );
        setFieldErrors((prev) => ({ ...prev, caseCount: true }));
        return;
      }

      const parsedInvoiceAmount = parseFloat(invoiceAmount);
      if (Math.abs(parsedInvoiceAmount - parseFloat(finalAmount)) > 0.01) {
        setFieldErrors((prev) => ({ ...prev, invoiceAmount: true }));
        setAmountError("Invoice Amount and Final Amount do not match.");
        toast.error("Invoice Amount and Final Amount do not match.");
        return;
      } else {
        setAmountError("");
      }

      let hasMismatch = false;
      for (const invoice of selected) {
        const matchedData = apiData.find(
          (item) => item.aA_Number === invoice.aA_Number
        );
        if (!matchedData) {
          toast.error(
            `AA Number ${invoice.aA_Number} not found in reference data. Please delete the row or check the source.`
          );
          return;
        }

        if (
          normalize(matchedData.serviceType) !==
            normalize(invoice.serviceType) ||
          normalize(matchedData.repairCharges) !==
            normalize(invoice.repairCharges) ||
          normalize(matchedData.serviceCharges) !==
            normalize(invoice.serviceCharges) ||
          normalize(matchedData.total) !== normalize(invoice.total)
        ) {
          hasMismatch = true;
        }
      }

      if (hasMismatch) {
        const confirmProceed = window.confirm(
          "Warning: Some invoice fields do not match the original data. Do you want to proceed anyway?"
        );
        if (!confirmProceed) return;
      }

      const formData = new FormData();
      const extract = (key) =>
        selected.map((item) => item[key] || "").join(", ");
      formData.append("AANo", extract("aA_Number"));
      formData.append("IMEINo", extract("imeiNumber"));
      formData.append("CreationDate", extract("creationDate"));
      formData.append("ClosureDate", extract("closureDate"));
      formData.append("CustomerName", extract("customerName"));
      formData.append("VendorName", vendorName);
      formData.append("FinalAmount", finalAmount);
      formData.append("TotalRepairCharges", totalRepairCharges.toFixed(2));
      formData.append("TotalServiceCharges", totalServiceCharges.toFixed(2));
      formData.append("ServiceType", extract("serviceType"));
      formData.append("Brand", extract("brand"));
      formData.append("MakeModel", extract("makeModel"));
      formData.append("RepairCharges", extract("repairCharges"));
      formData.append("ServiceCharges", extract("serviceCharges"));
      formData.append("ChargesInclGST", extract("chargesInclGST") || "");
      formData.append("Total", extract("total"));
      formData.append("SellingPartner", extract("sellingPartner") || "");
      formData.append("Remarks", extract("remarks"));
      formData.append(
        "InvoiceStatus",
        uploadedFile ? "Invoice Uploaded" : extract("invoiceStatus")
      );
      formData.append("InvoiceNo", invoiceNo);
      formData.append("InvoiceDate", invoiceDate);
      formData.append("InvoiceAmount", invoiceAmount);
      formData.append("CaseCount", caseCount);
      formData.append("IsGSTApplied", isGSTApplied ? "true" : "false");

      if (uploadedFile) {
        formData.append("Invoice", uploadedFile, uploadedFile.name);
      }

      const invoiceWithFile = selected.find((inv) => inv.RemarkFile);
      if (invoiceWithFile && invoiceWithFile.RemarkFile) {
        formData.append(
          "RemarkFile",
          invoiceWithFile.RemarkFile,
          invoiceWithFile.RemarkFile.name
        );
      }

      setLoading(true);
      const response = await fetch(`${BASE_URL}/SaveApprovalBatchData`, {
        method: "POST",
        body: formData,
      });

      const result = await response.json();
      setLoading(false);

      if (!response.ok) {
        throw new Error(
          `Error submitting batch: ${result.message || response.statusText}`
        );
      }
      toast.success("Batch submitted successfully.");
      navigate(uploadedFile ? "/approval" : "/");
    } catch (error) {
      console.error("Submission failed:", error);
      setLoading(false);
      toast.error("Submission failed. Please check console for details.");
    }
  };

  return (
    <div
      className="container-fluid py-4"
      style={{ backgroundColor: "#f8f9fa" }}
    >
      <ToastContainer position="top-right" autoClose={3000} />
      <div className="card shadow-sm p-4">
        <div
          className="d-flex justify-content-between align-items-center mb-4"
          style={{
            backgroundColor: "#e6f0ff",
            padding: "15px",
            borderRadius: "8px",
          }}
        >
          <h2 className="mb-0">Upload Invoice</h2>
          <button
            className="btn btn-primary d-flex align-items-center"
            style={{
              backgroundColor: "#8000d7",
              border: "none",
              padding: "10px 16px",
              borderRadius: "8px",
              fontWeight: "500",
              fontSize: "14px",
            }}
            onClick={() => navigate(-1)}
          >
            Back
          </button>
        </div>

        <div className="netwrok_table_main_content">
          <div className="d-flex justify-content-between align-items-center gap-2 mb-3">
            <div className="d-flex flex-wrap gap-2 align-items-center">
              <div className="fw-semibold">
                <span>Vendor: </span>
                <span className="text-success">{vendorName}</span>
              </div>
            </div>
            <div className="d-flex gap-2">
              <button
                className="btn btn-primary d-flex align-items-center"
                style={{
                  backgroundColor: "#8000d7",
                  border: "none",
                  padding: "10px 16px",
                  borderRadius: "8px",
                  fontWeight: "500",
                  fontSize: "14px",
                }}
                onClick={handleClick}
              >
                <FaUpload /> <span className="ms-2">Upload Invoice</span>
              </button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                style={{ display: "none" }}
                accept="*"
              />
            </div>
          </div>

          {fileType && (
            <div className="text-end upload_file_ext_name mb-3">
              <span className="fw-bold text-success">
                Uploaded File Type: {fileType}
              </span>
            </div>
          )}

          <div
            className="table-container mt-3"
            style={{ overflowX: "auto", maxHeight: "400px", overflowY: "auto" }}
          >
            <Table className="table-auto bg-white text-center border-dark network_table">
              <thead
                style={{
                  backgroundColor: "#EEF4FF",
                  position: "sticky",
                  top: "0",
                  zIndex: "1",
                }}
              >
                <tr className="text-dark fw-semibold table_th_border">
                  <th className="border-start">Select</th>
                  <th className="border-start">View</th>
                  <th className="border-start">Edit</th>
                  <th style={{ whiteSpace: "nowrap" }}>AA Number</th>
                  <th style={{ whiteSpace: "nowrap" }}>IMEI Number</th>
                  <th style={{ whiteSpace: "nowrap" }}>Creation Date</th>
                  <th style={{ whiteSpace: "nowrap" }}>Closure Date</th>
                  <th style={{ whiteSpace: "nowrap" }}>Customer Name</th>
                  <th style={{ whiteSpace: "nowrap" }}>Service Type</th>
                  <th style={{ whiteSpace: "nowrap" }}>Brand</th>
                  <th style={{ whiteSpace: "nowrap" }}>Make Model</th>
                  <th style={{ whiteSpace: "nowrap" }}>Repair Charges</th>
                  <th style={{ whiteSpace: "nowrap" }}>Service Charges</th>
                  <th style={{ whiteSpace: "nowrap" }}>Total</th>
                  <th style={{ whiteSpace: "nowrap" }}>Invoice Status</th>
                  <th style={{ whiteSpace: "nowrap" }}>Mismatched Data</th>
                  <th style={{ whiteSpace: "nowrap" }}>Differences</th>
                  <th style={{ whiteSpace: "nowrap" }}>Remarks</th>
                  <th style={{ whiteSpace: "nowrap" }}>Remark File</th>
                  <th className="border-end" style={{ whiteSpace: "nowrap" }}>
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr>
                    <td colSpan="20" className="text-center py-3">
                      Validating data...
                    </td>
                  </tr>
                )}
                {!loading &&
                  currentInvoices.map((invoice, index) => (
                    <tr
                      key={invoice.id || `${invoice.aA_Number}-${index}`}
                      className={`text-center border-bottom network_td_item ${getRowClassName(
                        invoice
                      )}`}
                      aria-label={
                        getRowClassName(invoice).replace("row-", "") + " row"
                      }
                    >
                      <td className="border-start align-middle">
                        <Form.Check
                          type="checkbox"
                          checked={invoice.isChecked}
                          onChange={() =>
                            handleCheckboxChange(invoice.aA_Number)
                          }
                        />
                      </td>
                      <td className="border-start align-middle">
                        <FaEye
                          size={25}
                          className="text-purple-600 review_fa_eye"
                          style={{ cursor: "pointer" }}
                          onClick={() =>
                            navigate("/invoice-template", {
                              state: { aaNumber: invoice.aA_Number },
                            })
                          }
                        />
                      </td>
                      <td className="border-start align-middle">
                        <FaEdit
                          size={25}
                          className="text-blue-600 review_fa_eye"
                          style={{ cursor: "pointer" }}
                          onClick={() => handleEditClick(index, invoice)}
                        />
                      </td>
                      <td className="align-middle">
                        {invoice.aA_Number || "-"}
                      </td>
                      <td className="align-middle">
                        {invoice.imeiNumber || "-"}
                      </td>
                      <td className="align-middle">
                        {new Date().toLocaleDateString("en-GB")}
                      </td>
                      <td className="align-middle">
                        {invoice.closureDate || "-"}
                      </td>
                      <td className="align-middle">
                        {invoice.customerName || "-"}
                      </td>
                      <td className="align-middle">
                        {invoice.serviceType || "-"}
                      </td>
                      <td className="align-middle">{invoice.brand || "-"}</td>
                      <td className="align-middle">
                        {invoice.makeModel || "-"}
                      </td>
                      <td className="align-middle">
                        {invoice.repairCharges || "0.00"}
                      </td>
                      <td className="align-middle">
                        {invoice.serviceCharges || "0.00"}
                      </td>
                      <td className="align-middle">
                        {invoice.total || "0.00"}
                      </td>
                      <td className="align-middle">
                        <span
                          className="vendore_invoice_status px-2 py-1 rounded-pill"
                          style={{ whiteSpace: "nowrap" }}
                        >
                          {invoice.invoiceStatus || "-"}
                        </span>
                      </td>
                      <td className="align-middle">
                        {getDifferencesData(invoice).length > 0
                          ? "Mismatch"
                          : "Valid"}
                      </td>
                      <td
                        className="align-middle position-relative"
                        onMouseEnter={() => setHoveredRow(index)}
                        onMouseLeave={() => setHoveredRow(null)}
                        style={{ cursor: "pointer", position: "relative" }}
                      >
                        {getDifferencesData(invoice).length > 0
                          ? "View Details"
                          : "-"}
                        {hoveredRow === index &&
                          getDifferencesData(invoice).length > 0 && (
                            <div
                              style={{
                                position: "absolute",
                                top: "100%",
                                left: "-18%",
                                transform: "translateX(-50%)",
                                zIndex: 1000,
                                backgroundColor: "#fff",
                                border: "1px solid #ddd",
                                padding: "10px",
                                boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.1)",
                                minWidth: "300px",
                                whiteSpace: "nowrap",
                              }}
                            >
                              <table className="table table-sm table-bordered mb-0">
                                <thead>
                                  <tr>
                                    <th>Field</th>
                                    <th>Excel Data</th>
                                    <th>System Data</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {getDifferencesData(invoice).map(
                                    (diff, i) => (
                                      <tr key={i}>
                                        <td>{diff.field}</td>
                                        <td>{diff.table}</td>
                                        <td>{diff.api}</td>
                                      </tr>
                                    )
                                  )}
                                </tbody>
                              </table>
                            </div>
                          )}
                      </td>
                      <td className="align-middle">
                        {invoice.remarks || ""}
                        {getRowClassName(invoice) === "row-yellow" &&
                          !invoice.remarks && (
                            <span className="text-danger ms-1">*</span>
                          )}
                      </td>
                      <td className="align-middle">
                        {invoice.RemarkFile ? (
                          typeof invoice.RemarkFile === "object" &&
                          invoice.RemarkFile.name ? (
                            <span>{invoice.RemarkFile.name}</span>
                          ) : invoice.RemarkFile.url ||
                            typeof invoice.RemarkFile === "string" ? (
                            <button
                              className="btn btn-primary btn-sm"
                              onClick={() =>
                                window.open(
                                  invoice.RemarkFile.url || invoice.RemarkFile,
                                  "_blank"
                                )
                              }
                            >
                              View File
                            </button>
                          ) : (
                            <span className="text-muted">No File</span>
                          )
                        ) : (
                          <span className="text-muted">No File</span>
                        )}
                      </td>
                      <td
                        className="align-middle border-end pointer-cursor"
                        style={{ cursor: "pointer" }}
                      >
                        <FaTrash
                          onClick={() => handleDelete(index)}
                          size={25}
                          style={{ color: "red" }}
                        />
                      </td>
                    </tr>
                  ))}
              </tbody>
            </Table>
          </div>

          <div className="d-flex justify-content-between align-items-center pagination-container mt-3">
            <button
              className="btn btn-outline-primary"
              onClick={handlePrevious}
              disabled={currentPage === 1}
            >
              Previous
            </button>
            <span className="page-info">
              Page {currentPage} of {totalPages}
            </span>
            <button
              className="btn btn-outline-primary"
              onClick={handleNext}
              disabled={currentPage === totalPages}
            >
              Next
            </button>
          </div>

          <div className="d-flex justify-content-between align-items-center mt-3">
            <div
              className="batch_popup_gross_ammount p-3 d-inline-block"
              style={{ backgroundColor: "#eef4ff", marginTop: "1rem" }}
            >
              <span className="fw-semibold text-secondary me-2">
                Total no of selected Service:
              </span>
              <span className="fw-bold text-dark">{selectedAAno.length}</span>
            </div>
            <div
              className="batch_popup_gross_ammount"
              style={{ backgroundColor: "#eef4ff", marginTop: "1rem" }}
            >
              <div className="text-start batch_popup_amount">
                <div className="fw-bold batch_gross">Total Repair Charges</div>
                <div className="batch_amount_to_fix">
                  ₹ {totalRepairCharges.toFixed(2)}
                </div>
              </div>
              <div className="text-start batch_popup_amount">
                <div className="fw-bold batch_gross">Total Service Charges</div>
                <div className="batch_amount_to_fix">
                  ₹ {totalServiceCharges.toFixed(2)}
                </div>
              </div>
              <div className="text-start batch_popup_amount">
                <div className="fw-bold batch_gross">Total Gross Amount</div>
                <div className="batch_amount_to_fix">
                  ₹ {grossAmount.toFixed(2)}
                </div>
              </div>
              <div className="text-start batch_popup_amount">
                <div className="fw-bold batch_gross">Final Amount</div>
                <div className="batch_amount_to_fix">₹ {finalAmount}</div>
                <div className="batch_gross ms-3">
                  Charges ({isGSTApplied ? "incl GST 18%" : "excl GST"})
                </div>
              </div>
              <div className="mt-2">
                <span className="fw-semibold text-secondary">
                  {isGSTApplied
                    ? `GST Amount Added: ₹${gstAmount}`
                    : `No GST Applied (₹${gstAmount})`}
                </span>
              </div>
            </div>
          </div>

          <div className="border rounded p-3 mt-4">
            <div className="d-flex justify-content-between align-items-center">
              <div className="fw-bold ms-2">
                <span>GST</span>
              </div>
              <div className="d-flex gap-3">
                <label className="registration_kc_radio">
                  <input
                    type="radio"
                    name="gstApplied"
                    checked={isGSTApplied}
                    onChange={() => setIsGSTApplied(true)}
                  />
                  <span className="registration_applied_yes">Yes</span>
                </label>
                <span className="mx-1">/</span>
                <label className="registration_kc_radio">
                  <input
                    type="radio"
                    name="gstApplied"
                    checked={!isGSTApplied}
                    onChange={() => setIsGSTApplied(false)}
                  />
                  <span className="registration_applied_yes">No</span>
                </label>
              </div>
            </div>
          </div>

          <div>
            <form className="mt-4 invoice_form">
              <div className="row align-items-center">
                <div className="col-md-4 align-items-center mb-3">
                  <label className="me-2 fw-semibold w-50">Case Count</label>
                  <input
                    type="number"
                    className={`form-control border-dark ${
                      fieldErrors.caseCount ? "is-invalid" : ""
                    }`}
                    placeholder="Enter Case Count"
                    value={caseCount}
                    onChange={(e) => {
                      const value = e.target.value;
                      setCaseCount(value);
                      setFieldErrors((prev) => ({
                        ...prev,
                        caseCount:
                          !value.trim() ||
                          isNaN(parseInt(value)) ||
                          parseInt(value) <= 0,
                      }));
                    }}
                    min="0"
                  />
                  {fieldErrors.caseCount && (
                    <div
                      className="text-danger mt-1"
                      style={{ fontSize: "14px" }}
                    >
                      {parseInt(caseCount) !== selectedAAno.length
                        ? "Case Count must match the number of selected services."
                        : "Case Count is required and must be a valid number."}
                    </div>
                  )}
                </div>
                <div className="col-md-4 align-items-center mb-3">
                  <label className="me-2 fw-semibold w-50">Invoice No</label>
                  <input
                    type="text"
                    className={`form-control border-dark ${
                      fieldErrors.invoiceNo ? "is-invalid" : ""
                    }`}
                    placeholder="Enter Invoice No"
                    value={invoiceNo}
                    onChange={(e) => {
                      const value = e.target.value;
                      setInvoiceNo(value);
                      setFieldErrors((prev) => ({
                        ...prev,
                        invoiceNo: !value.trim(),
                      }));
                    }}
                  />
                  {fieldErrors.invoiceNo && (
                    <div
                      className="text-danger mt-1"
                      style={{ fontSize: "14px" }}
                    >
                      Invoice No is required.
                    </div>
                  )}
                </div>
                <div className="col-md-4 align-items-center mb-3">
                  <label className="me-2 fw-semibold w-50">Invoice Date</label>
                  <input
                    type="date"
                    className={`form-control border-dark ${
                      fieldErrors.invoiceDate ? "is-invalid" : ""
                    }`}
                    value={invoiceDate}
                    onChange={(e) => {
                      const value = e.target.value;
                      setInvoiceDate(value);
                      setFieldErrors((prev) => ({
                        ...prev,
                        invoiceDate:
                          !value ||
                          value > new Date().toISOString().split("T")[0],
                      }));
                    }}
                    max={new Date().toISOString().split("T")[0]}
                  />
                  {fieldErrors.invoiceDate && (
                    <div
                      className="text-danger mt-1"
                      style={{ fontSize: "14px" }}
                    >
                      Invoice Date is required and must not be a future date.
                    </div>
                  )}
                </div>

                <div className="col-md-4 align-items-center mb-3">
                  <label className="me-2 fw-semibold w-50">
                    Invoice Amount
                  </label>
                  <input
                    type="number"
                    className={`form-control border-dark ${
                      fieldErrors.invoiceAmount || amountError
                        ? "is-invalid"
                        : ""
                    }`}
                    placeholder="Enter Invoice Amount"
                    value={invoiceAmount}
                    onChange={(e) => {
                      const value = e.target.value;
                      setInvoiceAmount(value);
                      setFieldErrors((prev) => ({
                        ...prev,
                        invoiceAmount:
                          !value.trim() ||
                          isNaN(parseFloat(value)) ||
                          parseFloat(value) <= 0,
                      }));
                      if (value && !isNaN(parseFloat(value))) {
                        if (
                          Math.abs(
                            parseFloat(value) - parseFloat(finalAmount)
                          ) > 0.01
                        ) {
                          setAmountError(
                            "Invoice Amount and Final Amount do not match."
                          );
                        } else {
                          setAmountError("");
                        }
                      } else {
                        setAmountError("");
                      }
                    }}
                    min="0"
                    step="0.01"
                  />

                  {fieldErrors.invoiceAmount && (
                    <div
                      className="text-danger mt-2"
                      style={{ fontSize: "14px" }}
                    >
                      Invoice Amount is required and must be a valid positive
                      number.
                    </div>
                  )}
                  {amountError && (
                    <div
                      className="text-danger mt-2"
                      style={{ fontSize: "14px" }}
                    >
                      {amountError}
                    </div>
                  )}
                </div>
              </div>
            </form>
          </div>

          <div className="d-flex mt-4 justify-content-center align-items-center flex-wrap gap-3">
            <button
              onClick={downloadCSV}
              className="btn btn-primary d-flex align-items-center"
              style={{
                backgroundColor: "rgb(248, 238, 255)",
                border: "1px solid #8000d7",
                padding: "10px 50px",
                borderRadius: "8px",
                fontWeight: "500",
                fontSize: "16px",
                color: "#8000d7",
              }}
            >
              <FaDownload /> <span className="ms-2">Download</span>
            </button>
            <button
              className="btn btn-primary d-flex align-items-center"
              onClick={handleSubmit}
              disabled={loading}
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
              {loading ? "Processing..." : "Confirm"}
            </button>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      <Modal show={showModal} onHide={handleCloseModal} centered size="lg">
        <Modal.Header closeButton style={{ backgroundColor: "#EBF3FF" }}>
          <Modal.Title>
            Edit Invoice (AA Number: {editingInvoice?.aA_Number || "-"})
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Repair Charges</Form.Label>
              <Form.Control
                type="number"
                name="repairCharges"
                value={editedCharges.repairCharges}
                onChange={handleEditInputChange}
                min="0"
                step="0.01"
                placeholder="0.00"
                size="lg"
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Service Charges</Form.Label>
              <Form.Control
                type="number"
                name="serviceCharges"
                value={editedCharges.serviceCharges}
                onChange={handleEditInputChange}
                min="0"
                step="0.01"
                placeholder="0.00"
                size="lg"
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Remarks</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="remarks"
                value={editedCharges.remarks}
                onChange={handleEditInputChange}
                placeholder="Enter remark"
                className={
                  fieldErrors.remarks?.[editingInvoice?.aA_Number]
                    ? "is-invalid"
                    : ""
                }
              />
              {fieldErrors.remarks?.[editingInvoice?.aA_Number] && (
                <div className="text-danger mt-1" style={{ fontSize: "14px" }}>
                  Remarks are required for mismatched data.
                </div>
              )}
            </Form.Group>

            <Form.Group className="mb-3" controlId="formFile">
              <Form.Label
                className="btn btn-secondary mb-0"
                style={{ backgroundColor: "#8000d7", border: "none" }}
                onClick={() => modalFileInputRef.current.click()}
              >
                Upload File
              </Form.Label>

              <Form.Control
                type="file"
                id="fileUpload"
                name="file"
                onChange={handleModalFileChange}
                style={{ display: "none" }}
                ref={modalFileInputRef}
                accept="application/pdf"
              />

              {editedCharges.fileName && (
                <div className="mt-2 d-flex align-items-center">
                  <span className="text-muted me-2">
                    Selected File: {editedCharges.fileName}
                  </span>
                  {editedCharges.file &&
                    editedCharges.file.type === "application/pdf" && (
                      <Button
                        variant="link"
                        className="p-0 ms-2"
                        onClick={() => setShowPreview(!showPreview)}
                        style={{ fontSize: "14px", color: "#8000d7" }}
                      >
                        <FaEye className="me-1" />{" "}
                        {showPreview ? "Hide Preview" : "Show Preview"}
                      </Button>
                    )}
                </div>
              )}

              {showPreview &&
                editedCharges.file &&
                editedCharges.file.type === "application/pdf" && (
                  <div
                    className="mt-3"
                    style={{
                      border: "1px solid #ddd",
                      borderRadius: "4px",
                      overflow: "hidden",
                    }}
                  >
                    <iframe
                      src={URL.createObjectURL(editedCharges.file)}
                      style={{ width: "100%", height: "400px", border: "none" }}
                      title="PDF Preview"
                      onLoad={() => {
                        // Revoke URL after iframe loads to free memory (optional)
                        setTimeout(
                          () =>
                            URL.revokeObjectURL(
                              URL.createObjectURL(editedCharges.file)
                            ),
                          10000
                        );
                      }}
                    />
                  </div>
                )}
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="danger" onClick={handleCloseModal}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleSaveEdit}
            style={{ backgroundColor: "#8000d7", border: "none" }}
          >
            Save
          </Button>
        </Modal.Footer>
      </Modal>

      <style jsx>{`
        .tooltip {
          position: relative;
          display: inline-block;
        }
        .tooltip:hover .tooltiptext {
          visibility: visible;
          opacity: 1;
        }
        .row-red {
          background-color: #ffe6e6;
          color: #d32f2f;
        }
        .row-yellow {
          background-color: #fff9c4;
        }
        .row-green {
          background-color: #fff;
        }
        .table-container {
          max-height: 400px;
          overflow-y: auto;
          overflow-x: auto;
        }
        .network_table {
          width: max-content;
          min-width: 100%;
        }
        .network_table th,
        .network_table td {
          overflow-wrap: break-word;
          padding: 8px 10px;
          vertical-align: middle;
          min-width: 80px;
        }
        .vendore_invoice_status {
          display: inline-block;
          white-space: nowrap;
        }
        .pagination-container {
          margin-top: 1rem;
        }
        .page-info {
          font-weight: 500;
        }
        .batch_popup_gross_amount {
          border-radius: 4px;
        }
        .batch_popup_amount {
          margin-bottom: 10px;
        }
      `}</style>
    </div>
  );
};

export default VendorBatchPage;
