/* global Tmapv2 */
import React, { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import styles from "../css/MapPage.module.css";
import {
  searchPOI,
  getTransitWithConnector,
  getTransitAllWalk,
  processRouteInstructions,
  getMarkersByTypes,
} from "../api/Map";
import ReportModal from "./ReportModal";
import RouteSelectModal from "./RouteSelectModal";
import BouncingDots from "./BouncingDots";

export default function MapPage() {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const [mode, setMode] = useState("elder");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [error, setError] = useState(null);
  const location = useLocation(); // 북마크에서 선택된 목적지를 map에 반영 시 필요한 설정

  // 마커 관리
  const [searchMarkers, setSearchMarkers] = useState([]);
  const [startMarker, setStartMarker] = useState(null);
  const [endMarker, setEndMarker] = useState(null);

  // 경로 안내 관련 상태
  const [routePolylines, setRoutePolylines] = useState([]);
  const [routeInstructions, setRouteInstructions] = useState([]);
  const [showRoutePanel, setShowRoutePanel] = useState(false);

  // 셔플 버튼 클릭 시 출발지/도착지 값 swap
  const handleShuffle = () => {
    setStart(end);
    setEnd(start);
  };

  // 경로 폴리라인 제거
  const clearRoutePolylines = () => {
    routePolylines.forEach((polyline) => {
      if (polyline) polyline.setMap(null);
    });
    setRoutePolylines([]);
  };

  // 검색 결과 마커들 제거
  const clearSearchMarkers = () => {
    searchMarkers.forEach((marker) => {
      if (marker) marker.setMap(null);
    });
    setSearchMarkers([]);
  };

  // 출발지/도착지 마커 제거
  const clearLocationMarkers = () => {
    if (startMarker) {
      startMarker.setMap(null);
      setStartMarker(null);
    }
    if (endMarker) {
      endMarker.setMap(null);
      setEndMarker(null);
    }
  };

  // 출발지 마커 표시
  const showStartMarker = (loc) => {
    // location -> loc
    if (startMarker) startMarker.setMap(null);

    const marker = new window.Tmapv2.Marker({
      position: new window.Tmapv2.LatLng(loc.lat, loc.lng),
      map: mapInstanceRef.current,
      title: loc.name,
      icon: "/markers/pin_r_m_s.png",
      iconSize: new window.Tmapv2.Size(24, 38),
    });

    setStartMarker(marker);
  };

  // 도착지 마커 표시
  const showEndMarker = (loc) => {
    // location -> loc
    if (endMarker) endMarker.setMap(null);

    const marker = new window.Tmapv2.Marker({
      position: new window.Tmapv2.LatLng(loc.lat, loc.lng),
      map: mapInstanceRef.current,
      title: loc.name,
      icon: "/markers/pin_r_m_e.png",
      iconSize: new window.Tmapv2.Size(24, 38),
    });

    setEndMarker(marker);
  };

  // 보행자 경로 폴리라인 그리기
  const drawPedestrianRoute = (data) => {
    clearRoutePolylines();

    if (!data.features || data.features.length === 0) {
      alert("경로를 찾을 수 없습니다.");
      return;
    }

    const bounds = new window.Tmapv2.LatLngBounds();
    const newPolylines = [];

    data.features.forEach((feature) => {
      if (feature.geometry.type === "LineString") {
        const path = [];
        feature.geometry.coordinates.forEach((coord) => {
          const pt = new window.Tmapv2.Point(coord[0], coord[1]);
          const geo = window.Tmapv2.Projection.convertEPSG3857ToWGS84GEO(pt);
          const latlng = new window.Tmapv2.LatLng(geo._lat, geo._lng);
          path.push(latlng);
          bounds.extend(latlng);
        });

        // 보행자 경로는 파란색으로 표시
        const polyline = new window.Tmapv2.Polyline({
          path: path,
          strokeColor: "#0090ff",
          strokeWeight: 5,
          map: mapInstanceRef.current,
        });

        newPolylines.push(polyline);
      }
    });

    setRoutePolylines(newPolylines);

    if (newPolylines.length > 0) {
      mapInstanceRef.current.fitBounds(bounds);
    }
  };

  const [searchResults, setSearchResults] = useState([]);
  const [showDropdown, setShowDropdown] = useState(""); // "start" or "end" or ""
  const [selectedLocations, setSelectedLocations] = useState({
    start: null,
    end: null,
  });

  // POI 자동완성 검색
  const handleInputChange = async (e, type) => {
    const value = e.target.value;
    if (type === "start") setStart(value);
    else setEnd(value);
    if (value.trim().length === 0) {
      setSearchResults([]);
      setShowDropdown("");
      return;
    }
    try {
      const result = await searchPOI(value);
      const pois = result?.searchPoiInfo?.pois?.poi || [];
      setSearchResults(pois);
      setShowDropdown(type);
    } catch {
      setSearchResults([]);
      setShowDropdown("");
    }
  };

  // 검색 결과 선택 처리
  const handlePOISelection = (poi, type) => {
    // EPSG3857 → WGS84GEO 변환
    const merc = new window.Tmapv2.Point(
      Number(poi.noorLon),
      Number(poi.noorLat)
    );
    const geo = window.Tmapv2.Projection.convertEPSG3857ToWGS84GEO(merc);
    const location = { lat: geo._lat, lng: geo._lng, name: poi.name };
    if (type === "start") {
      setStart(poi.name);
      showStartMarker(location);
    } else {
      setEnd(poi.name);
      showEndMarker(location);
    }
    setSelectedLocations((prev) => ({ ...prev, [type]: location }));
    setShowDropdown("");
    setSearchResults([]);
    clearSearchMarkers();
  };

  // 1. 상태 추가
  const [routes, setRoutes] = useState([]); // 여러 경로(보행자+대중교통)
  const [selectedRouteIdx, setSelectedRouteIdx] = useState(0); // 선택된 경로 인덱스

  // 검색 버튼 클릭 시 경로 검색
  const [showRouteSelectModal, setShowRouteSelectModal] = useState(false);
  const [routeOptions, setRouteOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [routeSortOption, setRouteSortOption] = useState("default");

  const handleSearch = async () => {
    if (!selectedLocations.start || !selectedLocations.end) {
      alert("출발지와 도착지를 모두 선택해주세요.");
      return;
    }
    setLoading(true);
    setRouteSortOption("default");
    try {
      const startLocation = selectedLocations.start;
      const endLocation = selectedLocations.end;
      const routeData = {
        startX: startLocation.lng,
        startY: startLocation.lat,
        endX: endLocation.lng,
        endY: endLocation.lat,
        startName: encodeURIComponent(startLocation.name),
        endName: encodeURIComponent(endLocation.name),
        reqCoordType: "WGS84GEO",
        resCoordType: "EPSG3857",
        searchOption: mode === "wheel" ? "4" : "0",
      };
      let transitResult;
      if (mode === "wheel") {
        transitResult = await getTransitWithConnector(routeData);
      } else {
        transitResult = await getTransitAllWalk(routeData);
      }
      const newRoutes = [];
      if (
        transitResult &&
        transitResult.metaData &&
        transitResult.metaData.plan &&
        Array.isArray(transitResult.metaData.plan.itineraries)
      ) {
        // 각 경로(itinerary)에 대해 description 수집 및 자연어 처리
        for (
          let idx = 0;
          idx < transitResult.metaData.plan.itineraries.length;
          idx++
        ) {
          const itinerary = transitResult.metaData.plan.itineraries[idx];
          // description 수집 함수
          const collectDescriptions = (legs) => {
            const descriptions = [];
            legs.forEach((leg, legIdx) => {
              if (leg.mode === "WALK" && Array.isArray(leg.steps)) {
                // 도보 구간: 각 step의 description 수집
                leg.steps.forEach((step, stepIdx) => {
                  if (step.description) {
                    descriptions.push({
                      type: "WALK",
                      step: stepIdx + 1,
                      description: step.description,
                      distance: step.distance,
                      duration: step.duration,
                    });
                  }
                });
              } else if (leg.mode === "BUS" || leg.mode === "SUBWAY") {
                // BUS: route/routeNm/name, SUBWAY: route/name
                descriptions.push({
                  type: leg.mode,
                  name: leg.route || leg.routeNm || leg.name || undefined,
                  distance: leg.distance,
                  duration: leg.duration,
                  from: leg.from?.name || leg.start?.name || "",
                  to: leg.to?.name || leg.end?.name || "",
                });
              } else {
                // 기타 구간
                descriptions.push({
                  type: leg.mode || "TRANSIT",
                  name: leg.name ? String(leg.name) : undefined,
                  distance: leg.distance,
                  duration: leg.duration,
                  from: leg.from?.name || "",
                  to: leg.to?.name || "",
                });
              }
            });
            // 콘솔에 descriptions 출력
            console.log("[collectDescriptions] descriptions:", descriptions);
            return descriptions;
          };
          // 현재 경로의 description 수집
          const rawDescriptions = collectDescriptions(itinerary.legs);
          // 백엔드로 description 전송하여 자연어 처리
          let processedInstructions = [];
          try {
            const processData = {
              legs: itinerary.legs,
              descriptions: rawDescriptions,
              userType: mode, // "elder" 또는 "wheel"
              startName: startLocation.name,
              endName: endLocation.name,
            };
            const processedResult = await processRouteInstructions(processData);
            processedInstructions = processedResult.instructions || [];
          } catch (error) {
            console.error("자연어 처리 중 오류:", error);
            // 자연어 처리 실패 시 기존 방식 사용
            processedInstructions = itinerary.legs.map((leg, lidx) => {
              return `${leg.mode || ""} ${leg.name || ""} ${
                leg.distance ? leg.distance + "m 이동" : ""
              }`.trim();
            });
          }
          newRoutes.push({
            type: "transit",
            data: itinerary,
            instructions: processedInstructions,
            rawDescriptions: rawDescriptions, // 원본 description도 보관
          });
        }
      }
      if (newRoutes.length > 0) {
        setRouteOptions(newRoutes);
        setShowRouteSelectModal(true);
      } else {
        alert("경로 정보를 가져오는데 실패했습니다.");
        setRoutes([]);
        setShowRoutePanel(false);
      }
    } catch (error) {
      console.error("Error during search:", error);
      alert("경로 검색 중 오류가 발생했습니다.");
      setRoutes([]);
      setShowRoutePanel(false);
    } finally {
      setLoading(false);
    }
  };

  // =============================
  // 이 부분은 자연어 처리 부분입니다.
  // =============================
  const [instructions, setInstructions] = useState([]); // 자연어 안내문
  const [instructionsLoading, setInstructionsLoading] = useState(false); // 안내문 로딩 상태
  // 경로 선택 시 안내문 비동기 요청
  const handleRouteSelect = async (route, idx) => {
    setRoutes([route]);
    setSelectedRouteIdx(0);
    setShowRoutePanel(true);
    setShowRouteSelectModal(false);
    // 안내문 초기화 및 로딩 시작
    setInstructions([]);
    setInstructionsLoading(true);

    // 폴리라인 그리기
    drawTransitRoute(route.data);

    // 비동기 안내문 요청
    try {
      const processData = {
        legs: route.data.legs,
        descriptions: route.rawDescriptions, // 이미 수집된 description
        userType: mode,
        startName: start,
        endName: end,
      };
      const processedResult = await processRouteInstructions(processData);
      setInstructions(processedResult.instructions || []);
    } catch (e) {
      setInstructions(["안내문 생성에 실패했습니다."]);
    } finally {
      setInstructionsLoading(false);
    }
  };

  const [showReportModal, setShowReportModal] = useState(false);

  const routePanelRef = useRef(null);
  const [closeBtnTop, setCloseBtnTop] = useState(null);

  // 패널 외부에 닫기 버튼 위치 동적 계산
  useEffect(() => {
    if (showRoutePanel && routePanelRef.current) {
      const updateBtnPos = () => {
        const rect = routePanelRef.current.getBoundingClientRect();
        setCloseBtnTop(window.scrollY + rect.top - 37); // 버튼 높이(32~34)+여백(5)
      };
      updateBtnPos();
      window.addEventListener("resize", updateBtnPos);
      window.addEventListener("scroll", updateBtnPos, true);
      return () => {
        window.removeEventListener("resize", updateBtnPos);
        window.removeEventListener("scroll", updateBtnPos, true);
      };
    } else {
      setCloseBtnTop(null);
    }
  }, [showRoutePanel]);

  // 지도 초기화 및 interval 관리
  useEffect(() => {
    const interval = setInterval(() => {
      if (window.tmapReady && mapRef.current) {
        clearInterval(interval);
        try {
          if (mapInstanceRef.current === null) {
            const center = new window.Tmapv2.LatLng(37.566481, 126.985023);
            mapInstanceRef.current = new window.Tmapv2.Map(mapRef.current, {
              center: center,
              zoom: 15,
              width: "100%",
              height: "100%",
            });
            window.mapInstanceRef = mapInstanceRef; // 디버깅용
          }
        } catch (e) {
          console.error("지도 생성 중 오류 발생:", e);
          setError("지도를 생성할 수 없습니다.");
        }
      }
    }, 100);
    return () => {
      clearInterval(interval);
      if (mapInstanceRef.current) {
        mapInstanceRef.current.destroy();
        mapInstanceRef.current = null;
        window.mapInstanceRef = null;
      }
    };
  }, []);

  // BookmarkPage에서 전달된 목적지 주소 처리
  useEffect(() => {
    if (location.state && location.state.destinationAddress) {
      const addressFromBookmark = location.state.destinationAddress;
      setEnd(addressFromBookmark);
      const searchAndSetDestination = async () => {
        try {
          const result = await searchPOI(addressFromBookmark);
          const pois = result?.searchPoiInfo?.pois?.poi || [];
          if (pois.length > 0) {
            const firstPOI = pois[0];
            handlePOISelection(firstPOI, "end");
          } else {
            alert(
              `"${addressFromBookmark}"에 대한 검색 결과를 찾을 수 없습니다.`
            );
          }
        } catch (err) {
          console.error("자동 POI 검색 중 오류 발생:", err);
          alert("주소 검색 중 오류가 발생했습니다.");
        }
      };
      if (mapInstanceRef.current) {
        searchAndSetDestination();
      } else {
        const checkMapLoaded = setInterval(() => {
          if (mapInstanceRef.current) {
            clearInterval(checkMapLoaded);
            searchAndSetDestination();
          }
        }, 100);
      }
      // location.state는 일회성으로 사용 후 초기화하는 것이 좋습니다.
      // navigate(".", { replace: true, state: {} }); // 예시
    }
  }, [location.state, mapInstanceRef.current]);

  // 지도에 대중교통 경로 폴리라인 그리기 함수 추가
  const drawTransitRoute = (itinerary) => {
    clearRoutePolylines();
    if (!itinerary || !Array.isArray(itinerary.legs)) return;
    const bounds = new window.Tmapv2.LatLngBounds();
    const newPolylines = [];

    itinerary.legs.forEach((leg, i) => {
      let coords = [];
      if (leg.mode === "WALK" && Array.isArray(leg.steps)) {
        // 도보: steps[].linestring 모두 이어붙이기
        leg.steps.forEach((step) => {
          if (step.linestring) {
            const points = step.linestring.split(" ").map((pair) => {
              const [lon, lat] = pair.split(",").map(Number);
              return new window.Tmapv2.LatLng(lat, lon);
            });
            coords.push(...points);
          }
        });
      } else if (leg.passShape && leg.passShape.linestring) {
        // 버스/지하철: passShape.linestring
        coords = leg.passShape.linestring.split(" ").map((pair) => {
          const [lon, lat] = pair.split(",").map(Number);
          return new window.Tmapv2.LatLng(lat, lon);
        });
      } else if (leg.start && leg.end) {
        // fallback: start/end만 연결
        coords = [
          new window.Tmapv2.LatLng(leg.start.lat, leg.start.lon),
          new window.Tmapv2.LatLng(leg.end.lat, leg.end.lon),
        ];
      }
      if (coords.length > 1) {
        coords.forEach((latlng) => bounds.extend(latlng));
        const polyline = new window.Tmapv2.Polyline({
          path: coords,
          strokeColor:
            leg.mode === "SUBWAY"
              ? "#7b2ff2"
              : leg.mode === "BUS"
              ? "#00c37a"
              : "#ff9800",
          strokeWeight: 5,
          map: mapInstanceRef.current,
        });
        newPolylines.push(polyline);
      }
    });

    setRoutePolylines(newPolylines);
    if (newPolylines.length > 0) {
      mapInstanceRef.current.fitBounds(bounds);
    }
  };

  // 현재 위치로 지도 이동
  const [myLocationMarker, setMyLocationMarker] = useState(null);
  const handleMoveToCurrentLocation = () => {
    setShowMarkerPanel(false); // 위치 버튼 누르면 마커 패널 닫힘
    if (!navigator.geolocation) {
      alert("이 브라우저에서는 위치 정보를 지원하지 않습니다.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        if (mapInstanceRef.current) {
          mapInstanceRef.current.setCenter(
            new window.Tmapv2.LatLng(latitude, longitude)
          );
          // 기존 내 위치 마커 제거
          if (myLocationMarker) {
            myLocationMarker.setMap(null);
          }
          // 내 위치 마커 추가
          const marker = new window.Tmapv2.Marker({
            position: new window.Tmapv2.LatLng(latitude, longitude),
            map: mapInstanceRef.current,
            title: "내 위치",
            icon: "/markers/icon-pin.png",
            iconSize: new window.Tmapv2.Size(36, 36),
          });
          setMyLocationMarker(marker);
        }
      },
      (err) => {
        alert("위치 정보를 가져올 수 없습니다: " + err.message);
      },
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
    );
  };

  // 시설 마커 상태
  const [facilityMarkers, setFacilityMarkers] = useState([]);
  const [selectedFacilityType, setSelectedFacilityType] = useState(null);

  // type별 한글명/아이콘 매핑 (임시)
  const FACILITY_TYPES = [
    { type: 3, label: "엘리베이터", icon: "/markers/icon-pin.png" },
    { type: 2, label: "장애인화장실", icon: "/markers/icon-pin.png" },
    { type: 1, label: "충전소", icon: "/markers/icon-ev.png" },
    { type: 4, label: "에스컬레이터", icon: "/markers/icon-pin.png" },
  ];

  // 시설 마커 클리어
  const clearFacilityMarkers = () => {
    facilityMarkers.forEach((marker) => marker.setMap(null));
    setFacilityMarkers([]);
  };

  // 시설 마커 표시
  const showFacilityMarkers = async (type) => {
    clearFacilityMarkers();
    const markers = await getMarkersByTypes([type]);
    if (!Array.isArray(markers) || markers.length === 0) return;
    const iconPath =
      window.location.origin +
      (FACILITY_TYPES.find((f) => f.type === type)?.icon ||
        "/markers/icon-pin.png");
    const newMarkers = markers.map((m) => {
      const lat = Number(m.lat);
      const lng = Number(m.lon);
      const marker = new window.Tmapv2.Marker({
        position: new window.Tmapv2.LatLng(lat, lng),
        map: mapInstanceRef.current,
        title: m.name || m.desc1,
        icon: iconPath,
        iconSize: new window.Tmapv2.Size(32, 32),
      });
      marker.setMap(mapInstanceRef.current);
      return marker;
    });
    setFacilityMarkers(newMarkers);
  };

  // 시설 버튼 클릭 핸들러
  const handleFacilityBtnClick = (type) => {
    if (selectedFacilityType === type) {
      // 이미 선택된 경우 토글(마커 제거)
      clearFacilityMarkers();
      setSelectedFacilityType(null);
    } else {
      setSelectedFacilityType(type);
      showFacilityMarkers(type);
    }
  };

  // 마커 패널 상태
  const [showMarkerPanel, setShowMarkerPanel] = useState(false);
  const markerPanelRef = useRef(null);

  // 패널 외부 클릭 시 닫기
  useEffect(() => {
    if (!showMarkerPanel) return;
    const handleClick = (e) => {
      if (
        markerPanelRef.current &&
        !markerPanelRef.current.contains(e.target) &&
        !e.target.closest(".fixedBtn") // 마커 메뉴 버튼 클릭은 무시
      ) {
        setShowMarkerPanel(false);
      }
    };
    document.addEventListener("click", handleClick); // mousedown → click
    return () => document.removeEventListener("click", handleClick);
  }, [showMarkerPanel]);

  useEffect(() => {
    console.log("showMarkerPanel 상태:", showMarkerPanel);
  }, [showMarkerPanel]);

  if (error) {
    return (
      <div className={styles.pageWrapper}>
        <div style={{ padding: "20px", textAlign: "center" }}>
          <p>지도 로드 오류: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.pageWrapper}>
      {loading && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            background: "rgba(255,255,255,0.6)",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <BouncingDots style={{ transform: "scale(2)" }} />
        </div>
      )}
      <header className={styles.mapHeader}>
        <div className={styles.headerLeft}>
          {/* 시설 마커 버튼 영역 삭제됨 */}
          <div className={styles.userTypeBtns}>
            <button
              className={`${styles.typeBtn} ${
                mode === "elder" ? styles.active : ""
              }`}
              onClick={() => {
                setMode("elder");
                if (selectedLocations.start && selectedLocations.end) {
                  handleSearch();
                }
              }}
            >
              노약자/임산부
            </button>
            <button
              className={`${styles.typeBtn} ${
                mode === "wheel" ? styles.active : ""
              }`}
              onClick={() => {
                setMode("wheel");
                if (selectedLocations.start && selectedLocations.end) {
                  handleSearch();
                }
              }}
            >
              휠체어/유모차
            </button>
          </div>
          <div className={styles.inputArea}>
            <div className={styles.inputRow} style={{ position: "relative" }}>
              <input
                value={start}
                onChange={(e) => handleInputChange(e, "start")}
                placeholder="출발지 입력"
                className={styles.input}
                autoComplete="off"
                onFocus={() => start && setShowDropdown("start")}
              />
              <button
                className={styles.iconBtn}
                type="button"
                onClick={handleShuffle}
                aria-label="셔플"
              >
                <img src="/images/icon-shuffle.png" alt="셔플" />
              </button>
              {/* 출발지 드롭다운 */}
              {showDropdown === "start" && searchResults.length > 0 && (
                <ul
                  style={{
                    position: "absolute",
                    top: 44,
                    left: 0,
                    right: 0,
                    zIndex: 20,
                    background: "#fff",
                    border: "1px solid #ccc",
                    borderRadius: 8,
                    maxHeight: 180,
                    overflowY: "auto",
                    listStyle: "none",
                    margin: 0,
                    padding: 0,
                  }}
                >
                  {searchResults.map((poi) => (
                    <li
                      key={poi.id}
                      style={{ padding: 8, cursor: "pointer" }}
                      onClick={() => handlePOISelection(poi, "start")}
                    >
                      {poi.name}
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div className={styles.inputRow} style={{ position: "relative" }}>
              <input
                value={end}
                onChange={(e) => handleInputChange(e, "end")}
                placeholder="도착지 입력"
                className={styles.input}
                autoComplete="off"
                onFocus={() => end && setShowDropdown("end")}
              />
              <button
                className={styles.iconBtn}
                type="button"
                onClick={handleSearch}
                aria-label="검색"
              >
                <img src="/images/icon-search.png" alt="검색" />
              </button>
              {/* 도착지 드롭다운 */}
              {showDropdown === "end" && searchResults.length > 0 && (
                <ul
                  style={{
                    position: "absolute",
                    top: 44,
                    left: 0,
                    right: 0,
                    zIndex: 20,
                    background: "#fff",
                    border: "1px solid #ccc",
                    borderRadius: 8,
                    maxHeight: 180,
                    overflowY: "auto",
                    listStyle: "none",
                    margin: 0,
                    padding: 0,
                  }}
                >
                  {searchResults.map((poi) => (
                    <li
                      key={poi.id}
                      style={{ padding: 8, cursor: "pointer" }}
                      onClick={() => handlePOISelection(poi, "end")}
                    >
                      {poi.name}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className={styles.mapArea}>
        {/* 경로 재선택 버튼 - 경로 안내 패널 바로 위 중앙 */}
        {showRoutePanel && (
          <button
            style={{
              position: "absolute",
              left: "50%",
              bottom: "41vh",
              transform: "translateX(-50%)",
              zIndex: 50,
              background: "#FFFBE7",
              border: "1.5px solid #F5D492",
              borderRadius: 16,
              padding: "8px 22px",
              fontWeight: 600,
              fontSize: 15,
              boxShadow: "0 2px 8px rgba(0,0,0,0.07)",
              cursor: "pointer",
            }}
            onClick={() => setShowRouteSelectModal(true)}
          >
            경로 재선택
          </button>
        )}
        <div ref={mapRef} className={styles.realMap} />
        <div className={styles.mapFixedBtns}>
          <button
            className={styles.fixedBtn}
            onClick={(e) => {
              e.stopPropagation(); // 이벤트 버블링 방지
              console.log("마커 메뉴 버튼 클릭!", showMarkerPanel);
              setShowMarkerPanel((prev) => !prev);
            }}
            aria-label="마커 메뉴"
          >
            <img src="/images/icon-menu.png" alt="메뉴" />
          </button>
          <button
            className={styles.fixedBtn}
            onClick={() => setShowReportModal(true)}
          >
            <img src="/images/icon-report2.png" alt="신고" />
          </button>
          <button
            className={styles.fixedBtn}
            onClick={handleMoveToCurrentLocation}
          >
            <img src="/images/icon-location.png" alt="위치" />
          </button>
        </div>
        {/* 마커 패널 */}
        {showMarkerPanel && (
          <div
            ref={markerPanelRef}
            style={{
              position: "absolute",
              top: "calc(50% - 15px)",
              right: 85,
              width: 210,
              background: "rgba(255,255,255,0.8)",
              borderRadius: 18,
              boxShadow: "0 2px 16px rgba(0,0,0,0.13)",
              padding: "18px 0 18px 0",
              zIndex: 100,
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-start",
              gap: 18,
              pointerEvents: "auto",
            }}
          >
            {FACILITY_TYPES.map((f) => (
              <button
                key={f.type}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 16,
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: "0 18px",
                  width: "100%",
                  fontSize: 17,
                  fontWeight: 500,
                  color: selectedFacilityType === f.type ? "#d17b00" : "#222",
                  outline: "none",
                }}
                onClick={() => handleFacilityBtnClick(f.type)}
              >
                <img
                  src={f.icon}
                  alt={f.label}
                  style={{ width: 38, height: 38, marginRight: 2 }}
                />
                <span>{f.label}</span>
              </button>
            ))}
          </div>
        )}
        {/* 경로 안내 슬라이드 패널 */}
        <div
          ref={routePanelRef}
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 201,
            transition:
              "transform 0.35s cubic-bezier(.4,1.3,.5,1), height 0.35s cubic-bezier(.4,1.3,.5,1), padding 0.2s",
            transform: showRoutePanel ? "translateY(0%)" : "translateY(100%)",
            background: "rgba(255,255,255,0.97)",
            borderTopLeftRadius: showRoutePanel ? 18 : 0,
            borderTopRightRadius: showRoutePanel ? 18 : 0,
            boxShadow: showRoutePanel ? "0 -2px 16px rgba(0,0,0,0.08)" : "none",
            minHeight: 0,
            height: showRoutePanel ? "35vh" : 0,
            maxHeight: "35vh",
            overflowY: showRoutePanel ? "auto" : "hidden",
            padding: showRoutePanel ? 20 : 0,
            pointerEvents: showRoutePanel ? "auto" : "none",
          }}
        >
          <div
            style={{
              width: 40,
              height: 5,
              borderRadius: 3,
              background: "#ccc",
              margin: "8px auto 16px auto",
              cursor: "pointer",
            }}
            onClick={() => setShowRoutePanel(false)}
          />
          <div
            style={{
              textAlign: "center",
              fontWeight: 600,
              fontSize: 16,
              marginBottom: 10,
            }}
          >
            경로 안내
          </div>
          <div style={{ position: "relative", minHeight: 0 }}>
            <ul
              style={{
                padding: 0,
                margin: 0,
                listStyle: "none",
                paddingBottom: 64,
              }}
            >
              {/* 이 부분은 자연어 처리 부분입니다. */}
              {instructionsLoading ? (
                <li style={{ color: "#888", fontStyle: "italic" }}>
                  안내문 생성 중...
                </li>
              ) : instructions.length > 0 ? (
                instructions.map((instruction, idx) => (
                  <li
                    key={`instruction-${idx}`}
                    style={{
                      padding: "8px 0",
                      borderBottom: "1px solid #eee",
                      fontSize: 15,
                    }}
                  >
                    {instruction}
                  </li>
                ))
              ) : (
                // fallback: 기존 방식
                (() => {
                  const route = routes[selectedRouteIdx];
                  if (!route) return null;
                  const routeData = route.data;
                  if (!routeData) return null;
                  const items = [];
                  routeData.legs.forEach((leg, lidx) => {
                    if (leg.mode === "WALK" && Array.isArray(leg.steps)) {
                      leg.steps.forEach((step, sidx) => {
                        items.push(
                          <li
                            key={`leg${lidx}-step${sidx}`}
                            style={{
                              padding: "8px 0",
                              borderBottom: "1px solid #eee",
                              fontSize: 15,
                            }}
                          >
                            {step.description}
                          </li>
                        );
                      });
                    } else {
                      items.push(
                        <li
                          key={`leg${lidx}`}
                          style={{
                            padding: "8px 0",
                            borderBottom: "1px solid #eee",
                            fontSize: 15,
                          }}
                        >
                          {leg.mode} {leg.name ? `(${leg.name})` : ""}{" "}
                          {leg.distance ? `- ${leg.distance}m 이동` : ""}
                        </li>
                      );
                    }
                  });
                  return items;
                })()
              )}
            </ul>
          </div>
        </div>
        {!showRoutePanel &&
          routes[selectedRouteIdx]?.instructions?.length > 0 && (
            <button
              style={{
                position: "absolute",
                left: "50%",
                bottom: 18,
                transform: "translateX(-50%)",
                zIndex: 31,
                background: "#FFFBE7",
                border: "1.5px solid #F5D492",
                borderRadius: 16,
                padding: "8px 22px",
                fontWeight: 600,
                fontSize: 15,
                boxShadow: "0 2px 8px rgba(0,0,0,0.07)",
                cursor: "pointer",
              }}
              onClick={() => setShowRoutePanel(true)}
            >
              경로 안내 보기
            </button>
          )}
      </div>
      <nav className={styles.bottomNav}>
        <Link to="/bookmark" className={styles.navItem}>
          <img src="/images/icon-star.png" alt="즐겨찾기" />
        </Link>
        <Link to="/main" className={styles.navItem}>
          <img src="/images/icon-home.png" alt="홈" />
        </Link>
        <Link to="/mypage" className={styles.navItem}>
          <img src="/images/icon-user.png" alt="내 정보" />
        </Link>
      </nav>
      {showReportModal && (
        <ReportModal onClose={() => setShowReportModal(false)} />
      )}
      {showRouteSelectModal && (
        <RouteSelectModal
          routes={routeOptions}
          onSelect={handleRouteSelect}
          onClose={() => setShowRouteSelectModal(false)}
          sortOption={routeSortOption}
          onSortChange={setRouteSortOption}
        />
      )}
    </div>
  );
}
