import React from "react";
import styles from "../css/RouteSelectModal.module.css";
import axios from "axios";

function getTotalDistance(legs) {
  return legs?.reduce((sum, leg) => sum + (leg.distance || 0), 0) || 0;
}
function getTotalWalkDistance(legs) {
  return (
    legs
      ?.filter((l) => l.mode === "WALK")
      .reduce((sum, leg) => sum + (leg.distance || 0), 0) || 0
  );
}
function getTotalWalkTime(legs) {
  return (
    legs
      ?.filter((l) => l.mode === "WALK")
      .reduce((sum, leg) => sum + (leg.sectionTime || 0), 0) || 0
  );
}

// 교통수단 이용 횟수 계산 함수 추가
function getTransportCounts(legs) {
  const counts = {
    bus: 0,
    subway: 0,
  };

  legs?.forEach((leg) => {
    if (leg.mode === "BUS") {
      counts.bus++;
    } else if (leg.mode === "SUBWAY") {
      counts.subway++;
    }
  });

  return counts;
}

// 교통수단 정보 텍스트 생성 함수 추가
function getTransportText(transportCounts) {
  const { bus, subway } = transportCounts;

  if (bus === 0 && subway === 0) {
    return "도보";
  }

  const parts = [];
  if (bus > 0) {
    parts.push(`버스${bus}`);
  }
  if (subway > 0) {
    parts.push(`지하철${subway}`);
  }

  return parts.join(" ");
}

function formatTime(sec) {
  if (!sec && sec !== 0) return "-";
  const min = Math.round(sec / 60);
  return `${min}분`;
}
function formatDistance(m) {
  if (!m && m !== 0) return "-";
  if (m >= 1000) return `${(m / 1000).toFixed(1)}km`;
  return `${m}m`;
}

function sortRoutes(routes, sortOption) {
  if (sortOption === "transfer") {
    return routes
      .slice()
      .sort(
        (a, b) => (a.data.transferCount || 0) - (b.data.transferCount || 0)
      );
  }
  if (sortOption === "distance") {
    return routes
      .slice()
      .sort(
        (a, b) => getTotalDistance(a.data.legs) - getTotalDistance(b.data.legs)
      );
  }
  if (sortOption === "time") {
    return routes
      .slice()
      .sort((a, b) => (a.data.totalTime || 0) - (b.data.totalTime || 0));
  }
  if (sortOption === "walk") {
    return routes
      .slice()
      .sort(
        (a, b) =>
          getTotalWalkDistance(a.data.legs) - getTotalWalkDistance(b.data.legs)
      );
  }
  // "default" or 기타: API 순서 그대로
  return routes;
}

export default function RouteSelectModal({
  routes,
  onSelect,
  onClose,
  sortOption = "default",
  onSortChange,
}) {
  const sortedRoutes = sortRoutes(routes, sortOption);
  return (
    <div className={styles.modalContainer}>
      <div className={styles.modalContent}>
        <h3 className={styles.modalTitle}>경로 선택</h3>
        {/* 정렬 옵션 셀렉트박스 */}
        {onSortChange && (
          <div className={styles.sortSelectContainer}>
            <select
              value={sortOption}
              onChange={(e) => onSortChange(e.target.value)}
              className={styles.sortSelect}
            >
              <option value="default">최적(추천)</option>
              <option value="transfer">최소환승</option>
              <option value="distance">최단거리</option>
              <option value="time">최단시간</option>
              <option value="walk">최소도보</option>
            </select>
          </div>
        )}
        <div className={styles.routeListContainer}>
          {sortedRoutes.map((route, idx) => {
            const data = route.data;
            const totalDistance = getTotalDistance(data.legs);
            const totalWalkDistance = getTotalWalkDistance(data.legs);
            const totalWalkTime = getTotalWalkTime(data.legs);
            const totalTime = data.totalTime;
            const transportCounts = getTransportCounts(data.legs);
            const transportText = getTransportText(transportCounts);
            return (
              <div
                key={idx}
                className={styles.routeItem}
                onClick={() => onSelect(route, idx)}
                onMouseEnter={(e) => {
                  e.target.classList.add(styles.routeItemHover);
                }}
                onMouseLeave={(e) => {
                  e.target.classList.remove(styles.routeItemHover);
                }}
              >
                <div className={styles.routeIndex}>경로 {idx + 1}</div>
                <div className={styles.routeInfo}>
                  총 거리: <b>{formatDistance(totalDistance)}</b> / 총 소요시간:{" "}
                  <b>{formatTime(totalTime)}</b>
                </div>
                <div className={styles.routeInfo}>
                  총 걷는 거리: {formatDistance(totalWalkDistance)} / 걷는 시간:{" "}
                  {formatTime(totalWalkTime)}
                </div>
                <div className={styles.routeInfo}>
                  이용 교통수단: <b>{transportText}</b>
                </div>
              </div>
            );
          })}
        </div>
        <button className={styles.closeButton} onClick={onClose}>
          닫기
        </button>
      </div>
    </div>
  );
}
