-- ═══════════════════════════════════════════════════════════════════
-- 💎 단일 플랜 모델 (₩79,000 / 2주 집중 부스트)
-- ═══════════════════════════════════════════════════════════════════
-- 변경 사항:
-- 1. 기존 다중 플랜(starter / standard / master) → 모두 비활성화
-- 2. focus 단일 플랜만 활성화 → ₩79,000 / 2주 / 음성 피드백 10회 + 무제한 AI 첨삭

-- 1️⃣ 다중 플랜 비활성화
UPDATE credit_packs
SET is_active = FALSE
WHERE id IN ('starter', 'standard', 'master');

-- 2️⃣ 단일 플랜 (2주 집중 부스트)
UPDATE credit_packs
SET name = '2주 집중 부스트',
    description = '시험 직전 2주 · Speaking 음성 피드백 10회 + Writing 무제한 + 자료실 무제한',
    price = 79000,
    credits = 200,
    sort_order = 1,
    is_active = TRUE
WHERE id = 'focus';

-- ✅ 결과 확인
SELECT id, name, description, price, credits, is_active, sort_order
FROM credit_packs
ORDER BY sort_order;
