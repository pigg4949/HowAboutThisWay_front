/* global Tmapv2 */
import React, { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import styles from "../css/MapPage.module.css";
import { searchPOI, getPedestrianRoute, getTransitRoute } from "../api/Map";
import ReportModal from "./ReportModal";

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

  /*
  // 수정 전 버전
  // 출발지 마커 표시
  const showStartMarker = (location) => {
    if (startMarker) startMarker.setMap(null);

    const marker = new window.Tmapv2.Marker({
      position: new window.Tmapv2.LatLng(location.lat, location.lng),
      map: mapInstanceRef.current,
      title: location.name,
      icon: "/markers/pin_r_m_s.png",
      iconSize: new window.Tmapv2.Size(24, 38),
    });

    setStartMarker(marker);
  };

  // 도착지 마커 표시
  const showEndMarker = (location) => {
    if (endMarker) endMarker.setMap(null);

    const marker = new window.Tmapv2.Marker({
      position: new window.Tmapv2.LatLng(location.lat, location.lng),
      map: mapInstanceRef.current,
      title: location.name,
      icon: "/markers/pin_r_m_e.png",
      iconSize: new window.Tmapv2.Size(24, 38),
    });

    setEndMarker(marker);
  };
  */

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
  const handleSearch = async () => {
    if (!selectedLocations.start || !selectedLocations.end) {
      alert("출발지와 도착지를 모두 선택해주세요.");
      return;
    }
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
      // 도보 경로
      const routeResult = await getPedestrianRoute(routeData);
      // 대중교통 경로
      const transitResult = await getTransitRoute(routeData);
      console.log("[DEBUG] transitResult:", transitResult);
      const newRoutes = [];
      // 보행자 경로 추가
      if (routeResult && routeResult.features) {
        newRoutes.push({
          type: "pedestrian",
          data: routeResult,
          instructions: routeResult.features
            .map((f) => f.properties?.description)
            .filter(Boolean)
            .filter(
              (desc) =>
                desc.trim() &&
                desc !== ", 17m" &&
                desc !== ", 46m" &&
                desc !== ", 57m" &&
                desc !== ", 15m" &&
                desc !== ", 6m" &&
                desc !== ", 20m" &&
                desc !== ", 31m" &&
                desc !== ", 12m" &&
                desc !== ", 22m"
            ),
        });
      }
      // 대중교통 경로 legs별로 추가 (기존 코드 대체)
      if (
        transitResult &&
        transitResult.metaData &&
        transitResult.metaData.plan &&
        Array.isArray(transitResult.metaData.plan.itineraries)
      ) {
        transitResult.metaData.plan.itineraries.forEach((itinerary, idx) => {
          // legs 배열을 한 줄 요약으로 안내 텍스트 생성
          const instructions = itinerary.legs.map((leg, lidx) => {
            return `${leg.mode || ""} ${leg.name || ""} ${
              leg.distance ? leg.distance + "m 이동" : ""
            }`.trim();
          });
          newRoutes.push({
            type: "transit",
            data: itinerary,
            instructions,
          });
        });
      }
      if (newRoutes.length > 0) {
        setRoutes(newRoutes);
        setSelectedRouteIdx(0); // 기본 첫 번째 경로 선택
        setShowRoutePanel(true);
        // 지도에 경로 그리기(기본: 첫 번째 경로)
        if (newRoutes[0].type === "pedestrian") {
          drawPedestrianRoute(newRoutes[0].data);
        } else {
          // 대중교통 경로는 별도 draw 함수 필요시 추가
          // drawTransitRoute(newRoutes[0].data);
          clearRoutePolylines();
        }
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
          }
        } catch (e) {
          console.error("지도 생성 중 오류 발생:", e);
          setError("지도를 생성할 수 없습니다.");
        }
      }
    }, 100);

    // 추가된 부분
    // MapPage 로드 시 또는 location.state 변경 시 실행되는 useEffect
    useEffect(() => {
      // BookmarkPage에서 전달된 destinationAddress 값 처리
      if (location.state && location.state.destinationAddress) {
        const addressFromBookmark = location.state.destinationAddress;

        // 1. 'end' 입력 필드를 채웁니다.
        setEnd(addressFromBookmark);

        // 2. 해당 주소로 POI 검색을 수행합니다.
        const searchAndSetDestination = async () => {
          try {
            const result = await searchPOI(addressFromBookmark);
            const pois = result?.searchPoiInfo?.pois?.poi || [];

            if (pois.length > 0) {
              // 가장 첫 번째 검색 결과를 도착지로 자동 선택합니다.
              const firstPOI = pois[0];
              handlePOISelection(firstPOI, "end"); // 'end' 타입으로 전달
            } else {
              alert(
                `"${addressFromBookmark}"에 대한 검색 결과를 찾을 수 없습니다.`
              );
              // 검색 결과가 없으면 'end' 필드를 초기화하거나 사용자에게 직접 입력하게 할 수 있습니다.
              // setEnd("");
              // setSelectedLocations((prev) => ({ ...prev, end: null }));
            }
          } catch (err) {
            console.error("자동 POI 검색 중 오류 발생:", err);
            alert("주소 검색 중 오류가 발생했습니다.");
          }
        };

        // 맵 인스턴스가 로드된 후에 검색을 실행하도록 확인 (선택적)
        // Tmapv2 Map 객체 생성 후 실행되도록 약간의 지연을 주거나,
        // mapInstanceRef.current가 유효한지 확인하는 로직을 추가할 수 있습니다.
        if (mapInstanceRef.current) {
          searchAndSetDestination();
        } else {
          // 맵이 아직 로드되지 않았다면, 맵 로드 후 실행되도록 처리 (예: setTimeout)
          const checkMapLoaded = setInterval(() => {
            if (mapInstanceRef.current) {
              clearInterval(checkMapLoaded);
              searchAndSetDestination();
            }
          }, 100); // 100ms 간격으로 맵 로드 확인
        }

        // location.state는 일회성으로 사용 후 초기화하는 것이 좋습니다.
        // (단, history.replaceState는 현재 페이지의 history를 대체하므로 주의해서 사용)
        // navigate(".", { replace: true, state: {} }); // 예시
      }
    }, [location.state, mapInstanceRef.current]); // location.state와 mapInstanceRef.current가 변경될 때마다 실행
    // 추가된 부분

    return () => {
      clearInterval(interval);
      if (mapInstanceRef.current) {
        mapInstanceRef.current.destroy();
        mapInstanceRef.current = null;
      }
    };
  }, []);

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
      <header className={styles.mapHeader}>
        <div className={styles.headerLeft}>
          <div className={styles.userTypeBtns}>
            <button
              className={`${styles.typeBtn} ${
                mode === "elder" ? styles.active : ""
              }`}
              onClick={() => setMode("elder")}
            >
              노약자/임산부
            </button>
            <button
              className={`${styles.typeBtn} ${
                mode === "wheel" ? styles.active : ""
              }`}
              onClick={() => setMode("wheel")}
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
        <div ref={mapRef} className={styles.realMap} />
        <div className={styles.mapFixedBtns}>
          <button className={styles.fixedBtn}>
            <img src="/images/icon-menu.png" alt="메뉴" />
          </button>
          <button
            className={styles.fixedBtn}
            onClick={() => setShowReportModal(true)}
          >
            <img src="/images/icon-report2.png" alt="신고" />
          </button>
          <button className={styles.fixedBtn}>
            <img src="/images/icon-location.png" alt="위치" />
          </button>
        </div>
        {/* 경로 안내 슬라이드 패널 */}
        <div
          ref={routePanelRef}
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 30,
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
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              marginBottom: 8,
            }}
          >
            <div
              style={{
                width: 40,
                height: 5,
                borderRadius: 3,
                background: "#ccc",
                margin: "8px 0",
                cursor: "pointer",
              }}
              onClick={() => setShowRoutePanel(!showRoutePanel)}
            />
          </div>
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
          {/* 경로 선택 UI (가로 스크롤, 스타일 개선, key 경고 해결) */}
          {showRoutePanel && routes.length > 0 && (
            <div
              style={{
                display: "flex",
                flexDirection: "row",
                overflowX: "auto",
                gap: 8,
                marginBottom: 10,
                padding: "4px 0 8px 0",
                scrollbarWidth: "thin",
                WebkitOverflowScrolling: "touch",
              }}
            >
              {routes.map((route, idx) => (
                <button
                  key={`route-btn-${route.type}-${idx}`}
                  onClick={() => {
                    setSelectedRouteIdx(idx);
                    // 지도에 경로 그리기
                    if (route.type === "pedestrian") {
                      drawPedestrianRoute(route.data);
                    } else {
                      drawTransitRoute(route.data);
                    }
                  }}
                  style={{
                    fontWeight: selectedRouteIdx === idx ? "bold" : "normal",
                    background:
                      selectedRouteIdx === idx ? "#ffe6a7" : "#f5f5f5",
                    border:
                      selectedRouteIdx === idx
                        ? "2px solid #f5d492"
                        : "1.5px solid #e0e0e0",
                    borderRadius: 18,
                    padding: "6px 10px",
                    cursor: "pointer",
                    fontSize: 13.5,
                    minWidth: 90,
                    maxWidth: 120,
                    height: 34,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    textAlign: "center",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow:
                      selectedRouteIdx === idx
                        ? "0 2px 8px rgba(0,0,0,0.07)"
                        : "none",
                    color: selectedRouteIdx === idx ? "#b97a00" : "#333",
                    transition: "all 0.15s",
                  }}
                >
                  {route.type === "pedestrian"
                    ? "보행자 경로"
                    : `대중교통경로 ${idx + 1}`}
                </button>
              ))}
            </div>
          )}
          <div style={{ position: "relative", minHeight: 0 }}>
            <ul
              style={{
                padding: 0,
                margin: 0,
                listStyle: "none",
                paddingBottom: 64,
              }}
            >
              {routes[selectedRouteIdx]?.instructions?.map((desc, idx) => (
                <li
                  key={idx}
                  style={{
                    padding: "8px 0",
                    borderBottom: "1px solid #eee",
                    fontSize: 15,
                  }}
                >
                  {desc}
                </li>
              ))}
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
                background: "#fffbe7",
                border: "1.5px solid #f5d492",
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
        {/* 경로 안내 닫기 버튼: 패널 외부, 모달 위쪽에 항상 위치 */}
        {showRoutePanel && closeBtnTop !== null && (
          <button
            style={{
              position: "absolute",
              left: "50%",
              top: closeBtnTop,
              transform: "translateX(-50%)",
              background: "#fffbe7",
              border: "1.5px solid #f5d492",
              borderRadius: 16,
              padding: "8px 22px",
              fontWeight: 600,
              fontSize: 15,
              boxShadow: "0 2px 8px rgba(0,0,0,0.07)",
              cursor: "pointer",
              zIndex: 100,
            }}
            onClick={() => setShowRoutePanel(false)}
          >
            경로 안내 닫기
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
    </div>
  );
}
