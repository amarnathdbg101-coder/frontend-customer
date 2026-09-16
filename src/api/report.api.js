import client from './client';

export const reportApi = {
  submitReport: async ({ target_type, target_id, reason, description }) => {
    const res = await client.post('/reports', {
      target_type,
      target_id,
      reason,
      description,
    });
    return res.data;
  },
};
