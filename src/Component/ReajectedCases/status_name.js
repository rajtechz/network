import React, { useState, useEffect, useRef } from "react";
import { Dropdown, Table } from "react-bootstrap";
import { FaEye, FaChevronDown } from "react-icons/fa";
import "bootstrap/dist/js/bootstrap.bundle.min";
import { GetUpdatedStatusData } from "../../api/api";

const StatusUpdaterTable = () => {
  const [invoiceData, setInvoiceData] = useState([]);
  // console.log(invoiceData, "invocieData time");

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "Batch":
        return "batch_badge_orange";
      case "Approved":
        return "approved_badge_green";
      case "approved":
        return "approved_badge_green";
      case "Submitted":
        return "submitted_badge_red";
      case "Invoice":
        return "invoice_badge_blue";
      case "hold":
        return "batch_badge_orange";
      case "Hold":
        return "batch_badge_orange";
      case "Rejected":
        return "rejected_badge_red";
      case "rejected":
        return "rejected_badge_red";
      case "Paid":
        return "paid_badge_red";
        case "paid":
        return "paid_badge_red";
      case "Query":
        return "query_badge_red";
      case "Partial Payment":
        return "partial_badge_red";
        case "Partial Approved":
          return "partial_approved_badge_red";
      case "query":
        return "query_badge_red";
      case "bank":
        return "bank_badge";
      default:
        return "badge-gray";
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const apiData = await GetUpdatedStatusData();
        if (apiData?.status && apiData?.dataItems?.length > 0) {
          setInvoiceData(apiData.dataItems); // 👈 directly using API data
        }
      } catch (error) {
        console.error("Failed to fetch invoice status:", error);
      }
    };

    fetchData();
  }, []);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  const dateInputRef = useRef(null);

  // Define filteredInvoices
  const filteredInvoices = invoiceData; // Add any filtering logic here if needed

  const totalPages = Math.ceil(filteredInvoices.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentInvoices = filteredInvoices.slice(indexOfFirstItem, indexOfLastItem);

  const handleIconClick = () => {
    dateInputRef.current?.setFocus();
  };

  const handleNext = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const handlePrevious = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };


  const formatDate = (dateTimeStr) => {
    if (!dateTimeStr) return "--";
    const [datePart] = dateTimeStr.split(" ");
    const [day, month, year] = datePart.split("-");
    return `${day}/${month}/${year}`;
  };

  const formatTime = (datetimeStr) => {
    if (!datetimeStr) return "--";
  
    try {
      // Extract time from "30-04-2025 15:31:13"
      const timePart = datetimeStr.split(" ")[1]; // Get "15:31:13"
  
      if (!timePart) return "--";
  
      const [hourStr, minuteStr] = timePart.split(":");
      let hour = parseInt(hourStr, 10);
      const minute = minuteStr;
      const ampm = hour >= 12 ? "PM" : "AM";
      hour = hour % 12 || 12; // convert 0 to 12
      return `${hour.toString().padStart(2, '0')}:${minute} ${ampm}`;
    } catch (e) {
      console.error("Error formatting time:", e);
      return "--";
    }
  };
  return (
    <div className="mt-4">
      <div className="border rounded shadow-sm">
        <div
          className="py-3 px-4 text-center text-dark fw-semibold fs-5"
          style={{
            backgroundColor: "#d7e8ff",
            borderTopLeftRadius: 8,
            borderTopRightRadius: 8,
          }}
        >
          <span className="status_name">Status Updater Name</span>
        </div>
        <div className="table-responsive mt-4 mb-4  px-4">
          <Table className="bg-white text-center border-0 network_table">
            <thead style={{ backgroundColor: "#EEF4FF" }}>
              <tr className="text-dark fw-semibold table_th_border">
                <th className="border-start">Batch ID</th>
                <th>Type</th>
                <th>Time</th>
                <th>Date</th>
                <th>Reason</th>
                <th>Before Status</th>
                <th className="border-end">After Status</th>
              </tr>
            </thead>
            <tbody>
              {currentInvoices.map((invoice, index) => (
                <tr
                  key={index}
                  className="text-center border-bottom network_td_item"
                >
                  <td className="border-start align-middle">
                    {invoice.batchId}
                  </td>
                  <td className="align-middle">{invoice.statusName ?? "--"}</td>
                <td className="align-middle">{formatTime(invoice.time)}</td>
                  <td className="align-middle">{formatDate(invoice.date)}</td>
                  <td className="align-middle">{invoice.reason ?? "--"}</td>
                  <td className="align-middle">
                    <span
                      className={`network_table_approve ${getStatusBadgeClass(
                        invoice.beforeStatus ?? "--"
                      )}`}
                    >
                      {invoice.beforeStatus ?? "--"}
                    </span>
                  </td>
                  <td className="align-middle border-end">
                    <span
                      className={`network_table_approve ${getStatusBadgeClass(
                        invoice.afterStatus ?? "--"
                      )}`}
                    >
                      {invoice.afterStatus ?? "--"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
        <div className="d-flex justify-content-between align-items-center pagination-container network_previous">
          <button
            className="network_previous"
            onClick={handlePrevious}
            disabled={currentPage === 1}
          >
            Previous
          </button>
          <span className="page-info ">
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
  );
};

export default StatusUpdaterTable;
