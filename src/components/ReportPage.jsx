import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import styles from "../css/ReportPage.module.css";
import { getReports, updateReportStatus } from "../api/report";
import { getInquiry, replyInquiry } from "../api/inquiry";

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
  const [showImageModal, setShowImageModal] = useState(false);
  const [modalImageUrl, setModalImageUrl] = useState("");
  const navigate = useNavigate();
  const isAdmin = localStorage.getItem("isAdmin") === "1";

  useEffect(() => {
    const token = localStorage.getItem("token");
    // 제보 내역 불러오기
    getReports().then((res) => setReportItems(res || []));
    // 문의 내역 불러오기 (토큰 전달)
    getInquiry(token).then((res) => setInquiryItems(res || []));
  }, []);

  useEffect(() => {
    if (showInquiryModal && selectedInquiry) {
      setInquiryAnswer(selectedInquiry.adminResponses || "");
    }
  }, [showInquiryModal, selectedInquiry]);

  function showResultToast(msg) {
    setToastMsg(msg);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2000);
  }

  const handleStatusChange = (idx, status) => {
    updateReportStatus(idx, status).then(() => {
      setShowModal(false);
      getReports().then((res) => setReportItems(res || []));
      showResultToast(
        status === "APPROVED"
          ? "처리 완료되었습니다!"
          : "추가 검토 필요로 처리되었습니다!"
      );
    });
  };

  const handleInquiryResponse = async (statusMsg) => {
    if (!selectedInquiry) return;
    const token = localStorage.getItem("token");
    try {
      await replyInquiry(selectedInquiry.idx, inquiryAnswer, token);
      setShowInquiryModal(false);
      getInquiry(token).then((res) => setInquiryItems(res || []));
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
                <button
                  type="button"
                  style={{
                    color: "#007BFF",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    textDecoration: "underline",
                  }}
                  onClick={() => {
                    setModalImageUrl(selectedReport.imageUrl);
                    setShowImageModal(true);
                  }}
                >
                  첨부파일 보기
                </button>
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
                처리 완료
              </button>
              <button
                onClick={() =>
                  handleStatusChange(selectedReport.idx, "REJECTED")
                }
                style={{
                  flex: 1,
                  background: "#FF6B6B",
                  color: "white",
                  border: "none",
                  borderRadius: 6,
                  padding: 12,
                  fontWeight: 600,
                  fontSize: 16,
                  cursor: "pointer",
                }}
              >
                추가 검토
              </button>
            </div>
          </div>
        </div>
      )}
      {/* 5) 문의 답변 모달 */}
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
            <h2 style={{ textAlign: "center", marginBottom: 16 }}>문의 답변</h2>
            <div
              style={{
                border: "1px solid #bbb",
                borderRadius: 8,
                padding: 16,
                minHeight: 80,
                marginBottom: 16,
              }}
            >
              {selectedInquiry.content}
            </div>
            <textarea
              value={inquiryAnswer}
              onChange={(e) => setInquiryAnswer(e.target.value)}
              placeholder="답변을 입력하세요..."
              style={{
                width: "100%",
                minHeight: 100,
                padding: 12,
                border: "1px solid #ddd",
                borderRadius: 6,
                marginBottom: 16,
                resize: "vertical",
              }}
            />
            <div style={{ display: "flex", gap: 8 }}>
              <button
                onClick={() => handleInquiryResponse("답변이 저장되었습니다!")}
                style={{
                  flex: 1,
                  background: "#007BFF",
                  color: "white",
                  border: "none",
                  borderRadius: 6,
                  padding: 12,
                  fontWeight: 600,
                  fontSize: 16,
                  cursor: "pointer",
                }}
              >
                답변 저장
              </button>
            </div>
          </div>
        </div>
      )}
      {/* 6) 토스트 메시지 */}
      {showToast && (
        <div
          style={{
            position: "fixed",
            bottom: 20,
            left: "50%",
            transform: "translateX(-50%)",
            background: "#333",
            color: "white",
            padding: "12px 24px",
            borderRadius: 6,
            zIndex: 1000,
          }}
        >
          {toastMsg}
        </div>
      )}
      {/* 이미지 미리보기 모달 */}
      {showImageModal && (
        <div
          className={styles.modalOverlay}
          onClick={() => setShowImageModal(false)}
        >
          <div
            className={styles.modalContent}
            style={{ maxWidth: 400, minWidth: 200, textAlign: "center" }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className={styles.modalClose}
              onClick={() => setShowImageModal(false)}
            >
              ×
            </button>
            <h3 style={{ marginBottom: 12 }}>첨부 이미지</h3>
            <img
              src={modalImageUrl}
              alt="첨부 이미지"
              style={{ maxWidth: "100%", maxHeight: 350, borderRadius: 8 }}
            />
          </div>
        </div>
      )}
      {/* 7) 하단 내비 */}
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
