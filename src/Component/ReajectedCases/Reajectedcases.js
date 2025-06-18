import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate
import Header from "../Header/header";
import { IoFilterSharp } from "react-icons/io5";
import { FaFilePdf } from "react-icons/fa";
import { Dropdown, Table, Button } from "react-bootstrap";
import { FaChevronDown, FaEye } from "react-icons/fa";
import { FaSearch } from "react-icons/fa";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { FaRegCalendarAlt } from "react-icons/fa";
import { FaPlus } from "react-icons/fa";
import { FaCirclePlus } from "react-icons/fa6";
import pdf_img from "../images/pdf_downlaod.png";
import random_pdf from "../images/dummy-pdf_2.pdf";
import {
  GetAllRejectedlBatchDatafromSubmit,
  updateBatchInvoiceStatus,
  updateBatchFinanceStatus,
} from "../../api/api";
import { Circles } from "react-loader-spinner";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import RejectPopUp from "./RejectPopUp";
import { IconButton } from "@mui/material";

function Reajectedcases() {
  const navigate = useNavigate(); // Initialize navigate
  const [invoicesData, setInvoicesData] = useState([]);
  const [vendorSearch, setVendorSearch] = useState("");
  const [srnSearch, setSrnSearch] = useState("");
  const [searchInvoiceNo, setSeachInvoiceNo] = useState("");
  const [batchSearch, setBatchSearch] = useState("");
  const [selectedDate, setSelectedDate] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRowData, setSelectedRowData] = useState(null);
  const [showHoldModal, setShowHoldModal] = useState(false);
  const itemsPerPage = 8;
  const dateInputRef = useRef(null);
  const [loading, setLoading] = useState(false);

  const invoiceOptions = [
    "Invoice",
    "Approved",
    "Hold",
    "Rejected",
    "Submitted",
    "Partial Approved",
    "Partial Finalized",
  ];
  const financeOptions = [
    "Paid",
    "Approved",
    "Hold",
    "Query",
    "Validate",
    "Payment Scheduled",
    "Partial Payment",
    "Bank Reject",
    "Rejected",
  ];

  const vendorList = Array.isArray(invoicesData)
    ? invoicesData.map(({ vendorName, srnNo }) => ({ vendorName, srnNo }))
    : [];

  const getStatusBadgeClass = (status) => {
    switch (status.toLowerCase()) {
      case "batch":
        return "batch_badge_orange";
      case "approved":
        return "approved_badge_green";
      case "submitted":
        return "submitted_badge_red";
      case "invoice":
        return "invoice_badge_blue";
      case "hold":
        return "batch_badge";
      case "rejected":
        return "rejected_badge_red";
      case "paid":
        return "paid_badge_red";
      case "query":
        return "query_badge_red";
      case "partial payment":
        return "partial_badge_red";
      case "partial approved":
        return "partial_approved_badge_red";
      case "bank reject":
        return "bank_badge_red";
      default:
        return "badge-gray";
    }
  };

  const handleIconClick = () => {
    dateInputRef.current?.setFocus();
  };

  const handleViewRow = (invoice) => {
    navigate("/reajectedcasesPage", { state: { invoice } });
  };

  const handleNext = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const handlePrevious = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const filteredInvoices = Array.isArray(invoicesData)
    ? invoicesData.filter((inv) => {
        if (!inv.invoiceDate) return false;
        const invoiceDateObj = new Date(inv.invoiceDate);

        const vendorName = inv.vendorName?.toLowerCase() || "";
        const srnNo = inv.srnNo?.toLowerCase() || "";
        const batchNo = inv.batchNo?.toLowerCase() || "";
        const financeStatus = inv.financeStatus?.toLowerCase() || "";
        const invoiceNumber = inv.invoiceNumber?.toLowerCase() || "";

        const vendorMatch = vendorName.includes(vendorSearch.toLowerCase());
        const srnMatch = srnNo.includes(srnSearch.toLowerCase());
        const batchMatch = batchNo.includes(batchSearch.toLowerCase());
        const invoiceNoMatch = invoiceNumber.includes(
          searchInvoiceNo.toLowerCase()
        );

        const dateMatch = selectedDate
          ? invoiceDateObj.toDateString() === selectedDate.toDateString()
          : true;

        return (
          vendorMatch && srnMatch && batchMatch && dateMatch && invoiceNoMatch
        );
      })
    : [];

  useEffect(() => {
    setCurrentPage(1);
  }, [vendorSearch, srnSearch, batchSearch, selectedDate, searchInvoiceNo]);

  const totalPages = Math.ceil(filteredInvoices.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentInvoices = filteredInvoices.slice(
    indexOfFirstItem,
    indexOfLastItem
  );

  const handleInvoiceStatusChange = async (index, newStatus) => {
    const globalIndex = indexOfFirstItem + index;
    const selectedInvoice = invoicesData[globalIndex];
    const batchNo = selectedInvoice?.batchNo;

    try {
      const reason = newStatus === "Rejected" ? "Some rejection reason" : "";

      const response = await updateBatchInvoiceStatus({
        batchNo,
        invoiceStatus: newStatus,
        reason,
      });

      setInvoicesData((prev) =>
        prev.map((item, i) =>
          i === globalIndex
            ? {
                ...item,
                invoiceStatus: newStatus,
                financeStatus: newStatus === "Approved" ? "Approved" : "",
              }
            : item
        )
      );

      toast.success("Invoice status updated successfully!", {
        position: "top-right",
        autoClose: 3000,
      });
    } catch (err) {
      toast.error("Failed to update invoice status.", {
        position: "top-right",
        autoClose: 3000,
      });
    }
  };

  const handleFinanceStatusChange = async (index, newStatus) => {
    const globalIndex = indexOfFirstItem + index;
    const selectedInvoice = invoicesData[globalIndex];
    const batchNo = selectedInvoice?.batchNo;

    try {
      const reason = newStatus === "Rejected" ? "Finance rejected" : "";

      const response = await updateBatchFinanceStatus({
        batchNo,
        financeStatus: newStatus,
        reason,
      });
setInvoicesData((prev) =>
  prev.map((item, i) =>
    i === globalIndex
      ? {
          ...item,
          financeStatus: newStatus,
          invoiceStatus: newStatus !== "Approved" ? "Hold" : item.invoiceStatus,
        }
      : item
  )
);


      toast.success("Finance status updated successfully!", {
        position: "top-right",
        autoClose: 3000,
      });
    } catch (err) {
      toast.error("Failed to update finance status.", {
        position: "top-right",
        autoClose: 3000,
      });
    }
  };

  useEffect(() => {
    const getData = async () => {
      setLoading(true);
      try {
        const data = await GetAllRejectedlBatchDatafromSubmit();
        if (Array.isArray(data.dataItems)) {
          setInvoicesData(data.dataItems);
        } else {
          setInvoicesData([]);
        }
      } catch (err) {
        console.error("Failed to load invoice data", err);
        setInvoicesData([]);
      } finally {
        setLoading(false);
      }
    };

    getData();
  }, []);

  return (
    <div>
      <ToastContainer />
      <div className="container mt-4">
        <div className="netwrok_table_main_content">
          <div className="d-flex justify-content-between  network_filter_div">
            <h5 className="fw-bold m-0">Rejected Cases</h5>
          </div>
          <div className="d-flex justify-content-between  network_filter_div">
            <div className="d-flex justify-content-between align-items-center all_search_input">
              <div
                className="review_batch_seach input-group"
                style={{ maxWidth: "280px" }}
              >
                <div className="fa_search_main">
                  <span className="input-group-text bg-light fasearch">
                    <FaSearch className="text-muted" />
                  </span>
                </div>
                <input
                  type="text"
                  className="form-control bg-light border-start-0"
                  placeholder="Search by Vendor Name"
                  value={vendorSearch}
                  onChange={(e) => setVendorSearch(e.target.value)}
                  style={{ borderLeft: "none", boxShadow: "none" }}
                />
              </div>
              <div
                className="review_batch_seach input-group"
                style={{ maxWidth: "240px" }}
              >
                <div className="fa_search_main">
                  <span className="input-group-text bg-light fasearch">
                    <FaSearch className="text-muted" />
                  </span>
                </div>
                <input
                  type="text"
                  className="form-control bg-light border-start-0"
                  placeholder="Search by Invoice No"
                  value={searchInvoiceNo}
                  onChange={(e) => setSeachInvoiceNo(e.target.value)}
                  style={{ borderLeft: "none", boxShadow: "none" }}
                />
              </div>
              <div
                className="review_batch_seach input-group"
                style={{ maxWidth: "240px" }}
              >
                <div className="fa_search_main">
                  <span className="input-group-text bg-light fasearch">
                    <FaSearch className="text-muted" />
                  </span>
                </div>
                <input
                  type="number"
                  className="form-control bg-light border-start-0"
                  placeholder="Search by Batch No"
                  value={batchSearch}
                  onChange={(e) => setBatchSearch(e.target.value)}
                  style={{ borderLeft: "none", boxShadow: "none" }}
                />
              </div>
            </div>

            <div className="d-flex justify-content-between  all_search_input">
              <div
                className="custom_date_wrapper review_batch_seach"
                style={{ maxWidth: "240px" }}
              >
                <DatePicker
                  ref={dateInputRef}
                  selected={selectedDate}
                  onChange={(date) => setSelectedDate(date)}
                  dateFormat="dd-MM-yyyy"
                  placeholderText="dd-mm-yyyy"
                  className="custom-date-input"
                />
                <span className="calendar-icon" onClick={handleIconClick}>
                  <FaRegCalendarAlt />
                </span>
              </div>
            </div>
          </div>
          {loading ? (
            <div
              className="d-flex justify-content-center align-items-center"
              style={{ height: "200px" }}
            >
              <Circles
                height="60"
                width="60"
                color="#FE850E"
                ariaLabel="circles-loading"
                visible={true}
              />
            </div>
          ) : (
            <div className="table-responsive mt-3">
              <Table className="bg-white text-center border-0 network_table">
                <thead style={{ backgroundColor: "#EEF4FF" }}>
                  <tr className="text-dark fw-semibold table_th_border">
                    <th className="border-start">View</th>
                    <th style={{ whiteSpace: "nowrap" }}>Batch No</th>
                    <th style={{ whiteSpace: "nowrap" }}>Vendor Name</th>
                    <th style={{ whiteSpace: "nowrap" }}>Approval Date</th>
                    <th style={{ whiteSpace: "nowrap" }}>Case Count</th>
                    <th style={{ whiteSpace: "nowrap" }}>Invoice No</th>
                    <th style={{ whiteSpace: "nowrap" }}>Invoice Date</th>
                    <th style={{ whiteSpace: "nowrap" }}>Invoice Amount</th>
                    <th style={{ whiteSpace: "nowrap" }}>Reimbursement</th>
                    <th style={{ whiteSpace: "nowrap" }}>Expense</th>
                    <th style={{ whiteSpace: "nowrap" }}>GST</th>
                    <th style={{ whiteSpace: "nowrap" }}>TDS</th>
                    <th style={{ whiteSpace: "nowrap" }}>Payable</th>
                    <th style={{ whiteSpace: "nowrap" }}>Pdf</th>
                    <th style={{ whiteSpace: "nowrap" }}>Remarks Date</th>
                    <th style={{ whiteSpace: "nowrap" }}>Remarks</th>
                    <th style={{ whiteSpace: "nowrap" }}>Invoice Status</th>
                    <th className="border-end" style={{ whiteSpace: "nowrap" }}>
                      Finance Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {currentInvoices.map((invoice, index) => (
                    <tr
                      key={index}
                      className="text-center border-bottom network_td_item"
                    >
                      <td className="border-start align-middle">
                        <IconButton
                          onClick={() => handleViewRow(invoice)} // Add onClick handler
                          aria-label={`View details for batch ${invoice.batchNo}`}
                        >
                          <FaEye
                            className="text-purple review_fa_eye"
                            style={{ cursor: "pointer" }}
                            size={20}
                          />
                        </IconButton>
                      </td>
                      <td className="align-middle">
                        {invoice.batchNo ?? "--"}
                      </td>
                      <td className="align-middle">
                        {invoice.vendorName ?? "--"}
                      </td>
                      <td className="align-middle">
                        {invoice.approvalDate ?? "--"}
                      </td>
                      <td className="align-middle">
                        {invoice.caseCount ?? "--"}
                      </td>
                      <td className="align-middle">
                        {invoice.invoiceNumber ?? "--"}
                      </td>
                      <td className="align-middle">
                        {invoice.invoiceDate
                          ? new Date(invoice.invoiceDate).toLocaleDateString(
                              "en-GB"
                            )
                          : "--"}
                      </td>
                      <td className="align-middle">
                        {invoice.invoiceAmount ?? "--"}
                      </td>
                      <td className="align-middle">
                        {invoice.reimbursement ?? "--"}
                      </td>
                      <td className="align-middle">
                        {invoice.expense ?? "--"}
                      </td>
                      <td className="align-middle">{invoice.gst ?? "--"}</td>
                      <td className="align-middle">{invoice.tds ?? "--"}</td>
                      <td className="align-middle">
                        {invoice.payable ?? "--"}
                      </td>
                      <td className="align-middle">
                        {invoice.pdf ? (
                          <a
                            href={invoice.pdf}
                            download
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <img
                              src={pdf_img}
                              alt="PDF"
                              style={{ width: "24px", height: "24px" }}
                            />
                          </a>
                        ) : (
                          <a
                            href={random_pdf}
                            download
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <img
                              src={pdf_img}
                              alt="PDF"
                              style={{ width: "24px", height: "24px" }}
                            />
                          </a>
                        )}
                      </td>
                      <td className="align-middle">{invoice.date ?? "--"}</td>
                      <td className="align-middle">{invoice.issue ?? "--"}</td>
                      <td className="align-middle">
                        {invoice.invoiceStatus !== "Approved" ? (
                          <Dropdown className="network_table_main">
                            <Dropdown.Toggle
                              className={`custom-dropdown-toggle network_table_approve ${getStatusBadgeClass(
                                invoice.invoiceStatus
                              )}`}
                            >
                              {invoice.invoiceStatus || "Batch"}{" "}
                              <FaChevronDown className="dropdown-icon" />
                            </Dropdown.Toggle>
                            <Dropdown.Menu className="custom-dropdown-menu">
                              {invoiceOptions.map((status) => (
                                <Dropdown.Item
                                  key={status}
                                  onClick={() =>
                                    handleInvoiceStatusChange(index, status)
                                  }
                                  className="custom-dropdown-item"
                                >
                                  {status}
                                </Dropdown.Item>
                              ))}
                            </Dropdown.Menu>
                          </Dropdown>
                        ) : (
                          <div className="network_table_main">
                            <span
                              className={`custom-dropdown-toggle network_table_approve ${getStatusBadgeClass(
                                invoice.invoiceStatus
                              )}`}
                            >
                              {invoice.invoiceStatus}
                            </span>
                          </div>
                        )}
                      </td>
                      <td className="align-middle border-end">
                        <div className="network_table_main">
                          <span
                            className={`custom-dropdown-toggle network_table_approve ${
                              invoice.financeStatus
                                ? getStatusBadgeClass(invoice.financeStatus)
                                : ""
                            }`}
                          >
                            {invoice.financeStatus || "--"}
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          )}
          <div className="d-flex justify-content-between align-items-center pagination-container network_previous">
            <button
              className="network_previous"
              onClick={handlePrevious}
              disabled={currentPage === 1}
            >
              Previous
            </button>
            <span className="page-info">
              Page {currentPage} of {totalPages}
            </span>
            <button
              className="network_previous"
              onClick={handleNext}
              disabled={currentPage === totalPages}
            >
              Next
            </button>
          </div>
        </div>
      </div>
      <RejectPopUp
        show={showHoldModal}
        handleClose={() => setShowHoldModal(false)}
        selectedData={selectedRowData}
      />
    </div>
  );
}

export default Reajectedcases;
