import React, { useEffect, useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import styles from "../css/LoginPage.module.css";
import { loginUser } from "../api/member";

export default function LoginPage() {
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = await loginUser(userId, password);
      localStorage.setItem("token", token);
      try {
        navigate("/report");
      } catch {
        navigate("/main");
      }
    } catch (err) {
      alert("로그인 실패: " + (err.response?.data?.message || err.message));
    }
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
            value={userId} // 👈 상태값 연결
            onChange={(e) => setUserId(e.target.value)} // 👈 입력 감지
            required
          />

          <label htmlFor="password">비밀번호</label>
          <input
            id="password"
            name="password"
            type="password"
            placeholder="비밀번호를 입력해주세요"
            value={password} // 👈 상태값 연결
            onChange={(e) => setPassword(e.target.value)} // 👈 입력 감지
            required
          />

          <div className={styles.buttonGroup}>
            <button type="submit" className="btnPrimary">
              로그인
            </button>
            <Link to="/signup">
              <button type="button" className="btnSecondary">
                회원가입
              </button>
            </Link>
          </div>
        </form>

        <Link to="/findInfo" className={styles.findInfoLink}>
          아이디 / 비밀번호 찾기
        </Link>
      </main>
    </div>
  );
}
