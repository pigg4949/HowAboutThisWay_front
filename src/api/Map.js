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
