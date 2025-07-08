import api from "./axios";

export const getMyReports = async (token) => {
  const res = await api.get("/reports/me", {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};
