import React, { useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import styles from "../css/FindInfoPage.module.css";

export default function FindInfoPage() {
  const [email, setEmail] = useState("");
  const [foundUserId, setFoundUserId] = useState("");
  const [userId, setUserId] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");

  const handleFindId = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post("/find-id", { email });
      setFoundUserId(res.data.userId);
      setMessage("");
    } catch {
      setMessage("아이디 찾기 실패");
    }
  };

  const handleResetPwd = async (e) => {
    e.preventDefault();
    try {
      await api.post("/reset-password", { userId, phone });
      setMessage("임시 비밀번호가 발송되었습니다.");
    } catch {
      setMessage("비밀번호 재설정 실패");
    }
  };

  return (
    <div className={styles.mainContent}>
      <section className={styles.findSection}>
        <div className={styles.header}>
          <Link to="/" className={styles.backButton}>
            ←
          </Link>
          <h2 className={styles.pageTitle}>아이디/비밀번호 찾기</h2>
        </div>
        <h3>아이디 찾기</h3>
        <form onSubmit={handleFindId} className={styles.findForm}>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="가입된 이메일"
            required
          />
          <button type="submit" className={styles.btnPrimary}>
            찾기
          </button>
        </form>
        {foundUserId && (
          <p className={styles.resultText}>아이디: {foundUserId}</p>
        )}
      </section>

      <section className={styles.findSection}>
        <h3>비밀번호 재설정</h3>
        <form onSubmit={handleResetPwd} className={styles.findForm}>
          <input
            type="text"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            placeholder="아이디"
            required
          />
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="휴대폰 번호"
            required
          />
          <button type="submit" className={styles.btnPrimary}>
            재설정
          </button>
        </form>
        {message && <p className={styles.resultText}>{message}</p>}
      </section>
    </div>
  );
}
