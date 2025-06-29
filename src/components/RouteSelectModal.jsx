import React from "react";

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

export default function RouteSelectModal({ routes, onSelect, onClose }) {
  return (
    <div
      style={{
        position: "fixed",
        left: 0,
        top: 0,
        width: "100vw",
        height: "100vh",
        background: "rgba(0,0,0,0.35)",
        zIndex: 10000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: 12,
          padding: 24,
          minWidth: 320,
          maxWidth: 400,
          boxShadow: "0 4px 24px rgba(0,0,0,0.13)",
        }}
      >
        <h3 style={{ marginBottom: 18, fontSize: 20, textAlign: "center" }}>
          경로 선택
        </h3>
        <div style={{ maxHeight: 350, overflowY: "auto" }}>
          {routes.map((route, idx) => {
            const data = route.data;
            const totalDistance = getTotalDistance(data.legs);
            const totalWalkDistance = getTotalWalkDistance(data.legs);
            const totalWalkTime = getTotalWalkTime(data.legs);
            const totalTime = data.totalTime;
            return (
              <div
                key={idx}
                style={{
                  border: "1px solid #eee",
                  borderRadius: 8,
                  padding: 14,
                  marginBottom: 12,
                  background: "#faf9f6",
                }}
              >
                <div style={{ fontWeight: 600, marginBottom: 6 }}>
                  경로 {idx + 1}
                </div>
                <div style={{ fontSize: 15, marginBottom: 4 }}>
                  총 거리: <b>{formatDistance(totalDistance)}</b> / 총 소요시간:{" "}
                  <b>{formatTime(totalTime)}</b>
                </div>
                <div style={{ fontSize: 14, color: "#666", marginBottom: 2 }}>
                  총 걷는 거리: {formatDistance(totalWalkDistance)} / 걷는 시간:{" "}
                  {formatTime(totalWalkTime)}
                </div>
                <button
                  style={{
                    marginTop: 8,
                    padding: "6px 18px",
                    borderRadius: 8,
                    background: "#ffe6a7",
                    border: "none",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                  onClick={() => onSelect(route, idx)}
                >
                  이 경로 선택
                </button>
              </div>
            );
          })}
        </div>
        <button
          style={{
            marginTop: 10,
            width: "100%",
            padding: "8px 0",
            borderRadius: 8,
            background: "#eee",
            border: "none",
            fontWeight: 500,
            cursor: "pointer",
          }}
          onClick={onClose}
        >
          닫기
        </button>
      </div>
    </div>
  );
}
