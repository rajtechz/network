import React, { useState, useEffect } from "react";
import Raise_concern_popup from "./raise_concern_popup";
import { FaDownload } from "react-icons/fa";
import { getAllClaimDetailsPrefiled } from "../../api/api";
import { useLocation, useNavigate } from "react-router-dom";

const InvoiceTemplate = () => {
  const navigate = useNavigate();
  const [activeCollapse, setActiveCollapse] = useState("first");

  const toggleCollapse = (section) => {
    setActiveCollapse(activeCollapse === section ? null : section);
  };

  const [showHoldModal, setShowHoldModal] = useState(false);

  const location = useLocation();
  const aaNumber = location.state?.aaNumber;

  console.log(aaNumber, "aaNumber");

  const [claimData, setClaimData] = useState(null);
  console.log(claimData, "claim Data all output");

  useEffect(() => {
    if (!aaNumber) return;

    const fetchAllClaimData = async () => {
      try {
        const result = await getAllClaimDetailsPrefiled(aaNumber);
        console.log("API returned result:", result);

        if (result.success) {
          setClaimData(result.data);
        } else {
          console.error("API failed:", result.message);
        }
      } catch (error) {
        console.error("Error fetching claim details:", error);
      }
    };

    fetchAllClaimData();
  }, [aaNumber]);

  const formatDate = (dateTimeStr) => {
    if (!dateTimeStr) return "--";
    const [datePart] = dateTimeStr.split(" ");
    const [year, month, day] = datePart.split("-"); // Changed order of destructuring
    return `${day}/${month}/${year}`;
  };

  //////////////////////// download here only remark seaction funactiolaity
  const handleDownloadRemarksCSV = () => {
    const data = claimData?.[0];
    if (!data) return;
  
    // CSV headers and row
    const headers = ["Status", "Remark Category", "Date", "Time", "Remarks"];
    const row = [
      data.status || "",
      data.remarkCategory || "",
      formatDate(data.date),
      data.time || "",
      `"${(data.remarks || "").replace(/"/g, '""')}"`, // Escape quotes
    ];
  
    const csvContent =
      headers.join(",") + "\n" + row.join(","); // Single row CSV
  
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
  
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "remark_details.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  return (
    <div>
      {/* <Header></Header> */}
      <div className="invoice_main_div">
        <div className="container-fluid bg-white rounded  p-4 ">
          <div className="d-flex justify-content-center align-items-center invoice_main_heading mb-4">
            <h6 className="fw-semibold mb-0">AA Details</h6>
          </div>
          <div className="d-flex justify-content-between align-items-center invoice_main_heading">
            <h6 className="fw-semibold mb-0">Vendor Name</h6>
            <div className="border rounded px-3 py-1 bg-light small text-muted">
              AA no: <span className="fw-semibold text-dark">{aaNumber}</span>
            </div>
          </div>
          {/* <div
        className="text-center fw-semibold mt-4 py-2 invoice_srn"
        style={{ backgroundColor: "#eef4ff", borderRadius: "8px" }}
      >
        <h6>SRN Information</h6>
      </div> */}
          <div className="row mb-3 align-items-center mt-4">
            {/* --- Section 1 --- */}
            <div className="card invooice_collpase">
              <div
                className={`card-header d-flex justify-content-between align-items-center ${
                  activeCollapse === "first"
                    ? "open_bg text-white"
                    : "close_bg text-dark"
                }`}
                style={{ cursor: "pointer" }}
                onClick={() => toggleCollapse("first")}
              >
                <strong>Customer Details</strong>
                <span className="up_down">
                  {activeCollapse === "first" ? "▲" : "▼"}
                </span>
              </div>

              {activeCollapse === "first" && (
                <div className="collapse_data">
                  <form
                    className="mt-6 invoice_form"
                    style={{ marginTop: "0px" }}
                  >
                    <div className="row align-items-center ">
                      <div className="col-md-4 align-items-center">
                        <label className="me-2 fw-semibold w-50">
                          Customer Name
                        </label>
                        <input
                          type="text"
                          className="form-control border-dark"
                          placeholder="Customer Name"
                          readOnly
                          value={claimData?.[0]?.customerName || ""}
                        />
                      </div>
                      <div className="col-md-4 align-items-center">
                        <label className="me-2 fw-semibold w-50">
                          Primary Contact No
                        </label>
                        <input
                          type="number"
                          className="form-control border-dark"
                          placeholder="Business Type"
                          readOnly
                          value={claimData?.[0]?.primaryContactNo || ""}
                        />
                      </div>
                      {/* <div className="col-md-3 align-items-center">
                      <label className="me-2 fw-semibold w-50">
                        Alternate Contact No
                      </label>
                      <input
                        type="text"
                        className="form-control border-dark"
                        placeholder="Vehicle Type"
                      />
                    </div> */}
                      <div className="col-md-4 align-items-center">
                        <label className="me-2 fw-semibold w-50">
                          Alternate Contact No
                        </label>
                        <input
                          type="text"
                          className="form-control border-dark"
                          placeholder="Vehicle Type"
                          readOnly
                          value={claimData?.[0]?.alternateContactNo || ""}
                        />
                      </div>
                    </div>
                  </form>
                </div>
              )}
            </div>

            {/* --- Section 2 --- */}
            <div className="card invooice_collpase mt-4">
              <div
                className={`card-header d-flex justify-content-between align-items-center ${
                  activeCollapse === "second"
                    ? "open_bg text-white"
                    : "close_bg text-dark"
                }`}
                style={{ cursor: "pointer" }}
                onClick={() => toggleCollapse("second")}
              >
                <strong>Incident Details</strong>
                <span className="up_down">
                  {activeCollapse === "second" ? "▲" : "▼"}
                </span>
              </div>

              {activeCollapse === "second" && (
                <div className="collapse_data">
                  <form
                    className="mt-6 invoice_form"
                    style={{ marginTop: "0px" }}
                  >
                    <div className="row align-items-center ">
                      <div className="col-md-3 align-items-center">
                        <label className="me-2 fw-semibold w-50">Address</label>
                        <input
                          type="text"
                          className="form-control border-dark"
                          placeholder="Customer Name"
                          readOnly
                          value={claimData?.[0]?.address || ""}
                        />
                      </div>
                      <div className="col-md-3 align-items-center">
                        <label className="me-2 fw-semibold w-50">State</label>
                        <input
                          type="text"
                          className="form-control border-dark"
                          placeholder="Business Type"
                          readOnly
                          value={claimData?.[0]?.state || ""}
                        />
                      </div>
                      <div className="col-md-3 align-items-center">
                        <label className="me-2 fw-semibold w-50">City</label>
                        <input
                          type="text"
                          className="form-control border-dark"
                          placeholder="Vehicle Type"
                          readOnly
                          value={claimData?.[0]?.city || ""}
                        />
                      </div>
                      <div className="col-md-3 align-items-center">
                        <label className="me-2 fw-semibold w-50">
                          Pin code
                        </label>
                        <input
                          type="number"
                          className="form-control border-dark"
                          placeholder="Vehicle Type"
                          readOnly
                          value={claimData?.[0]?.pincode || ""}
                        />
                      </div>
                    </div>
                    <div className="row align-items-center mt-4">
                      <div className="col-md-3 align-items-center">
                        <label className="me-2 fw-semibold w-50">
                          Incident Description
                        </label>
                        <input
                          type="text"
                          className="form-control border-dark"
                          placeholder="Customer Name"
                          readOnly
                          value={claimData?.[0]?.incident_Description || ""}
                        />
                      </div>
                    </div>
                  </form>
                </div>
              )}
            </div>
            {/* --- Section 3 --- */}
            <div className="card invooice_collpase mt-4">
              <div
                className={`card-header d-flex justify-content-between align-items-center ${
                  activeCollapse === "third"
                    ? "open_bg text-white"
                    : "close_bg text-dark"
                }`}
                style={{ cursor: "pointer" }}
                onClick={() => toggleCollapse("third")}
              >
                <strong>Product Information</strong>
                <span className="up_down">
                  {activeCollapse === "third" ? "▲" : "▼"}
                </span>
              </div>

              {activeCollapse === "third" && (
                <div className="collapse_data">
                  <form
                    className="mt-6 invoice_form"
                    style={{ marginTop: "0px" }}
                  >
                    <div className="row align-items-center ">
                      <div className="col-md-3 align-items-center">
                        <label className="me-2 fw-semibold w-50">Product</label>
                        <input
                          type="text"
                          className="form-control border-dark"
                          placeholder="Product Name"
                          readOnly
                          value={claimData?.[0]?.product || ""}
                        />
                      </div>
                      <div className="col-md-3 align-items-center">
                        <label className="me-2 fw-semibold w-50">Brand</label>
                        <input
                          type="text"
                          className="form-control border-dark"
                          placeholder="Brand Name"
                          readOnly
                          value={claimData?.[0]?.brand || ""}
                        />
                      </div>
                      <div className="col-md-3 align-items-center">
                        <label className="me-2 fw-semibold w-50">Modal</label>
                        <input
                          type="text"
                          className="form-control border-dark"
                          placeholder="Modal"
                          readOnly
                          value={claimData?.[0]?.model || ""}
                        />
                      </div>
                      <div className="col-md-3 align-items-center">
                        <label className="me-2 fw-semibold w-50">
                          Courier Company
                        </label>
                        <input
                          type="text"
                          className="form-control border-dark"
                          placeholder="Courier Company"
                          readOnly
                          value={claimData?.[0]?.couriorcompany || ""}
                        />
                      </div>
                    </div>
                    <div className="row align-items-center mt-4">
                      <div className="col-md-3 align-items-center">
                        <label className="me-2 fw-semibold w-50">
                          Courier Slip Number
                        </label>
                        <input
                          type="text"
                          className="form-control border-dark"
                          placeholder=" Courier Slip Number"
                          readOnly
                          value={claimData?.[0]?.couriorSlipnumber || ""}
                        />
                      </div>
                      <div className="col-md-3 align-items-center">
                        <label className="me-2 fw-semibold w-50">
                          Courier Dispatch Date
                        </label>
                        <input
                          type="text"
                          className="form-control border-dark"
                          placeholder="Courier Dispatch Date"
                          readOnly
                          value={formatDate(claimData?.[0]?.caseDispatchDate)}
                        />
                      </div>
                      <div className="col-md-3 align-items-center">
                        <label className="me-2 fw-semibold w-50">
                          Courier Intimate Date
                        </label>
                        <input
                          type="text"
                          className="form-control border-dark"
                          placeholder=" Courier Intimate Date"
                          readOnly
                          value={formatDate(
                            claimData?.[0]?.claimIntimationDate
                          )}
                        />
                      </div>
                      <div className="col-md-3 align-items-center">
                        <label className="me-2 fw-semibold w-50">
                          Claim Register Date
                        </label>
                        <input
                          type="text"
                          className="form-control border-dark"
                          placeholder="Claim Register Date"
                          readOnly
                          value={formatDate(claimData?.[0]?.claimRegisterDate)}
                        />
                      </div>
                    </div>
                    <div className="row align-items-center mt-4">
                      <div className="col-md-3 align-items-center">
                        <label className="me-2 fw-semibold w-50">
                          Pick Up Date
                        </label>
                        <input
                          type="text"
                          className="form-control border-dark"
                          placeholder=" Pick Up Date"
                          readOnly
                          value={formatDate(claimData?.[0]?.pickUpDate)}
                        />
                      </div>
                      <div className="col-md-3 align-items-center">
                        <label className="me-2 fw-semibold w-50">
                          Estimate Date
                        </label>
                        <input
                          type="text"
                          className="form-control border-dark"
                          placeholder="Estimate Date"
                          readOnly
                          value={formatDate(claimData?.[0]?.estimateDate)}
                        />
                      </div>
                      <div className="col-md-3 align-items-center">
                        <label className="me-2 fw-semibold w-50">
                          Approval Date
                        </label>
                        <input
                          type="text"
                          className="form-control border-dark"
                          placeholder="Approval Date"
                          readOnly
                          value={formatDate(claimData?.[0]?.approvalDate)}
                        />
                      </div>
                      <div className="col-md-3 align-items-center">
                        <label className="me-2 fw-semibold w-50">
                          Repair Complete date
                        </label>
                        <input
                          type="text"
                          className="form-control border-dark"
                          placeholder="Repair Complete date"
                          readOnly
                          value={formatDate(claimData?.[0]?.repairCompleteDate)}
                        />
                      </div>
                    </div>
                    <div className="row align-items-center mt-4">
                      <div className="col-md-3 align-items-center">
                        <label className="me-2 fw-semibold w-50">
                          Delivery Date
                        </label>
                        <input
                          type="text"
                          className="form-control border-dark"
                          placeholder="Delivery Date"
                          readOnly
                          value={formatDate(claimData?.[0]?.deliveryDate)}
                        />
                      </div>
                      <div className="col-md-3 align-items-center">
                        <label className="me-2 fw-semibold w-50">
                          Repair Stage
                        </label>
                        <input
                          type="text"
                          className="form-control border-dark"
                          placeholder="Repair Stage"
                          readOnly
                          value={claimData?.[0]?.repairStage || ""}
                        />
                      </div>
                      <div className="col-md-3 align-items-center">
                        <label className="me-2 fw-semibold w-50">
                          Latest Remark
                        </label>
                        <input
                          type="text"
                          className="form-control border-dark"
                          placeholder="Latest Remark"
                          readOnly
                          value={claimData?.[0]?.latestRemark || ""}
                        />
                      </div>
                      <div className="col-md-3 align-items-center">
                        <label className="me-2 fw-semibold w-50">
                          Excess Fees Payable
                        </label>
                        <input
                          type="text"
                          className="form-control border-dark"
                          placeholder=" Excess Fees Payable "
                          readOnly
                          value={claimData?.[0]?.excessFeesPayable || ""}
                        />
                      </div>
                    </div>
                    <div className="row align-items-center mt-4">
                      <div className="col-md-3 align-items-center">
                        <label className="me-2 fw-semibold w-50">
                          Excess Fees Status
                        </label>
                        <input
                          type="text"
                          className="form-control border-dark"
                          placeholder=" Excess Fees Status"
                          readOnly
                          value={claimData?.[0]?.excessFeesStatus || ""}
                        />
                      </div>
                      <div className="col-md-3 align-items-center">
                        <label className="me-2 fw-semibold w-50">
                          Excess Fees Date
                        </label>
                        <input
                          type="text"
                          className="form-control border-dark"
                          placeholder=" Excess Fees Date"
                          readOnly
                          value={claimData?.[0]?.excessFeesDate || ""}
                        />
                      </div>
                      <div className="col-md-3 align-items-center">
                        <label className="me-2 fw-semibold w-50">
                          Estimate Amount
                        </label>
                        <input
                          type="text"
                          className="form-control border-dark"
                          placeholder="Estimate Amount"
                          readOnly
                          value={claimData?.[0]?.estimateAmount || ""}
                        />
                      </div>
                      <div className="col-md-3 align-items-center">
                        <label className="me-2 fw-semibold w-50">
                          Approved Amount
                        </label>
                        <input
                          type="text"
                          className="form-control border-dark"
                          placeholder="Approved Amount"
                          readOnly
                          value={claimData?.[0]?.approvedAmount || ""}
                        />
                      </div>
                    </div>
                    <div className="row align-items-center mt-4">
                      <div className="col-md-3 align-items-center">
                        <label className="me-2 fw-semibold w-50">
                          Spare Part
                        </label>
                        <input
                          type="text"
                          className="form-control border-dark"
                          placeholder="Spare Part"
                          readOnly
                          value={claimData?.[0]?.spare_part || ""}
                        />
                      </div>
                      <div className="col-md-3 align-items-center">
                        <label className="me-2 fw-semibold w-50">
                          Service Charges
                        </label>
                        <input
                          type="text"
                          className="form-control border-dark"
                          placeholder="Service Charges"
                          readOnly
                          value={claimData?.[0]?.service_Charges || ""}
                        />
                      </div>
                      <div className="col-md-3 align-items-center">
                        <label className="me-2 fw-semibold w-50">
                          Incentive
                        </label>
                        <input
                          type="text"
                          className="form-control border-dark"
                          placeholder=" Incentive"
                          readOnly
                          value={claimData?.[0]?.incentive || ""}
                        />
                      </div>
                      <div className="col-md-3 align-items-center">
                        <label className="me-2 fw-semibold w-50">Penalty</label>
                        <input
                          type="text"
                          className="form-control border-dark"
                          placeholder="Penalty"
                          readOnly
                          value={claimData?.[0]?.penalty || ""}
                        />
                      </div>
                    </div>
                    <div className="row align-items-center mt-4">
                      <div className="col-md-3 align-items-center">
                        <label className="me-2 fw-semibold w-50">
                          Approved By
                        </label>
                        <input
                          type="text"
                          className="form-control border-dark"
                          placeholder="Approved By"
                          readOnly
                          value={claimData?.[0]?.approvedBy || ""}
                        />
                      </div>
                      <div className="col-md-3 align-items-center">
                        <label className="me-2 fw-semibold w-50">
                          Settled Amount
                        </label>
                        <input
                          type="text"
                          className="form-control border-dark"
                          placeholder="Settled Amount"
                          readOnly
                          value={claimData?.[0]?.settledAmount || ""}
                        />
                      </div>
                      <div className="col-md-3 align-items-center">
                        <label className="me-2 fw-semibold w-50">UTRN</label>
                        <input
                          type="text"
                          className="form-control border-dark"
                          placeholder="UTRN"
                          readOnly
                          value={claimData?.[0]?.utrn || ""}
                        />
                      </div>
                      <div className="col-md-3 align-items-center">
                        <label className="me-2 fw-semibold w-50">
                          Settlement Date
                        </label>
                        <input
                          type="text"
                          className="form-control border-dark"
                          placeholder="Settlement Date"
                          readOnly
                          value={claimData?.[0]?.settlementDate || ""}
                        />
                      </div>
                    </div>
                    <div className="row align-items-center mt-4">
                      <div className="col-md-3 align-items-center">
                        <label className="me-2 fw-semibold w-50">
                          Reject Cancel Reason
                        </label>
                        <input
                          type="text"
                          className="form-control border-dark"
                          placeholder="Reject Cancel Reason"
                          readOnly
                          value={claimData?.[0]?.rejectCancel_Reason || ""}
                        />
                      </div>
                      <div className="col-md-3 align-items-center">
                        <label className="me-2 fw-semibold w-50">
                          Sub Provider name
                        </label>
                        <input
                          type="text"
                          className="form-control border-dark"
                          placeholder="Sub Provider name"
                          readOnly
                          value={claimData?.[0]?.subProviderName || ""}
                        />
                      </div>
                    </div>
                  </form>
                </div>
              )}
            </div>
            {/* --- Section 4 --- */}
            <div className="card invooice_collpase mt-4">
              <div
                className={`card-header d-flex justify-content-between align-items-center ${
                  activeCollapse === "fourth"
                    ? "open_bg text-white"
                    : "close_bg text-dark"
                }`}
                style={{ cursor: "pointer" }}
                onClick={() => toggleCollapse("fourth")}
              >
                <strong>Estimation Photo</strong>
                <span className="up_down">
                  {activeCollapse === "fourth" ? "▲" : "▼"}
                </span>
              </div>

              {activeCollapse === "fourth" && (
                <div className="collapse_data">
                  <div
                    className="d-flex flex-wrap all_broken_img"
                    style={{ gap: "20px" }}
                  >
                    {claimData?.[0]?.estimationPhoto ? (
                      <img
                        src={claimData[0].estimationPhoto}
                        alt="Estimation"
                        // style={{ width: "150px", height: "auto" }}
                      />
                    ) : (
                      <p>No image available</p>
                    )}
                  </div>
                </div>
              )}
            </div>
            <div className="card invooice_collpase mt-4">
              <div
                className={`card-header d-flex justify-content-between align-items-center ${
                  activeCollapse === "fifth"
                    ? "open_bg text-white"
                    : "close_bg text-dark"
                }`}
                style={{ cursor: "pointer" }}
                onClick={() => toggleCollapse("fifth")}
              >
                <strong>Remarks</strong>
                <span className="up_down">
                  {activeCollapse === "fifth" ? "▲" : "▼"}
                </span>
              </div>

              {activeCollapse === "fifth" && (
                <div className="collapse_data">
                  <form
                    className="mt-6 invoice_form"
                    style={{ marginTop: "0px" }}
                  >
                    <div className="row align-items-center ">
                      <div className="col-md-3 align-items-center">
                        <div>
                          <label className="me-2 fw-semibold w-50">
                            Status
                          </label>
                          <input
                            type="text"
                            className="form-control border-dark"
                            placeholder="Status"
                            readOnly
                            value={claimData?.[0]?.status || ""}
                          />
                        </div>
                      </div>
                      <div className="col-md-3 align-items-center">
                        <label className="me-2 fw-semibold w-50">
                          Remark Category
                        </label>
                        <input
                          type="text"
                          className="form-control border-dark"
                          placeholder="Remark Category"
                          readOnly
                          value={claimData?.[0]?.remarkCategory || ""}
                        />
                      </div>
                      <div className="col-md-3 align-items-center">
                        <label className="me-2 fw-semibold w-50">Date</label>
                        <input
                          type="text"
                          className="form-control border-dark"
                          placeholder="Modal"
                          readOnly
                          value={formatDate(claimData?.[0]?.date)}
                        />
                      </div>
                      <div className="col-md-3 align-items-center">
                        <label className="me-2 fw-semibold w-50">Time</label>
                        <input
                          type="text"
                          className="form-control border-dark"
                          placeholder="Time"
                          readOnly
                          value={claimData?.[0]?.time || ""}
                        />
                      </div>
                    </div>
                    <div className="row align-items-end mt-4">
                      <div className="col-md-3 align-items-center">
                        <label className="me-2 fw-semibold w-50">Remarks</label>
                        <textarea
                          className="form-control rounded-2"
                          id="issueConcern"
                          rows="4"
                          placeholder="Remarks"
                          readOnly
                          value={claimData?.[0]?.remarks || ""}
                        ></textarea>
                      </div>
                      <div className="col-md-3 align-items-end">
                        <button
                         type="button" 
                          className="btn btn-primary d-flex align-items-center"
                          onClick={handleDownloadRemarksCSV}
                          style={{
                            backgroundColor: "#8000d7",
                            border: "none",
                            padding: "10px 40px",
                            borderRadius: "8px",
                            fontWeight: "500",
                            fontSize: "16px",
                          }}
                        >
                          <FaDownload />{" "}
                          <span className="ms-2">Download Document</span>
                        </button>
                      </div>
                    </div>
                  </form>
                </div>
              )}
            </div>
          </div>

          <div
            className="d-flex justify-content-center align-items-center gap-4 "
            style={{ marginTop: "50px" }}
          >
            <button
            onClick={() => navigate(-1)}
              className="btn btn-primary d-flex align-items-center"
              style={{
                backgroundColor: "#fff",
                border: "1px solid #8000d7",
                padding: "10px 50px",
                borderRadius: "8px",
                fontWeight: "500",
                fontSize: "16px",
                color: "#8000d7",
              }}
            >
              <span className="ms-2">Close</span>
            </button>
            <div>
              <div
                onClick={() => {
                  setShowHoldModal(true);
                }}
              >
                <button
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
                  <span className="ms-2">Raise Concern</span>
                </button>
              </div>
            </div>
          </div>
        </div>
        <Raise_concern_popup
          show={showHoldModal}
          handleClose={() => setShowHoldModal(false)}
        />
      </div>
    </div>
  );
};

export default InvoiceTemplate;
