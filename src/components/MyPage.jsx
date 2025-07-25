import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  getUserInfo,
  updateUser,
  logoutUser,
  signoutUser,
} from "../api/member";
import { createInquiry, getMyInquiries } from "../api/inquiry";
import { getMyReports } from "../api/reports";
import ReportEditModal from "./ReportEditModal";
import styles from "../css/MyPage.module.css";

export default function MyPage() {
  const [info, setInfo] = useState(null);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [activeTab, setActiveTab] = useState("report");
  const [recentReports, setRecentReports] = useState([]);
  const [recentInquiries, setRecentInquiries] = useState([]);
  const [allReports, setAllReports] = useState([]);
  const [allInquiries, setAllInquiries] = useState([]);
  const [showAllModal, setShowAllModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      try {
        const res = await getUserInfo();
        setInfo(res);
      } catch {
        alert("로그인 토큰 만료");
        navigate("/login");
      }
    })();
    // 내 제보/문의 내역 불러오기
    const token = localStorage.getItem("token");
    if (token) {
      getMyReports(token).then((data) => {
        setAllReports(Array.isArray(data) ? data : []);
        setRecentReports(Array.isArray(data) ? data.slice(0, 3) : []);
      });
      getMyInquiries(token).then((data) => {
        setAllInquiries(Array.isArray(data) ? data : []);
        setRecentInquiries(Array.isArray(data) ? data.slice(0, 3) : []);
      });
    }
  }, [navigate]);

  const handleUpdate = async () => {
    if (password !== confirm) {
      alert("비밀번호가 일치하지 않습니다.");
      return;
    }
    try {
      await updateUser({ passwordHash: password });
      alert("변경 완료");
      setPassword("");
      setConfirm("");
    } catch (err) {
      alert(
        "비밀번호 변경 실패: " + (err.response?.data?.message || err.message)
      );
    }
  };

  const handleLogout = async () => {
    try {
      await logoutUser();
    } catch (err) {
      // 서버 에러 무시(오프라인 등)
    }
    localStorage.removeItem("token");
    navigate("/");
  };

  const handleDelete = async () => {
    if (!window.confirm("탈퇴하시겠습니까?")) return;
    await signoutUser();
    navigate("/");
  };

  // 제보 데이터 새로고침
  const refreshReports = async () => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const data = await getMyReports(token);
        setAllReports(Array.isArray(data) ? data : []);
        setRecentReports(Array.isArray(data) ? data.slice(0, 3) : []);
      } catch (error) {
        console.error("제보 데이터 새로고침 실패:", error);
      }
    }
  };

  if (!info) return <p>로딩 중…</p>;

  return (
    <>
      <header className={styles.mypageHeader}>
        <div className={styles.mypageHeaderRow}>
          <img
            src="/images/HATWlogo.png"
            alt="HATW 로고"
            className={styles.mypageLogo}
            onClick={() => {
              const isAdmin = localStorage.getItem("isAdmin") === "1";
              navigate(isAdmin ? "/admin" : "/main");
            }}
          />
          <h2 className={`${styles.pageTitle} ${styles.mypageTitle}`}>
            내 정보
          </h2>
        </div>
      </header>
      <main className={styles.mainContent}>
        <div className={styles.formGroup}>
          <label>이름</label>
          <input value={info.name || info.username} readOnly />
        </div>

        <div className={styles.formGroup}>
          <label>비밀번호</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="새 비밀번호"
          />
        </div>

        <div className={styles.formGroup}>
          <label>비밀번호 확인</label>
          <input
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            placeholder="다시 입력"
          />
        </div>

        <button onClick={handleUpdate} className={styles.btnMain}>
          저장
        </button>

        {/* 제보/문의 내역 미리보기 */}
        <div className={styles.historyBox}>
          <div className={styles.tabRow}>
            <button
              className={activeTab === "report" ? styles.activeTab : ""}
              onClick={() => setActiveTab("report")}
            >
              제보 내역
            </button>
            <button
              className={activeTab === "inquiry" ? styles.activeTab : ""}
              onClick={() => setActiveTab("inquiry")}
            >
              문의 내역
            </button>
          </div>
          <ul className={styles.historyList}>
            {(() => {
              const list = activeTab === "report" ? allReports : allInquiries;
              if (list.length === 0) {
                return (
                  <li className={styles.historyEmpty}>
                    작성한 내역이 없습니다.
                  </li>
                );
              }
              return list.map((item, idx) => (
                <li
                  key={item.idx || idx}
                  className={`${styles.historyItem} ${styles.historyItemPointer}`}
                  onClick={() => {
                    setSelectedItem(item);
                    setShowDetailModal(true);
                  }}
                >
                  <span
                    className={`${styles.statusDot} ${
                      activeTab === "report"
                        ? item.status === "APPROVED"
                          ? styles.statusDotApproved
                          : item.status === "REJECTED"
                          ? styles.statusDotRejected
                          : styles.statusDotPending
                        : item.adminResponses
                        ? styles.statusDotApproved
                        : styles.statusDotPending
                    }`}
                  ></span>
                  <span
                    className={`${styles.historyContent} ${styles.historyContentFlex}`}
                  >
                    {activeTab === "report" ? item.comment : item.content}
                  </span>
                  <span className={styles.historyDate}>
                    {(item.createdAt || "").slice(0, 10)}
                  </span>
                </li>
              ));
            })()}
          </ul>
        </div>

        {/* 로그아웃/회원탈퇴 버튼 하단 고정 */}
        <div className={styles.bottomButtons}>
          <button onClick={handleLogout} className={styles.btnSub}>
            로그아웃
          </button>
          <button onClick={handleDelete} className={styles.btnDelete}>
            회원탈퇴
          </button>
        </div>
      </main>

      {/* 상세 모달 */}
      {showDetailModal && selectedItem && (
        <div
          className={styles.modalOverlay}
          onClick={() => setShowDetailModal(false)}
        >
          <div
            className={styles.detailModalContent}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className={styles.modalClose}
              onClick={() => setShowDetailModal(false)}
            >
              ×
            </button>
            <h2 className={styles.detailModalTitle}>
              {activeTab === "report" ? "제보 상세" : "문의 상세"}
            </h2>

            {activeTab === "report" && selectedItem.imageUrl && (
              <div>
                <img
                  src={selectedItem.imageUrl}
                  alt="제보 이미지"
                  className={styles.detailModalImage}
                />
              </div>
            )}

            <div className={styles.detailModalSection}>
              <div className={styles.detailModalSectionTitle}>내용</div>
              <div className={styles.detailModalSectionBox}>
                {activeTab === "report"
                  ? selectedItem.comment
                  : selectedItem.content}
              </div>
            </div>

            {activeTab === "report" && (
              <div className={styles.detailModalSection}>
                <div className={styles.detailModalSectionTitle}>상태</div>
                <div
                  className={
                    styles.detailModalStatusBox +
                    " " +
                    (selectedItem.status === "APPROVED"
                      ? styles.detailModalStatusApproved
                      : selectedItem.status === "REJECTED"
                      ? styles.detailModalStatusRejected
                      : styles.detailModalStatusPending)
                  }
                >
                  {selectedItem.status === "APPROVED"
                    ? "승인됨"
                    : selectedItem.status === "REJECTED"
                    ? "거절됨"
                    : "대기중"}
                </div>
              </div>
            )}

            {activeTab === "inquiry" && (
              <div className={styles.detailModalSection}>
                <div className={styles.detailModalSectionTitle}>
                  관리자 답변
                </div>
                <div className={styles.detailModalSectionBox}>
                  {selectedItem.adminResponses
                    ? selectedItem.adminResponses
                    : "아직 답변이 등록되지 않았습니다."}
                </div>
              </div>
            )}

            {/* 제보 수정 버튼 (대기중인 제보만) */}
            {activeTab === "report" && selectedItem.status === "PENDING" && (
              <button
                className={styles.detailModalEditBtn}
                onClick={() => {
                  setShowDetailModal(false);
                  setShowEditModal(true);
                }}
              >
                제보 수정
              </button>
            )}
          </div>
        </div>
      )}

      {/* 제보 수정 모달 */}
      {showEditModal && selectedItem && (
        <ReportEditModal
          report={selectedItem}
          onClose={() => setShowEditModal(false)}
          onUpdate={refreshReports}
        />
      )}

      <nav className={styles.bottomNav}>
        <Link to="/bookmark" className={styles.navItem}>
          <img src="/images/icon-star.png" alt="즐겨찾기" />
        </Link>
        <Link to="/main" className={styles.navItem}>
          <img src="/images/icon-home.png" alt="홈" />
        </Link>
        <Link to="/map" className={styles.navItem}>
          <img src="/images/icon-find.png" alt="길찾기" />
        </Link>
      </nav>
    </>
  );
}
