import React, { useState, useRef, useEffect } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import Header from "../Header/header";
import { Dropdown, Table } from "react-bootstrap";
import { FaChevronDown, FaEye, FaDownload } from "react-icons/fa";
import "react-datepicker/dist/react-datepicker.css";
import { ToggleButton, ToggleButtonGroup } from "react-bootstrap";
import { FaTrash } from "react-icons/fa";
import { FaUpload } from "react-icons/fa";
// import StatusUpdaterTable from "./status_name";
import Papa from "papaparse";
import { Link, useNavigate } from "react-router-dom";
import { saveAs } from "file-saver";
import { SaveApprovalBatchDataFlow } from "../../api/api";
import StatusUpdaterTable from "./status_name";

const BASE_URL = "https://mintflix.live:8086/api/Auto";

const RejectPopUp = ({ show, handleClose, selectedData }) => {
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
      "Charges Inc GST",
      "Total",
    ];

    const today = new Date().toLocaleDateString("en-GB"); // DD/MM/YYYY

    const data = currentInvoices.map((invoice) => ({
      aaNumber: invoice.aA_Number || "",
      imeiNumber: invoice.imeiNumber || "",
      creationDate: today,
      closureDate: "",
      customerName: invoice.customerName || "",
      serviceType: invoice.serviceType || "",
      brand: invoice.brand || "",
      makeModel: invoice.makeModel || "",
      repairCharges: invoice.repairCharges || "",
      chargesIncGST: invoice.chargesIncGST || "",
      total: invoice.total || "",
    }));

    const csv = Papa.unparse({
      fields: headers,
      data: data.map((row) => Object.values(row)),
    });

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, "invoice-list.csv");
  };

  const handleDownload = (pdfUrl) => {
    if (pdfUrl) {
      // Create a hidden anchor element
      const link = document.createElement("a");
      link.href = pdfUrl;
      link.target = "_blank";
      link.download = ""; // Optional: specify filename or leave empty
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };
  const navigate = useNavigate();
  const [invoices, setInvoices] = useState([]);

  useEffect(() => {
    console.log("this is row data", selectedData);
    if (!selectedData) return;

    const createArrayFromData = (key) => {
      const raw = selectedData[key];
      if (typeof raw === "string") {
        return raw.split(",").map((val) => val.trim());
      } else {
        return [];
      }
    };

    const imeiArr = createArrayFromData("imeiNo");
    const customerArr = createArrayFromData("customerName");
    const serviceArr = createArrayFromData("serviceType");
    const brandArr = createArrayFromData("brand");
    const modelArr = createArrayFromData("makeModel");
    const repairArr = createArrayFromData("repairCharges");
    const gstArr = createArrayFromData("chargesInclGST");
    const totalArr = createArrayFromData("total");

    const length = Math.max(
      imeiArr.length,
      customerArr.length,
      serviceArr.length,
      brandArr.length,
      modelArr.length,
      repairArr.length,
      gstArr.length,
      totalArr.length
    );

    const invoicesArray = Array.from({ length }).map((_, i) => ({
      aA_Number: `--`, // You can modify this if AA No becomes available
      imeiNumber: imeiArr[i] || "",
      creationDate: selectedData.creationDate || "",
      closureDate: selectedData.closureDate || "",
      customerName: customerArr[i] || "",
      serviceType: serviceArr[i] || "",
      brand: brandArr[i] || "",
      makeModel: modelArr[i] || "",
      repairCharges: repairArr[i] || "",
      chargesIncGST: gstArr[i] || "",
      total: totalArr[i] || "",
      invoiceStatus: selectedData.invoiceStatus || "",
      sellingPartner: "",
      batchNo: selectedData.batchNo || "",
      isChecked: true,
    }));

    setInvoices(invoicesArray);
  }, [selectedData]);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const totalPages = Math.ceil(invoices.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentInvoices = invoices.slice(indexOfFirstItem, indexOfLastItem);
  const selectedAAno = invoices.filter((invoice) => invoice.isChecked);
  const [isGSTApplied, setIsGSTApplied] = useState(false);

  // Calculate Gross Amount
  // Calculate Repair Charges separately
  const repairAmount = currentInvoices.reduce((total, invoice) => {
    const cleanedAmount = invoice.repairCharges?.toString().replace(/,/g, "");
    const amount = parseFloat(cleanedAmount);
    return total + (isNaN(amount) ? 0 : amount);
  }, 0);

  const grossAmount = currentInvoices.reduce((total, invoice) => {
    const cleanedAmount = invoice.total?.toString().replace(/,/g, "");
    const amount = parseFloat(cleanedAmount);
    return total + (isNaN(amount) ? 0 : amount);
  }, 0);
  // Calculate Final Amount with optional 18% GST
  const finalAmount = isGSTApplied
    ? (grossAmount * 1.18).toFixed(2)
    : grossAmount.toFixed(2);

  //////////////////// delete funactionality
  const handleDelete = (index) => {
    console.log("Deleting index:", index);
    console.log("Before delete:", invoices);

    const updatedInvoices = invoices.filter((_, i) => i !== index);

    console.log("After delete:", updatedInvoices);
    setInvoices(updatedInvoices);
    if (updatedInvoices.length === 0) {
      handleClose();
    }
  };
  const fileInputRef = useRef();
  const [uploadedFile, setUploadedFile] = useState(null); // holds any file
  const [fileType, setFileType] = useState("");
  const [invoiceNo, setInvoiceNo] = useState("");
  const [caseCount, setCaseCount] = useState("");
  const [invoiceDate, setInvoiceDate] = useState("");
  const [invoiceAmount, setInvoiceAmount] = useState("");
  const [amountError, setAmountError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({
    invoiceNo: false,
    invoiceDate: false,
    invoiceAmount: false,
    caseCount: false,
  });
  const [invoiceData, setInvoiceData] = useState({
    invoiceNo: "",
    invoiceDate: "",
    invoiceAmount: "",
  });

  const handleClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const extension = file.name.split(".").pop().toLowerCase();
    setFileType(extension);
    setUploadedFile(file);

    if (extension === "csv") {
      Papa.parse(file, {
        header: true,
        complete: (results) => {
          const row = results.data[0];
          setInvoiceData({
            invoiceNo: row["Invoice No"] || "",
            invoiceDate: row["Invoice Date"] || "",
            invoiceAmount: row["Invoice Amount"] || "",
          });
        },
        error: (err) => {
          console.error("CSV parsing error:", err);
          alert("Failed to read CSV file.");
        },
      });
    } else {
      // just store non-csv files, no parsing
      console.log("Non-CSV file uploaded:", file.name);
    }
  };

  const handleSubmit = async () => {
    try {
      const selected = invoices.filter((inv) => inv.isChecked);
      if (selected.length === 0) {
        alert("Please select at least one invoice.");
        return;
      }

      // If no file is uploaded, ask for confirmation
      if (!uploadedFile) {
        const confirmProceed = window.confirm(
          "No invoice file uploaded. Do you want to continue without uploading?"
        );
        if (!confirmProceed) {
          // User wants to cancel and upload
          return;
        }
      }

      // Validate only if a file is uploaded
      if (uploadedFile) {
        const newErrors = {
          invoiceNo: !invoiceNo,
          invoiceDate: !invoiceDate,
          invoiceAmount: !invoiceAmount,
          caseCount: !caseCount,
        };

        setFieldErrors(newErrors);

        const hasError = Object.values(newErrors).some(Boolean);
        if (hasError) {
          alert("Please fill all required invoice fields.");
          return;
        }

        if (parseFloat(invoiceAmount) !== parseFloat(finalAmount)) {
          alert("Invoice Amount and Final Amount do not match.");
          return;
        }

        if (parseInt(caseCount) !== selectedAAno.length) {
          alert("Case Count does not match the number of selected services.");
          return;
        }
      }

      const formData = new FormData();
      const extract = (key) =>
        selected.map((item) => item[key] || "").join(", ");
      formData.append("AANo", extract("aA_Number"));
      formData.append("IMEINo", extract("imeiNumber"));
      formData.append("CreationDate", extract("creationDate"));
      formData.append("ClosureDate", extract("closureDate"));
      formData.append("CustomerName", extract("customerName"));
      formData.append("VendorName", selectedData?.vendorName);
      formData.append("finalAmount", finalAmount);
      formData.append("BatchNo", selectedData?.batchNo || "");
      formData.append("ServiceType", extract("serviceType"));
      formData.append("Brand", extract("brand"));
      formData.append("MakeModel", extract("makeModel"));
      formData.append("RepairCharges", extract("repairCharges"));
      formData.append("ChargesInclGST", extract("chargesIncGST"));
      formData.append("Total", extract("total"));
      formData.append("SellingPartner", extract("sellingPartner"));
      formData.append(
        "InvoiceStatus",
        uploadedFile ? "Invoice Uploaded" : extract("InvoiceStatus")
      );
      if (uploadedFile) {
        formData.append("Invoice", uploadedFile, uploadedFile.name);
      }
      formData.append("InvoiceNo", invoiceNo || "");
      formData.append("InvoiceDate", invoiceDate || "");
      formData.append("InvoiceAmount", invoiceAmount || "");
      formData.append("CaseCount", caseCount || selected.length.toString());
      formData.append("IsGSTApplied", isGSTApplied ? "true" : "false");

      // Log and send the request
      console.log("FormData payload:");
      for (let [key, value] of formData.entries()) {
        console.log(`${key}:`, value);
      }

      const response = await fetch(
        "https://mintflix.live:8086/api/Auto/SaveApprovalBatchData",
        {
          method: "POST",
          body: formData,
        }
      );

      const result = await response.json();
      console.log("API response:", result);
      if (!response.ok) {
        alert("Error submitting batch. Check the payload or try again.");
        return;
      }

      alert("Batch submitted successfully.");
      navigate(invoiceData.invoiceNo ? "/approval" : "/");
      handleClose();
    } catch (error) {
      console.error("Submission failed:", error);
      alert("Submission failed. Please check console for details.");
    }
  };

  return (
    <Modal
      show={show}
      onHide={handleClose}
      centered
      className="hold_reason_modal batch_popup_modal"
      backdrop="static"
    >
      <Modal.Header
        style={{ backgroundColor: "#e6f0ff" }}
        closeButton
        className="hold_popup_header"
      >
        <Modal.Title>Upload Invoice </Modal.Title>
      </Modal.Header>
      <Modal.Body className="hold_popup_body">
        <div className=" mt-4 ">
          <div className="netwrok_table_main_content ">
            <div className="d-flex justify-content-between align-items-center gap-2 mb-3">
              {/* Left section: Batch No + Vendor Name */}
              <div className="d-flex flex-wrap gap-4 align-items-center">
                {selectedData?.batchNo && (
                  <div className="fw-semibold">
                    <span>Batch No: </span>
                    <span className="text-primary">{selectedData.batchNo}</span>
                  </div>
                )}
                {selectedData?.vendorName && (
                  <div className="fw-semibold">
                    <span>Vendor: </span>
                    <span className="text-success">
                      {selectedData.vendorName}
                    </span>
                  </div>
                )}
              </div>

              {/* Right section: Upload Button */}
              <div className="d-flex gap-2">
                <button
                  className="batch_popup_download"
                  onClick={() => handleDownload(selectedData?.pdf)}
                >
                  <FaDownload /> <span className="ms-2">Download Invoice</span>
                </button>
                {/* <button
                  className="batch_popup_download"
                  onClick={() => {
                    if (selectedData?.pdf) {
                      window.open(selectedData.pdf, "_blank");
                    }
                    const link = document.createElement("a");
                    link.href = selectedData?.pdf;
                    link.setAttribute("download", "invoice.pdf"); // You can change filename here
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                  }}
                >
                  <FaDownload /> <span className="ms-2"> Download Invoice</span>
                </button> */}

                <button className="batch_popup_upload" onClick={handleClick}>
                  <FaUpload /> <span className="ms-2"> Upload Invoice</span>
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

            <div className="text-end uplaod_file_ext_name">
              {fileType && (
                <div style={{ fontWeight: "bold", color: "green" }}>
                  Uploaded File Type: {fileType}
                </div>
              )}
            </div>
            <div className="table-responsive mt-3 ">
              <Table className="bg-white  text-center border-0 network_table">
                <thead style={{ backgroundColor: "#EEF4FF" }}>
                  <tr className="text-dark fw-semibold table_th_border">
                    <th className="border-start">View</th>
                    {/* <th style={{ whiteSpace: "nowrap" }}>AA No</th> */}
                    <th style={{ whiteSpace: "nowrap" }}>IMEI No</th>
                    <th style={{ whiteSpace: "nowrap" }}>Creation Date</th>
                    <th style={{ whiteSpace: "nowrap" }}>Customer Name</th>
                    <th style={{ whiteSpace: "nowrap" }}>Service Type</th>
                    <th style={{ whiteSpace: "nowrap" }}>Brand</th>
                    <th style={{ whiteSpace: "nowrap" }}>Make Model</th>
                    <th style={{ whiteSpace: "nowrap" }}>Repair Charges</th>
                    <th>Total</th>
                    <th style={{ whiteSpace: "nowrap" }}>Invoice Status</th>
                    <th className="border-end" style={{ whiteSpace: "nowrap" }}>
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {currentInvoices.map((invoice, index) => (
                    <tr
                      key={invoice.id || `${invoice.aA_Number}-${index}`} // Unique key using 'id' or fallback to 'aA_Number' + index
                      className="text-center border-bottom network_td_item"
                    >
                      <td className="border-start align-middle">
                        <FaEye
                          className="text-purple review_fa_eye"
                          style={{ cursor: "pointer" }}
                          onClick={() =>
                            navigate("/invoice-template", {
                              state: { aaNumber: invoice.aA_Number }, // ✅ Correct key
                            })
                          }
                        />
                      </td>
                      {/* <td className="align-middle vendor_checkbox">
                        <input
                          type="checkbox"
                          id="cb1"
                          checked={invoice.isChecked || false} // Check if the invoice is selected
                          onChange={() =>
                            handleCheckboxChange(invoice.aA_Number)
                          }
                        />
                      </td> */}

                      {/* <td className="align-middle">
                        {invoice.aA_Number || ""}
                      </td> */}
                      {/* <td className="align-middle">
                        {invoice.batchNo || ""}
                      </td> */}
                      <td className="align-middle">
                        {invoice.imeiNumber || ""}
                      </td>

                      <td className="align-middle">
                        {new Date().toLocaleDateString("en-GB")}
                      </td>

                      <td className="align-middle">
                        {invoice.customerName || ""}
                      </td>
                      <td className="align-middle">
                        {invoice.serviceType || ""}
                      </td>
                      {/* <td className="align-middle">{invoice.vehicleNo || '--'}</td> */}
                      <td className="align-middle">{invoice.brand || ""}</td>
                      <td className="align-middle">
                        {invoice.makeModel || ""}
                      </td>
                      <td className="align-middle">
                        {invoice.repairCharges || ""}
                      </td>
                      {/* <td className="align-middle">
                        {invoice.chargesIncGST || ""}
                      </td> */}
                      <td className="align-middle">{invoice.total || ""}</td>

                      <td
                        className="align-middle"
                        style={{ whiteSpace: "nowrap" }}
                      >
                        <span className="vendore_invoice_status px-3 py-1 rounded-pill">
                          {invoice.invoiceStatus || ""}
                        </span>
                      </td>
                      <td
                        className="align-middle border-end pointer-cursor"
                        style={{ cursor: "pointer" }}
                      >
                        <FaTrash onClick={() => handleDelete(index)} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
            <div className="d-flex justify-content-between align-items-center">
              <div
                className="batch_popup_gross_ammount p-3 d-inline-block "
                style={{ backgroundColor: "#eef4ff", marginTop: "1rem" }}
              >
                <span className="fw-semibold text-secondary me-2">
                  Total no of selected Service :
                </span>
                <span className="fw-bold text-dark">{selectedAAno.length}</span>
              </div>
              <div
                className="batch_popup_gross_ammount"
                style={{ backgroundColor: "#eef4ff", marginTop: "1rem" }}
              >
                <div className="text-start batch_popup_amount">
                  <div className="fw-bold batch_gross">Repair Charges</div>
                  <div className="batch_amount_to_fix">
                    ₹ {repairAmount.toFixed(2)}
                  </div>
                </div>

                <div className="text-start batch_popup_amount">
                  <div className="fw-bold batch_gross">Gross Amount</div>
                  <div className="batch_amount_to_fix">
                    ₹ {grossAmount.toFixed(2)}
                  </div>
                </div>
                <div className="text-start batch_popup_amount">
                  <div className="fw-bold batch_gross">Final Amount</div>
                  <div className="batch_amount_to_fix">₹ {finalAmount}</div>
                  <div className=" batch_gross ms-3">
                    Charges ({isGSTApplied ? "incl GST 18%" : "excl GST"})
                  </div>
                </div>
              </div>
            </div>
            <div className="d-flex justify-content-between align-items-center border rounded p-3 mt-4">
              <div className="fw-bold ms-2">
                <span>GST</span>
              </div>
              <div className="d-flex gap-3">
                <label className="regestration_kc_radio">
                  <input
                    type="radio"
                    name="kcApplication"
                    id="kcApplicationYes"
                    value="Yes"
                    checked={isGSTApplied === true}
                    onChange={() => setIsGSTApplied(true)}
                  />
                  <span className="regestration_applied_yes">Yes</span>
                </label>
                <span className="mx-1">/</span>
                <label className="regestration_kc_radio">
                  <input
                    type="radio"
                    name="kcApplication"
                    id="kcApplicationNo"
                    value="No"
                    checked={isGSTApplied === false}
                    onChange={() => setIsGSTApplied(false)}
                  />
                  <span className="regestration_applied_yes">No</span>
                </label>
              </div>
            </div>
            <div>
              <form className="mt-6 invoice_form" style={{ marginTop: "0px" }}>
                <div className="row align-items-center mt-4">
                  <div className="col-md-4 align-items-center">
                    <label className="me-2 fw-semibold w-50">Case Count</label>
                    <input
                      type="text"
                      className={`form-control border-dark ${
                        uploadedFile && fieldErrors.caseCount
                          ? "is-invalid"
                          : ""
                      }`}
                      placeholder="Enter Case Count"
                      value={caseCount}
                      onChange={(e) => setCaseCount(e.target.value)}
                    />
                    {uploadedFile && fieldErrors.caseCount && (
                      <div
                        className="text-danger mt-1"
                        style={{ fontSize: "14px" }}
                      >
                        Case Count is required.
                      </div>
                    )}
                  </div>

                  <div className="col-md-4 align-items-center">
                    <label className="me-2 fw-semibold w-50">Invoice No</label>
                    <input
                      type="text"
                      className={`form-control border-dark ${
                        uploadedFile && fieldErrors.invoiceNo
                          ? "is-invalid"
                          : ""
                      }`}
                      placeholder="Enter Invoice No"
                      value={invoiceNo}
                      onChange={(e) => setInvoiceNo(e.target.value)}
                    />
                    {uploadedFile && fieldErrors.invoiceNo && (
                      <div
                        className="text-danger mt-1"
                        style={{ fontSize: "14px" }}
                      >
                        Invoice No is required.
                      </div>
                    )}
                  </div>

                  <div className="col-md-4 align-items-center">
                    <label className="me-2 fw-semibold w-50">
                      Invoice Date
                    </label>
                    <input
                      type="date"
                      className={`form-control border-dark ${
                        uploadedFile && fieldErrors.invoiceDate
                          ? "is-invalid"
                          : ""
                      }`}
                      value={invoiceDate}
                      onChange={(e) => setInvoiceDate(e.target.value)}
                      max={new Date().toISOString().split("T")[0]} // ⬅️ Set max date to today
                    />
                    {uploadedFile && fieldErrors.invoiceDate && (
                      <div
                        className="text-danger mt-1"
                        style={{ fontSize: "14px" }}
                      >
                        Invoice Date is required.
                      </div>
                    )}
                  </div>

                  <div className="col-md-4 align-items-center">
                    <label className="me-2 fw-semibold w-50">
                      Invoice Amount
                    </label>
                    <input
                      type="text"
                      className={`form-control border-dark ${
                        uploadedFile &&
                        (fieldErrors.invoiceAmount || amountError)
                          ? "is-invalid"
                          : ""
                      }`}
                      placeholder="Enter Invoice Amount"
                      value={invoiceAmount}
                      onChange={(e) => {
                        const enteredAmount = e.target.value;
                        setInvoiceAmount(enteredAmount);

                        if (
                          parseFloat(enteredAmount) !== parseFloat(finalAmount)
                        ) {
                          setAmountError(
                            "Invoice Amount and Final Amount do not match."
                          );
                        } else {
                          setAmountError("");
                        }
                      }}
                    />
                    {uploadedFile && fieldErrors.invoiceAmount && (
                      <div
                        className="text-danger mt-1"
                        style={{ fontSize: "14px" }}
                      >
                        Invoice Amount is required.
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

            <div className="d-flex mt-4  justify-content-center align-items-center flex-wrap gap-3">
              <button
                onClick={downloadCSV}
                className="btn btn-primary d-flex align-items-center"
                style={{
                  backgroundColor: "rgb(248 238 255)",
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
                }}
              >
                <span className="ms-2">Submit</span>
              </button>
            </div>
          </div>
          <div>
            <StatusUpdaterTable />
          </div>
        </div>
      </Modal.Body>
    </Modal>
  );
};

export default RejectPopUp;
