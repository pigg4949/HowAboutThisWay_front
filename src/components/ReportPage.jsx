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

  // 이미지 전체 경로 생성 함수
  const getFullImageUrl = (url) => {
    const prefix = "http://localhost:8080";
    if (!url) return "";
    if (url.startsWith("/uploads/")) return prefix + url;
    if (url.startsWith("/reportImgs/")) return prefix + "/uploads" + url;
    if (url.startsWith("http")) return url;
    return prefix + "/uploads/" + url.replace(/^\/+/, "");
  };

  return (
    <div className={styles.pageWrapper}>
      {/* 1) 헤더 바 */}
      <header className={styles.headerBar}>
        <span className={styles.headerLogo}>
          <img
            src="/images/HATWlogo.png"
            alt="HATW 로고"
            className={styles.headerLogoImg}
            onClick={() => {
              navigate(isAdmin ? "/admin" : "/main");
            }}
          />
        </span>
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
          <div className={`${styles.modalContent} ${styles.modalContentWide}`}>
            <button
              className={styles.modalClose}
              onClick={() => setShowModal(false)}
            >
              ×
            </button>
            <h2 className={styles.modalTitleCenter}>불편 제보 관리</h2>
            <div
              style={{
                fontSize: 14,
                color: "#666",
                marginBottom: 8,
                textAlign: "right",
              }}
            >
              작성자: {selectedReport.userId || "알 수 없음"}
            </div>
            <div className={styles.modalBox}>{selectedReport.comment}</div>
            {selectedReport.imageUrl && (
              <div>
                <button
                  type="button"
                  className={styles.modalImageBtn}
                  onClick={() => {
                    setModalImageUrl(selectedReport.imageUrl);
                    setShowImageModal(true);
                  }}
                >
                  첨부파일 보기
                </button>
              </div>
            )}
            <div className={styles.modalActionRow}>
              <button
                onClick={() =>
                  handleStatusChange(selectedReport.idx, "APPROVED")
                }
                className={styles.modalActionBtn}
              >
                처리 완료
              </button>
              <button
                onClick={() =>
                  handleStatusChange(selectedReport.idx, "REJECTED")
                }
                className={`${styles.modalActionBtn} ${styles.modalActionBtnReject}`}
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
            className={`${styles.modalContent} ${styles.inquiryModalContent}`}
          >
            <button
              className={styles.modalClose}
              onClick={() => setShowInquiryModal(false)}
            >
              ×
            </button>
            <h2 className={styles.inquiryModalTitle}>문의 답변</h2>
            <div
              style={{
                fontSize: 14,
                color: "#666",
                marginBottom: 8,
                textAlign: "right",
              }}
            >
              작성자: {selectedInquiry.userId || "알 수 없음"}
            </div>
            <div className={styles.inquiryContent}>
              {selectedInquiry.content}
            </div>
            <textarea
              value={inquiryAnswer}
              onChange={(e) => setInquiryAnswer(e.target.value)}
              placeholder="답변을 입력하세요..."
              className={styles.inquiryTextarea}
            />
            <div className={styles.inquiryActionRow}>
              <button
                onClick={() => handleInquiryResponse("답변이 저장되었습니다!")}
                className={styles.inquiryActionBtn}
              >
                답변 저장
              </button>
            </div>
          </div>
        </div>
      )}
      {/* 6) 토스트 메시지 */}
      {showToast && <div className={styles.toastContainer}>{toastMsg}</div>}
      {/* 이미지 미리보기 모달 */}
      {showImageModal && (
        <div
          className={styles.modalOverlay}
          onClick={() => setShowImageModal(false)}
        >
          <div
            className={`${styles.modalContent} ${styles.imageModalContent}`}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className={styles.modalClose}
              onClick={() => setShowImageModal(false)}
            >
              ×
            </button>
            <h3 className={styles.imageModalTitle}>첨부 이미지</h3>
            <img
              src={getFullImageUrl(modalImageUrl)}
              alt="첨부 이미지"
              className={styles.imageModalImg}
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
