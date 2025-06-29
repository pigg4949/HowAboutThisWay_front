import React, { useState } from "react";
import { Link } from "react-router-dom";
import styles from "../css/MainPage.module.css";
import ReportModal from "./ReportModal";
export default function AdminMainPage() {
  const [showReportModal, setShowReportModal] = useState(false);
  return (
    <>
      <main className={styles.main}>
        {/* 중앙 상단에 큰 로고 */}
        <img
          src="/images/HATWlogo.png"
          alt="HATW 로고"
          style={{
            width: "100%",
            maxWidth: 200,
            height: "auto",
            display: "block",
            margin: "0 auto 24px auto",
          }}
        />
        <div className={styles.cardGrid}>
          <Link to="/map" className={styles.card}>
            <img
              src="/images/icon-find.png"
              alt="길찾기 아이콘"
              className={styles.icon}
            />
            <span className={styles.label}>길찾기</span>
          </Link>
          <Link to="/report" className={styles.card}>
            <img
              src="/images/icon-report.png"
              alt="제보관리 아이콘"
              className={styles.icon}
            />
            <span className={styles.label}>제보관리</span>
          </Link>
          <Link to="/bookmark" className={styles.card}>
            <img
              src="/images/icon-star.png"
              alt="즐겨찾기 아이콘"
              className={styles.icon}
            />
            <span className={styles.label}>즐겨찾기</span>
          </Link>
          <Link to="/admin/members" className={styles.card}>
            <img
              src="/images/icon-user.png"
              alt="회원 관리 아이콘"
              className={styles.icon}
            />
            <span className={styles.label}>회원 관리</span>
            <small className={styles.smallLabel}>문의/불편 접수</small>
          </Link>
        </div>
      </main>
      {showReportModal && (
        <ReportModal onClose={() => setShowReportModal(false)} />
      )}
    </>
  );
}
