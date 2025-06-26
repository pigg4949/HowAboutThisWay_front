import axios from "axios";

const BASE_URL = "http://localhost:8080/api/inquiry";

// 문의 등록O
export const createInquiry = async (inquiry, token) => {
  const res = await axios.post(BASE_URL, inquiry, {
    headers: { Authorization: `Bearer ${token}` },
    withCredentials: true,
  });
  return res.data;
};

// 문의 전체 조회
export const getInquiry = async (token) => {
  const res = await axios.get(`${BASE_URL}/admin`, {
    headers: { Authorization: `Bearer ${token}` },
    withCredentials: true,
  });
  return res.data;
};

// 문의 답변
export const replyInquiry = async (idx, replyContent, token) => {
  try {
    const res = await axios.put(
      `${BASE_URL}/admin/${idx}`, // 여기에 '/api/inquiry/' 추가
      { adminResponses: replyContent },
      {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      }
    );
    return res.data;
  } catch (error) {
    console.error(`Error replying to inquiry ${idx}:`, error);
    throw error;
  }
};

// 내 문의 전체 조회
