// src/components/ReportModal.jsx
import React, { useEffect, useState, useMemo, useRef } from "react";
import { createReport } from "../api/report";
import styles from "../css/MainPage.module.css";

/**
 * 통행 이용 불편 제보 모달 컴포넌트
 * @param {function} onClose - 모달 닫기 콜백
 */
export default function ReportModal({ onClose }) {
  const [category, setCategory] = useState("");
  const [content, setContent] = useState("");
  const [image, setImage] = useState(null);
  const token = useMemo(() => localStorage.getItem("token"));

  const [lon, setLon] = useState(null);
  const [lat, setLat] = useState(null);

  // Tmap API 스크립트 로드 완료 상태 (이 상태는 여전히 필요)
  const [isTmapReady, setIsTmapReady] = useState(false); // isTmapScriptLoaded 대신 isTmapReady로 명칭 변경

  const mapRef = useRef(null);

  // TMAP_API_KEY는 이제 public/index.html에서 사용되므로 여기서는 필요 없습니다.
  // const TMAP_API_KEY = "YOUR_TMAP_API_KEY_HERE";

  // Tmap API 객체 준비 상태를 확인하는 useEffect
  useEffect(() => {
    let checkTmapReadyInterval = null;

    // window.Tmapv3.Map 함수가 완전히 준비될 때까지 기다림
    checkTmapReadyInterval = setInterval(() => {
      if (window.Tmapv3 && typeof window.Tmapv3.Map === "function") {
        setIsTmapReady(true);
        console.log("Tmapv3.Map 객체 준비 완료.");
        clearInterval(checkTmapReadyInterval);
      }
    }, 100); // 100ms마다 확인

    // 컴포넌트 언마운트 시 인터벌 클리어
    return () => {
      if (checkTmapReadyInterval) {
        clearInterval(checkTmapReadyInterval);
      }
    };
  }, []); // 빈 배열은 컴포넌트 마운트 시 한 번만 실행됨을 의미

  // 2. Tmap 지도 초기화 (Tmap API 및 mapRef 준비 완료 시)
  useEffect(() => {
    // isTmapReady가 true이고 mapRef.current가 존재하면 지도 초기화
    if (isTmapReady && mapRef.current) {
      console.log("Tmap API 및 지도 컨테이너 준비 완료. 지도 초기화 시작.");
      initializeTmap();
    } else {
      console.log(
        "Tmap API 또는 지도 컨테이너 미준비 (아직 대기 중). TmapReady:",
        isTmapReady,
        "mapRef.current:",
        !!mapRef.current
      );
    }
  }, [isTmapReady, mapRef.current]); // 의존성 배열에 TmapReady 상태와 ref 추가

  const initializeTmap = () => {
    let initialCenter = new window.Tmapv3.LatLng(37.5665, 126.978);

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lon = position.coords.longitude;
          initialCenter = new window.Tmapv3.LatLng(lat, lon);
          console.log("GPS 위치 사용:", lat, lon);
          createAndSetupMap(initialCenter);
        },
        (error) => {
          console.warn("GPS 사용 동의 거부 또는 오류 발생:", error.message);
          createAndSetupMap(initialCenter);
        },
        {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0,
        }
      );
    } else {
      console.warn("이 브라우저는 Geolocation API를 지원하지 않습니다.");
      createAndSetupMap(initialCenter);
    }
  };

  const createAndSetupMap = (centerLatLng) => {
    // 이 시점에서는 window.Tmapv3와 mapRef.current가 모두 준비되었다고 가정합니다.
    if (
      !window.Tmapv3 ||
      typeof window.Tmapv3.Map !== "function" ||
      !mapRef.current
    ) {
      console.error(
        "지도를 생성할 수 없습니다: Tmapv3 API의 Map 객체 또는 지도 컨테이너 미준비."
      );
      return;
    }

    const map = new window.Tmapv3.Map(mapRef.current, {
      center: centerLatLng,
      zoom: 15,
      width: "100%",
      height: "300px",
      draggable: true,
      scrollwheel: true,
    });

    let currentMarker = null;

    map.addListener("click", (e) => {
      if (currentMarker) {
        currentMarker.setMap(null);
      }

      const latLng = e.latLng;
      setLat(latLng.lat());
      setLon(latLng.lng());

      currentMarker = new window.Tmapv3.Marker({
        position: latLng,
        map: map,
        title: "선택된 위치",
        icon: "http://tmapapi.sktelecom.com/upload/tmap/marker/pin_b_m_1.png",
      });

      console.log("선택된 위도(Latitude):", latLng.lat());
      console.log("선택된 경도(Longitude):", latLng.lng());
    });
  };

  const handleImageChange = (e) => {
    setImage(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!token) {
      alert("로그인이 필요합니다.");
      return;
    }

    if (lon === null || lat === null) {
      alert("지도에서 불편 사항의 위치를 선택해주세요.");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("type", category);
      formData.append("comment", content);
      formData.append("lon", lon);
      formData.append("lat", lat);
      if (image) {
        formData.append("image", image);
      }

      await createReport(formData, token);
      alert("제보가 성공적으로 등록되었습니다.");
      onClose();
    } catch (error) {
      console.error("제보 등록 실패:", error);
      alert("제보 등록에 실패했습니다. 다시 시도해주세요.");
    }
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <h2>불편 사항 제보</h2>
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

          <div
            ref={mapRef}
            className={styles.mapContainer}
            style={{
              width: "100%",
              height: "300px",
              margin: "10px 0",
              borderRadius: "8px",
              overflow: "hidden",
            }}
          >
            {!isTmapReady && <p>지도 로딩 중...</p>}{" "}
            {/* 로딩 메시지 조건 변경 */}
          </div>
          {lon !== null && lat !== null && (
            <p className={styles.coordinateInfo}>
              선택된 좌표: 경도 {lon.toFixed(6)}, 위도 {lat.toFixed(6)}
            </p>
          )}

          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="불편 사항을 사진과 함께 기재해주세요."
            className={styles.modalTextarea}
            required
          />
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className={styles.modalFileInput}
          />
          <div className={styles.modalActions}>
            <button type="submit" className={styles.submitButton}>
              제보하기
            </button>
            <button
              type="button"
              onClick={onClose}
              className={styles.cancelButton}
            >
              취소
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
