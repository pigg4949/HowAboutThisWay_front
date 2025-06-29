import React, { useState } from "react";

const slides = [
  // 1. 2x2 카드 그리드 (길찾기/제보하기/즐겨찾기/내 정보)
  {
    content: (
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gridTemplateRows: "1fr 1fr",
          gap: 20,
          width: "100%",
          maxWidth: 320,
          margin: "0 auto",
          marginTop: 10,
        }}
      >
        <div
          style={{
            background: "#f7f6f3",
            borderRadius: 18,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            height: 90,
            boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
          }}
        >
          <span style={{ fontSize: 32, marginBottom: 6 }}>🧭</span>
          <span style={{ fontSize: 16, fontWeight: 500, color: "#3b2b00" }}>
            길찾기
          </span>
        </div>
        <div
          style={{
            background: "#f7f6f3",
            borderRadius: 18,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            height: 90,
            boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
          }}
        >
          <span style={{ fontSize: 32, marginBottom: 6 }}>⚠️</span>
          <span style={{ fontSize: 16, fontWeight: 500, color: "#3b2b00" }}>
            제보하기
          </span>
        </div>
        <div
          style={{
            background: "#f7f6f3",
            borderRadius: 18,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            height: 90,
            boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
          }}
        >
          <span style={{ fontSize: 32, marginBottom: 6 }}>⭐</span>
          <span style={{ fontSize: 16, fontWeight: 500, color: "#3b2b00" }}>
            즐겨찾기
          </span>
        </div>
        <div
          style={{
            background: "#f7f6f3",
            borderRadius: 18,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            height: 90,
            boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
          }}
        >
          <span style={{ fontSize: 32, marginBottom: 6 }}>👤</span>
          <span style={{ fontSize: 16, fontWeight: 500, color: "#3b2b00" }}>
            내 정보
          </span>
        </div>
      </div>
    ),
  },
  // 2. 텍스트 설명 슬라이드 (예시와 동일하게)
  {
    content: (
      <div
        style={{
          fontSize: 15,
          lineHeight: 1.7,
          color: "#222",
          padding: "10px 6px 0 6px",
        }}
      >
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
      <ul
        style={{
          fontSize: 15,
          paddingLeft: 0,
          listStyle: "none",
          lineHeight: 1.7,
          margin: 0,
          marginTop: 10,
        }}
      >
        <li style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 20 }}>🟢</span> 마커 요소를 선택할 수
          있습니다
        </li>
        <li style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 20 }}>🔴</span> 위험 요소를 제보할 수
          있습니다
        </li>
        <li style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 20 }}>📍</span> 현재 위치를 표시합니다
        </li>
      </ul>
    ),
  },
  // 4. 네비게이션 안내 슬라이드
  {
    content: (
      <ul
        style={{
          fontSize: 15,
          paddingLeft: 0,
          listStyle: "none",
          lineHeight: 1.7,
          margin: 0,
          marginTop: 10,
        }}
      >
        <li style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 20 }}>⭐</span> 즐겨찾기 화면으로 이동합니다
        </li>
        <li style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 20 }}>🏠</span> 메인 화면으로 이동합니다
        </li>
        <li style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 20 }}>👤</span> 내 정보 페이지로 이동합니다
        </li>
      </ul>
    ),
  },
  // 5. 마커/위험구역 안내 슬라이드
  {
    content: (
      <ul
        style={{
          fontSize: 15,
          paddingLeft: 0,
          listStyle: "none",
          lineHeight: 1.7,
          margin: 0,
          marginTop: 10,
        }}
      >
        <li style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 20 }}>🚧</span> 사용자 주의구역을 표시합니다
        </li>
        <li style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 20 }}>🚻</span> 장애인 화장실을 표시합니다
        </li>
        <li style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 20 }}>🔋</span> 휠체어 충전소 위치를
          표시합니다
        </li>
        <li style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 20 }}>📍</span> 사용자가 제보한 위치를
          표시합니다
        </li>
        <li style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 20 }}>⚠️</span> 사용자 위험구역을 표시합니다
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
    <div
      style={{
        position: "fixed",
        left: 0,
        top: 0,
        width: "100vw",
        height: "100vh",
        background: "rgba(0,0,0,0.38)",
        zIndex: 10000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: 24,
          padding: 28,
          minWidth: 340,
          maxWidth: 380,
          boxShadow: "0 4px 24px rgba(0,0,0,0.13)",
          position: "relative",
          overflow: "hidden",
          width: "90vw",
          maxHeight: 520,
        }}
      >
        <div
          style={{
            minHeight: 210,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
            width: "100%",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              display: "flex",
              width: `calc(100% * ${slides.length})`,
              transition: "transform 0.5s cubic-bezier(.4,1.3,.5,1)",
              transform: `translateX(-${page * 100}%)`,
            }}
          >
            {slides.map((slide, idx) => (
              <div
                key={idx}
                style={{
                  minWidth: "100%",
                  boxSizing: "border-box",
                  padding: 8,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {slide.content}
              </div>
            ))}
          </div>
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: 12,
            margin: "18px 0 8px 0",
          }}
        >
          <button
            onClick={handlePrev}
            disabled={page === 0}
            style={{
              background: "none",
              border: "none",
              fontSize: 22,
              cursor: page === 0 ? "default" : "pointer",
              color: page === 0 ? "#ccc" : "#333",
            }}
          >
            &lt;
          </button>
          {slides.map((_, idx) => (
            <span
              key={idx}
              style={{
                width: 8,
                height: 8,
                borderRadius: 4,
                background: idx === page ? "#e0b200" : "#ddd",
                display: "inline-block",
              }}
            />
          ))}
          <button
            onClick={handleNext}
            disabled={page === slides.length - 1}
            style={{
              background: "none",
              border: "none",
              fontSize: 22,
              cursor: page === slides.length - 1 ? "default" : "pointer",
              color: page === slides.length - 1 ? "#ccc" : "#333",
            }}
          >
            &gt;
          </button>
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginTop: 10,
          }}
        >
          <label
            style={{
              fontSize: 15,
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <input
              type="checkbox"
              checked={dontShow}
              onChange={(e) => setDontShow(e.target.checked)}
            />{" "}
            다시 보지 않기
          </label>
          <button
            onClick={handleClose}
            style={{
              background: "#eee",
              border: "none",
              borderRadius: 8,
              padding: "8px 22px",
              fontWeight: 600,
              fontSize: 15,
              cursor: "pointer",
            }}
          >
            Skip
          </button>
        </div>
      </div>
    </div>
  );
}
