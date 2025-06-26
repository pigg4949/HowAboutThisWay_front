import React, { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import styles from "../css/AdminMainPage.module.css";

export default function AdminMainPage() {
  const [reports, setReports] = useState([]);
  const [users, setUsers] = useState([]);
  const token = useMemo(() => localStorage.getItem("token"));

  useEffect(() => {
    async function fetchAdminData() {
      try {
        const [reportsRes, usersRes] = await Promise.all([
          api.get("api/reports/admin/pending"),
          api.get("api/inquiry/admin"),
        ]);
        setReports(reportsRes.data);
        setUsers(usersRes.data);
      } catch (err) {
        console.error("관리자 데이터 로드 실패:", err);
      }
    }
    fetchAdminData();
  }, []);

  return (
    <div className={styles.container}>
      <header className={styles.header}>관리자 대시보드</header>

      <section className={styles.sectionGroup}>
        <h2 className={styles.sectionTitle}>미처리 제보</h2>
        <ul className={styles.reportList}>
          {reports.map((report) => (
            <li key={report.idx} className={styles.reportCard}>
              <Link to={`/report/${report.idx}`} className={styles.reportLink}>
                {report.title}
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className={styles.sectionGroup}>
        <h2 className={styles.sectionTitle}>회원 관리</h2>
        <ul className={styles.userList}>
          {users.map((user) => (
            <li key={user.idx} className={styles.userCard}>
              {user.username} ({user.role})
            </li>
          ))}
        </ul>
      </section>

      <nav className={styles.adminNav}>
        <Link to="/main" className={styles.navLink}>
          사용자 메인
        </Link>
        <Link to="/bookmark" className={styles.navLink}>
          즐겨찾기
        </Link>
        <Link to="/map" className={styles.navLink}>
          지도
        </Link>
      </nav>
    </div>
  );
}
