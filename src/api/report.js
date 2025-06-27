// src/api/reports.js
import axios from "axios";

const BASE_URL = "http://localhost:8080/api/reports";

// 제보 등록
// Ensure token is passed and used for authorization
export const createReport = async (report, token) => {
  const res = await axios.post(`${BASE_URL}`, report, {
    headers: { Authorization: `Bearer ${token}` },
    withCredentials: true,
  });
  return res.data;
};

// 제보 목록 조회
export const getReports = async (token) => {
  const res = await axios.get(`${BASE_URL}/admin/pending`, {
    headers: { Authorization: `Bearer ${token}` },
    withCredentials: true,
  });
  return res.data;
};

// 제보 상태 변경 (APPROVED / REJECTED )
export const updateReportStatus = async (idx, status, token) => {
  const res = await axios.put(
    `${BASE_URL}/admin/${idx}/status`,
    { status },
    {
      headers: { Authorization: `Bearer ${token}` },
      withCredentials: true,
    }
  );
  return res.data;
};
