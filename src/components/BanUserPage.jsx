import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import styles from "../css/AdminBanUser.module.css";

export default function BanUserPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");

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

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("/api/users", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(res.data);
      console.log(res.data);
    } catch (err) {
      setError("유저 목록을 불러오는 중 오류 발생");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const toggleActive = async (userId, isActive) => {
    const action = isActive ? "차단" : "차단 해제";
    if (!window.confirm(`정말로 이 사용자를 ${action}하시겠습니까?`)) return;
    try {
      const token = localStorage.getItem("token");
      console.log("[DEBUG] PATCH /api/users/" + userId + "/active");
      console.log("[DEBUG] userId:", userId);
      console.log("[DEBUG] isActive(현재):", isActive, "-> (변경):", !isActive);
      console.log("[DEBUG] token:", token);
      const res = await axios.patch(`/api/users/${userId}/active`, null, {
        params: { isActive: !isActive },
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log("[DEBUG] PATCH 응답:", res);
      alert(`${action} 완료`);
      fetchUsers();
    } catch (err) {
      console.error("[DEBUG] PATCH 에러:", err);
      if (err.response) {
        console.error("[DEBUG] 서버 응답:", err.response.data);
      }
      alert(`${action} 중 오류 발생`);
    }
  };

  if (loading) return <div className={styles.loading}>불러오는 중...</div>;
  if (error) return <div className={styles.error}>{error}</div>;

  return (
    <div className={styles.pageWrapper}>
      <header className={styles.headerBar}>
        <span className={styles.headerLogo}>
          <img
            src="/images/HATWlogo.png"
            alt="HATW 로고"
            className={styles.headerLogoImg}
            onClick={() => navigate("/admin")}
          />
        </span>
        <span className={styles.headerTitle}>회원 관리</span>
        <span className={styles.headerRight}></span>
      </header>
      <div className={styles.card}>
        <div className={styles.listTitle}>회원 목록</div>
        <input
          type="text"
          placeholder="회원 검색..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className={styles.userSearchInput}
          style={{
            marginBottom: 16,
            padding: "8px 12px",
            borderRadius: 6,
            border: "1px solid #ccc",
            width: "100%",
            fontSize: 15,
          }}
        />
        <div className={styles.listContainer}>
          {users.filter(
            (user) =>
              !searchTerm ||
              (user.userId || "")
                .toLowerCase()
                .includes(searchTerm.toLowerCase())
          ).length === 0 ? (
            <p className={styles.emptyText}>검색 결과가 없습니다.</p>
          ) : (
            <ul className={styles.userList}>
              {users
                .filter(
                  (user) =>
                    !searchTerm ||
                    (user.userId || "")
                      .toLowerCase()
                      .includes(searchTerm.toLowerCase())
                )
                .map((user) => (
                  <li
                    key={user.userId || user.idx || user.userIdx}
                    className={styles.userItem}
                  >
                    <span className={styles.itemTitle}>{user.userId}</span>
                    <button
                      className={`${styles.btnToggle} ${
                        !user.isActive ? styles.btnUnblock : ""
                      }`}
                      onClick={() => toggleActive(user.userId, user.isActive)}
                    >
                      {user.isActive ? "차단하기" : "차단 해제"}
                    </button>
                  </li>
                ))}
            </ul>
          )}
        </div>
      </div>
      {/* 하단 내비게이션 바 */}
      <nav className={styles.bottomNav}>
        <a href="/bookmark" className={styles.navItem}>
          <img src="/images/icon-star.png" alt="즐겨찾기" />
        </a>
        <a href="/admin" className={styles.navItem}>
          <img src="/images/icon-home.png" alt="홈" />
        </a>
        <a href="/mypage" className={styles.navItem}>
          <img src="/images/icon-user.png" alt="내 정보" />
        </a>
      </nav>
    </div>
  );
}
