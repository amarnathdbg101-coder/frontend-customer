import client from "./client";

export const customerKhataApi = {
  getSummary: async () => {
    const res = await client.get("/customer/khata");
    return res.data?.data || res.data;
  },
  getPassbook: async (khataId) => {
    const res = await client.get(`/customer/khata/${khataId}/transactions`);
    return res.data?.data || res.data;
  },
  disputeTransaction: async (khataId, txId, reason) => {
    const res = await client.post(`/customer/khata/${khataId}/dispute`, {
      transaction_id: txId,
      dispute_reason: reason,
    });
    return res.data;
  },
  submitUPIPayment: async (khataId, amount, utrNumber, note) => {
    const res = await client.post(`/customer/khata/${khataId}/pay-upi`, {
      amount: Number(amount),
      utr_number: utrNumber,
      note,
    });
    return res.data;
  },
  setPromiseToPay: async (khataId, promiseDate, note) => {
    const res = await client.post(`/customer/khata/${khataId}/promise-date`, {
      promise_date: promiseDate,
      note,
    });
    return res.data;
  },
  getStatementPdfUrl: (khataId) => {
    return `${client.defaults.baseURL || ""}/customer/khata/${khataId}/statement.pdf`;
  },
};
