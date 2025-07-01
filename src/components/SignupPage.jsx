import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { DuplCheck, registerUser, formatPhoneNumber } from "../api/member";
import { sendVerificationCode, verifyCode } from "../api/auth";
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
  const navigate = useNavigate();
  const timerRef = useRef(null);

  // 회원정보
  const [userId, setUserId] = useState("");
  const [ssnFront, setSsnFront] = useState("");
  const [ssnBack, setSsnBack] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");

  // 약관 동의
  const [agreeService, setAgreeService] = useState(false);
  const [agreeLocation, setAgreeLocation] = useState(false);

  // 모달
  const [modalTerm, setModalTerm] = useState(null);

  // 아이디 중복확인 상태: null=미확인, true=사용가능, false=중복
  const [isUserIdAvailable, setIsUserIdAvailable] = useState(null);

  // 휴대폰 인증
  const [codeSent, setCodeSent] = useState(false);
  const [verified, setVerified] = useState(false);
  const [serverCode, setServerCode] = useState("");
  const [timeLeft, setTimeLeft] = useState(0);

  // 아이디 입력 변경
  const handleUserIdChange = (e) => {
    setUserId(e.target.value);
    setIsUserIdAvailable(null);
  };

  // 중복확인
  const handleCheckDup = async () => {
    if (!userId) {
      alert("아이디를 입력해주세요.");
      return;
    }
    try {
      const response = await DuplCheck(userId);
      // 200 응답: 사용 가능한 아이디
      alert("✅ 사용 가능한 아이디입니다.");
      setIsUserIdAvailable(true);
    } catch (err) {
      // 409 응답: 이미 사용 중인 아이디
      if (err.response && err.response.status === 409) {
        alert("❌ 이미 사용 중인 아이디입니다.");
        setIsUserIdAvailable(false);
      } else {
        // 기타 에러
        console.error("중복 확인 오류:", err.response || err);
        alert("중복 확인 중 오류가 발생했습니다.");
        setIsUserIdAvailable(false);
      }
    }
  };

  // 인증번호 발송
  const handleVerifyCode = async () => {
    if (!phone) {
      alert("휴대폰 번호를 입력해주세요.");
      return;
    }
    try {
      const response = await sendVerificationCode(phone);
      alert("인증번호가 발송되었습니다.");
      setServerCode(response.code);
      setCodeSent(true);
      setTimeLeft(180);
      startTimer();
    } catch (err) {
      console.error(err);
      alert("인증번호 발송 실패");
    }
  };

  // 타이머 시작
  const startTimer = () => {
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          setCodeSent(false);
          alert("⏰ 인증 시간이 만료되었습니다. 다시 시도해주세요.");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // 인증번호 확인
  const handleCodeConfirm = async () => {
    try {
      const response = await verifyCode(phone, code); // 서버에 검증 요청
      alert("✅ 인증 성공");
      setVerified(true);
      clearInterval(timerRef.current);
    } catch (err) {
      alert("❌ 인증 실패 또는 만료되었습니다.");
      setVerified(false);
    }
  };

  // 폼 제출
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isUserIdAvailable !== true) {
      alert("아이디 중복 확인을 완료해주세요.");
      return;
    }
    if (password !== confirm) {
      alert("비밀번호가 일치하지 않습니다.");
      return;
    }
    if (!verified) {
      alert("휴대폰 인증을 완료해주세요.");
      return;
    }
    if (!agreeService || !agreeLocation) {
      alert("약관에 모두 동의해주세요.");
      return;
    }

    try {
      await registerUser({
        userId,
        ssn1: ssnFront,
        ssn2: ssnBack,
        name,
        passwordHash: password,
        phone,
        agreeService,
        agreeLocation,
      });
      alert("회원가입이 완료되었습니다.");
      localStorage.removeItem("helpModalHide");
      navigate("/");
    } catch (err) {
      console.error(err);
      alert("회원가입 실패: " + (err.response?.data?.message || err.message));
    }
  };

  // cleanup
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  return (
    <div className={styles.pageWrapper}>
      <header className={styles.headerBar}>
        <span className={styles.headerLogo}>
          <img
            src="/images/HATWlogo.png"
            alt="HATW 로고"
            className={styles.headerLogoImg}
            onClick={() => navigate("/")}
          />
        </span>
        <span className={styles.headerTitle}>회원가입</span>
        <span className={styles.headerRight}></span>
      </header>

      <main className={styles.mainContent}>
        <form onSubmit={handleSubmit} className={styles.signupForm}>
          {/* 아이디 */}
          <div className={styles.marginBottom15}>
            <label htmlFor="userId">아이디</label>
            <div className={styles.inputWithButton}>
              <input
                id="userId"
                type="text"
                value={userId}
                onChange={handleUserIdChange}
                placeholder="아이디를 입력하세요"
                required
              />
              <button
                type="button"
                onClick={handleCheckDup}
                className={styles.btnInline}
              >
                중복확인
              </button>
            </div>
          </div>

          {/* 주민등록번호 */}
          <div className={styles.marginBottom15}>
            <label>주민등록번호</label>
            <div className={styles.ssnGroup}>
              <input
                type="text"
                value={ssnFront}
                onChange={(e) => setSsnFront(e.target.value.slice(0, 6))}
                placeholder="앞 6자리"
                maxLength={6}
                required
              />
              <span>-</span>
              <input
                type="text"
                value={"******" + (ssnBack ? "*" : "")}
                onChange={(e) => {
                  const v = e.target.value.replace(/[^0-9]/g, "").slice(-1);
                  setSsnBack(v);
                }}
                placeholder="뒤 1자리"
                maxLength={7}
                inputMode="numeric"
                className={styles.letterSpacing2}
                required
              />
            </div>
          </div>

          {/* 이름 */}
          <div className={styles.marginBottom15}>
            <label htmlFor="name">이름</label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="이름을 입력하세요"
              required
            />
          </div>

          {/* 비밀번호 */}
          <div className={styles.marginBottom15}>
            <label htmlFor="password">비밀번호</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="비밀번호를 입력하세요"
              required
            />
          </div>

          {/* 비밀번호 확인 */}
          <div className={styles.marginBottom15}>
            <label htmlFor="confirm">비밀번호 확인</label>
            <input
              id="confirm"
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="비밀번호를 다시 입력하세요"
              required
            />
            {confirm && password !== confirm && (
              <span className={styles.errorMsg}>
                비밀번호가 일치하지 않습니다.
              </span>
            )}
          </div>

          {/* 휴대폰 인증 */}
          <div className={styles.marginBottom15}>
            <label>휴대폰 인증</label>
            <div className={styles.inputWithButton}>
              <input
                type="tel"
                value={formatPhoneNumber(phone)}
                onChange={(e) =>
                  setPhone(e.target.value.replace(/[^0-9]/g, "").slice(0, 11))
                }
                placeholder="휴대폰 번호"
                required
              />
              <button
                type="button"
                onClick={handleVerifyCode}
                className={styles.btnInline}
                disabled={codeSent}
              >
                인증번호 발송
              </button>
            </div>
            {codeSent && (
              <div
                className={`${styles.inputWithButton} ${styles.inputWithButtonMargin}`}
              >
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="인증번호 6자리"
                  maxLength={6}
                />
                <button
                  type="button"
                  onClick={handleCodeConfirm}
                  className={styles.btnInline}
                >
                  확인
                </button>
                <span className={styles.timerSpan}>
                  {Math.floor(timeLeft / 60)}:
                  {(timeLeft % 60).toString().padStart(2, "0")}
                </span>
              </div>
            )}
            {verified && (
              <span className={styles.successMsg}>
                ✅ 인증이 완료되었습니다.
              </span>
            )}
          </div>

          {/* 약관 동의 */}
          <div className={styles.marginBottom15}>
            <label>약관 동의</label>
            <div className={styles.termsGroup}>
              <label>
                <input
                  type="checkbox"
                  checked={agreeService}
                  onChange={(e) => setAgreeService(e.target.checked)}
                />
                <span onClick={() => setModalTerm("service")}>
                  {termsData.service.title} (필수)
                </span>
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={agreeLocation}
                  onChange={(e) => setAgreeLocation(e.target.checked)}
                />
                <span onClick={() => setModalTerm("location")}>
                  {termsData.location.title} (필수)
                </span>
              </label>
            </div>
          </div>

          <button type="submit" className={styles.buttonPrimary}>
            회원가입
          </button>
        </form>
      </main>

      {/* 약관 모달 */}
      {modalTerm && (
        <div className={styles.modalOverlay} onClick={() => setModalTerm(null)}>
          <div
            className={`${styles.modalContent} ${styles.modalContentWide}`}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className={styles.modalClose}
              onClick={() => setModalTerm(null)}
            >
              ×
            </button>
            <h2 className={styles.modalTitleCenter}>
              {termsData[modalTerm].title}
            </h2>
            <div
              className={styles.termContent}
              dangerouslySetInnerHTML={{ __html: termsData[modalTerm].content }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
