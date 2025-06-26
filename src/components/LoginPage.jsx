import React from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axios";
import styles from "../css/LoginPage.module.css";

export default function LoginPage() {
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post("/users/login", {
        userId: e.target.userId.value,
        passwordHash: e.target.password.value,
      });
      localStorage.setItem("token", res.data);
      navigate("/main");
    } catch (err) {
      alert("로그인 실패: " + (err.response?.data?.message || err.message));
    }
  };

  const KAKAO_CLIENT_ID = "dc65abb4b12a5d1c1632d37d84d1ac71";
  const KAKAO_REDIRECT_URI = "http://localhost:5173/kakao-callback";
  const handleKakaoLogin = () => {
    const kakaoAuthUrl = `https://kauth.kakao.com/oauth/authorize?client_id=${KAKAO_CLIENT_ID}&redirect_uri=${encodeURIComponent(
      KAKAO_REDIRECT_URI
    )}&response_type=code`;
    window.location.href = kakaoAuthUrl;
  };

  return (
    <div className={styles.pageWrapper}>
      {/* 1) 스플래시 로고 */}
      <div className={styles.logo}>이길어때</div>

      {/* 2) 2초 뒤에 페이드인될 로그인 박스 */}
      <main className={`${styles.loginBox} ${styles.formContainer}`}>
        <form onSubmit={handleSubmit}>
          <label htmlFor="userId">아이디</label>
          <input
            id="userId"
            name="userId"
            type="text"
            placeholder="아이디를 입력해주세요"
            required
          />

          <label htmlFor="password">비밀번호</label>
          <input
            id="password"
            name="password"
            type="password"
            placeholder="비밀번호를 입력해주세요"
            required
          />

          {/* 2x2 버튼 그리드로 모든 버튼 통일 */}
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 8,
              width: "100%",
              marginBottom: 8,
            }}
          >
            <button
              type="submit"
              className="btnPrimary"
              style={{ flex: "1 1 48%", minWidth: 0, height: 48 }}
            >
              로그인
            </button>
            <Link
              to="/signup"
              style={{
                flex: "1 1 48%",
                minWidth: 0,
                height: 48,
                display: "flex",
              }}
            >
              <button
                type="button"
                className="btnSecondary"
                style={{ width: "100%", height: 48 }}
              >
                회원가입
              </button>
            </Link>
            <button
              type="button"
              className="btnSecondary"
              style={{ flex: "1 1 48%", minWidth: 0, height: 48 }}
              onClick={handleKakaoLogin}
            >
              카카오로 로그인
            </button>
            <button
              type="button"
              className="btnSecondary"
              style={{ flex: "1 1 48%", minWidth: 0, height: 48 }}
            >
              네이버로 로그인
            </button>
          </div>
        </form>

        <Link
          to="/findInfo"
          className={styles.findInfoLink}
          style={{ marginTop: 16 }}
        >
          아이디 / 비밀번호 찾기
        </Link>
      </main>
    </div>
  );
}
