# How About This Way (HATW) - 프론트엔드

장애인과 노약자를 위한 접근성 경로 안내 서비스의 프론트엔드 애플리케이션입니다.

## 📋 프로젝트 개요

HATW는 장애인과 노약자가 안전하고 편리하게 이동할 수 있도록 도와주는 웹 애플리케이션입니다. T-Map API를 활용하여 접근성을 고려한 경로 안내와 시설 정보를 제공합니다.

## ✨ 주요 기능

### 🗺️ 지도 및 경로 안내

- **T-Map 기반 지도 서비스**: 실시간 지도 표시 및 상호작용
- **접근성 경로 안내**: 장애인과 노약자를 위한 최적화된 경로 제공
- **대중교통 연동**: 버스, 지하철 등 대중교통 정보 통합
- **POI 검색**: 장소 자동완성 검색 기능

### 📍 시설 정보 및 제보

- **접근성 시설 마커**: 엘리베이터, 에스컬레이터, 화장실 등 표시
- **사용자 제보 시스템**: 접근성 문제점 및 개선사항 제보
- **즐겨찾기 기능**: 자주 이용하는 경로 및 장소 저장

### 👤 사용자 관리

- **소셜 로그인**: 카카오, 구글 로그인 지원
- **개인정보 관리**: 사용자 프로필 및 설정 관리
- **문의/불편 접수**: 사용자 피드백 시스템

### 🔧 관리자 기능

- **사용자 관리**: 회원 정보 조회 및 관리
- **제보 관리**: 사용자 제보 내용 검토 및 처리
- **신고 처리**: 부적절한 사용자 신고 및 제재

## 🛠️ 기술 스택

### Frontend

- **React 19.1.0**: 최신 React 버전 사용
- **React Router DOM 7.6.2**: 클라이언트 사이드 라우팅
- **Vite 6.3.5**: 빠른 개발 서버 및 빌드 도구
- **CSS Modules**: 스타일 컴포넌트화

### API & 통신

- **Axios 1.10.0**: HTTP 클라이언트
- **T-Map API**: 지도 및 경로 안내 서비스
- **RESTful API**: 백엔드와의 통신

### 개발 도구

- **ESLint**: 코드 품질 관리
- **TypeScript**: 타입 안정성 (개발 의존성)

## 📁 프로젝트 구조

```
src/
├── api/                    # API 통신 모듈
│   ├── auth.js            # 인증 관련 API
│   ├── Map.js             # 지도 및 경로 API
│   ├── member.js          # 사용자 관리 API
│   ├── report.js          # 제보 관련 API
│   └── ...
├── components/            # React 컴포넌트
│   ├── MainPage.jsx       # 메인 페이지
│   ├── MapPage.jsx        # 지도 페이지
│   ├── LoginPage.jsx      # 로그인 페이지
│   ├── ReportModal.jsx    # 제보 모달
│   └── ...
├── css/                   # CSS 모듈 파일들
│   ├── MainPage.module.css
│   ├── MapPage.module.css
│   └── ...
└── App.jsx               # 메인 앱 컴포넌트
```

## 🚀 시작하기

### 필수 요구사항

- Node.js 18.0.0 이상
- npm 또는 yarn

### 설치 및 실행

1. **저장소 클론**

   ```bash
   git clone https://github.com/pigg4949/HowAboutThisWay_front.git
   cd HowAboutThisWay_front
   ```

2. **의존성 설치**

   ```bash
   npm install
   ```

3. **개발 서버 실행**

   ```bash
   npm run dev
   ```

4. **브라우저에서 확인**
   ```
   http://localhost:5173
   ```

### 빌드

```bash
npm run build
```

### 린트 검사

```bash
npm run lint
```

## 🔑 환경 설정

### T-Map API 설정

T-Map API를 사용하기 위해 다음 설정이 필요합니다:

1. [T-Map 개발자 센터](https://developers.sktelecom.com/)에서 API 키 발급
2. 환경 변수 또는 설정 파일에 API 키 추가

### 소셜 로그인 설정

- **카카오 로그인**: Kakao Developers에서 앱 등록 및 설정
- **구글 로그인**: Google Cloud Console에서 OAuth 2.0 설정

## 📱 주요 페이지

### 메인 페이지 (`/main`)

- 앱의 메인 허브
- 길찾기, 제보하기, 즐겨찾기, 내 정보로 이동

### 지도 페이지 (`/map`)

- T-Map 기반 지도 서비스
- 출발지/도착지 검색 및 경로 안내
- 접근성 시설 마커 표시

### 제보 페이지 (`/report`)

- 접근성 문제점 및 개선사항 제보
- 사진 첨부 및 상세 설명

### 마이페이지 (`/mypage`)

- 사용자 정보 관리
- 문의/불편 접수
- 즐겨찾기 관리

## 📞 문의

프로젝트에 대한 문의사항이 있으시면 이슈를 생성해 주세요.

## 이길어때 서비스 백엔드 repository 주소
"https://github.com/pigg4949/HowAboutThisWay_back"
---

**HATW** - 더 나은 접근성을 위한 길찾기 서비스 🚶‍♂️♿
