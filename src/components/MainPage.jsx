// src/pages/MainPage.jsx
import React, { useEffect, useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import styles from "../css/MainPage.module.css";
import ReportModal from "./ReportModal";
import HelpModal from "./HelpModal";

export default function MainPage() {
  const [showReportModal, setShowReportModal] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(
    () => !localStorage.getItem("helpModalHide")
  );
  const navigate = useNavigate();
  const token = useMemo(() => localStorage.getItem("token"), []);

  useEffect(() => {
    if (!token) {
      alert("토큰이 만료되었습니다.");
      navigate("/login");
    }
  }, [token, navigate]);

  return (
    <>
      <main className={styles.main}>
        <div className={styles.cardGrid}>
          <Link to="/map" className={styles.card}>
            <img
              src="/images/icon-find.png"
              alt="길찾기 아이콘"
              className={styles.icon}
            />
            <span className={styles.label}>길찾기</span>
          </Link>
          <a
            href="#"
            className={styles.card}
            onClick={(e) => {
              e.preventDefault();
              setShowReportModal(true);
            }}
          >
            <img
              src="/images/icon-report.png"
              alt="제보하기 아이콘"
              className={styles.icon}
            />
            <span className={styles.label}>제보하기</span>
          </a>
          <Link to="/bookmark" className={styles.card}>
            <img
              src="/images/icon-star.png"
              alt="즐겨찾기 아이콘"
              className={styles.icon}
            />
            <span className={styles.label}>즐겨찾기</span>
          </Link>
          <Link to="/mypage" className={styles.card}>
            <img
              src="/images/icon-user.png"
              alt="내 정보 아이콘"
              className={styles.icon}
            />
            <span className={styles.label}>내 정보</span>
            <small className={styles.smallLabel}>문의/불편 접수</small>
          </Link>
        </div>
      </main>
      {showReportModal && (
        <ReportModal onClose={() => setShowReportModal(false)} />
      )}
      <HelpModal open={showHelpModal} onClose={() => setShowHelpModal(false)} />
    </>
  );
}
