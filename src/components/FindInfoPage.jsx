import React, { useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import styles from "../css/FindInfoPage.module.css";

export default function FindInfoPage() {
  const [name, setName] = useState("");
  const [phoneForFindId, setPhoneForFindId] = useState("");
  const [foundUserId, setFoundUserId] = useState("");
  const [userId, setUserId] = useState("");
  const [phoneForResetPwd, setPhoneForResetPwd] = useState("");
  const [findIdMessage, setFindIdMessage] = useState("");
  const [resetPwdMessage, setResetPwdMessage] = useState("");

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
      await api.post("/find-id", {
        name,
        phone: phoneForFindId.replace(/-/g, ""),
      });
      setFindIdMessage("입력하신 연락처로 아이디가 문자로 발송되었습니다.");
      setFoundUserId("");
    } catch {
      setFindIdMessage("아이디 찾기 실패");
    }
  };

  const handleResetPwd = async (e) => {
    e.preventDefault();
    try {
      await api.post("/reset-password", {
        userId,
        phone: phoneForResetPwd.replace(/-/g, ""),
      });
      setResetPwdMessage("임시 비밀번호가 발송되었습니다.");
    } catch {
      setResetPwdMessage("비밀번호 재설정 실패");
    }
  };

  return (
    <div className={styles.mainContent}>
      <Link
        to="/"
        className={styles.backButton}
        style={{ position: "absolute", top: 18, left: 18, zIndex: 10 }}
      >
        ←
      </Link>
      <section className={styles.findSection}>
        <div className={styles.header}>
          <h2 className={styles.pageTitle}>아이디/비밀번호 찾기</h2>
        </div>
        <h3>아이디 찾기</h3>
        <form onSubmit={handleFindId} className={styles.findForm}>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="이름"
            className={styles.input}
            required
          />
          <input
            type="tel"
            value={formatPhone(phoneForFindId)}
            onChange={(e) =>
              setPhoneForFindId(
                e.target.value.replace(/[^0-9]/g, "").slice(0, 11)
              )
            }
            placeholder="연락처(휴대폰 번호)"
            className={styles.input}
            required
          />
          <button type="submit" className={styles.btnPrimary}>
            찾기
          </button>
        </form>
        {findIdMessage && <p className={styles.resultText}>{findIdMessage}</p>}
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
            value={formatPhone(phoneForResetPwd)}
            onChange={(e) =>
              setPhoneForResetPwd(
                e.target.value.replace(/[^0-9]/g, "").slice(0, 11)
              )
            }
            placeholder="휴대폰 번호"
            required
          />
          <button type="submit" className={styles.btnPrimary}>
            재설정
          </button>
        </form>
        {resetPwdMessage && (
          <p className={styles.resultText}>{resetPwdMessage}</p>
        )}
      </section>
    </div>
  );
}
