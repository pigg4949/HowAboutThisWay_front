import axios from "axios";

const api = axios.create({
  baseURL: "/api", // 백엔드 SpringBoot가 /api/* 로 매핑돼 있다면
  withCredentials: true, // 세션·쿠키 필요 시
});

// 요청 인터셉터로 Authorization 헤더 자동 추가
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
