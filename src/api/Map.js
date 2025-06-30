import axios from "axios";

const BASE_URL = "http://localhost:8080/api/map";

// POI 검색 API
export const searchPOI = async (keyword) => {
  const res = await axios.get(`${BASE_URL}/searchLocation`, {
    params: { keyword },
  });
  return res.data;
};

// 환승 전후 보행경로 계산 (forPram)
export const getTransitWithConnector = async (params) => {
  const res = await axios.post(`${BASE_URL}/forPram`, params);
  return res.data;
};

// 모든 보행 레그 재계산 (forOld)
export const getTransitAllWalk = async (params) => {
  const res = await axios.post(`${BASE_URL}/forOld`, params);
  return res.data;
};

// =============================
// 이 부분은 자연어 처리 부분입니다.
// =============================
// 경로 안내문 자연어 처리 API
export const processRouteInstructions = async (routeData) => {
  const res = await axios.post(`${BASE_URL}/process-instructions`, routeData);
  return res.data;
};

// 고정 마커(시설 등) 조회
export const getMarkersByTypes = async (types) => {
  // types: 배열 (ex: [1,2,3])
  const res = await axios.get(`${BASE_URL}/markers`, {
    params: { types: types.join(",") },
  });
  return res.data;
};

// 제보 마커(사용자 제보) 조회
export const getReportsByTypes = async (types) => {
  const res = await axios.get(`${BASE_URL}/reports`, {
    params: { types: types.join(",") },
  });
  return res.data;
};
