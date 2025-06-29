// src/pages/BookmarkPage.jsx
import React, { useEffect, useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  getBookmarks,
  createBookmark,
  deleteBookmark,
} from "../api/bookmarker";
import styles from "../css/BookmarkPage.module.css";

export default function BookmarkPage() {
  const [items, setItems] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newAlias, setNewAlias] = useState("");
  const [newAddress, setNewAddress] = useState("");
  const navigate = useNavigate();
  const token = useMemo(() => localStorage.getItem("token"), []);

  useEffect(() => {
    if (!token) {
      alert("토큰이 만료되었습니다.");
      navigate("/login");
      return;
    }

    getBookmarks(token)
      .then((res) => {
        console.log(res);
        setItems(Array.isArray(res) ? res : []);
      })
      .catch((error) => {
        console.error("북마크를 불러오는 중 오류 발생:", error);
        setItems([]);
      });
  }, [token, navigate]);

  const handleDelete = async (idx) => {
    if (!token) {
      alert("로그인이 필요합니다.");
      navigate("/login");
      return;
    }
    try {
      await deleteBookmark(token, idx);
      setItems((prev) => prev.filter((item) => item.idx !== idx));
    } catch {
      alert("삭제 실패");
    }
  };

  const handleAdd = () => {
    setShowAddForm(true);
    setNewAlias("");
    setNewAddress("");
  };

  const handleAddSave = async () => {
    if (!token) {
      alert("로그인이 필요합니다.");
      navigate("/login");
      return;
    }
    if (!newAlias.trim() || !newAddress.trim()) {
      alert("별명과 주소를 모두 입력하세요.");
      return;
    }
    try {
      await createBookmark(token, { label: newAlias, address: newAddress });
      const data = await getBookmarks(token);
      setItems(Array.isArray(data) ? data : []);
      setShowAddForm(false);
    } catch (err) {
      alert(
        "서버에 저장 실패: " + (err.response?.data?.message || err.message)
      );
    }
  };

  const handleDestination = async (address) => {
    if (!token) {
      alert("로그인이 필요합니다.");
      navigate("/login");
      return;
    }
    if (!address) {
      alert("올바르지 못한 즐겨찾기 주소입니다. 이 항목을 삭제해 주세요.");
      return;
    }
    try {
      // MapPage로 이동하면서 address 값을 state로 전달
      navigate("/map", { state: { destinationAddress: address } });
      // 또는 쿼리 파라미터: navigate(`/map?end=${encodeURIComponent(address)}`);
    } catch (error) {
      console.error("목적지 설정 중 오류 발생:", error);
      alert("목적지 설정에 실패했습니다.");
    }
  };

  return (
    <div className={styles.pageWrapper}>
      <header className={styles.headerBar}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            width: "100%",
            position: "relative",
          }}
        >
          <img
            src="/images/HATWlogo.png"
            alt="HATW 로고"
            style={{
              height: 32,
              width: "auto",
              display: "block",
              position: "absolute",
              left: 0,
              top: "50%",
              transform: "translateY(-50%)",
              cursor: "pointer",
            }}
            onClick={() => {
              const isAdmin = localStorage.getItem("isAdmin") === "1";
              navigate(isAdmin ? "/admin" : "/main");
            }}
          />
          <span
            className={styles.headerTitle}
            style={{ margin: "0 auto", display: "block", textAlign: "center" }}
          >
            즐겨찾기
          </span>
        </div>
      </header>

      <div className={styles.itemList}>
        {items.length === 0 && !showAddForm ? (
          <div className={styles.emptyMsg}>즐겨찾기 내역이 없습니다.</div>
        ) : (
          items.map((item) => (
            <div key={item.idx} className={styles.bookmarkItem}>
              <div className={styles.itemHeader}>
                <span className={styles.name}>{item.label}</span>
                <div className={styles.actions}>
                  <button
                    className={styles.actionLink}
                    onClick={() => handleDelete(item.idx)}
                  >
                    삭제
                  </button>
                </div>
              </div>
              <div className={styles.itemBody}>
                <img src="/images/icon-location.png" alt="" />
                <span className={styles.address}>{item.address}</span>
                <button
                  className={styles.setDestination}
                  onClick={() => handleDestination(item.address)}
                >
                  목적지
                </button>
              </div>
            </div>
          ))
        )}

        {showAddForm ? (
          <div className={styles.addForm}>
            <input
              className={styles.addInput}
              value={newAlias}
              onChange={(e) => setNewAlias(e.target.value)}
              placeholder="별명"
            />
            <input
              className={styles.addInput}
              value={newAddress}
              onChange={(e) => setNewAddress(e.target.value)}
              placeholder="주소"
            />
            <div className={styles.addFormBtns}>
              <button className={styles.btnPrimary} onClick={handleAddSave}>
                저장
              </button>
              <button
                className={styles.btnSecondary}
                onClick={() => setShowAddForm(false)}
              >
                취소
              </button>
            </div>
          </div>
        ) : (
          <button className={styles.btnAdd} onClick={handleAdd}>
            <img src="/images/icon-add.png" alt="추가" />
          </button>
        )}
      </div>

      <nav className={styles.bottomNav}>
        <Link to="/map" className={styles.navItem}>
          <img src="/images/icon-find.png" alt="지도" />
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
