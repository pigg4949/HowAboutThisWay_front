import axios from "axios";
import api from "./axios";

const BASE_URL = "http://localhost:8080/api/auth";

//auth 컨트롤러는 상원 님 개정본 받아야 함: coolSMS도 추가할지?

// 로그인
export const loginUser = async (userId, password) => {
  const res = await api.post("/users/login", {
    userId,
    passwordHash: password,
  });
  return res.data;
};

// 카카오 로그인 콜백 처리
export const handleKakaoCallback = async (code) => {
  const res = await api.get(`/users/kakao/callback?code=${code}`);
  return res.data;
};

// 구글 로그인 콜백 처리
export const handleGoogleCallback = async (code) => {
  const res = await api.get(`/users/google/callback?code=${code}`);
  return res.data;
};

// 인증번호 발송
export const sendVerificationCode = async (phone) => {
  const res = await api.post("/users/send-code", { phone });
  return res.data;
};

// 인증번호 확인
export const verifyCode = async (code, serverCode) => {
  return code === serverCode;
};
