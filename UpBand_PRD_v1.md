# UpBand — Product Requirements Document
### Writing & Speaking AI Feedback Platform
**Version:** 1.0 | **Date:** 2026-03-27 | **Owner:** 밀리 선생님

---

## 1. 배경 및 문제 정의

한국 IELTS 학습자들은 Writing과 Speaking에서 반복적으로 낮은 점수를 받는다. 주요 원인은 두 가지다.

1. **즉각적인 피드백 부재** — 에세이를 쓴 뒤 선생님의 교정을 받기까지 며칠이 걸리고, 스피킹은 연습 자체를 혼자 하기 어렵다.
2. **피드백의 질 불균형** — AI 도구(ChatGPT 등)는 문법 교정은 되지만 IELTS 채점 기준(TA/TR/CC/LR/GRA)에 맞는 Band 분석은 제공하지 않는다.

BandUp은 이 두 문제를 해결하는 **Writing + Speaking 특화 AI 피드백 플랫폼**이다.

---

## 2. 목표 (Goals)

| 목표 | 측정 기준 | 기간 |
|------|----------|------|
| 사용자 획득 | 웨이팅리스트 200명 | MVP 전 |
| Writing 피드백 사용 | 주간 에세이 제출 50건 | 론칭 후 1개월 |
| 유료 전환 | 무료→유료 전환율 10% | 론칭 후 3개월 |
| 재방문율 | 주 2회 이상 재방문 30% | 론칭 후 2개월 |

---

## 3. 타겟 사용자

**Primary:** Band 5~6 한국인 IELTS 학습자 (독학 또는 학원 병행)
- 에세이를 써도 뭐가 틀렸는지 모름
- 스피킹 연습 상대가 없음
- 채점 기준을 이해하고 싶지만 영어 해설이 어려움

**Secondary:** IELTS 강사 (Teacher B2B)
- 학생 에세이 일괄 피드백 시간 절감
- 반 전체 오류 패턴 파악

---

## 4. 핵심 기능 (Feature Scope)

### Phase 1 — MVP (Writing 우선)

#### 4.1 Writing AI Feedback
- 에세이 텍스트 입력 (Task 1 / Task 2 선택)
- 4개 채점 기준별 Band 점수 출력: TA or TR / CC / LR / GRA
- 오류 인라인 하이라이트 (문법, 어휘, 구조)
- Band 업그레이드 표현 제안 (Band 5 표현 → Band 7 대안)
- 피드백 언어: 한국어 메인

#### 4.2 Speaking AI Feedback
- 답변 텍스트 직접 입력 또는 음성 녹음 → STT 변환
- Part 1 / 2 / 3 구분 입력
- 4개 채점 기준별 점수: Fluency / Lexical / Grammar / Pronunciation (텍스트 기반은 3개)
- 모범 답안 예시 제공
- 한 줄 개선 포인트 (짧고 명확하게)

#### 4.3 결과 저장 & 히스토리
- 제출 기록 저장 (로그인 필요)
- 점수 추이 그래프 (최근 5회)
- 이전 피드백 재열람

---

### Phase 1 — Teacher Dashboard (B2B)

- 학생 계정 그룹 생성
- 반 전체 에세이 일괄 업로드 → AI 초안 피드백 자동 생성
- 강사 피드백 추가 입력 후 학생에게 발송
- 오류 패턴 통계 (반 평균 vs 개인)

---

## 5. 비기능 요구사항

| 항목 | 요건 |
|------|------|
| 응답 속도 | Writing 피드백 30초 이내 |
| 플랫폼 | 웹 (모바일 반응형 우선) |
| 언어 | 한국어 UI + 영어 콘텐츠 |
| 인증 | 이메일 회원가입 / Google SSO |
| 데이터 | 학생 에세이 저장 (개인정보 처리방침 필요) |

---

## 6. Out of Scope (이번 버전에서 제외)

- Reading / Listening 모듈 (추후 Phase 3)
- 실시간 AI 튜터 채팅
- 네이티브 앱 (iOS/Android)
- 결제 시스템 (웨이팅리스트 단계에서는 불필요)
- Cambridge 공식 문제 사용 (저작권 이슈 → AI 생성 문제로 대체)

---

## 7. 경쟁 분석 & 차별점

| | UpBand | Jumpinto.com | ChatGPT |
|---|---|---|---|
| IELTS Band 기준 분석 | ✅ | ✅ (Reading 중심) | ❌ |
| Speaking 피드백 | ✅ | ❌ | 부분적 |
| 한국어 피드백 | ✅ | ❌ | 가능하나 IELTS 특화 아님 |
| 강사 대시보드 | ✅ (Phase 2) | ❌ | ❌ |
| 오류 인라인 하이라이트 | ✅ | ❌ | ❌ |

**핵심 차별점:** "IELTS 채점관처럼 분석하고, 한국인 강사처럼 설명한다"

---

## 8. 기술 스택 (안)

- **Frontend:** React (웹), Tailwind CSS
- **AI 피드백:** Claude API (Anthropic) — IELTS 채점 기준 프롬프트 특화
- **STT (Speaking):** Whisper API
- **배포:** Tiiny.host (랜딩/웨이팅리스트) → Vercel (MVP)
- **DB:** Supabase (인증 + 데이터 저장)

---

## 9. 마일스톤

| 단계 | 내용 | 목표 시점 |
|------|------|----------|
| M0 | 랜딩 페이지 + 웨이팅리스트 배포 | 완료 (기완성) |
| M1 | Writing 피드백 프로토타입 (Claude API 연동) | 4주 |
| M2 | Speaking 피드백 추가 + 로그인/히스토리 | 8주 |
| M3 | Teacher Dashboard Beta | 10주 |
| M4 | 크레딧 결제 시스템 도입 | 12주 |

---

## 10. 결정 사항 (Decisions Made)

- [x] **유료 모델: 크레딧 방식** — 월정액 아닌 크레딧 구매 방식으로 확정
- [x] **Speaking Pronunciation 점수:** 텍스트 기반으로 우선 론칭 후 실사용 데이터 보고 개선
- [x] **Teacher Dashboard: Phase 1에 포함** — 초기 유료화 전략으로 앞당김
- [x] **브랜드명: "UpBand"로 확정**

---

*이 문서는 살아있는 문서입니다. 결정사항이 생길 때마다 업데이트하세요.*
