import React, { useState } from "react";
import { updateReportImage, updateReport } from "../api/report";
import styles from "../css/MainPage.module.css";

export default function ReportEditModal({ report, onClose, onUpdate }) {
  const [content, setContent] = useState(report.comment || "");
  const [image, setImage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleImageChange = (e) => {
    if (e.target.files[0]) {
      setImage(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) {
      alert("내용을 입력해주세요.");
      return;
    }

    setIsLoading(true);
    try {
      // 제보 내용 업데이트
      await updateReport(report.idx, { comment: content });

      // 이미지가 선택된 경우에만 이미지 업데이트
      if (image) {
        await updateReportImage(report.idx, image);
      }

      alert("제보가 수정되었습니다.");
      onUpdate && onUpdate();
      onClose();
    } catch (error) {
      console.error("제보 수정 실패:", error);
      alert("제보 수정에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.modalOverlay} style={{ pointerEvents: "auto" }}>
      <div className={styles.modalContent} style={{ pointerEvents: "auto" }}>
        <button className={styles.modalClose} onClick={onClose}>
          &times;
        </button>
        <h2 className={styles.modalTitle}>제보 수정</h2>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 16 }}>
            <label
              style={{ display: "block", marginBottom: 8, fontWeight: 600 }}
            >
              분류
            </label>
            <div
              style={{
                background: "#f7f7f7",
                borderRadius: 8,
                padding: 12,
                color: "#666",
              }}
            >
              {report.type === "5" && "단차 큼"}
              {report.type === "6" && "보도 폭 좁음"}
              {report.type === "toilet" && "장애인 화장실"}
              {report.type === "7" && "기타"}
            </div>
          </div>

          <div style={{ marginBottom: 16 }}>
            <label
              style={{ display: "block", marginBottom: 8, fontWeight: 600 }}
            >
              위치
            </label>
            <div
              style={{
                background: "#f7f7f7",
                borderRadius: 8,
                padding: 12,
                color: "#666",
                fontSize: 14,
              }}
            >
              경도: {report.lon?.toFixed(6)}, 위도: {report.lat?.toFixed(6)}
            </div>
          </div>

          <div style={{ marginBottom: 16 }}>
            <label
              style={{ display: "block", marginBottom: 8, fontWeight: 600 }}
            >
              내용
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="불편 사항을 수정해주세요."
              className={styles.modalTextarea}
              required
            />
          </div>

          <div style={{ marginBottom: 16 }}>
            <label
              style={{ display: "block", marginBottom: 8, fontWeight: 600 }}
            >
              현재 이미지
            </label>
            {report.imageUrl ? (
              <img
                src={report.imageUrl}
                alt="현재 이미지"
                style={{
                  width: "100%",
                  maxHeight: 200,
                  objectFit: "cover",
                  borderRadius: 8,
                  border: "1px solid #ddd",
                }}
              />
            ) : (
              <div
                style={{
                  background: "#f7f7f7",
                  borderRadius: 8,
                  padding: 40,
                  textAlign: "center",
                  color: "#999",
                }}
              >
                이미지 없음
              </div>
            )}
          </div>

          <div style={{ marginBottom: 16 }}>
            <label
              style={{ display: "block", marginBottom: 8, fontWeight: 600 }}
            >
              새 이미지 업로드 (선택사항)
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              style={{
                width: "100%",
                padding: 8,
                border: "1px solid #ddd",
                borderRadius: 4,
              }}
            />
          </div>

          <div className={styles.modalActions}>
            <button
              type="button"
              onClick={onClose}
              className={styles.buttonSecondary}
              disabled={isLoading}
            >
              취소
            </button>
            <button
              type="submit"
              className={styles.buttonPrimary}
              disabled={isLoading}
            >
              {isLoading ? "수정 중..." : "수정하기"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
