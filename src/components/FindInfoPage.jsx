import React, { useState } from "react";
import { Link } from "react-router-dom";
import { findUserId, resetPassword, formatPhoneNumber } from "../api/member";
import styles from "../css/FindInfoPage.module.css";

export default function FindInfoPage() {
  const [name, setName] = useState("");
  const [foundUserId, setFoundUserId] = useState("");
  const [userId, setUserId] = useState("");
  const [phoneForFindId, setPhoneForFindId] = useState("");
  const [phoneForResetPwd, setPhoneForResetPwd] = useState("");
  const [findIdMessage, setFindIdMessage] = useState("");
  const [resetPwdMessage, setResetPwdMessage] = useState("");

  // 전화번호 입력 처리
  const handlePhoneInput = (value) => {
    return value.replace(/[^0-9]/g, "").slice(0, 11);
  };

  const handleFindId = async (e) => {
    e.preventDefault();
    try {
      const response = await findUserId(name, phoneForFindId);
      const foundId = response.userId;
      if (foundId) {
        alert(`✅ 회원님의 아이디는 "${foundId}"입니다.`);
        setFoundUserId(foundId);
        setFindIdMessage("");
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
    console.log("보내는 전화번호:", cleanedPhone);

    try {
      await resetPassword(userId, cleanedPhone);
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
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="이름"
            className={styles.input}
            required
          />
          <input
            type="tel"
            value={formatPhoneNumber(phoneForFindId)}
            onChange={(e) =>
              setPhoneForFindId(handlePhoneInput(e.target.value))
            }
            placeholder="연락처(휴대폰 번호)"
            className={styles.input}
            required
          />
          <button type="submit" className={styles.btnPrimary}>
            찾기
          </button>
        </form>
        {foundUserId && (
          <p className={styles.resultText}>아이디: {foundUserId}</p>
        )}
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
            className={styles.input}
            required
          />
          <input
            type="tel"
            value={formatPhoneNumber(phoneForResetPwd)}
            onChange={(e) =>
              setPhoneForResetPwd(handlePhoneInput(e.target.value))
            }
            placeholder="휴대폰 번호"
            className={styles.input}
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
