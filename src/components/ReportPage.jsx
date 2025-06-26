import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import styles from "../css/ReportPage.module.css";

export default function ReportPage() {
  const [activeTab, setActiveTab] = useState("report"); // "report" or "inquiry"
  const navigate = useNavigate();

  // 더미 데이터 (서버 연동 시 API 호출로 교체)
  const reportItems = [
    {
      id: 1,
      status: "pending",
      title: "선릉역 엘리베이터 고장이에요!!",
      date: "2025-05-21",
    },
    {
      id: 2,
      status: "approved",
      title: "모란역 2번출구 에스컬레이터 또 점검",
      date: "2025-03-11",
    },
    {
      id: 3,
      status: "rejected",
      title: "양재역 7번출구 에스컬레이터 점검",
      date: "2025-03-05",
    },
  ];
  const inquiryItems = [
    {
      id: 1,
      status: "pending",
      title: "지도에서 제보하기 버튼이 안보여요",
      date: "2025-05-30",
    },
    {
      id: 2,
      status: "approved",
      title: "지도 마커에는 없는 장소가 있어요",
      date: "2025-03-21",
    },
    { id: 3, status: "rejected", title: "어디 사세요?", date: "2025-03-03" },
  ];

  return (
    <div className={styles.pageWrapper}>
      {/* 1) 헤더 바 */}
      <header className={styles.headerBar}>
        <span className={styles.headerTitle}>logo</span>
        <button className={styles.logoutBtn} onClick={() => navigate("/login")}>
          <img src="/images/icon-logout.png" alt="로그아웃" />
        </button>
      </header>

      {/* 2) 탭 버튼 */}
      <div className={styles.tabButtons}>
        <button
          className={
            activeTab === "report" ? styles.tabActive : styles.tabInactive
          }
          onClick={() => setActiveTab("report")}
        >
          제보 내역
        </button>
        <button
          className={
            activeTab === "inquiry" ? styles.tabActive : styles.tabInactive
          }
          onClick={() => setActiveTab("inquiry")}
        >
          문의 내역
        </button>
      </div>

      {/* 3) 리스트 컨테이너 */}
      <div className={styles.listContainer}>
        {activeTab === "report" && (
          <div className={styles.reportListActive}>
            {reportItems.map((item) => (
              <div key={item.id} className={styles.reportItem}>
                <div
                  className={`${styles.statusIndicator} ${
                    item.status === "pending"
                      ? styles.statusPending
                      : item.status === "approved"
                      ? styles.statusApproved
                      : styles.statusRejected
                  }`}
                />
                <span className={styles.itemTitle}>{item.title}</span>
                <span className={styles.itemDate}>{item.date}</span>
              </div>
            ))}
          </div>
        )}
        {activeTab === "inquiry" && (
          <div className={styles.reportListActive}>
            {inquiryItems.map((item) => (
              <div key={item.id} className={styles.reportItem}>
                <div
                  className={`${styles.statusIndicator} ${
                    item.status === "pending"
                      ? styles.statusPending
                      : item.status === "approved"
                      ? styles.statusApproved
                      : styles.statusRejected
                  }`}
                />
                <span className={styles.itemTitle}>{item.title}</span>
                <span className={styles.itemDate}>{item.date}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 4) 하단 내비 */}
      <nav className={styles.bottomNav}>
        <Link to="/bookmark" className={styles.navItem}>
          <img src="/images/icon-star.png" alt="즐겨찾기" />
        </Link>
        <Link to="/main" className={styles.navItem}>
          <img src="/images/icon-home.png" alt="홈" />
        </Link>
        <Link to="/mypage" className={styles.navItem}>
          <img src="/images/icon-user.png" alt="내 정보" />
        </Link>
      </nav>
    </div>
  );
}
