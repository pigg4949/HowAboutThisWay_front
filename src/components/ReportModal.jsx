import React, { useState } from "react";
import styles from "../css/MainPage.module.css";

/**
 * 통행 이용 불편 제보 모달 컴포넌트
 * @param {function} onClose - 모달 닫기 콜백
 */
export default function ReportModal({ onClose }) {
  const [category, setCategory] = useState("");
  const [content, setContent] = useState("");
  // 이미지 업로드는 실제 업로드 없이 버튼만 구현

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <button className={styles.modalClose} onClick={onClose}>
          &times;
        </button>
        <h2 className={styles.modalTitle}>통행 이용 불편 제보</h2>
        <form>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className={styles.modalSelect}
          >
            <option value="">-- 분류 --</option>
            <option value="escalator">에스컬레이터</option>
            <option value="elevator">엘리베이터</option>
            <option value="toilet">장애인 화장실</option>
            <option value="etc">기타</option>
          </select>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="불편 사항을 사진과 함께 기재해주세요."
            className={styles.modalTextarea}
          />
          <div className={styles.modalActions}>
            <button type="button" className={styles.buttonSecondary}>
              이미지 업로드
            </button>
            <button type="submit" className={styles.buttonPrimary}>
              제보하기
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
