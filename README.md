# 이화여자대학교 AI 에이전트 개발 과정 - React 애플리케이션

이 프로젝트는 기존 Docsify 기반 문서 사이트를 React + TypeScript로 리팩터링한 LMS 스타일의 교육용 웹 애플리케이션입니다.

## 🚀 프로젝트 개요

- **기존**: Docsify 기반 정적 문서 사이트
- **현재**: React + TypeScript 기반 인터랙티브 교육 플랫폼
- **목적**: 더 나은 UX와 확장성을 제공하는 LMS 스타일 웹사이트

## 🛠 기술 스택

### Frontend
- **React 18** - UI 라이브러리
- **TypeScript** - 타입 안전성
- **Vite** - 빌드 도구 및 개발 서버
- **React Router v6** - 클라이언트 사이드 라우팅

### 스타일링 & UI
- **Tailwind CSS v4** - 유틸리티 퍼스트 CSS 프레임워크
- **Framer Motion** - 애니메이션 라이브러리
- **Lucide React** - 아이콘 라이브러리

### 마크다운 & 콘텐츠
- **React Markdown** - 마크다운 렌더링
- **Remark GFM** - GitHub Flavored Markdown 지원

### 상태 관리
- **Zustand** - 경량 상태 관리 라이브러리

## 📁 프로젝트 구조

```
ewha-react/
├── public/                    # 정적 파일들
│   ├── day1/                 # Day 1 마크다운 파일들
│   ├── day2/                 # Day 2 마크다운 파일들
│   ├── day3/                 # Day 3 마크다운 파일들
│   └── lecture_plan.md       # 강의 계획표
├── src/
│   ├── components/           # 재사용 가능한 컴포넌트들
│   │   ├── Layout/          # 레이아웃 컴포넌트
│   │   ├── Sidebar/         # 사이드바 관련 컴포넌트들
│   │   └── MarkdownRenderer/ # 마크다운 렌더링 컴포넌트
│   ├── pages/               # 페이지 컴포넌트들
│   │   ├── HomePage.tsx     # 홈페이지
│   │   └── SessionPage.tsx  # 세션 페이지
│   ├── store/               # 상태 관리
│   │   └── navigationStore.ts
│   ├── data/                # 정적 데이터
│   │   └── sidebarData.ts   # 사이드바 메뉴 구조
│   ├── types/               # TypeScript 타입 정의
│   │   └── index.ts
│   └── App.tsx              # 메인 앱 컴포넌트
├── vite.config.ts           # Vite 설정
└── tailwind.config.js       # Tailwind CSS 설정
```

## ✨ 주요 기능

### 1. 인터랙티브 사이드바
- **애니메이션 접기/펼치기**: Framer Motion을 활용한 부드러운 애니메이션
- **진행 상태 표시**: 읽은/안읽은 표시 기능
- **현재 페이지 하이라이팅**: 활성 페이지 시각적 표시
- **반응형 디자인**: 모바일/태블릿/데스크톱 대응

### 2. 마크다운 렌더링
- **실시간 로딩**: public 폴더의 .md 파일을 동적으로 로드
- **GitHub Flavored Markdown**: 테이블, 체크박스 등 지원
- **커스텀 스타일링**: 교육용 콘텐츠에 최적화된 스타일

### 3. 라우팅 시스템
- **RESTful URL**: `/day1/01_onboarding` 형태
- **GitHub Pages 지원**: base path 설정으로 배포 최적화
- **404 페이지**: 존재하지 않는 페이지 처리

### 4. 상태 관리
- **진행 상태 저장**: 로컬 스토리지를 통한 상태 유지
- **사이드바 상태**: 열림/닫힘 상태 기억
- **확장 상태**: 각 섹션의 접힘 상태 유지

## 🚀 설치 및 실행

### 개발 환경 요구사항
- Node.js 20.19.0+ 또는 22.12.0+
- npm 또는 yarn

### 설치
```bash
cd ewha-react
npm install
```

### 개발 서버 실행
```bash
npm run dev
```
- 로컬 서버: http://localhost:5173/ (또는 다른 포트)

### 프로덕션 빌드
```bash
npm run build
```

### 빌드 미리보기
```bash
npm run preview
```

## 🔧 성능 최적화

### 1. 코드 분할 (Code Splitting)
- **페이지별 Lazy Loading**: React.lazy()를 활용한 동적 import
- **라이브러리별 청크 분리**: Vite rollupOptions로 manual chunks 설정

### 2. 번들 최적화 결과
```
dist/assets/store-DXNT9TQM.js           0.64 kB │ gzip:   0.40 kB
dist/assets/HomePage-BdeQZazr.js        0.79 kB │ gzip:   0.52 kB
dist/assets/SessionPage-BPa3JDkI.js     1.53 kB │ gzip:   0.71 kB
dist/assets/icons-icTmSgHZ.js           5.49 kB │ gzip:   1.51 kB
dist/assets/react-vendor-c5ypKtDW.js   11.95 kB │ gzip:   4.24 kB
dist/assets/router-CeQoIQrs.js         31.66 kB │ gzip:  11.74 kB
dist/assets/animation-BzvPHGpW.js     114.91 kB │ gzip:  37.92 kB
dist/assets/markdown-BGr0mr8O.js      157.33 kB │ gzip:  47.56 kB
```

### 3. 최적화 기법
- **Manual Chunks**: 라이브러리별 청크 분리
- **Tree Shaking**: 사용하지 않는 코드 제거
- **Gzip 압축**: 전송 크기 대폭 감소

## 🔧 개발 가이드

### 새로운 페이지 추가
1. `src/pages/` 디렉토리에 새 컴포넌트 생성
2. `src/App.tsx`에 라우트 추가
3. `src/data/sidebarData.ts`에 메뉴 항목 추가

### 새로운 마크다운 콘텐츠 추가
1. `public/dayN/` 디렉토리에 .md 파일 추가
2. `src/data/sidebarData.ts`에 메뉴 항목 추가
3. 파일명은 URL path와 일치해야 함

### 스타일 커스터마이징
- `src/index.css`에서 마크다운 콘텐츠 스타일 수정
- Tailwind CSS 클래스 활용
- Framer Motion으로 애니메이션 효과 추가

## 🌐 배포 설정

### GitHub Pages 배포 준비
- **Base Path**: `/ewha-lecture-test/`로 설정됨
- **Router Basename**: React Router에 basename 설정
- **빌드 출력**: `dist/` 디렉토리

### 배포 프로세스
```bash
npm run build  # 프로덕션 빌드 생성
# dist/ 폴더를 GitHub Pages에 배포
```

## 🛠 트러블슈팅

### 자주 발생하는 문제들

#### 1. Tailwind CSS v4 관련
- **문제**: PostCSS 플러그인 오류
- **해결**: `@tailwindcss/vite` 플러그인 사용 및 `@import "tailwindcss"` 방식 적용

#### 2. SidebarItem import 오류
- **문제**: 순환 참조로 인한 import 오류
- **해결**: export const 방식으로 변경

#### 3. 마크다운 파일 로딩 실패
- **문제**: public 폴더 경로 문제
- **해결**: 절대 경로 사용 및 base path 고려

## 📝 마이그레이션 히스토리

### Docsify → React 마이그레이션
1. **기존 구조 분석**: 22개 마크다운 파일, 3일차 교육 과정
2. **React 프로젝트 초기화**: Vite + TypeScript 템플릿 사용
3. **마크다운 파일 이관**: public 폴더로 복사하여 동적 로딩
4. **사이드바 재구현**: 접기/펼치기 애니메이션 기능 추가
5. **라우팅 시스템**: React Router로 SPA 구현
6. **성능 최적화**: 코드 분할 및 번들 최적화

### 주요 개선 사항
- ❌ **Docsify 한계**: 사이드바 애니메이션 미동작, 커스터마이징 제한
- ✅ **React 장점**: 부드러운 애니메이션, 진행 상태 관리, 확장성

## 📞 지원

문제가 발생하거나 개선 사항이 있으시면 이슈를 등록해 주세요.

---

*이 프로젝트는 교육용 목적으로 제작되었습니다.*