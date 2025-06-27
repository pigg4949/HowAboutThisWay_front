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


  // 전화번호 하이픈 자동 포맷 함수
  function formatPhone(value) {
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
  }

  const handleFindId = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post("/users/find-id", {
        name,
        phone: phoneForFindId.replace(/-/g, ""),
      });
      const foundId = response.data.userId;
      if (foundId) {
        alert(`✅ 회원님의 아이디는 "${foundId}"입니다.`);
        setFoundUserId(foundId); // 필요 시 저장
        setFindIdMessage(""); // 메시지 대신 alert만 사용
      } else {
        setFindIdMessage("해당 정보로 가입된 아이디를 찾을 수 없습니다.");
      }
    } catch (err) {
      setFindIdMessage("❌ 아이디 찾기 실패. 입력 정보를 다시 확인해주세요.");
    }
  };

  const handleResetPwd = async (e) => {
    e.preventDefault();

    const cleanedPhone = phoneForResetPwd.replace(/-/g, "");
    console.log("보내는 전화번호:", cleanedPhone); // ✅ 여기에!

    try {
      await api.post("/users/reset-password", {
        userId,
        phone: cleanedPhone,
      });
      setResetPwdMessage("임시 비밀번호가 발송되었습니다.");
    } catch {
      setResetPwdMessage("비밀번호 재설정 실패");
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
