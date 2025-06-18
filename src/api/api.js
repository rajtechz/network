import axios from "axios";

export const BASE_URL = "https://mintflix.live:8086/api/Auto";

/*********************************************************
 * Function to review batch to get invoice batch data
 *********************************************************/
export const fetchBatchInvoiceData = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/GetBatchInvoiceData`, {
      headers: {
        Accept: "text/plain",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching batch invoice data:", error);
    throw error;
  }
};
/*********************************************************
 *  END function to review batch to get invoice batch data
 *********************************************************/
/*********************************************************
 * Function to update invoice batch status
 *********************************************************/
export const updateBatchInvoiceStatus = async ({ batchNo, status, reason }) => {
  try {
    const response = await axios.post(
      `${BASE_URL}/UpdateBatchInvoiceStatus`,
      {
        batchNo: batchNo.toString(),
        status,
        reason,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error updating invoice status:", error);
    throw error;
  }
};
/*********************************************************
 * End function to update invoice batch status
 *********************************************************/
/*********************************************************
 * Function to update finacnce batch status
 *********************************************************/

export const updateBatchFinanceStatus = async ({ batchNo, status, reason }) => {
  try {
    const response = await fetch(
      // "https://mintflix.live:8086/api/Auto/UpdateBatchFinanceStatus",
      `${BASE_URL}/UpdateBatchFinanceStatus`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          batchNo: batchNo.toString(),
          status: status.toLowerCase(),
          reason: reason || "",
        }),
      }
    );

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("API call failed:", error);
    throw error;
  }
};

/*********************************************************
 *End Function to update finacnce batch status
 *********************************************************/
/*********************************************************
 * Function to fetch vendor popup suggestions based on search query
 * @param {string} query - Text input to search vendors
 * @returns {Promise<Array>} - Array of vendor suggestions
 *********************************************************/
export const fetchVendorSuggestions = async (query) => {
  try {
    const response = await axios.get(
      `${BASE_URL}/GetServiceProvidersByName?searchText=${query}`,
      {
        headers: {
          Accept: "application/json", // or "text/plain" if required by server
        },
      }
    );
    console.log("API Vendor Suggestions:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching vendor suggestions:", error);
    throw error;
  }
};
/*********************************************************
 * END function to fetch vendor popup suggestions based on search query
 *********************************************************/

// here is next api
// you can add here new api
/*********************************************************
 * Function to fetchGadgetCaseDetailsByVendor to get invoice
 *********************************************************/
export const fetchGadgetCaseDetailsByVendor = async (vendorName) => {
  const myUrl = `${BASE_URL}/GetGadgetCaseDetailsByVendor?vendorName=${encodeURIComponent(
    vendorName
  )}`;
  // console.log("Calling URL:", myUrl);
  try {
    const response = await axios.get(myUrl);
    console.log("API Response:", response);
    if (response.data.status) {
      return { success: true, data: response.data.dataItems };
    } else {
      return { success: false, message: response.data.message };
    }
  } catch (error) {
    console.error("API Error:", error);
    return { success: false, message: error.message };
  }
};

/*********************************************************
 *END Function to fetchGadgetCaseDetailsByVendor to get invoice
 *********************************************************/

/*********************************************************
 * Function to Status update deatils to get invoice
 *********************************************************/

export const getAllClaimDetailsPrefiled = async (aaNumber) => {
  const myUrl = `${BASE_URL}/GetAllGadgetClaimDetails?aaNumber=${aaNumber}`;
  // console.log("Calling URL:", myUrl);
  try {
    const response = await axios.get(myUrl);
    console.log("API Response:", response);
    if (response.data.status) {
      return { success: true, data: response.data.dataItems };
    } else {
      return { success: false, message: response.data.message };
    }
  } catch (error) {
    console.error("API Error:", error);
    return { success: false, message: error.message };
  }
};

// //////////////////////////////////////
/*********************************************************
 * END Function to Status update deatils to get invoice
 *********************************************************/
/*********************************************************
 * Function to update status deatils to get invoice
 *********************************************************/
export const GetUpdatedStatusData = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/GetUpdatedStatusData`, {
      headers: {
        Accept: "text/plain",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching batch invoice data:", error);
    throw error;
  }
};
/*********************************************************
 * Function to update status deatils to get invoice
 *********************************************************/
/*********************************************************
 * Function to Raised Concern deatils
 *********************************************************/
export const raiseConcern = async (data) => {
  try {
    const response = await fetch(`${BASE_URL}/InsertRaisedConcern`, {
      method: "POST",
      body: data,
    });

    if (!response.ok) throw new Error("Failed to raise concern");

    const result = await response.json();
    return result;
  } catch (error) {
    console.error("Error raising concern:", error);
    throw error;
  }
};

/*********************************************************
 * End Function to Raised Concern deatils
 *********************************************************/
/*********************************************************
 * Function to SaveApprovalBatchData
 *********************************************************/
export const SaveApprovalBatchDataFlow = async (invoice) => {
  // Helper function to convert date formats to ISO (YYYY-MM-DD)
  const toISODate = (dateStr) => {
    if (!dateStr || dateStr === "--" || dateStr === "null") return null;

    try {
      // Handle different date formats
      if (dateStr.includes("/")) {
        // Format: DD/MM/YYYY
        const [day, month, year] = dateStr.split("/");
        return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
      } else if (dateStr.includes("-")) {
        // Format: DD-MM-YYYY
        const [day, month, year] = dateStr.split("-");
        return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
      } else if (dateStr.match(/^\d{8}$/)) {
        // Format: YYYYMMDD
        const year = dateStr.substring(0, 4);
        const month = dateStr.substring(4, 6);
        const day = dateStr.substring(6, 8);
        return `${year}-${month}-${day}`;
      }
      return null;
    } catch (e) {
      console.error("Date conversion error:", e);
      return null;
    }
  };

  // Format numbers to ensure they're valid
  const formatNumber = (value) => {
    if (value === null || value === undefined || value === "--") return "0";
    const num = parseFloat(value.toString().replace(/[^0-9.-]/g, ""));
    return isNaN(num) ? "0" : num.toString();
  };

  // Validate AA Number format
  const validateAANo = (aaNo) => {
    if (!aaNo || aaNo === "--") return null;
    const cleanAA = aaNo.toString().trim();
    return cleanAA.length > 0 ? cleanAA : null;
  };

  // IMEI validation - modified to accept any value
  const validateIMEI = (imei) => {
    if (!imei || imei === "--") return null;
    return imei.toString(); 
  };
  
  const payload = {
    id: invoice.id || 0,
    sellingPartner: invoice.sellingPartner || "Unknown",
    aaNo: validateAANo(invoice.aA_Number),
    imeiNo: validateIMEI(invoice.imeiNumber),
    BatchNo: invoice.BatchNo,
    creationDate: toISODate(invoice.creationDate),
    closureDate: toISODate(invoice.closureDate),
    customerName: invoice.customerName || "Unknown",
    serviceType: invoice.serviceType || "Unknown",
    brand: invoice.brand || "Unknown",
    makeModel: invoice.makeModel || "Unknown",
    repairCharges: formatNumber(invoice.repairCharges),
    chargesInclGST: formatNumber(invoice.chargesIncGST),
    total: formatNumber(invoice.total),
    invoiceStatus: invoice.invoiceStatus || "Pending",
  };

  // Validate required fields
  if (!payload.aaNo) {
    console.error("Invalid AA Number:", invoice.aA_Number);
    throw new Error(`Invalid AA Number: ${invoice.aA_Number}`);
  }

  if (!payload.imeiNo) {
    console.error("Invalid IMEI Number:", invoice.imeiNumber);
    throw new Error(`Invalid IMEI Number: ${invoice.imeiNumber}`);
  }

  try {
    const response = await fetch(`${BASE_URL}/SaveApprovalBatchData`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "*/*",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("API Validation Errors:", errorData.errors);
      throw new Error(`Validation failed: ${JSON.stringify(errorData.errors)}`);
    }

    return await response.json();
  } catch (error) {
    console.error("API Request Error:", error);
    throw error;
  }
};
/*********************************************************
 * End function to SaveApprovalBatchData
 *********************************************************/
/*********************************************************
 * Function to GetAllApprovalBatchDatafromSubmit
 *********************************************************/
export const GetAllApprovalBatchDatafromSubmit = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/GetAllApprovalBatchData`, {
      headers: {
        Accept: "text/plain",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching batch invoice data:", error);
    throw error;
  }
};
export const GetNetworkRejectData = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/GetRejectedInvoiceData`, {
      headers: {
        Accept: "text/plain",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching batch invoice data:", error);
    throw error;
  }
};
export const   GetPartialApprovedInvoiceData = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/GetPartialApprovedInvoiceData`, {
      headers: {
        Accept: "text/plain",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching batch invoice data:", error);
    throw error;
  }
};

/*********************************************************
 * Function to GetAllApprovalBatchDatafromSubmit
 *********************************************************/
/*********************************************************
 * Function to GetAllRejectedlBatchDatafromSubmit
 *********************************************************/
export const GetAllRejectedlBatchDatafromSubmit = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/GetRejectInvoiceData`, {
      headers: {
        Accept: "text/plain",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching batch invoice data:", error);
    throw error;
  }
};

/*********************************************************
 * Function to GetAllApprovalBatchDatafromSubmit
 *********************************************************/
/*********************************************************
 * Function to GetAllGetQueryData
 *********************************************************/
export const GetAllGetQueryData = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/GetQueryInvoiceData`, {
      headers: {
        Accept: "text/plain",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching batch invoice data:", error);
    throw error;
  }
};

/*********************************************************
 * Function to GetAllGetQueryData
 *********************************************************/
/*********************************************************
 * Function to GetAllHoldData
 *********************************************************/
export const GetAllHoldData = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/GetHoldInvoiceData`, {
      headers: {
        Accept: "text/plain",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching batch invoice data:", error);
    throw error;
  }
};

/*********************************************************
 * Function to GetAllHoldData
 *********************************************************/
/*********************************************************
 * Function to GetRaisedConcernsNetwork
 *********************************************************/
export const GetRaisedConcernsNetworkForSidebar = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/GetRaisedConcernsNetwork`, {
      headers: {
        Accept: "text/plain",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching batch invoice data:", error);
    throw error;
  }
};

/*********************************************************
 * Function to GetAllApprovalBatchDatafromSubmit
 *********************************************************/
/*********************************************************
 * Function to update updateInvoiceStatusNetworkForApproved
 *********************************************************/
export const updateInvoiceStatusNetworkForApproved = async ({
  batchNo,
  invoiceStatus,
}) => {
  try {
    const response = await axios.post(
      `${BASE_URL}/UpdateInvoiceStatusNetwork`,
      {
        batchNo: batchNo.toString(), 
        invoiceStatus, 
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error updating invoice status:", error);
    throw error;
  }
};
export const UpdateInvoicePartialNetwork = async ({
  batchNo,
  invoiceStatus,
}) => {
  try {
    const response = await axios.post(
      `${BASE_URL}/Update_InvoicePartialNetwork`,
      {
        batchNo: batchNo.toString(), 
        invoiceStatus, 
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error updating invoice status:", error);
    throw error;
  }
};
/*********************************************************
 * End function to update updateInvoiceStatusNetworkForApproved
 *********************************************************/
