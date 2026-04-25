-- ═══════════════════════════════════════════════════════════════════
-- 💎 credit_packs 가격/크레딧/설명 업데이트 (기간제 무제한 모델 반영)
-- ═══════════════════════════════════════════════════════════════════
-- 변경 사항:
-- 1. starter 플랜 → 비활성화 (UI에서 제거됨)
-- 2. standard (실전): 29,900원 / 100크레딧 / 1주 무제한
-- 3. focus (집중):     49,000원 / 200크레딧 / 2주 무제한 + 강사 음성 피드백
-- 4. master (마스터):  99,000원 / 400크레딧 / 2주 무제한 + Zoom 10회

-- 1️⃣ starter 비활성화
UPDATE credit_packs
SET is_active = FALSE
WHERE id = 'starter';

-- 2️⃣ 실전 (1주 무제한)
UPDATE credit_packs
SET name = '실전',
    description = '시험 1주 전 · E-Book 자료실 무제한',
    price = 29900,
    credits = 100,
    sort_order = 1,
    is_active = TRUE
WHERE id = 'standard';

-- 3️⃣ 집중 (2주 무제한 + 강사 음성 피드백)
UPDATE credit_packs
SET name = '집중',
    description = '시험 2-3주 전 · 강사 음성 피드백 + 자료실 무제한',
    price = 49000,
    credits = 200,
    sort_order = 2,
    is_active = TRUE
WHERE id = 'focus';

-- 4️⃣ 마스터 (2주 무제한 + Zoom 1:1)
UPDATE credit_packs
SET name = '마스터',
    description = '시험 2주 전 · 1:1 Zoom 코칭 10회 + 무제한',
    price = 99000,
    credits = 400,
    sort_order = 3,
    is_active = TRUE
WHERE id = 'master';

-- ✅ 결과 확인
SELECT id, name, description, price, credits, is_active, sort_order
FROM credit_packs
ORDER BY sort_order;
