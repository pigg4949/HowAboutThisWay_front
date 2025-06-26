import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import styles from "../css/MyPage.module.css";
import { createInquiry } from "../api/inquiry";
import {
  getUserInfo,
  updateUser,
  logoutUser,
  signoutUser,
} from "../api/member";

export default function MyPage() {
  const [info, setInfo] = useState(null);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [inquiry, setInquiry] = useState("");
  const navigate = useNavigate();
  const token = useMemo(() => localStorage.getItem("token"));

  useEffect(() => {
    getUserInfo(token)
      .then((res) => {
        setInfo(res.data);
      })
      .catch(() => setMessage("사용자 정보를 불러오지 못했습니다. 😢"));
    navigate("/main");
  }, [token]);

  if (!token) {
    alert("로그인 토큰 만료");
    return navigate("/login");
  }

  const handleUpdate = async () => {
    try {
      if (password !== confirm) {
        alert("비밀번호가 일치하지 않습니다.");
        return;
      }
      await updateUser({ userId, password }, token);
      setMessage("회원정보가 수정되었습니다 😊");
      navigate("/mypage");
    } catch (e) {
      setMessage("수정 실패 🤢");
    }
  };

  const handleInquiry = async () => {
    await createInquiry(inquiry, token);
    alert("문의 전송됨");
  };

  /*const handleInquiryList = async () => {
    await 
  }*/

  const handleLogout = async () => {
    await logoutUser(token);
    localStorage.removeItem("token");
    navigate("/login");
  };

  const handleDelete = async () => {
    if (!window.confirm("탈퇴하시겠습니까?")) return;
    await signoutUser(token);
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
