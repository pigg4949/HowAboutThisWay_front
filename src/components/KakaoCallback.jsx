import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { handleKakaoCallback } from "../api/auth";

export default function KakaoCallback() {
  const navigate = useNavigate();
  const requested = useRef(false); // 중복 방지 플래그

  useEffect(() => {
    if (requested.current) return; // 이미 요청했으면 실행 안 함
    requested.current = true;

    const url = new URL(window.location.href);
    const code = url.searchParams.get("code");

    if (code) {
      handleKakaoCallback(code)
        .then((res) => {
          console.log("카카오 로그인 응답:", res);
          // 토큰과 userId가 있으면 성공
          if (res && res.token && res.userId) {
            localStorage.setItem("token", res.token);
            localStorage.setItem("isAdmin", "0");
            navigate("/main");
          } else {
            alert("카카오 로그인 실패: 사용자 정보 없음");
            navigate("/");
          }
        })
        .catch((err) => {
          console.error("카카오 로그인 에러:", err);
          alert("카카오 로그인 실패");
          navigate("/");
        });
    }
  }, [navigate]);

  return <div>카카오 로그인 중...</div>;
}
