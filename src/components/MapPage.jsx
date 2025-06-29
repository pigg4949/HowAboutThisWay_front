/* global Tmapv2 */
import React, { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import styles from "../css/MapPage.module.css";
import {
  searchPOI,
  getTransitWithConnector,
  getTransitAllWalk,
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
        transitResult.metaData.plan.itineraries.forEach((itinerary, idx) => {
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

  // 모달에서 경로 선택 시 호출
  const handleRouteSelect = (route, idx) => {
    console.log("선택한 경로 데이터:", route);
    console.log("선택한 경로 인덱스:", idx);
    setRoutes([route]);
    setSelectedRouteIdx(0);
    setShowRoutePanel(true);
    setShowRouteSelectModal(false);
    // 지도에 경로 그리기
    if (route.type === "pedestrian") {
      drawPedestrianRoute(route.data);
    } else {
      drawTransitRoute(route.data);
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
  const handleMoveToCurrentLocation = () => {
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
        }
      },
      (err) => {
        alert("위치 정보를 가져올 수 없습니다: " + err.message);
      },
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
    );
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
          <button
            className={styles.fixedBtn}
            onClick={handleMoveToCurrentLocation}
          >
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
          {/* 경로 재선택 버튼 */}
          {showRoutePanel && (
            <button
              style={{
                position: "absolute",
                top: 16,
                right: 20,
                zIndex: 40,
                background: "#ffe6a7",
                border: "1px solid #f5d492",
                borderRadius: 8,
                padding: "4px 14px",
                fontWeight: 500,
                fontSize: 13,
                cursor: "pointer",
                boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
              }}
              onClick={() => setShowRouteSelectModal(true)}
            >
              경로 재선택
            </button>
          )}
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
              {(() => {
                const route = routes[selectedRouteIdx]?.data;
                if (!route) return null;
                const items = [];
                route.legs.forEach((leg, lidx) => {
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
                    // 대중교통 구간: 버스/지하철 등
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
              })()}
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
