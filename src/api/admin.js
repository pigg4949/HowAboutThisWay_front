// src/api/adminUserApi.js
import axios from 'axios';

// 사용자 관리 API
const API_BASE = '/api/users';

/**
 * 모든 사용자 목록을 가져옵니다.
 * @returns {Promise<Array>} 사용자 배열
 */
export async function getAllUsers() {
  const token = localStorage.getItem('token');
  const res = await axios.get(API_BASE, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
}

/**
 * 특정 사용자의 활성 상태(isActive)를 변경합니다.
 * @param {string} userId - 대상 사용자 ID
 * @param {boolean} isActive - true: 활성화, false: 비활성화
 * @returns {Promise<Object>} 응답 데이터
 */
export async function toggleUserActive(userId, isActive) {
  const token = localStorage.getItem('token');
  const res = await axios.patch(
    `${API_BASE}/${userId}/active`,
    null,
    {
      params: { isActive },
      headers: { Authorization: `Bearer ${token}` }
    }
  );
  return res.data;
}
