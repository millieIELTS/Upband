# UpBand 프로젝트 개발 기록

> IELTS Writing & Speaking AI 피드백 플랫폼
> 배포 URL: https://upband.vercel.app
> 최종 업데이트: 2026-04-10

---

## 기술 스택

| 분류 | 기술 |
|------|------|
| 프론트엔드 | React 19 + Vite + Tailwind CSS v4 |
| 백엔드/DB | Supabase (Auth, Database, Storage) |
| AI 피드백 | Claude API (Anthropic) |
| 음성 변환 | OpenAI Whisper API |
| TTS | Microsoft Edge Neural TTS (msedge-tts) |
| 배포 | Vercel (GitHub push 시 자동 배포) |
| 아이콘 | lucide-react |
| 차트 | recharts |

---

## 프로젝트 구조

```
src/
├── components/
│   ├── layout/         Layout.jsx, Navbar.jsx
│   ├── speaking/       FeedbackResult.jsx, QuestionProgress.jsx
│   └── writing/        EssayWithHighlights.jsx, FeedbackDisplay.jsx, Task1Chart.jsx
├── data/
│   └── speakingQuestions.js    Part 1/2/3 각 50개 토픽
├── hooks/
│   ├── useAuth.jsx     인증 + 프로필 관리 (Context API)
│   ├── useRecorder.js  녹음 기능
│   └── useTimer.js     카운트다운 타이머
├── lib/
│   ├── claude.js       Claude API 호출
│   ├── stt.js          Whisper 음성→텍스트
│   ├── submissions.js  DB 저장/조회
│   ├── supabase.js     Supabase 클라이언트
│   └── tts.js          Edge TTS (5개 음성 랜덤)
├── pages/
│   ├── Home.jsx                 메인 페이지 (4개 카드)
│   ├── Writing.jsx              Writing Mock Test 선택
│   ├── WritingTask.jsx          Writing Mock Test (AI 피드백)
│   ├── WritingHomeworkSelect.jsx Writing Task 선택
│   ├── WritingHomework.jsx      Writing 제출 (강사 피드백)
│   ├── Speaking.jsx             Speaking Part 선택
│   ├── SpeakingPart1.jsx        Part 1 연습
│   ├── SpeakingPart1Select.jsx  Part 1 토픽 선택 (완료 표시)
│   ├── SpeakingPart2.jsx        Part 2 연습 (준비+스피치)
│   ├── SpeakingPart2Select.jsx  Part 2 토픽 선택 (완료 표시)
│   ├── SpeakingPart3.jsx        Part 3 연습
│   ├── SpeakingPart3Select.jsx  Part 3 토픽 선택 (완료 표시)
│   ├── History.jsx              달력 히트맵 + 밴드 추이 그래프
│   ├── Dashboard.jsx            관리자 대시보드
│   ├── SubmissionDetail.jsx     제출물 관리 + 피드백
│   ├── AdminEbooks.jsx          전자책 관리 (인라인 수정)
│   ├── Store.jsx                전자책 스토어
│   ├── Login.jsx                로그인 (Google)
│   ├── MyPage.jsx               마이페이지 + 카카오톡 문의
│   └── Settings.jsx             설정 (닉네임 변경)
├── App.jsx              라우팅
├── main.jsx             엔트리포인트
└── index.css            글로벌 스타일

api/
├── tts.js               Edge TTS 서버리스 함수
├── feedback.js          Claude API 서버리스 함수
└── package.json         API 전용 의존성 (msedge-tts)
```

---

## 주요 기능 목록

### Writing
- **Writing Mock Test**: AI 피드백 (TA/CC/LR/GRA Band 점수 + 상세 피드백)
- **Writing 제출**: 강사가 직접 확인하는 피드백
  - Task 1: Cambridge IELTS 문제 텍스트 입력 + 이미지 드래그앤드롭 업로드 (2MB 제한)
  - Task 2: 문제 텍스트 입력
- **크레딧 차감**: Mock Test 및 Writing 제출 시 각각 1 크레딧 차감
- **붙여넣기 금지**: Mock Test에서 Ctrl+V 차단 (시험 환경 시뮬레이션)
- 자동완성/자동수정/맞춤법검사 비활성화

### Speaking
- **Part 1**: 50개 토픽, 토픽당 6개 질문, 질문을 듣고 녹음
- **Part 2**: 50개 토픽, 토픽 카드 → 1분 준비 → 5초 카운트다운 → 2분 스피치
- **Part 3**: 50개 토픽 (Part 2와 테마 매칭, "Part 2-N 연계" 표시), 토픽당 질문
- **AI 피드백**: Fluency/Lexical/Grammar 기준 Band 점수 (Whisper 변환 → Claude 분석)
- **완료 표시**: 피드백 받은 토픽은 초록색 배경 + 체크 아이콘 (localStorage)
- **Edge TTS**: 5개 음성 랜덤 배정 (Sonia-UK, Thomas-UK, William-AU, Guy-US, Natasha-AU)
- **세션 음성 유지**: 같은 토픽 내에서는 동일 음성 유지
- 녹음 파일 1주 보관

### 관리자 기능
- **대시보드**: 학생 목록, 크레딧 관리, 역할 변경, 제출 현황 통계
- **제출물 관리**: Writing/Speaking 탭, 미검토 카운트 배지, 검토 토글
- **선생님 피드백**: Band 점수 입력 + 텍스트 피드백 → 학생에게 표시
- **전자책 관리**: 파일 직접 업로드, 인라인 수정 모드, 공개/비공개 토글

### 학생 기능
- **히스토리**: 달력 히트맵 (활동량 시각화) + 밴드 추이 그래프 + 상세 기록
- **마이페이지**: 프로필, 크레딧 잔여량, 카카오톡 문의하기 링크
- **닉네임 변경**: Settings에서 자유롭게 변경
- **전자책 스토어**: 공개된 전자책 열람/다운로드

### 인증
- Google OAuth (Supabase Auth, implicit flow)
- 인앱 브라우저 감지 → 외부 브라우저 안내 (Galaxy 403 해결)
- 첫 로그인 시 자동 계정 생성 (student, 크레딧 3)

---

## DB 구조

### profiles
| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | uuid (PK) | auth.users 연결 |
| email | text | 이메일 |
| display_name | text | 닉네임 |
| role | text | student / teacher / admin |
| credits | integer | 남은 크레딧 |

### writing_submissions
| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | uuid (PK) | |
| user_id | uuid (FK) | profiles 연결 |
| task_type | text | task1 / task2 |
| essay | text | 에세이 본문 |
| question | text | 문제 텍스트 |
| question_image_url | text | 문제 이미지 URL (Task 1) |
| is_homework | boolean | 숙제 여부 |
| word_count | integer | 단어 수 |
| overall_band | numeric | AI 점수 |
| score_ta, score_tr, score_cc, score_lr, score_gra | numeric | 세부 점수 |
| feedback_json | jsonb | AI 피드백 전체 |
| teacher_band | numeric | 선생님 점수 |
| teacher_feedback | text | 선생님 피드백 |
| reviewed | boolean | 검토 완료 여부 |
| created_at | timestamp | |

### speaking_submissions
| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | uuid (PK) | |
| user_id | uuid (FK) | |
| part | text | part1 / part2 / part3 |
| question | text | 질문 |
| transcript | text | 음성 변환 텍스트 |
| audio_url | text | 녹음 URL |
| audio_expires_at | timestamp | 녹음 만료일 (1주) |
| overall_band, score_fluency, score_lexical, score_grammar | numeric | 점수 |
| feedback_json | jsonb | AI 피드백 |
| model_answer | text | 모범 답안 |
| reviewed | boolean | 검토 완료 |
| created_at | timestamp | |

### ebooks
| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | uuid (PK) | |
| title | text | 전자책 제목 |
| description | text | 설명 |
| price | integer | 가격 (0=무료) |
| file_url | text | PDF URL (Storage) |
| cover_url | text | 커버 이미지 URL (Storage) |
| is_published | boolean | 공개 여부 |
| created_at | timestamp | |

---

## Supabase RPC 함수 (SECURITY DEFINER)

| 함수명 | 용도 |
|--------|------|
| `get_my_profile()` | 현재 로그인한 사용자 프로필 조회 |
| `get_all_profiles()` | 모든 프로필 조회 (관리자용) |
| `get_all_writing_submissions()` | 모든 Writing 제출물 (관리자용) |
| `get_all_speaking_submissions()` | 모든 Speaking 제출물 (관리자용) |
| `admin_update_credits()` | 크레딧 변경 (관리자용) |
| `admin_update_role()` | 역할 변경 (관리자용) |
| `admin_mark_reviewed()` | 검토 완료 표시 (관리자용) |
| `admin_save_feedback()` | 선생님 피드백 저장 (관리자용) |
| `update_my_display_name()` | 닉네임 변경 (본인만) |
| `deduct_credit()` | 크레딧 1 차감 (GREATEST(credits-1, 0)) |
| `get_published_ebooks()` | 공개 전자책 목록 조회 |

---

## Supabase Storage

| 버킷 | 용도 | 정책 |
|------|------|------|
| ebooks | 전자책 커버 이미지 + PDF | 읽기: 공개 / 쓰기: 인증된 사용자 |
| homework-images | Writing Task 1 문제 이미지 | 읽기: 공개 / 쓰기: 인증된 사용자 |

---

## 라우팅

| 경로 | 페이지 |
|------|--------|
| `/` | Home (메인) |
| `/writing` | Writing Mock Test 선택 |
| `/writing/:taskType` | Writing Mock Test 연습 |
| `/writing/homework` | Writing Task 선택 |
| `/writing/homework/:taskType` | Writing 제출 |
| `/speaking` | Speaking Part 선택 |
| `/speaking/part1` | Part 1 토픽 선택 |
| `/speaking/part1/:topicId` | Part 1 연습 |
| `/speaking/part2` | Part 2 토픽 선택 |
| `/speaking/part2/:topicId` | Part 2 연습 |
| `/speaking/part3` | Part 3 토픽 선택 |
| `/speaking/part3/:topicId` | Part 3 연습 |
| `/history` | 제출 기록 (달력 히트맵) |
| `/dashboard` | 관리자 대시보드 |
| `/dashboard/submissions` | 제출물 관리 |
| `/dashboard/ebooks` | 전자책 관리 |
| `/store` | 전자책 스토어 |
| `/login` | 로그인 |
| `/mypage` | 마이페이지 |
| `/settings` | 설정 |

---

## 해결한 주요 이슈들

### RLS 재귀 문제
- **증상**: `profiles` 테이블 RLS 정책이 자기 자신을 참조하면서 무한 재귀
- **해결**: 모든 DB 접근을 `SECURITY DEFINER` RPC 함수로 교체

### 관리자 역할 소실
- **증상**: 로그인할 때마다 `upsert`가 role을 `student`로 덮어씀
- **해결**: `upsert` → `insert`로 변경 (기존 프로필 있으면 생성 건너뜀)

### 로그인 블로킹
- **증상**: `onAuthStateChange` 콜백 내 `await`가 후속 이벤트 차단
- **해결**: async 작업을 `setTimeout`으로 이벤트 루프 밖으로 분리

### Galaxy 403 (disallowed_useragent)
- **증상**: 삼성 인앱 브라우저에서 Google OAuth가 차단됨
- **해결**: User-Agent 감지 → "외부 브라우저로 열기" 안내 메시지

### Edge TTS Vercel 배포 실패
- **증상**: `Cannot find package 'msedge-tts'` (서버리스 함수에서 번들링 실패)
- **해결**: `api/package.json` 별도 생성하여 API 전용 의존성 분리

### Speaking 음성 변경 문제
- **증상**: 질문 전환 시 다른 음성으로 바뀜
- **해결**: `stopPlaying()` (음성 유지) vs `stopSpeaking()` (음성 리셋) 분리

### Band 평균 0 표시
- **증상**: 미채점 제출물의 `Number(null)` = 0이 평균에 포함
- **해결**: null 값 필터링, `teacher_band ?? overall_band` 우선순위

---

## 크레딧 시스템

- 신규 가입 시 **3 크레딧** 자동 부여
- **Writing Mock Test**: 제출 시 1 크레딧 차감
- **Writing 제출**: 제출 시 1 크레딧 차감
- **Speaking**: 크레딧 차감 미설정 (추후 설정 예정)
- `deduct_credit` RPC: `GREATEST(credits - 1, 0)` (0 이하 방지)
- 관리자가 대시보드에서 수동으로 크레딧 부여/차감 가능
- 향후 결제 시스템 연동 예정 (토스페이먼츠)

---

## 배포 정보

- **GitHub**: millieIELTS 계정
- **Vercel**: GitHub 연동, main 브랜치 push 시 자동 배포
- **환경변수**: Vercel에 VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, ANTHROPIC_API_KEY, OPENAI_API_KEY 설정
- **서버리스 함수**: `api/feedback.js` (Claude), `api/tts.js` (Edge TTS, maxDuration: 15s)
