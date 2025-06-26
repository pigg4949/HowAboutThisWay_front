// src/api/bookmarker.js
import axios from "axios";
const BASE_URL = "http://localhost:8080/api/bookmarker";

// 즐겨찾기 조회
export const getBookmarks = async (token) => {
  const res = await axios.get(`${BASE_URL}`, {
    headers: { Authorization: `Bearer ${token}` },
    withCredentials: true,
  });
  return res.data;
};

// 즐겨찾기 등록
export const createBookmark = async (token, bookmark) => {
  console.log(token, bookmark);
  const res = await axios.post(`${BASE_URL}`, bookmark, {
    headers: { Authorization: `Bearer ${token}` },
    withCredentials: true,
  });
  return res.data;
};

// 즐겨찾기 삭제
export const deleteBookmark = async (token, idx) => {
  console.log(token, idx);
  const res = await axios.delete(`${BASE_URL}/${idx}`, {
    headers: { Authorization: `Bearer ${token}` },
    withCredentials: true,
  });
  return res.data;
};
