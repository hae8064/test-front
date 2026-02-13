# Biocom Frontend (모노레포)

React + TypeScript + Vite 기반 예약 관리 프론트엔드 모노레포입니다.

## 구조

```
biocom-front/
├── apps/
│   ├── admin/      # 관리자 앱 (포트 3001)
│   └── booking/    # 예약 앱 (포트 3000)
├── packages/
│   ├── api/        # axios instance + API 함수
│   ├── ui/         # 공통 UI 컴포넌트 (Button, Input, Modal, Table, Calendar, Toast)
│   └── utils/      # 유틸 (formatKST 등)
```

## 기술 스택

- React 19 + TypeScript + Vite
- React Router, TanStack Query
- Zustand (토큰/유저 상태)
- Tailwind CSS v4
- react-hook-form + zod
- axios

## 실행

```bash
pnpm install
pnpm dev:admin    # http://localhost:3001
pnpm dev:booking  # http://localhost:3000
pnpm dev          # 두 앱 동시 실행
```

## 환경 변수

각 앱 루트에 `.env` 생성 후:

```
VITE_API_BASE_URL=http://localhost:4000
```

## Admin 앱 라우트

- `/login` - 로그인
- `/slots` - 슬롯 관리 (CRUD)
- `/email-links` - 예약 링크 생성
- `/bookings` - 슬롯별 예약자 조회
- `/sessions/:bookingId` - 상담 기록

## Booking 앱 라우트

- `/public/reserve?token=xxx` - 예약 페이지
- `/public/complete?bookingId=xxx` - 예약 완료 화면

## API 엔드포인트 (백엔드 연동 가정)

| 구분 | 메서드 | 경로 |
|------|--------|------|
| Admin Auth | POST | /admin/auth/login |
| Admin Slots | GET/POST/PATCH/DELETE | /admin/slots |
| Admin Bookings | GET | /admin/slots/:slotId/bookings |
| Admin Email Links | POST | /admin/email-links |
| Admin Sessions | GET/PUT | /admin/sessions/:bookingId |
| Public Reserve | GET | /public/reserve?token=&date= |
| Public Reserve | POST | /public/reserve?token= |
