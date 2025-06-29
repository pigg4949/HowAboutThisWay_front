import axios from "./axios";

export const getMyReports = async (token) => {
  const res = await axios.get("/api/reports/me", {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};
