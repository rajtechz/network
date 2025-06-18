
import React, { useState, useRef, useEffect, useCallback } from "react";
import { Table, Form, Button, Modal } from "react-bootstrap";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  FaChevronDown,
  FaEye,
  FaDownload,
  FaTrash,
  FaUpload,
  FaEdit,
  FaSave,
  FaTimes,
} from "react-icons/fa";
import Papa from "papaparse";
import { useNavigate, useLocation } from "react-router-dom";
import { saveAs } from "file-saver";

const BASE_URL = "https://mintflix.live:8086/api/Auto";

const RejectedCasePage = () => {
  const navigate = useNavigate();
  const { state } = useLocation();
  const { invoice, vendorId, isExcelUpload } = state || {};
  console.log("hello this is data ", invoice);
  const fileInputRef = useRef();
  const modalFileInputRef = useRef();
  const [invoices, setInvoices] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isGSTApplied, setIsGSTApplied] = useState(true);
  const [apiData, setApiData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [fileType, setFileType] = useState("");
  const [invoiceNo, setInvoiceNo] = useState("");
  const [caseCount, setCaseCount] = useState("");
  const [invoiceDate, setInvoiceDate] = useState("");
  const [invoiceAmount, setInvoiceAmount] = useState("");
  const [amountError, setAmountError] = useState("");
  const [hoveredRow, setHoveredRow] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({
    invoiceNo: false,
    invoiceDate: false,
    invoiceAmount: false,
    caseCount: false,
    uploadedFile: false,
    remarks: {},
  });
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState(null);
  const [editValues, setEditValues] = useState({
    serviceCharges: "",
    repairCharges: "",
    remarks: "",
    file: null,
    fileName: "",
  });

  const itemsPerPage = 10;
  const totalPages = Math.ceil(invoices.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentInvoices = invoices.slice(indexOfFirstItem, indexOfLastItem);
  const selectedAAno = invoices.filter((invoice) => invoice.isChecked);

const totalRepairCharges = invoices.reduce(
  (acc, curr) => acc + parseFloat(curr.repairCharges || 0),
  0
);

const totalServiceCharges = invoices.reduce(
  (acc, curr) => acc + parseFloat(curr.serviceCharges || 0),
  0
);

  const grossAmount = totalServiceCharges + totalRepairCharges;



const gstAmount = isGSTApplied
  ? (totalServiceCharges * 0.18).toFixed(2)
  : (0).toFixed(2);

const finalAmount = (
  totalRepairCharges +
  totalServiceCharges +
  parseFloat(gstAmount)
).toFixed(2);


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

  useEffect(() => {
    console.log("Selected Batch Data:", invoice);
    if (!invoice) {
      navigate("/");
      return;
    }
    setInvoiceNo(invoice.invoiceNo || "");
    setInvoiceDate(invoice.invoiceDate || "");
    setInvoiceAmount(
      invoice.invoiceAmount
        ? invoice.invoiceAmount.toString()
        : ""
    );
    setCaseCount(
      invoice.caseCount ? invoice.caseCount.toString() : ""
    );

    setIsLoading(true);
    if (invoice.aaNo) {
      const aaNumbers = invoice.aaNo
        .split(",")
        .map((val) => val.trim());

      Promise.all(
        aaNumbers.map((aaNo) =>
          fetch(`${BASE_URL}/GetGadgetCaseDetailsByAA?aaNumbers=${aaNo}`)
            .then((response) => {
              if (!response.ok) {
                console.error(
                  `HTTP error for aaNo ${aaNo}: ${response.status}`
                );
                return null;
              }
              return response.json();
            })
            .then((responseData) => {
              if (!responseData || !responseData.dataItems) {
                return [];
              }
              return Array.isArray(responseData.dataItems)
                ? responseData.dataItems
                : [];
            })
            .catch((error) => {
              console.error(`Error fetching API data for ${aaNo}:`, error);
              return [];
            })
        )
      )
        .then((results) => {
          const combinedData = results.flat().filter((item) => item);
          setApiData(combinedData);
        })
        .catch((error) => {
          console.error("Error in Promise.all:", error);
          setApiData([]);
        })
        .finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, [invoice, navigate]);

  useEffect(() => {
    if (!invoice) return;
    const splitData = (key) =>
      invoice[key]?.split(",").map((val) => val.trim()) || [];
    const invoicesArray = splitData("aaNo").map((_, i) => {
      const remarkFileUrl = splitData("remarkFile")[i];
      return {
        aA_Number: splitData("aaNo")[i],
        imeiNumber: splitData("imeiNo")[i],
        creationDate: invoice.creationDate || "",
        closureDate: invoice.closureDate || "",
        customerName: splitData("customerName")[i],
        serviceType: splitData("serviceType")[i],
        brand: splitData("brand")[i],
        makeModel: splitData("makeModel")[i],
        repairCharges: splitData("repairCharges")[i]
          ? parseFloat(splitData("repairCharges")[i]).toFixed(2)
          : "0.00",
        serviceCharges: splitData("serviceCharges")[i]
          ? parseFloat(splitData("serviceCharges")[i]).toFixed(2)
          : "0.00",
        total: splitData("total")[i]
          ? parseFloat(splitData("total")[i]).toFixed(2)
          : "0.00",
        invoiceStatus: invoice.invoiceStatus || "-",
        sellingPartner: splitData("sellingPartner")[i],
        batchNo: invoice.batchNo || "",
        isChecked: true,
        remarks: splitData("remarks")[i] || "",
        remarkFile: remarkFileUrl
          ? { name: remarkFileUrl.split("/").pop(), url: remarkFileUrl }
          : null,
      };
    });
    setInvoices(invoicesArray);
  }, [invoice]);

  const normalize = (value) =>
    (value ? value.toString().trim() : "").toLowerCase();

  const getRowClassName = useCallback(
    (invoice) => {
      if (!Array.isArray(apiData)) return "row-red";
      const matchedData = apiData.find(
        (item) => item && item.aA_Number === invoice.aA_Number
      );
      if (!matchedData) return "row-red";
      if (
        normalize(matchedData.serviceType) !== normalize(invoice.serviceType) ||
        normalize(matchedData.sellingPartner) !==
          normalize(invoice.sellingPartner) ||
        normalize(matchedData.repairCharges) !==
          normalize(invoice.repairCharges) ||
        normalize(matchedData.serviceCharges) !==
          normalize(invoice.serviceCharges) ||
        normalize(matchedData.total) !== normalize(invoice.total)
      ) {
        return "row-yellow";
      }
      return "row-green";
    },
    [apiData]
  );

  const getDifferencesData = (invoice) => {
    const matchedData = apiData.find(
      (item) => item && item.aA_Number === invoice.aA_Number
    );
    if (!matchedData)
      return [{ field: "AA Number", table: invoice.aA_Number, api: "-" }];
    const differences = [];
    if (normalize(matchedData.serviceType) !== normalize(invoice.serviceType)) {
      differences.push({
        field: "Service Type",
        table: invoice.serviceType || "",
        api: matchedData.serviceType || "",
      });
    }
    if (normalize(matchedData.imeiNumber) !== normalize(invoice.imeiNumber)) {
      differences.push({
        field: "IMEI Number",
        table: invoice.imeiNumber || "",
        api: matchedData.imeiNumber || "",
      });
    }
    if (
      normalize(matchedData.sellingPartner) !==
      normalize(invoice.sellingPartner)
    ) {
      differences.push({
        field: "Selling Partner",
        table: invoice.sellingPartner || "",
        api: matchedData.sellingPartner || "",
      });
    }
    if (
      normalize(matchedData.repairCharges) !== normalize(invoice.repairCharges)
    ) {
      differences.push({
        field: "Repair Charges",
        table: invoice.repairCharges || "",
        api: matchedData.repairCharges || "",
      });
    }
    if (
      normalize(matchedData.serviceCharges) !==
      normalize(invoice.serviceCharges)
    ) {
      differences.push({
        field: "Service Charges",
        table: invoice.serviceCharges || "",
        api: matchedData.serviceCharges || "",
      });
    }
    if (normalize(matchedData.total) !== normalize(invoice.total)) {
      differences.push({
        field: "Total Amount",
        table: invoice.total || "",
        api: matchedData.total || "",
      });
    }
    return differences.length > 0 ? differences : [];
  };

  const handleDelete = (index) => {
    const updatedInvoices = invoices.filter((_, i) => i !== index);
    setInvoices(updatedInvoices);
    if (updatedInvoices.length === 0) {
      navigate("/");
    }
  };

  const handleCheckboxChange = (invoiceId) => {
    setInvoices((prevInvoices) =>
      prevInvoices.map((invoice) =>
        invoice.aA_Number === invoiceId
          ? { ...invoice, isChecked: !invoice.isChecked }
          : invoice
      )
    );
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
        complete: (results) => {
          const row = results.data[0];
          setInvoiceNo(row["Invoice No"] || invoice.invoiceNo || "");
          setInvoiceDate(
            row["Invoice Date"] || invoice.invoiceDate || ""
          );
          setInvoiceAmount(
            row["Invoice Amount"]
              ? row["Invoice Amount"].toString()
              : invoice.invoiceAmount
              ? invoice.invoiceAmount.toString()
              : ""
          );
          setCaseCount(
            row["Case Count"]
              ? row["Case Count"].toString()
              : invoice.caseCount
              ? invoice.caseCount.toString()
              : ""
          );
        },
        error: (err) => {
          console.error("CSV parsing error:", err);
          toast.error("Failed to read CSV file.");
        },
      });
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
      remarkFile: invoice.remarkFile
        ? invoice.remarkFile.name || invoice.remarkFile
        : "",
    }));
    const csv = Papa.unparse({
      fields: headers,
      data: data.map((row) => Object.values(row)),
    });
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, "invoice-list.csv");
  };

  const handleSubmit = async () => {
    try {
      const selected = invoices.filter((inv) => inv.isChecked);
      if (selected.length === 0) {
        toast.error("Please select at least one invoice.");
        return;
      }

      const invoiceAmountStr = invoiceAmount ? invoiceAmount.toString() : "";
      const caseCountStr = caseCount ? caseCount.toString() : "";

      const newErrors = {
        invoiceNo: !invoiceNo.trim(),
        invoiceDate: !invoiceDate,
        invoiceAmount:
          !invoiceAmountStr.trim() ||
          isNaN(parseFloat(invoiceAmountStr)) ||
          parseFloat(invoiceAmountStr) <= 0,
        caseCount:
          !caseCountStr.trim() ||
          isNaN(parseInt(caseCountStr)) ||
          parseInt(caseCountStr) <= 0,
        uploadedFile: !uploadedFile,
        remarks: {},
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

      if (newErrors.uploadedFile) {
        toast.error("Please upload an invoice file.");
      }
      if (newErrors.invoiceNo) {
        toast.error("Invoice No is required.");
      }
      if (newErrors.invoiceDate) {
        toast.error("Invoice Date is required.");
      }
      if (newErrors.invoiceAmount) {
        toast.error("Invoice Amount must be a valid positive number.");
      }
      if (newErrors.caseCount) {
        toast.error("Case Count must be a valid positive number.");
      }
      if (hasRemarkError) {
        toast.error(
          "Remarks are required for all yellow rows (mismatched data)."
        );
      }

      if (
        Object.values(newErrors).some((error) => error === true) ||
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

      const parsedCaseCount = parseInt(caseCountStr);
      if (parsedCaseCount !== selected.length) {
        setFieldErrors((prev) => ({ ...prev, caseCount: true }));
        toast.error(
          "Case Count does not match the number of selected services."
        );
        return;
      }

      const parsedInvoiceAmount = parseFloat(invoiceAmountStr);
      if (Math.abs(parsedInvoiceAmount - parseFloat(finalAmount)) > 0.01) {
        setFieldErrors((prev) => ({ ...prev, invoiceAmount: true }));
        setAmountError("Invoice Amount and Final Amount do not match.");
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
          "Warning: Some invoice fields do not match the original data.\nDo you want to proceed anyway?"
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
      formData.append("Remarks", extract("remarks"));
      formData.append("VendorName", invoice?.vendorName || "");
      formData.append("finalAmount", finalAmount);
      formData.append("TotalRepairCharges", totalRepairCharges.toFixed(2));
      formData.append("TotalServiceCharges", totalServiceCharges.toFixed(2));
      formData.append("BatchNo", invoice?.batchNo || "");
      formData.append("ServiceType", extract("serviceType"));
      formData.append("Brand", extract("brand"));
      formData.append("MakeModel", extract("makeModel"));
      formData.append("RepairCharges", extract("repairCharges"));
      formData.append("ServiceCharges", extract("serviceCharges"));
      formData.append("Total", extract("total"));
      formData.append("SellingPartner", extract("sellingPartner"));
      formData.append(
        "InvoiceStatus",
        uploadedFile ? "Invoice Uploaded" : extract("invoiceStatus")
      );
      formData.append("InvoiceNo", invoiceNo);
      formData.append("InvoiceDate", invoiceDate);
      formData.append("InvoiceAmount", invoiceAmountStr);
      formData.append("CaseCount", caseCountStr);
      formData.append("IsGSTApplied", isGSTApplied ? "true" : "false");
      if (uploadedFile) {
        formData.append("Invoice", uploadedFile, uploadedFile.name);
      }

      // Handle RemarkFile logic
      const invoiceWithFile = selected.find((inv) => inv.remarkFile);

      if (invoiceWithFile) {
        const remark = invoiceWithFile.remarkFile;

        if (remark instanceof File) {
          // If a new file was uploaded via the modal
          formData.append("RemarkFile", remark, remark.name);
        } else if (remark?.url && typeof remark.url === "string") {
          // If the file is coming as URL from previous page
          const fileName = remark.name || "remark-file.pdf";
          try {
            const response = await fetch(remark.url);
            if (response.ok) {
              const blob = await response.blob();
              formData.append("RemarkFile", blob, fileName);
            } else {
              // Append null silently if fetch fails
              formData.append("RemarkFile", null);
            }
          } catch (err) {
            // Do not toast error, just append null
            formData.append("RemarkFile", null);
          }
        } else {
          // No valid file or URL
          formData.append("RemarkFile", null);
        }
      } else {
        // No invoiceWithFile case
        formData.append("RemarkFile", null);
      }

      setIsLoading(true);
      const response = await fetch(`${BASE_URL}/SaveApprovalBatchData`, {
        method: "POST",
        body: formData,
      });
      const result = await response.json();
      setIsLoading(false);

      if (!response.ok) {
        toast.error("Error submitting batch. Check the payload or try again.");
        return;
      }

      toast.success("Batch submitted successfully.");
      navigate(uploadedFile ? "/approval" : "/");
    } catch (error) {
      console.error("Submission failed:", error);
      setIsLoading(false);
      toast.error("Submission failed. Please check console for details.");
    }
  };

  const handleEdit = (invoice) => {
    setEditingInvoice(invoice);
    setEditValues({
      serviceCharges: invoice.serviceCharges || "0.00",
      repairCharges: invoice.repairCharges || "0.00",
      remarks: invoice.remarks || "",
      file: invoice.remarkFile instanceof File ? invoice.remarkFile : null,
      fileName:
        invoice.remarkFile && typeof invoice.remarkFile === "object"
          ? invoice.remarkFile.name
          : invoice.remarkFile || "",
    });
    setShowEditModal(true);
  };

  const handleSaveEdit = () => {
    if (!editingInvoice) return;

    const parsedServiceCharges = parseFloat(editValues.serviceCharges);
    const parsedRepairCharges = parseFloat(editValues.repairCharges);
    const remarks = editValues.remarks?.trim() || "";

    if (
      isNaN(parsedServiceCharges) ||
      parsedServiceCharges < 0 ||
      isNaN(parsedRepairCharges) ||
      parsedRepairCharges < 0
    ) {
      toast.error(
        "Service Charges and Repair Charges must be valid non-negative numbers."
      );
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

    const formattedServiceCharges = parsedServiceCharges.toFixed(2);
    const formattedRepairCharges = parsedRepairCharges.toFixed(2);
    const formattedTotal = (parsedServiceCharges + parsedRepairCharges).toFixed(
      2
    );

    setInvoices((prevInvoices) =>
      prevInvoices.map((invoice) =>
        invoice.aA_Number === editingInvoice.aA_Number
          ? {
              ...invoice,
              serviceCharges: formattedServiceCharges,
              repairCharges: formattedRepairCharges,
              total: formattedTotal,
              remarks: remarks,
              remarkFile: editValues.file
                ? editValues.file
                : editValues.fileName
                ? { name: editValues.fileName, url: editValues.fileName }
                : null,
            }
          : invoice
      )
    );
    setFieldErrors((prev) => ({
      ...prev,
      remarks: { ...prev.remarks, [editingInvoice.aA_Number]: false },
    }));
    setShowEditModal(false);
    setEditingInvoice(null);
    setEditValues({
      serviceCharges: "",
      repairCharges: "",
      remarks: "",
      file: null,
      fileName: "",
    });
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditValues((prev) => ({ ...prev, [name]: value }));
    if (name === "remarks" && editingInvoice) {
      setFieldErrors((prev) => ({
        ...prev,
        remarks: { ...prev.remarks, [editingInvoice.aA_Number]: !value.trim() },
      }));
    }
  };

  const handleCloseModal = () => {
    setShowEditModal(false);
    setEditingInvoice(null);
    setEditValues({
      serviceCharges: "",
      repairCharges: "",
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

  const handleRemarkChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setEditValues((prev) => ({
        ...prev,
        file,
        fileName: file.name,
      }));
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
              {invoice?.batchNo && (
                <div className="fw-semibold">
                  <span>Batch No: </span>
                  <span className="text-primary">
                    {invoice.batchNo}
                  </span>
                </div>
              )}
              {invoice?.vendorName && (
                <div className="fw-semibold">
                  <span>Vendor: </span>
                  <span className="text-success">
                    {invoice.vendorName}
                  </span>
                </div>
              )}
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
                onChange={(e) => {
                  handleFileChange(e);
                  setFieldErrors((prev) => ({ ...prev, uploadedFile: false }));
                }}
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
          {fieldErrors.uploadedFile && (
            <div className="text-danger mb-3" style={{ fontSize: "14px" }}>
              Please upload an invoice file.
            </div>
          )}

          <div
            className="table-container mt-3"
            style={{ overflowX: "auto", overflowY: "auto" }}
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
                  <th style={{ whiteSpace: "nowrap" }}>AA No</th>
                  <th style={{ whiteSpace: "nowrap" }}>IMEI No</th>
                  <th style={{ whiteSpace: "nowrap" }}>Creation Date</th>
                  <th style={{ whiteSpace: "nowrap" }}>Closure Date</th>
                  <th style={{ whiteSpace: "nowrap" }}>Customer Name</th>
                  <th style={{ whiteSpace: "nowrap" }}>Service Type</th>
                  <th style={{ whiteSpace: "nowrap" }}>Selling Partner</th>
                  <th style={{ whiteSpace: "nowrap" }}>Brand</th>
                  <th style={{ whiteSpace: "nowrap" }}>Make Model</th>
                  <th style={{ whiteSpace: "nowrap" }}>Repair Charges</th>
                  <th style={{ whiteSpace: "nowrap" }}>Service Charges</th>
                  <th style={{ whiteSpace: "nowrap" }}>Total</th>
                  <th style={{ whiteSpace: "nowrap" }}>Invoice Status</th>
                  <th className="border-end" style={{ whiteSpace: "nowrap" }}>
                    Mismatched Data
                  </th>
                  <th className="border-end" style={{ whiteSpace: "nowrap" }}>
                    Remarks
                  </th>
                  <th className="border-end" style={{ whiteSpace: "nowrap" }}>
                    Remark File
                  </th>
                  <th className="border-end" style={{ whiteSpace: "nowrap" }}>
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {isLoading && (
                  <tr>
                    <td colSpan="20" className="text-center py-3">
                      Validating data...
                    </td>
                  </tr>
                )}
                {!isLoading &&
                  currentInvoices.map((invoice, index) => (
                    <tr
                      key={invoice.id || `${invoice.aA_Number}-${index}`}
                      className={`text-center border-bottom network_td_item ${getRowClassName(
                        invoice
                      )}`}
                      aria-label="Invoice row"
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
                          size={20}
                          className="text-purple-600 review_fa_eye"
                          style={{ cursor: "pointer" }}
                          onClick={() => handleEdit(invoice)}
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
                      <td className="align-middle">
                        {invoice.sellingPartner || "-"}
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
                          {invoice.invoiceStatus || ""}
                        </span>
                      </td>
                      <td className="align-middle">
                        {getDifferencesData(invoice).length > 0
                          ? "Mismatch"
                          : "Valid"}
                        <div
                          className="align-middle position-relative"
                          onMouseEnter={() => setHoveredRow(index)}
                          onMouseLeave={() => setHoveredRow(null)}
                          style={{ cursor: "pointer", position: "relative" }}
                        >
                          {getDifferencesData(invoice).length > 0
                            ? "View Details"
                            : ""}
                          {hoveredRow === index &&
                            getDifferencesData(invoice).length > 0 && (
                              <div
                                style={{
                                  position: "absolute",
                                  top: "100%",
                                  left: "-18%",
                                  transform: "translateX(-50%)",
                                  zIndex: "1000",
                                  backgroundColor: "#ffffff",
                                  border: "1px solid #ddd",
                                  padding: "10px",
                                  boxShadow: "0px 4px 8px rgba(0,0,0,0.3)",
                                  minWidth: "300px",
                                  whiteSpace: "nowrap",
                                }}
                              >
                                <table className="table table-sm table-bordered table-hover mb-0">
                                  <thead>
                                    <tr>
                                      <th className="text-left">Field</th>
                                      <th className="text-left">Excel Data</th>
                                      <th className="text-left">System Data</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {getDifferencesData(invoice).map(
                                      (diff, i) => (
                                        <tr key={i}>
                                          <td className="text-left">
                                            {diff.field}
                                          </td>
                                          <td className="text-left">
                                            {diff.table}
                                          </td>
                                          <td className="text-left">
                                            {diff.api}
                                          </td>
                                        </tr>
                                      )
                                    )}
                                  </tbody>
                                </table>
                              </div>
                            )}
                        </div>
                      </td>
                      <td className="align-middle border-end">
                        <span>
                          {invoice.remarks || "-"}
                          {getRowClassName(invoice) === "row-yellow" &&
                            !invoice.remarks && (
                              <span className="text-danger ms-1">*</span>
                            )}
                        </span>
                      </td>
                      <td className="align-middle border-end">
                        {invoice.remarkFile ? (
                          <a
                            href={invoice.remarkFile.url || invoice.remarkFile}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            View
                          </a>
                        ) : (
                          "-"
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
              <span className="fw-semibold text-muted">
                Total no of selected invoices:
              </span>
              <span className="fw-bold text-dark">{selectedAAno?.length}</span>
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
              <div className="mt-2 ms-2">
                <span className="fw-semibold text-muted">
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
                    checked={isGSTApplied === true}
                    onChange={() => setIsGSTApplied(true)}
                  />
                  <span className="registration_applied_yes">Yes</span>
                </label>
                <span className="mx-1">/</span>
                <label className="registration_kc_radio">
                  <input
                    type="radio"
                    name="gstApplied"
                    checked={isGSTApplied === false}
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
                          !value.trim() || isNaN(value) || parseInt(value) <= 0,
                      }));
                    }}
                    min="0"
                  />
                  {fieldErrors.caseCount && (
                    <div
                      className="text-danger mt-1"
                      style={{ fontSize: "14px" }}
                    >
                      Case Count must be a valid positive number.
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
                          !value.trim() ||
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
                      Invoice Date is required and cannot be a future date.
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
                      const enteredAmount = e.target.value;
                      setInvoiceAmount(enteredAmount);
                      setFieldErrors((prev) => ({
                        ...prev,
                        invoiceAmount:
                          !enteredAmount.trim() ||
                          isNaN(enteredAmount) ||
                          parseFloat(enteredAmount) <= 0,
                      }));
                      if (enteredAmount.trim() && !isNaN(enteredAmount)) {
                        if (
                          Math.abs(
                            parseFloat(enteredAmount) - parseFloat(finalAmount)
                          ) > 0.01
                        ) {
                          setAmountError(
                            "Invoice Amount and final amount do not match."
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
                    <div class="text-danger mt-1" style={{ fontSize: "14px" }}>
                      Invoice Amount must be a valid positive number.
                    </div>
                  )}
                  {amountError && (
                    <div
                      className="text-danger mt-1"
                      style={{ fontSize: "14px" }}
                    >
                      {amountError}
                    </div>
                  )}
                </div>
              </div>
            </form>
          </div>

          <div className="d-flex mt-3 justify-content-center gap-3">
            <button
              onClick={downloadCSV}
              className="btn btn-primary d-flex align-items-center"
              style={{
                backgroundColor: "rgb(248, 238, 255)",
                border: "1px solid #8000d7",
                padding: "10px 50px",
                borderRadius: "8px",
                fontWeight: "500",
                fontSize: "14px",
                color: "#8000d7",
              }}
            >
              <FaDownload />
              <span className="ms-2">Download</span>
            </button>
            <button
              onClick={handleSubmit}
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
              disabled={isLoading}
            >
              {isLoading ? "Submitting..." : "Submit"}
            </button>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      <Modal show={showEditModal} onHide={handleCloseModal} centered size="lg">
        <Modal.Header closeButton style={{ backgroundColor: "#EBF3FF" }}>
          <Modal.Title>
            Edit Invoices (AA No: {editingInvoice?.aA_Number})
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Repair Charges</Form.Label>
              <Form.Control
                type="number"
                name="repairCharges"
                value={editValues.repairCharges}
                onChange={handleEditInputChange}
                min="0"
                step="0.01"
                placeholder="Enter Repair Charges"
                size="lg"
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Service Charges</Form.Label>
              <Form.Control
                type="number"
                name="serviceCharges"
                value={editValues.serviceCharges}
                onChange={handleEditInputChange}
                min="0"
                step="0.01"
                size="lg"
                placeholder="Enter Service Charges"
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Remarks</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="remarks"
                value={editValues.remarks}
                onChange={handleEditInputChange}
                placeholder="Enter Remarks"
                className={
                  fieldErrors.remarks[editingInvoice?.aA_Number]
                    ? "is-invalid"
                    : ""
                }
              />
              {fieldErrors.remarks[editingInvoice?.aA_Number] && (
                <div className="text-danger mt-1" style={{ fontSize: "14px" }}>
                  {" "}
                  Remarks are required for mismatched data.
                </div>
              )}
            </Form.Group>
          
            <Form.Group controlId="formFile" className="mb-3">
              <Form.Label
                className="btn btn-secondary mb-0"
                style={{
                  backgroundColor: "#8000d7",
                  border: "none",
                }}
                onClick={() => modalFileInputRef.current.click()}
              >
                Upload File
              </Form.Label>

              <Form.Control
                type="file"
                id="fileUpload"
                name="uploadedFile"
                onChange={handleRemarkChange}
                style={{ display: "none" }}
                ref={modalFileInputRef}
              />

              {editValues.fileName && (
                <div className="mt-2 text-muted">
                  Selected File: {editValues.fileName}
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
            style={{
              backgroundColor: "#8000d7",
              border: "none",
            }}
          >
            Save
          </Button>
        </Modal.Footer>
      </Modal>

      <style jsx>{`
        .table-container {
          overflow-x: auto;
          overflow-y: auto;
          max-height: 400px;
          width: 100%;
        }
        .network_table {
          min-width: 1200px;
        }
        .network_table th,
        .network_table td {
          padding: 2px;
          vertical-align: top;
        }
        .vendore_invoice_status {
          display: inline-block;
          white-space: nowrap;
        }
        .page-info {
          margin-top: 1rem;
          font-weight: 500;
        }
        .row-red {
          background-color: #ffe6e6;
          color: #d32f2f;
        }
        .row-yellow {
          background-color: #fff9c4;
        }
        .row-green {
          background-color: #e8f5e9;
        }
      `}</style>
    </div>
  );
};

export default RejectedCasePage
