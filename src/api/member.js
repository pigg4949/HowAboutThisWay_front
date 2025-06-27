import axios from "axios";

const BASE_URL = "http://localhost:8080/api/users";

// 로그인
export const loginUser = async (userId, password) => {
  console.log(`아이디 전달: ${userId}`, `비번 전달: ${password}`);
  const res = await axios.post(`${BASE_URL}/login`, {
    userId,
    passwordHash: password,
  });
  return res.data;
};

// 회원가입
export const registerUser = async (user) => {
  const res = await axios.post(`${BASE_URL}/register`, user);
  return res.data;
};

// 내 정보 조회
export const getUserInfo = async (token) => {
  const res = await axios.get(`${BASE_URL}/info`, {
    headers: { Authorization: `Bearer ${token}` },
    withCredentials: true,
  });
  return res.data;
};

// 로그아웃
export const logoutUser = async (token) => {
  const res = await axios.post(`${BASE_URL}/logout`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

// 내 정보 수정
export const updateUser = async (user, token) => {
  const res = await axios.put(`${BASE_URL}/update`, user, {
    headers: { Authorization: `Bearer ${token}` },
    withCredentials: true,
  });
  return res.data;
};

// 회원 탈퇴: 이것도 수정해야 함.
export const signoutUser = async (token) => {
  const res = await axios.delete(`${BASE_URL}/delete`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

// 아이디 찾기
export const getInfoByUserId = async (userId) => {
  const res = await axios.get(`${BASE_URL}/me`, userId, {
    headers: { Authorization: `Bearer ${token}` },
    withCredentials: true,
  });
  return res.data;
};
