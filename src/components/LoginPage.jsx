import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { loginUser } from "../api/auth";
import styles from "../css/LoginPage.module.css";

export default function LoginPage() {
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await loginUser(
        e.target.userId.value,
        e.target.password.value
      );
      localStorage.setItem("token", res.token);
      localStorage.setItem(
        "isAdmin",
        res.isAdmin === 1 || res.isAdmin === "1" || res.isAdmin === true
          ? "1"
          : "0"
      );
      if (res.isAdmin === 1 || res.isAdmin === "1" || res.isAdmin === true) {
        navigate("/admin");
      } else {
        navigate("/main");
      }
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

  const GOOGLE_CLIENT_ID =
    "986385424479-823jtt1pk037afk7obm3rnnesfo26ik3.apps.googleusercontent.com";
  const GOOGLE_REDIRECT_URI = "http://localhost:5173/google-callback";
  const handleGoogleLogin = () => {
    const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${GOOGLE_CLIENT_ID}&redirect_uri=${encodeURIComponent(
      GOOGLE_REDIRECT_URI
    )}&response_type=code&scope=openid%20email%20profile`;
    window.location.href = googleAuthUrl;
  };

  return (
    <div className={styles.pageWrapper}>
      {/* 1) 스플래시 로고 */}
      <div className={styles.logo}>
        <img
          src="/images/HATWlogo.png"
          alt="HATW 로고"
          className={styles.logoImg}
        />
      </div>

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
          <div className={styles.buttonGroup}>
            <button type="submit" className={styles.buttonPrimary}>
              로그인
            </button>
            <button
              type="button"
              className={styles.buttonSecondary}
              onClick={() => navigate("/signup")}
            >
              회원가입
            </button>
          </div>
          <div className={styles.buttonGroup}>
            <button
              type="button"
              className={styles.buttonSecondary}
              onClick={handleKakaoLogin}
            >
              카카오로 로그인
            </button>
            <button
              type="button"
              className={styles.buttonSecondary}
              onClick={handleGoogleLogin}
            >
              구글로 로그인
            </button>
          </div>
        </form>

        <Link
          to="/findInfo"
          className={`${styles.findInfoLink} ${styles.findInfoLinkMargin}`}
        >
          아이디 / 비밀번호 찾기
        </Link>
      </main>
    </div>
  );
}
