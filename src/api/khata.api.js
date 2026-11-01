import client from "./client";

export const customerKhataApi = {
  getSummary: async () => {
    const res = await client.get("/customer/khata");
    return res;
  },
  getPassbook: async (khataId) => {
    const res = await client.get(`/customer/khata/${khataId}/transactions`);
    return res;
  },
  disputeTransaction: async (khataId, txId, reason) => {
    const res = await client.post(`/customer/khata/${khataId}/dispute`, {
      transaction_id: txId,
      dispute_reason: reason,
    });
    return res;
  },
  submitUPIPayment: async (khataId, amount, utrNumber, note) => {
    const res = await client.post(`/customer/khata/${khataId}/pay-upi`, {
      amount: Number(amount),
      utr_number: utrNumber,
      note,
    });
    return res;
  },
  setPromiseToPay: async (khataId, promiseDate, note) => {
    const res = await client.post(`/customer/khata/${khataId}/promise-date`, {
      promise_date: promiseDate,
      note,
    });
    return res;
  },
  setCreditOTPProtection: async (khataId, enabled) => {
    const res = await client.post(`/customer/khata/${khataId}/otp-protection`, {
      otp_required: enabled,
    });
    return res;
  },
  getStatementPdfUrl: (khataId) => {
    return `${client.defaults.baseURL || ""}/customer/khata/${khataId}/statement.pdf`;
  },
};
