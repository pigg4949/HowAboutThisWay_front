// src/pages/ReportPage.jsx
import React, { useEffect, useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getReports, updateReportStatus } from "../api/report";
import styles from "../css/ReportPage.module.css";
import ReportModal from "./ReportModal";
import { getInquiry, replyInquiry } from "../api/inquiry";

export default function ReportPage() {
  const [showReportModal, setShowReportModal] = useState(false);
  const [items, setItems] = useState([]); // 이 변수는 현재 사용되지 않는 것 같습니다.
  const [inquiryItems, setInquiryItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [replyingInquiryId, setReplyingInquiryId] = useState(null);
  const [replyText, setReplyText] = useState("");
  const token = useMemo(() => localStorage.getItem("token"));
  const [activeTab, setActiveTab] = useState("report"); // "report" or "inquiry"
  const [reportItems, setReportItems] = useState([]);
  const navigate = useNavigate();

  // 이미지 로딩 상태를 위한 새로운 State (각 이미지마다 관리)
  const [imageLoadStatus, setImageLoadStatus] = useState({});

  // 이미지 로드 완료 핸들러
  const handleImageLoad = (idx) => {
    setImageLoadStatus((prev) => ({ ...prev, [idx]: true }));
  };

  // 이미지 로드 실패 핸들러
  const handleImageError = (e, idx) => {
    setImageLoadStatus((prev) => ({ ...prev, [idx]: "error" }));
    console.error(`이미지 로드 실패 (idx: ${idx}):`, e.target.src);
  };

  // 제보 목록 불러오기
  useEffect(() => {
    if (!token) {
      alert("로그인이 필요합니다.");
      navigate("/login");
      return;
    }
    console.log("제보 목록 로딩 시작."); // 추가
    try {
      getReports(token)
        .then((res) => {
          console.log("getReports API 응답 데이터:", res);
          const processedData = res.map((item) => {
            let typeString = "";
            switch (item.type) {
              case 5:
                typeString = "단차 큼";
                break;
              case 6:
                typeString = "보도 폭 좁음";
                break;
              case 7:
                typeString = "기타";
                break;
              default:
                typeString = item.type;
                break;
            }
            return {
              ...item,
              type: typeString,
            };
          });
          setReportItems(Array.isArray(processedData) ? processedData : []);
          console.log(
            "처리된 reportItems:",
            Array.isArray(processedData) ? processedData : []
          ); // 추가
          setImageLoadStatus({}); // 새 목록 로드 시 이미지 로딩 상태 초기화
        })
        .catch((err) => {
          console.error("제보 목록 조회 실패:", err);
          setReportItems([]);
          setImageLoadStatus({}); // 에러 시에도 상태 초기화
          if (err.response && err.response.status === 401) {
            alert("인증 실패. 다시 로그인해주세요.");
            localStorage.removeItem("token");
            navigate("/login");
          } else if (err.response && err.response.status === 403) {
            navigate("/main");
          }
        });
    } catch (error) {
      console.error("제보 목록 조회 중 예상치 못한 오류 발생:", error);
      alert("로그인이 필요합니다.");
      navigate("/login");
    }
  }, [token, navigate]);

  // 문의 목록 불러오기
  useEffect(() => {
    const fetchInquiries = async () => {
      if (activeTab === "inquiry") {
        setLoading(true);
        setError(null);
        try {
          const data = await getInquiry(token);
          const formattedData = data.map((item) => ({ ...item }));
          setInquiryItems(formattedData);
        } catch (err) {
          setError("문의 내역을 불러오는 데 실패했습니다.");
          console.error(err);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchInquiries();
  }, [activeTab, token]);

  const handleLogout = async () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const handleReplyClick = (idx) => {
    setReplyingInquiryId(idx);
    const inquiryToReply = inquiryItems.find((item) => item.idx === idx);
    setReplyText(inquiryToReply?.adminResponses || "");
  };

  const handleReplySubmit = async (idx) => {
    if (!replyText.trim()) {
      alert("답변 내용을 입력해주세요.");
      return;
    }

    try {
      await replyInquiry(idx, replyText, token);
      alert("답변이 성공적으로 등록되었습니다.");
      setReplyingInquiryId(null);
      setReplyText("");
      const updatedData = await getInquiry(token);
      const formattedUpdatedData = updatedData.map((item) => ({
        ...item,
        status: item.adminResponses ? "APPROVED" : "PENDING",
        date: new Date(item.createdAt).toLocaleDateString("ko-KR"),
      }));
      setInquiryItems(formattedUpdatedData);
    } catch (err) {
      alert("답변 등록에 실패했습니다.");
      console.error("Failed to submit reply:", err);
    }
  };

  const handleReplyCancel = () => {
    setReplyingInquiryId(null);
    setReplyText("");
  };

  const handleStatusChange = async (idx, status) => {
    if (!token) {
      alert("로그인이 필요합니다.");
      navigate("/login");
      return;
    }
    try {
      await updateReportStatus(idx, status, token);
      setReportItems((prev) =>
        prev.map((item) => (item.idx === idx ? { ...item, status } : item))
      );
      alert("상태 변경 성공!");
    } catch (err) {
      console.error("상태 변경 실패:", err);
      if (err.response && err.response.status === 401) {
        alert("인증 실패. 다시 로그인해주세요.");
        localStorage.removeItem("token");
        navigate("/login");
      } else if (err.response && err.response.status === 403) {
        navigate("/main");
      } else {
        alert("상태 변경에 실패했습니다.");
      }
    }
  };

  return (
    <div className={styles.pageWrapper}>
      <header className={styles.headerBar}>
        <span className={styles.headerTitle}>제보 관리</span>
        <button className={styles.logoutBtn} onClick={handleLogout}>
          <img src="/images/icon-logout.png" alt="로그아웃" />
        </button>
      </header>

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

      <div className={styles.listContainer}>
        {/* 제보 내역 */}
        {activeTab === "report" && reportItems.length === 0 && (
          <p className={styles.noItemsMessage}>표시할 제보가 없습니다.</p>
        )}
        {activeTab === "report" &&
          reportItems.map((item) => (
            <div key={item.idx} className={styles.reportItem}>
              {/* Status Indicator */}
              <div
                className={`${styles.statusIndicator} ${
                  item.status === "REJECTED"
                    ? styles.statusRejected
                    : item.status === "APPROVED"
                    ? styles.statusApproved
                    : styles.statusPending
                }`}
              />

              {/* Item Main Content - 상태 표시기 옆, 버튼 제외한 모든 내용 */}
              <div className={styles.itemMainContent}>
                <div className={styles.itemMeta}>
                  <span className={styles.itemType}>{item.type}</span>
                  <span className={styles.itemDate}>{item.createdAt}</span>
                </div>

                {/* 이미지: imageWrapper로 감싸서 로딩 상태 제어 및 깜빡임 방지 */}
                {item.imageUrl && (
                  <div
                    className={`${styles.imageWrapper} ${
                      imageLoadStatus[item.idx] ? styles.imageLoaded : ""
                    }`}
                  >
                    {/* 이미지 로드 상태에 따라 <img> 또는 텍스트 표시 */}
                    {imageLoadStatus[item.idx] === "error" ? (
                      <span className={styles.imageErrorMessage}>
                        이미지를 로드할 수 없습니다.
                      </span>
                    ) : (
                      <img
                        src={`http://localhost:8080${item.imageUrl}`}
                        onLoad={() => handleImageLoad(item.idx)}
                        onError={(e) => handleImageError(e, item.idx)}
                        alt="신고 이미지"
                        className={styles.itemImage}
                      />
                    )}
                  </div>
                )}

                <span className={styles.itemComment}>{item.comment}</span>
              </div>

              {/* Action Buttons (승인/거부) */}
              {item.status === "PENDING" && (
                <div className={styles.actionBtns}>
                  <button
                    className={styles.approveButton}
                    onClick={() => handleStatusChange(item.idx, "APPROVED")}
                  >
                    승인
                  </button>
                  <button
                    className={styles.rejectButton}
                    onClick={() => handleStatusChange(item.idx, "REJECTED")}
                  >
                    거부
                  </button>
                </div>
              )}
            </div>
          ))}

        {/* 문의 내역 */}
        {activeTab === "inquiry" && inquiryItems.length === 0 && (
          <p className={styles.noItemsMessage}>표시할 문의가 없습니다.</p>
        )}
        {activeTab === "inquiry" && loading && (
          <p>문의 내역을 불러오는 중...</p>
        )}
        {activeTab === "inquiry" && error && (
          <p className={styles.errorMessage}>{error}</p>
        )}
        {activeTab === "inquiry" &&
          !loading &&
          !error &&
          inquiryItems.length === 0 && (
            <p className={styles.noItemsMessage}>표시할 문의가 없습니다.</p>
          )}
        {activeTab === "inquiry" &&
          inquiryItems.map((item) => (
            <div key={item.idx} className={styles.reportItem}>
              <div className={styles.itemContent}>
                <span className={styles.itemTitle}>{item.content}</span>{" "}
                <span className={styles.itemDate}>{item.createdAt}</span>
                <span className={styles.userId}>문의자: {item.userId}</span>
                {item.adminResponses && (
                  <div className={styles.adminResponse}>
                    <strong>관리자 답변:</strong> {item.adminResponses}
                  </div>
                )}
                {replyingInquiryId === item.idx ? (
                  <div className={styles.replyForm}>
                    <textarea
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder="답변 내용을 입력하세요."
                      rows="4"
                      className={styles.replyTextarea}
                    />
                    <div className={styles.replyActions}>
                      <button
                        onClick={() => handleReplySubmit(item.idx)}
                        className={styles.submitButton}
                      >
                        등록
                      </button>
                      <button
                        onClick={handleReplyCancel}
                        className={styles.cancelButton}
                      >
                        취소
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => handleReplyClick(item.idx)}
                    className={styles.replyButton}
                  >
                    {item.adminResponses ? "답변 수정" : "답변하기"}
                  </button>
                )}
              </div>
            </div>
          ))}
      </div>

      <nav className={styles.bottomNav}>
        <Link to="/bookmark" className={styles.navItem}>
          <img src="/images/icon-star.png" alt="즐겨찾기" />
        </Link>
        <Link to="/adminmain" className={styles.navItem}>
          <img src="/images/icon-home.png" alt="관리자 홈" />
        </Link>
        <Link to="/mypage" className={styles.navItem}>
          <img src="/images/icon-user.png" alt="내 정보" />
        </Link>
      </nav>
    </div>
  );
}
