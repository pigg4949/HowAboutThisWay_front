import React, { useEffect, useRef } from "react";
/**
* Tmap 지도를 렌더링하는 최소 MapView 컴포넌트
* @param {object} center - { lat, lng } 형태의 초기 중심 좌표
* @param {string|number} width - 지도 width (ex: '100%', 400)
* @param {string|number} height - 지도 height (ex: '100%', 300)
*/
export default function MapView({
  center = { lat: 37.5665, lng: 126.978 },
  width = "100%",
  height = 300,
}) {
  const mapRef = useRef(null);
  useEffect(() => {
    if (!window.Tmapv2 || !mapRef.current) return;
    // 이미 생성된 지도 인스턴스가 있으면 제거
    if (mapRef.current._tmapInstance) {
      mapRef.current._tmapInstance.destroy();
      mapRef.current._tmapInstance = null;
    }
    // 지도 생성
    const map = new window.Tmapv2.Map(mapRef.current, {
      center: new window.Tmapv2.LatLng(center.lat, center.lng),
      width: typeof width === "number" ? `${width}px` : width,
      height: typeof height === "number" ? `${height}px` : height,
      zoom: 15
    });
    mapRef.current._tmapInstance = map;
    // cleanup
    return () => {
      if (mapRef.current && mapRef.current._tmapInstance) {
        mapRef.current._tmapInstance.destroy();
        mapRef.current._tmapInstance = null;
      }
    };
  }, [center, width, height]);
  return (
    <div
      ref={mapRef}
      style={{
        width: typeof width === "number" ? `${width}px` : width,
        height: typeof height === "number" ? `${height}px` : height,
        borderRadius: 8,
        overflow: "hidden",
      }}
    />
  );
}