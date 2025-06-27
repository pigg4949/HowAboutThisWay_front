import React from "react";
import { Routes, Route } from "react-router-dom";
import LoginPage from "./components/LoginPage";
import SignupPage from "./components/SignupPage";
import BookmarkPage from "./components/BookmarkPage";
import MainPage from "./components/MainPage";
import FindInfoPage from "./components/FindInfoPage";
import MyPage from "./components/MyPage";
import ReportPage from "./components/ReportPage";
import MapPage from "./components/MapPage";
import AdminMainPage from "./components/AdminMainPage"
import KakaoCallback from "./components/KakaoCallback";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/bookmark" element={<BookmarkPage />} />
      <Route path="/main" element={<MainPage />} />
      <Route path="/admin" element={<AdminMainPage />} />
      <Route path="/map" element={<MapPage />} />
      <Route path="/findinfo" element={<FindInfoPage />} />
      <Route path="/mypage" element={<MyPage />} />
      <Route path="/report" element={<ReportPage />} />
      <Route path="/kakao-callback" element={<KakaoCallback />} />
    </Routes>
  );
}
