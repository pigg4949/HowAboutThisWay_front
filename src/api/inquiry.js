import axios from "axios";

const BASE_URL = "http://localhost:8080/api/inquiry";

// 문의 등록
export const createInquiry = async (inquiry, token) => {
  const res = await axios.post(`${BASE_URL}/create`, inquiry, {
    headers: { Authorization: `Bearer ${token}` },
    withCredentials: true,
  });
  return res.data;
};

// 관리자용 문의 전체 조회
export const getInquiry = async (token) => {
  const res = await axios.get(`${BASE_URL}/admin`, {
    headers: { Authorization: `Bearer ${token}` },
    withCredentials: true,
  });
  return res.data;
};

// 문의 답변
export const replyInquiry = async (idx, replyContent, token) => {
  const res = await axios.put(
    `${BASE_URL}/${idx}`,
    { adminResponses: replyContent },
    {
      headers: { Authorization: `Bearer ${token}` },
      withCredentials: true,
    }
  );
  return res.data;
};

// 내 문의 전체 조회
export const getMyInquiries = async (token) => {
  const res = await axios.get(`${BASE_URL}/me`, {
    headers: { Authorization: `Bearer ${token}` },
    withCredentials: true,
  });
  return res.data;
};
