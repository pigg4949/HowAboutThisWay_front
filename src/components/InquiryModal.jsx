import React, { useState } from "react";
import { createInquiry } from "../api/inquiry";
import styles from "../css/MainPage.module.css";

export default function InquiryModal({ onClose }) {
  const [inquiry, setInquiry] = useState("");
  const [loading, setLoading] = useState(false);

  const handleInquiry = async () => {
    if (!inquiry.trim()) {
      alert("문의 내용을 입력하세요.");
      return;
    }
    const token = localStorage.getItem("token");
    if (!token) {
      alert("로그인이 필요합니다.");
      return;
    }
    setLoading(true);
    try {
      await createInquiry({ content: inquiry }, token);
      alert("문의가 전송되었습니다.");
      setInquiry("");
      onClose();
    } catch (err) {
      alert("문의 전송 실패: " + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={`${styles.modalContent} ${styles.inquiryModalContent}`}>
        <button
          className={`${styles.modalClose} ${styles.inquiryModalClose}`}
          onClick={onClose}
        >
          ×
        </button>
        <h2 className={`${styles.modalTitle} ${styles.inquiryModalTitle}`}>
          문의하기
        </h2>
        <div className={styles.inquiryTextareaWrapper}>
          <textarea
            value={inquiry}
            onChange={(e) => setInquiry(e.target.value)}
            placeholder="문의 또는 불편 사항을 입력하세요."
            className={styles.inquiryTextarea}
            disabled={loading}
          />
        </div>
        <button
          onClick={handleInquiry}
          className={styles.inquirySendBtn}
          disabled={loading}
        >
          {loading ? "전송 중..." : "전송"}
        </button>
      </div>
    </div>
  );
}
