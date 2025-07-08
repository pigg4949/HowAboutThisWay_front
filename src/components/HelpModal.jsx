import React, { useState } from "react";
import styles from "../css/HelpModal.module.css";

const slides = [
  // 1. 2x2 카드 그리드 (길찾기/제보하기/즐겨찾기/내 정보)
  {
    content: (
      <div className={styles.helpSlideGrid}>
        <div className={styles.helpCard}>
          <img
            src="/images/icon-find.png"
            alt="길찾기 아이콘"
            className={styles.helpCardIcon}
          />
          <span className={styles.helpCardLabel}>길찾기</span>
        </div>
        <div className={styles.helpCard}>
          <img
            src="/images/icon-report.png"
            alt="제보하기 아이콘"
            className={styles.helpCardIcon}
          />
          <span className={styles.helpCardLabel}>제보하기</span>
        </div>
        <div className={styles.helpCard}>
          <img
            src="/images/icon-star.png"
            alt="즐겨찾기 아이콘"
            className={styles.helpCardIcon}
          />
          <span className={styles.helpCardLabel}>즐겨찾기</span>
        </div>
        <div className={styles.helpCard}>
          <img
            src="/images/icon-user.png"
            alt="내 정보 아이콘"
            className={styles.helpCardIcon}
          />
          <span className={styles.helpCardLabel}>내 정보</span>
        </div>
      </div>
    ),
  },
  // 2. 텍스트 설명 슬라이드 (예시와 동일하게)
  {
    content: (
      <div className={styles.helpSlideText}>
        <b>길찾기 :</b> 지도에서 이동할 경로 안내와 위험 요소 마커를 확인할 수
        있습니다.
        <br />
        <br />
        <b>제보하기 :</b> 지도에는 없는 위험 요소를 제보할 수 있습니다.
        <br />
        <br />
        <b>즐겨찾기 :</b> 내가 즐겨찾기한 경로들을 볼 수 있습니다.
        <br />
        <br />
        <b>내 정보 :</b> 비밀번호 수정과 문의를 보낼 수 있습니다.
      </div>
    ),
  },
  // 3. 리스트/아이콘 안내 슬라이드
  {
    content: (
      <ul className={styles.helpSlideList}>
        <li className={styles.helpSlideListItem}>
          <img
            src="/images/icon-menu.png"
            alt="마커 요소 아이콘"
            className={styles.helpListIcon}
          />{" "}
          마커 요소를 선택할 수 있습니다
        </li>
        <li className={styles.helpSlideListItem}>
          <img
            src="/images/icon-report2.png"
            alt="위험 요소 아이콘"
            className={styles.helpListIcon}
          />{" "}
          위험 요소를 제보할 수 있습니다
        </li>
        <li className={styles.helpSlideListItem}>
          <img
            src="/markers/icon-pin.png"
            alt="현재 위치 아이콘"
            className={styles.helpListIcon}
          />{" "}
          현재 위치를 표시합니다
        </li>
      </ul>
    ),
  },
  // 4. 네비게이션 안내 슬라이드
  {
    content: (
      <ul className={styles.helpSlideList}>
        <li className={styles.helpSlideListItem}>
          <img
            src="/images/icon-star.png"
            alt="즐겨찾기 아이콘"
            className={styles.helpListIcon}
          />{" "}
          즐겨찾기 화면으로 이동합니다
        </li>
        <li className={styles.helpSlideListItem}>
          <img
            src="/images/icon-home.png"
            alt="메인 화면 아이콘"
            className={styles.helpListIcon}
          />{" "}
          메인 화면으로 이동합니다
        </li>
        <li className={styles.helpSlideListItem}>
          <img
            src="/images/icon-user.png"
            alt="내 정보 아이콘"
            className={styles.helpListIcon}
          />{" "}
          내 정보 페이지로 이동합니다
        </li>
      </ul>
    ),
  },
  // 5. 마커/위험구역 안내 슬라이드
  {
    content: (
      <ul className={styles.helpSlideList}>
        <li className={styles.helpSlideListItem}>
          <img
            src="/markers/icon-elevator.png"
            alt="엘리베이터 아이콘"
            className={styles.helpListIcon}
          />{" "}
          엘리베이터 위치를 표시합니다
        </li>
        <li className={styles.helpSlideListItem}>
          <img
            src="/markers/icon-escalator.png"
            alt="에스컬레이터 아이콘"
            className={styles.helpListIcon}
          />{" "}
          에스컬레이터 위치를 표시합니다
        </li>
        <li className={styles.helpSlideListItem}>
          <img
            src="/markers/icon-ev.png"
            alt="휠체어 충전소 아이콘"
            className={styles.helpListIcon}
          />{" "}
          휠체어 충전소 위치를 표시합니다
        </li>
        <li className={styles.helpSlideListItem}>
          <img
            src="/markers/icon-toilet.png"
            alt="장애인 화장실 아이콘"
            className={styles.helpListIcon}
          />{" "}
          장애인 화장실 위치를 표시합니다
        </li>
      </ul>
    ),
  },
  // 6. 통행에 불편한 곳 안내 슬라이드
  {
    content: (
      <ul className={styles.helpSlideList}>
        <li className={styles.helpSlideListItem}>
          <img
            src="/markers/icon-level-gap.png"
            alt="단차 아이콘"
            className={styles.helpListIcon}
          />{" "}
          단차로 통행이 불편한 곳을 표시합니다
        </li>
        <li className={styles.helpSlideListItem}>
          <img
            src="/markers/icon-stairs.png"
            alt="계단 아이콘"
            className={styles.helpListIcon}
          />{" "}
          계단 위치를 표시합니다
        </li>
        <li className={styles.helpSlideListItem}>
          <img
            src="/markers/icon-narrow-sidewalk.png"
            alt="보도 폭 좁은 곳 아이콘"
            className={styles.helpListIcon}
          />{" "}
          보도 폭이 좁은 곳을 표시합니다
        </li>
      </ul>
    ),
  },
];

export default function HelpModal({ open, onClose }) {
  const [page, setPage] = useState(0);
  const [dontShow, setDontShow] = useState(false);
  if (!open) return null;

  const handleNext = () => setPage((p) => Math.min(p + 1, slides.length - 1));
  const handlePrev = () => setPage((p) => Math.max(p - 1, 0));
  const handleClose = () => {
    if (dontShow) localStorage.setItem("helpModalHide", "true");
    onClose();
  };

  return (
    <div className={styles.helpModalOverlay}>
      <div className={styles.helpModalContent}>
        <div className={styles.helpSlideContent}>{slides[page].content}</div>
        <div className={styles.helpModalNav}>
          <button
            onClick={handlePrev}
            disabled={page === 0}
            className={styles.helpModalBtn}
          >
            &lt;
          </button>
          {slides.map((_, idx) => (
            <span
              key={idx}
              className={
                idx === page
                  ? `${styles.helpModalDot} ${styles.helpModalDotActive}`
                  : styles.helpModalDot
              }
            />
          ))}
          <button
            onClick={handleNext}
            disabled={page === slides.length - 1}
            className={styles.helpModalBtn}
          >
            &gt;
          </button>
        </div>
        <div className={styles.helpModalFooter}>
          <label className={styles.helpModalCheckboxLabel}>
            <input
              type="checkbox"
              checked={dontShow}
              onChange={(e) => setDontShow(e.target.checked)}
            />
            다시 보지 않기
          </label>
          <button onClick={handleClose} className={styles.helpModalCloseBtn}>
            닫기
          </button>
        </div>
      </div>
    </div>
  );
}
