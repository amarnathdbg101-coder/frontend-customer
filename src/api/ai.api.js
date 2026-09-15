import client from "./client";

export const aiApi = {
  customerChat: async (message, history = []) => {
    const res = await client.post("/ai/customer-chat", {
      message,
      conversation_history: history,
    });
    return res.data?.data || res.data;
  },
  scanProduct: async (imageBase64) => {
    const res = await client.post("/ai/scan-product", {
      image_base64: imageBase64,
    });
    return res.data?.data || res.data;
  },
  semanticSearch: async (query, latitude, longitude) => {
    const res = await client.post("/ai/semantic-search", {
      query,
      latitude: latitude ? Number(latitude) : undefined,
      longitude: longitude ? Number(longitude) : undefined,
    });
    return res.data?.data || res.data;
  },
};
