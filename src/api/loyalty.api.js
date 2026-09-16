import client from './client';

export const loyaltyApi = {
  getUserLoyalty: async () => {
    const res = await client.get('/user/loyalty');
    return res.data?.data || res.data;
  },
};
