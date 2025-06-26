import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import styles from "../css/MyPage.module.css";

export default function MyPage() {
  const [info, setInfo] = useState(null);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [inquiry, setInquiry] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get("/users/info");
        setInfo(res.data);
      } catch {
        alert("로그인 토큰 만료");
        navigate("/login");
      }
    })();
  }, [navigate]);

  const handleUpdate = async () => {
    if (password !== confirm) {
      alert("비밀번호가 일치하지 않습니다.");
      return;
    }
    await api.post("/mypage/update", { password });
    alert("변경 완료");
  };
  const handleInquiry = async () => {
    await api.post("/mypage/inquiry", { inquiry });
    alert("문의 전송됨");
  };
  const handleLogout = async () => {
    await api.post("/logout");
    navigate("/");
  };
  const handleDelete = async () => {
    if (!window.confirm("탈퇴하시겠습니까?")) return;
    await api.post("/users/delete");
    navigate("/");
  };

  if (!info) return <p>로딩 중…</p>;

  return (
    <>
      <header className={styles.mypageHeader}>
        <button
          onClick={() => navigate("/main")}
          className={styles.backButton}
          style={{
            background: "none",
            boxShadow: "none",
            border: "none",
            outline: "none",
            padding: 0,
            margin: 0,
            minWidth: 0,
          }}
        >
          ←
        </button>
        <h2 className={styles.pageTitle}>내 정보</h2>
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

        <div className={styles.formGroup}>
          <label>문의</label>
          <textarea
            value={inquiry}
            onChange={(e) => setInquiry(e.target.value)}
            placeholder="문의 또는 불편 사항"
          />
        </div>

        <button onClick={handleInquiry} className={styles.btnSub}>
          전송
        </button>
        <button onClick={handleLogout} className={styles.btnSub}>
          로그아웃
        </button>
        <button onClick={handleDelete} className={styles.btnDelete}>
          회원탈퇴
        </button>
      </main>
    </>
  );
}
