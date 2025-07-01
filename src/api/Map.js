import axios from "axios";

const BASE_URL = "http://localhost:8080/api/map";

// ====== 클라이언트 캐시 유틸 ======
const ROUTE_CACHE_KEY = "routeCacheV1";
function loadRouteCache() {
  try {
    return JSON.parse(localStorage.getItem(ROUTE_CACHE_KEY)) || {};
  } catch {
    return {};
  }
}
function saveRouteCache(cache) {
  localStorage.setItem(ROUTE_CACHE_KEY, JSON.stringify(cache));
}
function makeCacheKey(params, mode) {
  // 속성 이름을 정렬해서 stringify
  const ordered = {};
  Object.keys(params)
    .sort()
    .forEach((k) => {
      ordered[k] = params[k];
    });
  return mode + ":" + JSON.stringify(ordered);
}

function makeInstructionCacheKey(data) {
  // legs, descriptions, userType, startName, endName을 정렬해서 stringify
  const ordered = {
    userType: data.userType,
    startName: data.startName,
    endName: data.endName,
    // legs와 descriptions은 JSON.stringify로만 처리(순서 중요)
    legs: data.legs,
    descriptions: data.descriptions,
  };
  return "instructions:" + JSON.stringify(ordered);
}

const INSTRUCTION_CACHE_KEY = "routeInstructionCacheV1";
function loadInstructionCache() {
  try {
    return JSON.parse(localStorage.getItem(INSTRUCTION_CACHE_KEY)) || {};
  } catch {
    return {};
  }
}
function saveInstructionCache(cache) {
  localStorage.setItem(INSTRUCTION_CACHE_KEY, JSON.stringify(cache));
}

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
  const res = await axios.get(`${BASE_URL}/markers`, {
    params: { types }, // 배열 그대로
    paramsSerializer: (params) =>
      params.types.map((t) => `types=${t}`).join("&"),
  });
  return res.data;
};


export const getReportsByTypes = async (types) => {
  const res = await axios.get(`${BASE_URL}/reports`, {
    params: { types },
    paramsSerializer: (params) =>
      params.types.map((t) => `types=${t}`).join("&"),
  });
  return res.data;
};

export async function getTransitWithConnectorCached(params) {
  const cache = loadRouteCache();
  const key = makeCacheKey(params, "wheel");
  if (cache[key] && Date.now() - cache[key].ts < 1000 * 60 * 60 * 24) {
    console.log("[ROUTE CACHE] 캐시에서 불러옴:", key);
    return cache[key].result;
  }
  console.log("[ROUTE CACHE] 서버에서 새로 요청:", key);
  const result = await getTransitWithConnector(params);
  cache[key] = { result, ts: Date.now() };
  saveRouteCache(cache);
  return result;
}

export async function getTransitAllWalkCached(params) {
  const cache = loadRouteCache();
  const key = makeCacheKey(params, "elder");
  if (cache[key] && Date.now() - cache[key].ts < 1000 * 60 * 60 * 24) {
    console.log("[ROUTE CACHE] 캐시에서 불러옴:", key);
    return cache[key].result;
  }
  console.log("[ROUTE CACHE] 서버에서 새로 요청:", key);
  const result = await getTransitAllWalk(params);
  cache[key] = { result, ts: Date.now() };
  saveRouteCache(cache);
  return result;
}

export async function processRouteInstructionsCached(data) {
  const cache = loadInstructionCache();
  const key = makeInstructionCacheKey(data);
  if (cache[key] && Date.now() - cache[key].ts < 1000 * 60 * 60 * 24) {
    console.log("[INSTRUCTION CACHE] 캐시에서 불러옴:", key);
    return cache[key].result;
  }
  console.log("[INSTRUCTION CACHE] 서버에서 새로 요청:", key);
  const result = await processRouteInstructions(data);
  cache[key] = { result, ts: Date.now() };
  saveInstructionCache(cache);
  return result;
}
