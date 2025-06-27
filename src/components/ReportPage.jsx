import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import styles from "../css/ReportPage.module.css";
import api from "../api/axios";
export default function ReportPage() {
  const [activeTab, setActiveTab] = useState("report"); // "report" or "inquiry"
  const [reportItems, setReportItems] = useState([]);
  const [inquiryItems, setInquiryItems] = useState([]);
  const [selectedReport, setSelectedReport] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedInquiry, setSelectedInquiry] = useState(null);
  const [showInquiryModal, setShowInquiryModal] = useState(false);
  const [toastMsg, setToastMsg] = useState("");
  const [showToast, setShowToast] = useState(false);
  const [inquiryAnswer, setInquiryAnswer] = useState("");
  const navigate = useNavigate();
  const isAdmin = localStorage.getItem("isAdmin") === "1";
  useEffect(() => {
    // 제보 내역 불러오기
    api
      .get("/reports/admin/pending")
      .then((res) => setReportItems(res.data || []));
    // 문의 내역 불러오기
    api.get("/inquiry/admin").then((res) => setInquiryItems(res.data || []));
  }, []);
  useEffect(() => {
    if (showInquiryModal && selectedInquiry) {
      setInquiryAnswer(selectedInquiry.adminResponses || "");
    }
  }, [showInquiryModal, selectedInquiry]);
  function showResultToast(msg) {
    setToastMsg(msg);
    setShowToast(true);
  }
  const handleStatusChange = (idx, status) => {
    api.put(`/reports/admin/${idx}/status`, { status }).then(() => {
      setShowModal(false);
      api
        .get("/reports/admin/pending")
        .then((res) => setReportItems(res.data || []));
      showResultToast(
        status === "APPROVED"
          ? "처리 완료되었습니다!"
          : "추가 검토 필요로 처리되었습니다!"
      );
    });
  };
  const handleInquiryResponse = async (statusMsg) => {
    if (!selectedInquiry) return;
    try {
      await api.put(`/inquiry/${selectedInquiry.idx}`, {
        adminResponses: inquiryAnswer,
      });
      setShowInquiryModal(false);
      api.get("/inquiry/admin").then((res) => setInquiryItems(res.data || []));
      showResultToast(statusMsg);
    } catch (err) {
      showResultToast(
        "답변 저장 실패: " + (err.response?.data?.message || err.message)
      );
    }
  };
  return (
    <div className={styles.pageWrapper}>
      {/* 1) 헤더 바 */}
      <header className={styles.headerBar}>
        <span className={styles.headerLogo}>logo</span>
        <span className={styles.headerTitle}>제보관리</span>
        <span className={styles.headerRight}></span>
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
              <div
                key={item.idx}
                className={styles.reportItem}
                style={{ cursor: "pointer" }}
                onClick={() => {
                  setSelectedReport(item);
                  setShowModal(true);
                }}
              >
                <div
                  className={`${styles.statusIndicator} ${
                    item.status === "APPROVED"
                      ? styles.statusApproved
                      : item.status === "REJECTED"
                      ? styles.statusRejected
                      : styles.statusPending
                  }`}
                />
                <span className={styles.itemTitle}>{item.comment}</span>
                <span className={styles.itemDate}>{item.createdAt}</span>
              </div>
            ))}
          </div>
        )}
        {activeTab === "inquiry" && (
          <div className={styles.reportListActive}>
            {inquiryItems.map((item) => (
              <div
                key={item.idx}
                className={styles.reportItem}
                style={{ cursor: "pointer" }}
                onClick={() => {
                  setSelectedInquiry(item);
                  setShowInquiryModal(true);
                }}
              >
                <div
                  className={`${styles.statusIndicator} ${
                    item.adminResponses
                      ? styles.statusApproved
                      : styles.statusPending
                  }`}
                />
                <span className={styles.itemTitle}>{item.content}</span>
                <span className={styles.itemDate}>{item.createdAt}</span>
              </div>
            ))}
          </div>
        )}
      </div>
      {/* 4) 상세 모달 */}
      {showModal && selectedReport && (
        <div className={styles.modalOverlay}>
          <div
            className={styles.modalContent}
            style={{ maxWidth: 380, minWidth: 280 }}
          >
            <button
              className={styles.modalClose}
              onClick={() => setShowModal(false)}
            >
              ×
            </button>
            <h2 style={{ textAlign: "center", marginBottom: 16 }}>
              불편 제보 관리
            </h2>
            <div
              style={{
                border: "1px solid #bbb",
                borderRadius: 8,
                padding: 16,
                minHeight: 80,
                marginBottom: 16,
              }}
            >
              {selectedReport.comment}
            </div>
            {selectedReport.imageUrl && (
              <div style={{ marginBottom: 12 }}>
                <a
                  href={selectedReport.imageUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: "#007BFF" }}
                >
                  첨부파일 보기
                </a>
              </div>
            )}
            <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
              <button
                onClick={() =>
                  handleStatusChange(selectedReport.idx, "APPROVED")
                }
                style={{
                  flex: 1,
                  background: "#8FD694",
                  color: "#222",
                  border: "none",
                  borderRadius: 6,
                  padding: 12,
                  fontWeight: 600,
                  fontSize: 16,
                  cursor: "pointer",
                }}
              >
                승인
              </button>
              <button
                onClick={() =>
                  handleStatusChange(selectedReport.idx, "REJECTED")
                }
                style={{
                  flex: 1,
                  background: "#F7B6B6",
                  color: "#222",
                  border: "none",
                  borderRadius: 6,
                  padding: 12,
                  fontWeight: 600,
                  fontSize: 16,
                  cursor: "pointer",
                }}
              >
                검토 필요
              </button>
            </div>
          </div>
        </div>
      )}
      {/* 문의 상세 모달 */}
      {showInquiryModal && selectedInquiry && (
        <div className={styles.modalOverlay}>
          <div
            className={styles.modalContent}
            style={{ maxWidth: 380, minWidth: 280 }}
          >
            <button
              className={styles.modalClose}
              onClick={() => setShowInquiryModal(false)}
            >
              ×
            </button>
            <h2 style={{ textAlign: "center", marginBottom: 16 }}>
              사용자 문의
            </h2>
            <div
              style={{
                border: "1px solid #bbb",
                borderRadius: 8,
                padding: 16,
                minHeight: 60,
                marginBottom: 16,
              }}
            >
              {selectedInquiry.content}
            </div>
            <textarea
              value={inquiryAnswer}
              onChange={(e) => setInquiryAnswer(e.target.value)}
              placeholder="답변을 입력하세요."
              style={{
                width: "100%",
                border: "1px solid #bbb",
                borderRadius: 8,
                padding: 16,
                minHeight: 60,
                marginBottom: 16,
                background: "#FAFAFA",
                resize: "vertical",
                boxSizing: "border-box",
              }}
            />
            <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
              <button
                onClick={() => handleInquiryResponse("처리 완료되었습니다!")}
                style={{
                  flex: 1,
                  background: "#8FD694",
                  color: "#222",
                  border: "none",
                  borderRadius: 6,
                  padding: 12,
                  fontWeight: 600,
                  fontSize: 16,
                  cursor: "pointer",
                }}
              >
                처리 완료
              </button>
              <button
                onClick={() =>
                  handleInquiryResponse("추가 검토 필요로 처리되었습니다!")
                }
                style={{
                  flex: 1,
                  background: "#F7B6B6",
                  color: "#222",
                  border: "none",
                  borderRadius: 6,
                  padding: 12,
                  fontWeight: 600,
                  fontSize: 16,
                  cursor: "pointer",
                }}
              >
                추가 검토 필요
              </button>
            </div>
          </div>
        </div>
      )}
      {/* 안내 팝업 */}
      {showToast && (
        <div className={styles.toastPopup}>
          <div className={styles.toastMsg}>{toastMsg}</div>
          <button
            className={styles.toastBtn}
            onClick={() => setShowToast(false)}
          >
            닫기
          </button>
        </div>
      )}
      {/* 5) 하단 내비 */}
      <nav className={styles.bottomNav}>
        <Link to="/bookmark" className={styles.navItem}>
          <img src="/images/icon-star.png" alt="즐겨찾기" />
        </Link>
        <Link to={isAdmin ? "/admin" : "/main"} className={styles.navItem}>
          <img src="/images/icon-home.png" alt="홈" />
        </Link>
        <Link to="/mypage" className={styles.navItem}>
          <img src="/images/icon-user.png" alt="내 정보" />
        </Link>
      </nav>
    </div>
  );
}












