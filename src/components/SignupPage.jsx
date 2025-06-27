import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axios";
import styles from "../css/SignupPage.module.css";

const termsData = {
  service: {
    title: "이용 약관",
    content: `
      <b>제1조(목적)</b><br>
      본 약관은 [발사 후 조준](이하 "회사")이 제공하는 서비스(이하 "서비스")의 이용과 관련하여
      회사와 이용자 간의 권리, 의무 및 책임사항을 규정함을 목적으로 합니다.<br><br>
      <b>제2조(회원가입)</b><br>
      1. 이용자는 회사가 정한 절차에 따라 회원가입을 신청할 수 있습니다.<br>
      2. 회원가입 시 제공한 정보가 허위임이 밝혀질 경우, 서비스 이용에 제한이 있을 수 있습니다.<br><br>
      <b>제3조(서비스 이용)</b><br>
      1. 회사는 이용자에게 다양한 서비스를 제공합니다.<br>
      2. 회사는 서비스의 내용, 이용방법, 운영시간을 사전 공지 없이 변경할 수 있습니다.<br><br>
      <b>제4조(회원의 의무)</b><br>
      1. 회원은 관계 법령, 본 약관 및 이용안내 등 회사가 정한 사항을 준수해야 합니다.<br>
      2. 회원은 서비스 이용과 관련하여 다음 각 호의 행위를 해서는 안 됩니다.<br>
      &nbsp; 가. 신청 또는 변경 시 허위내용 등록<br>
      &nbsp; 나. 타인 정보 도용<br>
      &nbsp; 다. 운영진·관리자 명의 도용 행위<br><br>
      <b>제5조(면책조항)</b><br>
      회사는 천재지변, 불가항력적 사유, 이용자 귀책사유로 인한 서비스 이용 장애에 대해 책임을 지지 않습니다.<br><br>
      <b>제6조(약관의 변경)</b><br>
      본 약관은 정책 및 관련 법령 변경에 따라 변경될 수 있으며, 변경 시 사전 고지합니다.
    `,
  },
  location: {
    title: "위치기반서비스 약관",
    content: `
      <b>제1조(목적)</b><br>
      본 약관은 [발사 후 조준]이 제공하는 위치기반서비스(이하 "서비스")의 이용과 관련하여
      회사와 이용자 간의 권리, 의무 및 책임사항을 규정함을 목적으로 합니다.<br><br>
      <b>제2조(위치정보의 수집 및 이용)</b><br>
      1. 회사는 서비스 제공을 위하여 이용자의 위치정보를 수집·이용할 수 있습니다.<br>
      2. 수집된 위치정보는 서비스 목적 외의 용도로 사용되지 않으며, 보관기간 경과 시 즉시 파기됩니다.<br><br>
      <b>제3조(동의 및 철회)</b><br>
      1. 이용자는 위치정보의 수집 및 이용에 동의하지 않을 수 있으며, 언제든지 동의를 철회할 수 있습니다.<br>
      2. 동의 철회 시 회사는 즉시 위치정보의 수집 및 이용을 중단합니다.<br><br>
      <b>제4조(제3자 제공)</b><br>
      회사는 이용자의 동의 없이 위치정보를 제3자에게 제공하지 않습니다. 다만, 법령에 의해 요구되는 경우에는 예외로 합니다.<br><br>
      <b>제5조(이용자의 권리)</b><br>
      이용자는 자신의 위치정보에 대한 열람, 정정, 삭제를 회사에 요청할 수 있습니다.<br><br>
      <b>제6조(손해배상 및 면책)</b><br>
      위치정보 관리에 있어 회사의 고의 또는 중대한 과실로 손해가 발생한 경우, 회사는 관련 법령에 따라 책임을 집니다.
      단, 불가항력적 사유 등은 책임이 제한될 수 있습니다.
    `,
  },
};

export default function SignupPage() {
  const [userId, setUserId] = useState("");
  const [ssnFront, setSsnFront] = useState("");
  const [ssnBack, setSsnBack] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [agreeService, setAgreeService] = useState(false);
  const [agreeLocation, setAgreeLocation] = useState(false);
  const [modalTerm, setModalTerm] = useState(null);
  const navigate = useNavigate();

  const [codeSent, setCodeSent] = useState(false);
  const [verified, setVerified] = useState(false);
  const [serverCode, setServerCode] = useState("");
  const [timeLeft, setTimeLeft] = useState(180); // 3분

  // 새 상태 추가
  const [isUserIdAvailable, setIsUserIdAvailable] = useState(null); // null: 아직 확인 안함, true/false: 확인 결과

  // 아이디 입력 시 중복확인 상태 초기화
  const handleUserIdChange = (e) => {
    setUserId(e.target.value);
    setIsUserIdAvailable(null); // 아이디가 바뀌면 중복확인 상태 초기화
  };

  const handleCheckDup = async () => {
    try {
      console.log("Checking duplicate for:", userId);
      const res = await api.get(`/check-dup?userId=${userId}`);
      console.log("Response status:", res.status);
      alert("✅ 사용 가능한 아이디입니다.");
      setIsUserIdAvailable(true);
    } catch (error) {
      console.log("Error response:", error.response);
      alert("❌ 이미 사용 중인 아이디입니다.");
      setIsUserIdAvailable(false);
    }
  };

  const handleVerifyCode = async () => {
    try {
      const response = await api.post("/users/send-code", { phone });
      alert("인증번호가 발송되었습니다.");
      setServerCode(response.data.code); // 서버가 인증코드를 응답에 포함시켰다고 가정
      setCodeSent(true);
      setTimeLeft(180);
      startTimer();
    } catch {
      alert("인증번호 발송 실패");
    }
  };

const startTimer = () => {
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setServerCode(""); // 만료 시 코드 무효화
          setCodeSent(false);
          alert("⏰ 인증 시간이 만료되었습니다. 다시 시도해주세요.");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleCodeConfirm = async () => {
    try {
      const response = await api.post("/users/verify-code", { phone, code });
      alert(response.data.message); // "인증 성공"
      setVerified(true);
    } catch (err) {
      alert("❌ 인증 실패 또는 만료되었습니다.");
      setVerified(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // if (isUserIdAvailable !== true) {
    //   alert("아이디 중복 확인을 완료해주세요.");
    //   return;
    // }

    if (password !== confirm) {
      alert("비밀번호가 일치하지 않습니다.");
      return;
    }
    // hanwon
    if (!verified) {
      alert("휴대폰 인증을 완료해주세요.");
      return;
    }
    //여기까지
    if (!agreeService || !agreeLocation) {
      alert("약관에 모두 동의해주세요.");
      return;
    }
    try {
      await api.post("/users/register", {
        userId,
        ssn1: ssnFront,
        ssn2: ssnBack,
        name,
        passwordHash: password,
        phone,
        agreeService,
        agreeLocation,
      });
      navigate("/");
    } catch (err) {
      alert("회원가입 실패: " + err.message);
    }
  };

  return (
    <>
      <main className={styles.mainContent}>
        <header className={styles.header}>
          <Link to="/" className={styles.backButton}>
            ←
          </Link>
          <h2 className={styles.pageTitle}>회원가입</h2>
        </header>

        <form onSubmit={handleSubmit} className={styles.signupForm}>
          {/* 아이디 */}
          <label htmlFor="userId">아이디</label>
          <div className={styles.inputWithButton}>
            <input
              id="userId"
              type="text"
              value={userId}
              onChange={handleUserIdChange} // 변경됨
              placeholder="아이디를 입력해주세요"
              required
            />
            <button
              type="button"
              className={styles.btnInline}
              onClick={handleCheckDup}
            >
              중복 확인
            </button>
            {isUserIdAvailable === false && (
              <p className={styles.errorText}>이미 사용 중인 아이디입니다.</p>
            )}
            {isUserIdAvailable === true && (
              <p className={styles.successText}>사용 가능한 아이디입니다.</p>
            )}
          </div>

          {/* 주민등록번호 */}
          <label>주민등록번호</label>
          <div className={styles.ssnGroup}>
            <input
              type="text"
              value={ssnFront}
              onChange={(e) => setSsnFront(e.target.value)}
              placeholder="주민번호 앞자리"
              maxLength={6}
              required
            />
            <input
              type="password"
              value={ssnBack}
              onChange={(e) => setSsnBack(e.target.value)}
              placeholder="주민번호 뒷자리"
              maxLength={7}
              required
            />
          </div>

          {/* 이름 */}
          <label htmlFor="name">이름</label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="성함을 입력해주세요"
            required
          />

          {/* 비밀번호 */}
          <label htmlFor="password">비밀번호</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="비밀번호를 입력해주세요"
            required
          />

          {/* 비밀번호 확인 */}
          <label htmlFor="confirm">비밀번호 확인</label>
          <input
            id="confirm"
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            placeholder="비밀번호를 한번 더 입력해주세요"
            required
          />

          {/* 휴대폰 인증 */}
          <label>휴대폰 번호 인증</label>
          <div className={styles.inputWithButton}>
            <input
              id="phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="휴대폰 번호 입력"
              required
            />
            <button
              type="button"
              className={styles.btnInline}
              onClick={handleVerifyCode}
            >
              전송
            </button>
          </div>

          {/* 인증번호 입력 */}
          <div className={styles.inputWithButton}>
            <input
              id="code"
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="인증번호 입력"
              required
            />
            <button
              type="button"
              className={styles.btnInline}
              onClick={handleCodeConfirm}
            >
              확인
            </button>
          

          {/* 타이머 표시 */}
            {codeSent && timeLeft > 0 && (
              <p style={{ color: "red" }}>
                남은 시간: {Math.floor(timeLeft / 60)}:
                {String(timeLeft % 60).padStart(2, "0")}
              </p>
            )}
          </div>

          {/* 약관 동의 */}
          <div className={styles.termsGroup}>
            <label>
              <input
                type="checkbox"
                checked={agreeService}
                onChange={(e) => setAgreeService(e.target.checked)}
              />
              이용 약관 동의(필수) |
              <span onClick={() => setModalTerm("service")}>약관 보기</span>
            </label>
            <label>
              <input
                type="checkbox"
                checked={agreeLocation}
                onChange={(e) => setAgreeLocation(e.target.checked)}
              />
              위치 기반 서비스 이용 동의(필수) |
              <span onClick={() => setModalTerm("location")}>약관 보기</span>
            </label>
          </div>

          {/* 회원가입 버튼 */}
          <div className={styles.formButtons}>
            <button type="submit" className={styles.buttonPrimary}>
              회원가입
            </button>
          </div>
        </form>
      </main>

      {/* 약관 모달 */}
      {modalTerm && (
        <div className={styles.modalOverlay} onClick={() => setModalTerm(null)}>
          <div
            className={styles.modalContent}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className={styles.closeButton}
              onClick={() => setModalTerm(null)}
            >
              ×
            </button>
            <h3 className={styles.modalTitle}>{termsData[modalTerm].title}</h3>
            <div
              className={styles.modalText}
              dangerouslySetInnerHTML={{
                __html: termsData[modalTerm].content,
              }}
            />
          </div>
        </div>
      )}
    </>
  );
}
