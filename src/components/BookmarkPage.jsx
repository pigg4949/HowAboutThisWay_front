import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import styles from "../css/BookmarkPage.module.css";

export default function BookmarkPage() {
  const [items, setItems] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newAlias, setNewAlias] = useState("");
  const [newAddress, setNewAddress] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get("/bookmarker");
        setItems(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        // API 실패 시 더미 데이터로 대체
        setItems([
          {
            id: 1,
            alias: "우리집",
            icon: "icon-home.png",
            address: "서울시 강남구 테헤란로 123",
          },
          {
            id: 2,
            alias: "회사",
            icon: "icon-location.png",
            address: "서울시 중구 을지로 456",
          },
        ]);
      }
    })();
  }, []);

  const handleDelete = async (idx) => {
    try {
      await api.delete(`/bookmarker/${idx}`);
      // 삭제 후 목록 새로고침
      const res = await api.get("/bookmarker");
      setItems(Array.isArray(res.data) ? res.data : []);
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
    if (!newAlias.trim() || !newAddress.trim()) {
      alert("별명과 주소를 모두 입력하세요.");
      return;
    }
    try {
      // 서버로 POST 요청 보내기
      await api.post("/bookmarker", {
        label: newAlias,
        address: newAddress,
      });
      // 서버에서 추가된 북마크 목록을 다시 불러오기
      const res = await api.get("/bookmarker");
      setItems(Array.isArray(res.data) ? res.data : []);
      setShowAddForm(false);
    } catch (err) {
      alert(
        "서버에 저장 실패: " + (err.response?.data?.message || err.message)
      );
    }
  };

  const handleAddCancel = () => {
    setShowAddForm(false);
  };

  return (
    <div className={styles.pageWrapper}>
      <header className={styles.headerBar}>
        <span className={styles.headerTitle}>즐겨찾기</span>
      </header>

      <div className={styles.itemList}>
        {Array.isArray(items) && items.length === 0 && !showAddForm ? (
          <div className={styles.emptyMsg}>즐겨찾기 내역이 없습니다.</div>
        ) : (
          Array.isArray(items) &&
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
                <img
                  src={`/images/${item.icon || "icon-location.png"}`}
                  alt=""
                />
                <span className={styles.address}>{item.address}</span>
                <button className={styles.setDestination}>목적지</button>
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
              <button className={styles.btnSecondary} onClick={handleAddCancel}>
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
