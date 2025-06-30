// src/api/reports.js
import api from "./axios";

// 제보 등록
export const createReport = async (report) => {
  const res = await api.post("/reports", report);
  return res.data;
};

// 제보 목록 조회
export const getReports = async () => {
  const res = await api.get("/reports/admin/pending");
  return res.data;
};

// 제보 상태 변경 (APPROVED / REJECTED )
export const updateReportStatus = async (idx, status) => {
  const res = await api.put(`/reports/admin/${idx}/status`, { status });
  return res.data;
};

// 제보 이미지 업데이트
export const updateReportImage = async (reportId, imageFile) => {
  const formData = new FormData();
  formData.append("image", imageFile);
  const res = await api.put(`/reports/${reportId}/image`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};

// 제보 내용 업데이트
export const updateReport = async (reportId, reportData) => {
  const res = await api.put(`/reports/${reportId}`, reportData);
  return res.data;
};
