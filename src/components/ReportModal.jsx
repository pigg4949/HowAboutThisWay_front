// src/components/ReportModal.jsx
import React, { useEffect, useState, useMemo, useRef } from "react";
import { createReport } from "../api/report";
import styles from "../css/MainPage.module.css";

export default function ReportModal({ onClose }) {
  const [category, setCategory] = useState("");
  const [content, setContent] = useState("");
  const [image, setImage] = useState(null);
  const [lon, setLon] = useState(null);
  const [lat, setLat] = useState(null);
  const [isReady, setIsReady] = useState(false);
  const mapRef = useRef(null);
  const token = useMemo(() => localStorage.getItem("token"), []);

  // 1) Tmap v2 스크립트 로드
  useEffect(() => {
    if (window.Tmapv2?.Map) {
      setIsReady(true);
      return;
    }
    const s = document.createElement("script");
    s.src = `https://apis.openapi.sk.com/tmap/jsv2?version=1&appKey=${import.meta.env.VITE_TMAP_API_KEY}`;
    s.async = true;
    s.onload = () => setIsReady(true);
    document.head.appendChild(s);
    return () => document.head.removeChild(s);
  }, []);

  // 2) 지도 초기화 — geolocation 성공 시에만 initMap 호출
  useEffect(() => {
    if (!isReady || !mapRef.current) return;

    let map, clickMarker;

    const initMap = (center) => {
      map = new window.Tmapv2.Map(mapRef.current.id, {
        center,
        width: "100%",
        height: "300px",
        zoom: 15,
        zoomControl: true,
        scrollwheel: true,
      });

      // ———————— 여기만 변경 됨 ————————
      // ① 내 위치에 빨간 원(Circle) 마커
      new window.Tmapv2.Circle({
        center,                  // 중심 좌표
        radius: 8,               // 반지름(px)
        strokeColor: "#FF0000",  // 테두리 색
        strokeWeight: 2,         // 테두리 두께
        fillColor: "#FF0000",    // 채우기 색
        fillOpacity: 0.4,        // 채우기 불투명도
        map                      // 붙일 지도
      });                         // ← Circle 사용 :contentReference[oaicite:0]{index=0}
      // ————————————————————————————

      // ② 클릭하면 기본 파란 핀(Marker)
      map.addListener("click", (evt) => {
        const clickedLat = evt.latLng.lat();
        const clickedLng = evt.latLng.lng();
        const pos = new window.Tmapv2.LatLng(clickedLat, clickedLng);

        if (clickMarker) clickMarker.setMap(null);
        clickMarker = new window.Tmapv2.Marker({
          position: pos,
          map,
        });

        setLat(clickedLat);
        setLon(clickedLng);
      });
    };

    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        const userPos = new window.Tmapv2.LatLng(
          coords.latitude,
          coords.longitude
        );
        initMap(userPos);
        setLat(coords.latitude);
        setLon(coords.longitude);
      },
      () => {
        alert("위치 정보를 가져올 수 없습니다. 권한을 확인해주세요.");
      },
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
    );
  }, [isReady]);

  const handleImageChange = (e) => {
    if (e.target.files[0]) setImage(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token) return alert("로그인이 필요합니다.");
    if (lon == null || lat == null)
      return alert("지도를 클릭해 위치를 선택하세요.");

    const fd = new FormData();
    fd.append("type", category);
    fd.append("comment", content);
    fd.append("lon", lon);
    fd.append("lat", lat);
    if (image) fd.append("image", image);

    try {
      await createReport(fd, token);
      alert("제보가 등록되었습니다.");
      onClose();
    } catch {
      alert("제보 등록에 실패했습니다. 다시 시도해주세요.");
    }
  };

  return (
    <div className={styles.modalOverlay} style={{ pointerEvents: "auto" }}>
      <div className={styles.modalContent} style={{ pointerEvents: "auto" }}>
        <button className={styles.modalClose} onClick={onClose}>
          &times;
        </button>
        <h2 className={styles.modalTitle}>통행 이용 불편 제보</h2>

        <div
          id="map_div"
          ref={mapRef}
          className={styles.mapContainer}
          style={{ margin: "16px 0", pointerEvents: "auto" }}
        >
          {!isReady && <p>지도 로딩 중...</p>}
        </div>

        {lon != null && lat != null && (
          <p>
            선택된 좌표: 경도 {lon.toFixed(6)}, 위도 {lat.toFixed(6)}
          </p>
        )}

        <form onSubmit={handleSubmit}>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className={styles.modalSelect}
            required
          >
            <option value="">-- 분류 --</option>
            <option value="5">단차 큼</option>
            <option value="6">보도 폭 좁음</option>
            <option value="toilet">장애인 화장실</option>
            <option value="7">기타</option>
          </select>

          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="불편 사항을 사진과 함께 기재해주세요."
            className={styles.modalTextarea}
            required
          />

          <div className={styles.modalActions}>
            <label className={styles.buttonSecondary}>
              이미지 업로드
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                style={{ display: "none" }}
              />
            </label>
            <button type="submit" className={styles.buttonPrimary}>
              제보하기
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
