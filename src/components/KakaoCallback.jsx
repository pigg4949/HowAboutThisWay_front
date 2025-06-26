import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

export default function KakaoCallback() {
  const navigate = useNavigate();
  const requested = useRef(false); // 중복 방지 플래그

  useEffect(() => {
    if (requested.current) return; // 이미 요청했으면 실행 안 함
    requested.current = true;

    const url = new URL(window.location.href);
    const code = url.searchParams.get("code");
    if (code) {
      api
        .get(`/users/kakao/callback?code=${code}`)
        .then((res) => {
          console.log("카카오 로그인 응답:", res);
          // 필요시 토큰 저장
          localStorage.setItem("token", res.data.token);
          if (res && res.status === 200 && res.data && res.data.userId) {
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
