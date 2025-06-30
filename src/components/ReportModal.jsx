// src/components/ReportModal.jsx
import React, { useEffect, useState, useMemo, useRef } from "react";
import { createReport } from "../api/report";
import styles from "../css/MainPage.module.css";

export default function ReportModal({ onClose }) {
  const [category, setCategory] = useState("");
  const [content, setContent] = useState("");
  const [image, setImage] = useState(null);
  const [isReady, setIsReady] = useState(false);
  const mapRef = useRef(null);
  const mapObj = useRef(null);
  const token = useMemo(() => localStorage.getItem("token"), []);
  const latRef = useRef(null);
  const lonRef = useRef(null);
  const [lat, setLat] = useState(null);
  const [lon, setLon] = useState(null);

  // 1) Tmap v2 스크립트 로드
  useEffect(() => {
    if (window.Tmapv2?.Map) {
      setIsReady(true);
      return;
    }
    const s = document.createElement("script");
    s.src = `https://apis.openapi.sk.com/tmap/jsv2?version=1&appKey=${
      import.meta.env.VITE_TMAP_API_KEY
    }`;
    s.async = true;
    s.onload = () => setIsReady(true);
    document.head.appendChild(s);
    return () => document.head.removeChild(s);
  }, []);

  // 2) 지도 초기화 — geolocation 성공 시에만 initMap 호출
  useEffect(() => {
    if (!isReady || !mapRef.current) return;
    if (mapObj.current) return; // 이미 생성된 경우 재생성 방지

    const centerInit = (lat, lng) => {
      setLat(lat);
      setLon(lng);
      latRef.current = lat;
      lonRef.current = lng;
      console.log("초기 좌표", lat, lng);
    };

    const initMap = (center) => {
      mapObj.current = new window.Tmapv2.Map(mapRef.current, {
        center,
        width: "100%",
        height: "300px",
        zoom: 15,
        zoomControl: true,
        scrollwheel: true,
      });

      // mapObj.current.clearOverlays(); // 필요 없다면 주석처리

      // 최초 좌표 동기화
      centerInit(center.lat(), center.lng());

      // 지도 이동 시 좌표 동기화
      mapObj.current.addListener("center_changed", () => {
        const newCenter = mapObj.current.getCenter();
        setLat(newCenter.lat());
        setLon(newCenter.lng());
        latRef.current = newCenter.lat();
        lonRef.current = newCenter.lng();
        console.log("중앙 좌표", newCenter.lat(), newCenter.lng());
      });
    };

    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        const userPos = new window.Tmapv2.LatLng(
          coords.latitude,
          coords.longitude
        );
        initMap(userPos);
      },
      () => {
        const defaultPos = new window.Tmapv2.LatLng(37.5665, 126.978);
        initMap(defaultPos);
        alert("위치 정보를 가져올 수 없어 서울 시청으로 설정됩니다.");
      },
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
    );

    // 모달이 닫힐 때 mapObj 초기화
    return () => {
      mapObj.current = null;
    };
  }, [isReady]);

  const handleImageChange = (e) => {
    if (e.target.files[0]) setImage(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("제보 좌표:", latRef.current, lonRef.current);
    if (!token) return alert("로그인이 필요합니다.");
    if (lonRef.current == null || latRef.current == null)
      return alert("지도를 조정해서 위치를 선택하세요.");

    const fd = new FormData();
    fd.append("type", category);
    fd.append("comment", content);
    fd.append("lon", String(lonRef.current));
    fd.append("lat", String(latRef.current));
    if (image) fd.append("image", image);

    // FormData 내용 확인
    for (let pair of fd.entries()) {
      console.log("FormData:", pair[0], pair[1]);
    }

    try {
      await createReport(fd, token);
      alert("제보가 등록되었습니다.");
      onClose();
    } catch {
      alert("제보 등록에 실패했습니다. 다시 시도해주세요.");
    }
  };

  // 현재 위치로 이동 함수
  const moveToCurrentLocation = () => {
    if (!window.Tmapv2 || !mapObj.current) return;
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        const userPos = new window.Tmapv2.LatLng(
          coords.latitude,
          coords.longitude
        );
        mapObj.current.setCenter(userPos);
      },
      () => {
        alert("위치 정보를 가져올 수 없습니다. 권한을 확인해주세요.");
      },
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
    );
  };

  return (
    <div className={styles.modalOverlay} style={{ pointerEvents: "auto" }}>
      <div className={styles.modalContent} style={{ pointerEvents: "auto" }}>
        <button className={styles.modalClose} onClick={onClose}>
          &times;
        </button>
        <h2 className={styles.modalTitle}>통행 이용 불편 제보</h2>

        {/* 지도+마커를 감싸는 래퍼 */}
        <div
          style={{
            position: "relative",
            width: "100%",
            height: "300px",
            margin: "16px 0",
          }}
        >
          <div
            id="report_map"
            ref={mapRef}
            className={styles.mapContainer}
            style={{
              width: "100%",
              height: "300px",
              pointerEvents: "auto",
            }}
          />
          {/* 현재 위치로 이동 버튼 */}
          <button
            type="button"
            onClick={moveToCurrentLocation}
            style={{
              position: "absolute",
              top: 12,
              right: 12,
              zIndex: 1100,
              background: "#fff",
              border: "1px solid #bbb",
              borderRadius: 24,
              width: 40,
              height: 40,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
              cursor: "pointer",
              padding: 0,
            }}
            title="현재 위치로 이동"
          >
            <img
              src="/images/icon-location.png"
              alt="현재 위치"
              style={{ width: 24, height: 24 }}
            />
          </button>
          {/* 중앙 고정 마커 (항상 map 위에 보임) */}
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -100%)",
              zIndex: 1000,
              pointerEvents: "none",
              width: 24,
              height: 38,
            }}
          >
            <img
              src="/markers/icon-pin.png"
              alt="위치 마커"
              style={{
                width: "36px",
                height: "36px",
                filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.3))",
              }}
            />
          </div>
        </div>

        {lon != null && lat != null && (
          <p>
            선택된 위치: 경도 {lon.toFixed(6)}, 위도 {lat.toFixed(6)}
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
            <option value="toilet">공사중</option>
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
