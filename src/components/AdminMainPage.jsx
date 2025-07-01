import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import styles from "../css/AdminMainPage.module.css";
import { getReports } from "../api/report";
import { getInquiry } from "../api/inquiry";
import ReportModal from "./ReportModal";
export default function AdminMainPage() {
  const [showReportModal, setShowReportModal] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const isAdmin = localStorage.getItem("isAdmin") === "1";
    if (!token) {
      alert("로그인이 필요합니다.");
      navigate("/login");
    } else if (!isAdmin) {
      alert("관리자만 접근 가능합니다.");
      navigate("/main");
    }
    // 관리자는 진입 허용
  }, [navigate]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    Promise.all([getReports(), getInquiry(token)]).then(
      ([reports, inquiries]) => {
        const pendingReports = (reports || []).filter(
          (r) => r.status === "PENDING"
        ).length;
        const unansweredInquiries = (inquiries || []).filter(
          (i) => !i.adminResponses
        ).length;
        setPendingCount(pendingReports + unansweredInquiries);
      }
    );
  }, []);

  return (
    <>
      <main className={styles.main}>
        {/* 중앙 상단에 큰 로고 */}
        <img
          src="/images/HATWlogo.png"
          alt="HATW 로고"
          className={styles.logo}
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
          <Link
            to="/report"
            className={`${styles.card} ${styles.cardWithBadge}`}
          >
            <img
              src="/images/icon-report.png"
              alt="제보관리 아이콘"
              className={styles.icon}
            />
            {pendingCount > 0 && (
              <span className={styles.badge}>{pendingCount}</span>
            )}
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
