import axios from "axios";

const BASE_URL = "http://localhost:8080/api/map";

export const viewMap = async () => {
  const res = await axios.post(`${BASE_URL}/view`);
  return res.data;
};

// POI 검색 API
export const searchPOI = async (keyword) => {
  try {
    const response = await fetch(
      `${BASE_URL}/searchLocation?keyword=${encodeURIComponent(keyword)}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("POI 검색 API 호출 중 오류:", error);
    throw error;
  }
};

// 보행자 경로 안내 API
export const getPedestrianRoute = async (routeData) => {
  try {
    const response = await fetch(`${BASE_URL}/pedestrianRoute`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(routeData),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("보행자 경로 API 호출 중 오류:", error);
    throw error;
  }
};

// 대중교통 경로 안내 API
export const getTransitRoute = async (routeData) => {
  try {
    const response = await fetch(`${BASE_URL}/transitRoute`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(routeData),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("대중교통 경로 API 호출 중 오류:", error);
    throw error;
  }
};
