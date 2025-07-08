import api from "./axios";

// 회원가입
export const registerUser = async (user) => {
  const res = await api.post("/users/register", user);
  return res.data;
};

// 회원가입 중복확인 함수
export const DuplCheck = async (userId) => {
  // GET 요청으로 userId를 쿼리 파라미터로 전달
  const res = await api.get(
    `/users/check-dup?userId=${encodeURIComponent(userId)}`
  );
  return res.data; // 예: "사용 가능한 아이디입니다." 또는 "이미 사용 중인 아이디입니다."
};

// 내 정보 조회
export const getUserInfo = async (token) => {
  const res = await api.get("/users/info");
  return res.data;
};

// 로그아웃
export const logoutUser = async (token) => {
  const res = await api.post("/users/logout");
  return res.data;
};

// 내 정보 수정
export const updateUser = async (user) => {
  const res = await api.put("/users/update", user);
  return res.data;
};

// 회원 탈퇴
export const signoutUser = async () => {
  const res = await api.post("/users/delete");
  return res.data;
};

// 아이디 찾기
export const getInfoByUserId = async (userId, token) => {
  const res = await api.get("/users/me", {
    params: { userId },
  });
  return res.data;
};

// 아이디 찾기
export const findUserId = async (name, phone) => {
  const res = await api.post("/users/find-id", {
    name,
    phone: phone.replace(/-/g, ""),
  });
  return res.data;
};

// 비밀번호 재설정
export const resetPassword = async (userId, phone) => {
  const res = await api.post("/users/reset-password", {
    userId,
    phone: phone.replace(/-/g, ""),
  });
  return res.data;
};

// 전화번호 포맷팅 유틸리티
export const formatPhoneNumber = (value) => {
  const onlyNums = value.replace(/[^0-9]/g, "");
  if (onlyNums.length < 4) return onlyNums;
  if (onlyNums.length < 8)
    return onlyNums.slice(0, 3) + "-" + onlyNums.slice(3);
  return (
    onlyNums.slice(0, 3) +
    "-" +
    onlyNums.slice(3, 7) +
    "-" +
    onlyNums.slice(7, 11)
  );
};
