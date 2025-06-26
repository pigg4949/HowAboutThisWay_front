// src/pages/ReportPage.jsx
import React, { useEffect, useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getReports, updateReportStatus } from "../api/report";
import styles from "../css/ReportPage.module.css";
import ReportModal from "./ReportModal";
import { getInquiry, replyInquiry } from "../api/inquiry";

export default function ReportPage() {
  const [showReportModal, setShowReportModal] = useState(false);
  const [items, setItems] = useState([]);
  const [inquiryItems, setInquiryItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [replyingInquiryId, setReplyingInquiryId] = useState(null);
  const [replyText, setReplyText] = useState("");
  const token = useMemo(() => localStorage.getItem("token"));
  const [activeTab, setActiveTab] = useState("report"); // "report" or "inquiry"
  const [reportItems, setReportItems] = useState([]);
  /*const [inquiryItems] = useState([
    {
      idx: 1,
      status: "PENDING",
      title: "지도에서 제보하기 버튼이 안보여요",
      date: "2025-05-30",
    },
    {
      idx: 2,
      status: "APPROVED",
      title: "지도 마커에는 없는 장소가 있어요",
      date: "2025-03-21",
    },
    { idx: 3, status: "rejected", title: "어디 사세요?", date: "2025-03-03" },
  ]);*/
  const navigate = useNavigate();

  const handleLogout = async () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  // 제보 목록 불러오기
  useEffect(() => {
    if (!token) {
      alert("로그인이 필요합니다.");
      navigate("/login");
      return;
    }

    try {
      getReports(token)
        .then((res) => {
          // console.log(res); // 원본 데이터 확인용
          // // 1. type을 문자열로 변환하는 로직
          const processedData = res.map((item) => {
            let typeString = ""; // 변환된 문자열을 담을 변수
            // item.type 값에 따라 문자열을 할당
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
              default: // 혹시 모를 다른 값에 대한 처리
                typeString = item.type; // 원본 유지
                break;
            }
            // 2. 기존 item의 모든 속성을 복사하고, type 속성만 새로운 문자열로 덮어쓰기
            return {
              ...item, // '...'는 item의 모든 기존 속성(idx, comment 등)을 그대로 가져옵니다.
              type: typeString, // type 값만 새로운 문자열로 교체합니다.
            };
          }); // console.log(processedData); // 변환 후 데이터 확인용
          // 3. 변환된 데이터를 state에 저장
          setReportItems(Array.isArray(processedData) ? processedData : []);
        })
        .catch((err) => {
          console.error("제보 목록 조회 실패:", err);
          setReportItems([]);
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
  // useEffect to fetch inquiries when the component mounts or activeTab/token changes
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
  }, [activeTab, token]); // Re-run when activeTab or token changes

  const handleReplyClick = (idx) => {
    setReplyingInquiryId(idx);
    const inquiryToReply = inquiryItems.find((item) => item.idx === idx);
    // Pre-fill reply text if there's an existing admin response
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
      // Re-fetch inquiries to update the list and status
      const updatedData = await getInquiry(token);
      const formattedUpdatedData = updatedData.map((item) => ({
        ...item,
        status: item.adminResponses ? "APPROVED" : "PENDING", // Re-apply status logic
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

  // 상태 변경 핸들러
  const handleStatusChange = async (idx, status) => {
    if (!token) {
      alert("로그인이 필요합니다.");
      navigate("/login");
      return;
    }
    try {
      // Pass the token to the updateReportStatus function
      console.log(idx, status);
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
                  {" "}
                  {/* itemType, itemDate 컨테이너 */}
                  <span className={styles.itemType}>{item.type}</span>
                  <span className={styles.itemDate}>{item.createdAt}</span>
                </div>
                {item.imageUrl && (
                  <img
                    src={`http://localhost:8080${item.imageUrl}`}
                    onError={(e) => (e.target.src = "/default.png")}
                    alt="신고 이미지"
                    className={styles.itemImage}
                  />
                )}
                {/* item.comment (itemTitle 대신 itemComment로 클래스명 변경) */}
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
                {" "}
                {/* itemContent는 문의 내역에만 사용 */}
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
