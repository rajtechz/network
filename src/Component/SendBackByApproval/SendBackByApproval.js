import React, { useState, useEffect, useRef } from "react";
import { FaFilePdf, FaEye, FaSearch, FaRegCalendarAlt } from "react-icons/fa";
import { Dropdown, Table, Button } from "react-bootstrap";
import { FaChevronDown } from "react-icons/fa";
import {
  BASE_URL,
  GetAllApprovalinvoicefromSubmit,
  updateInvoiceStatusNetworkForApproved,
} from "../../api/api";
import { toast, ToastContainer } from "react-toastify";
import pdfimage from "../images/pdf_downlaod.png";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";

function SendBackByApproval() {
    const navigate = useNavigate();
  const [vendorSearch, setVendorSearch] = useState("");
  const [searchInvoiceNo, setSearchInvoiceNo] = useState("");
  const [batchSearch, setBatchSearch] = useState("");
  const [selectedDate, setSelectedDate] = useState(null);
  const dateInputRef = useRef(null);
  const [invoices, setInvoices] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const { user } = React.useContext(AuthContext);
  const handleIconClick = () => {
    dateInputRef.current?.setFocus();
  };

  // useEffect(() => {
  //   const fetchData = async () => {
  //     try {
  //       const response = await GetAllApprovalinvoicefromSubmit();
  //       console.log("API Response:", response);
  //       if (response?.dataitems) {
  //         setInvoices(response.dataitems);
  //       } else {
  //         toast.error("No data received from API");
  //       }
  //     } catch (error) {
  //       console.error("Failed to fetch approval batch data:", error);
  //       toast.error("Failed to fetch data");
  //     }
  //   };
  //   fetchData();
  // }, []);
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${BASE_URL}/GetAllBackPartialData`);
        const result = await response.json();
        if (result.status) {
          const sendBackData = result.data.filter(item => item.type === 'Send Back');
          setInvoices(sendBackData);
        } else {
          toast.error('Failed to fetch data.');
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('An error occurred while fetching data.');
      }
    };

    fetchData();
  }, []);

  const formatDate = (dateTimeStr) => {
    // Handle null, undefined, or empty string
    if (!dateTimeStr || typeof dateTimeStr !== "string") {
      console.warn("Invalid date input:", dateTimeStr);
      return "--";
    }

    // Case 1: Already in DD/MM/YYYY or DD-MM-YYYY
    if (/^\d{2}[/-]\d{2}[/-]\d{4}$/.test(dateTimeStr)) {
      return dateTimeStr.replace(/\//g, "-");
    }

    // Case 2: YYYY-MM-DD format
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateTimeStr)) {
      try {
        const date = new Date(dateTimeStr);
        if (isNaN(date.getTime())) {
          console.warn("Invalid YYYY-MM-DD date:", dateTimeStr);
          return "--";
        }
        return date.toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        });
      } catch (e) {
        console.warn("Error parsing YYYY-MM-DD date:", dateTimeStr, e);
        return "--";
      }
    }

    // Case 3: Custom format like "2025 15:37:37-04-21"
    if (/\d{4}\s+\d{2}:\d{2}:\d{2}-\d{2}-\d{2}/.test(dateTimeStr)) {
      try {
        const [year, timeAndDate] = dateTimeStr.split(" ");
        const [, , dayMonth] = timeAndDate.split(":");
        const [, month, day] = dayMonth.split("-");
        const formattedDate = `${day}-${month}-${year}`;
        // Validate the constructed date
        const date = new Date(`${year}-${month}-${day}`);
        if (isNaN(date.getTime())) {
          console.warn("Invalid custom format date:", dateTimeStr);
          return "--";
        }
        return formattedDate;
      } catch (e) {
        console.warn("Error parsing custom format date:", dateTimeStr, e);
        return "--";
      }
    }

    // Fallback for any other format: Try parsing with Date
    try {
      const date = new Date(dateTimeStr);
      if (isNaN(date.getTime())) {
        console.warn("Unrecognized date format:", dateTimeStr);
        return "--";
      }
      return date.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    } catch (e) {
      console.warn("Error parsing date with Date object:", dateTimeStr, e);
      return "--";
    }
  };

  // Format Date object to DD-MM-YYYY
  const formatDateObject = (date) => {
    if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
      return "";
    }
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  // Filter invoices based on search inputs
  const filteredInvoices = invoices.filter((invoice) => {
    const vendorMatch = vendorSearch
      ? invoice.vendorName?.toLowerCase().includes(vendorSearch.toLowerCase())
      : true;
    const invoiceNoMatch = searchInvoiceNo
      ? invoice.invoiceNo?.toLowerCase().includes(searchInvoiceNo.toLowerCase())
      : true;
    const batchMatch = batchSearch
      ? String(invoice.batchNo).includes(batchSearch)
      : true;
    const dateMatch = selectedDate
      ? formatDate(invoice.creationDate) === formatDateObject(selectedDate)
      : true;
    return vendorMatch && invoiceNoMatch && batchMatch && dateMatch;
  });

  // Reset currentPage when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [vendorSearch, searchInvoiceNo, batchSearch, selectedDate]);

  // Pagination
  const itemsPerPage = 8;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentInvoices = filteredInvoices.slice(
    indexOfFirstItem,
    indexOfLastItem
  );
  const totalPages = Math.ceil(filteredInvoices.length / itemsPerPage);

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status?.toLowerCase()) {
      case "batch":
      case "hold":
        return "batch_badge_orange";
      case "approved":
        return "approved_badge_green";
      case "submitted":
        return "submitted_badge_red";
      case "invoice":
        return "invoice_badge_blue";
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
      case "bank":
        return "bank_badge";
      default:
        return "badge-gray";
    }
  };
  const invoiceOptions = ["Approve", "Reject",];

const handleInvoiceStatusChange = async (index, newStatus) => {
  const globalIndex = indexOfFirstItem + index;
  const selectedInvoice = filteredInvoices[globalIndex];
  const batchNo = selectedInvoice?.batchNo;

  try {
    const response = await updateInvoiceStatusNetworkForApproved({
      batchNo,
      invoiceStatus: newStatus,
    });

    setInvoices((prev) =>
      prev.map((item) =>
        item.batchNo === batchNo
          ? {
              ...item,
              invoiceStatus: newStatus,
              financeStatus:
                newStatus === "Approved" ? "Submitted" : item.financeStatus,
            }
          : item
      )
    );

    toast.success("Invoice status updated successfully!");

    if (newStatus === "Approve") {
      navigate("/approvalBatchPage", {
        state: { invoice: selectedInvoice },
      });
    }
  } catch (err) {
    console.error("Failed to update invoice status:", err);
    toast.error("Failed to update invoice status");
  }
};

  return (
         <div className="container mt-4">
            <div className="netwrok_table_main_content">
              <div className="d-flex justify-content-between align-items-center network_filter_div">
                <h5 className="fw-bold m-0">Send Back Approval Data</h5>
              </div>
              <div className="table-responsive mt-3">
                <div className="d-flex justify-content-between network_filter_div">
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
                        onChange={(e) => setSearchInvoiceNo(e.target.value)}
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
                        placeholder="Search by Batch No"
                        value={batchSearch}
                        onChange={(e) => setBatchSearch(e.target.value)}
                        style={{ borderLeft: "none", boxShadow: "none" }}
                      />
                    </div>
                  </div>
                  <div className="d-flex justify-content-between all_search_input">
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
                <Table className="bg-white text-center border-0 network_table">
                  <thead style={{ backgroundColor: "#EEF4FF" }}>
                    <tr className="text-dark fw-semibold table_th_border">
                      <th className="border-start" style={{ whiteSpace: "nowrap" }}>
                        View
                      </th>
                      <th style={{ whiteSpace: "nowrap" }}>Batch no</th>
                      <th style={{ whiteSpace: "nowrap" }}>Vendor Name</th>
                      <th style={{ whiteSpace: "nowrap" }}>Case Count</th>
                      <th style={{ whiteSpace: "nowrap" }}>Creation Date</th>
                      <th style={{ whiteSpace: "nowrap" }}>Closure Date</th>
                      <th style={{ whiteSpace: "nowrap" }}>Total Repair Charges</th>
                      <th style={{ whiteSpace: "nowrap" }}>
                        Total Service Charges
                      </th>
                      <th style={{ whiteSpace: "nowrap" }}>Total</th>
                      <th style={{ whiteSpace: "nowrap" }}>Remarks</th>
                      <th>Invoice</th>
                      {/* <th style={{ whiteSpace: "nowrap" }}>Invoice Status</th> */}
                    </tr>
                  </thead>
                  <tbody>
                    {currentInvoices.length > 0 ? (
                      currentInvoices.map((invoice, index) => (
                        <tr
                          key={invoice.id || `${invoice.batchNo}-${index}`}
                          className="text-center border-bottom network_td_item"
                        >
                          <td className="border-start align-middle cursor-pointer">
                            <FaEye
                              size={20}
                              className="text-purple review_fa_eye"
                              onClick={() => {
                                navigate("/sendBackdetailPage", {
                                  state: { invoice: invoice },
                                });
                              }}
                            />
                          </td>
                          <td className="align-middle">
                            {invoice.batchNo || "--"}
                          </td>
                          <td className="align-middle">
                            {invoice.vendorName || "--"}
                          </td>
                          <td className="align-middle">
                            {invoice.caseCount || "--"}
                          </td>
                          <td className="align-middle">
                            {formatDate(invoice.creationDate)}
                          </td>
                          <td className="align-middle">
                            {formatDate(invoice.closureDate) || "--"}
                          </td>
                          <td className="align-middle">
                            {invoice.totalRepairCharges || "--"}
                          </td>
                          <td className="align-middle">
                            {invoice.totalServiceCharges || "--"}
                          </td>
                          <td className="align-middle">
                            {invoice.total
                              ? `${invoice.total
                                .split(",")
                                .map((val) => parseFloat(val.trim()))
                                .reduce(
                                  (acc, num) => acc + (isNaN(num) ? 0 : num),
                                  0
                                )
                                .toLocaleString()}`
                              : "--"}
                          </td>
                          <td
                            className="align-middle"
                            style={{ whiteSpace: "nowrap" }}
                          >
                            {invoice.remarks
                              ? invoice.remarks.split(" ").slice(0, 3).join(" ") +
                              (invoice.remarks.split(" ").length > 3 ? "..." : "")
                              : "No remark"}
                          </td>
    
                          <td className="align-middle">
                            {invoice.invoice ? (
                              <a
                                href={invoice.invoice}
                                target="_blank"
                                rel="noopener noreferrer"
                                download
                              >
                                <img
                                  src={pdfimage}
                                  alt="Download PDF"
                                  style={{ height: "24px", cursor: "pointer" }}
                                />
                              </a>
                            ) : (
                              "--"
                            )}
                          </td>
                          {/* <td className="align-middle">
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
                              <span
                                className={`custom-dropdown-toggle network_table_approve ${getStatusBadgeClass(
                                  invoice.invoiceStatus
                                )}`}
                              >
                                {invoice.invoiceStatus}
                              </span>
                            )}
                          </td> */}
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="12" className="text-center py-4">
                          No data available
                        </td>
                      </tr>
                    )}
                  </tbody>
                </Table>
              </div>
              <div className="d-flex justify-content-between align-items-center pagination-container network_previous">
                <button
                  className="network_previous"
                  onClick={handlePrevPage}
                  disabled={currentPage === 1}
                >
                  Previous
                </button>
                <span className="page-info">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  className="network_previous"
                  onClick={handleNextPage}
                  disabled={currentPage === totalPages}
                >
                  Next
                </button>
              </div>
            </div>
          </div>
  )
}

export default SendBackByApproval