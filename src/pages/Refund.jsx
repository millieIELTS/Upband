export default function Refund() {
  return (
    <div className="max-w-2xl mx-auto py-10 px-4">
      <h1 className="text-2xl font-bold mb-2">환불/취소 규정</h1>
      <p className="text-text-secondary text-sm mb-8">최종 수정일: 2026년 4월</p>

      <section className="mb-8">
        <h2 className="text-base font-semibold mb-2">1. 크레딧 환불 원칙</h2>
        <p className="text-sm text-text-secondary leading-relaxed">
          구매한 크레딧은 구매일로부터 7일 이내, 사용 내역이 없는 경우 전액 환불이 가능합니다.
          단, 크레딧을 1회 이상 사용한 경우에는 잔여 크레딧에 대한 환불이 제한될 수 있습니다.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-base font-semibold mb-2">2. 환불 불가 항목</h2>
        <p className="text-sm text-text-secondary leading-relaxed">
          이미 사용된 크레딧(AI 피드백, 첨삭 등에 소진된 크레딧)은 환불되지 않습니다.<br />
          이벤트·프로모션으로 무상 지급된 크레딧은 환불 대상이 아닙니다.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-base font-semibold mb-2">3. 환불 신청 방법</h2>
        <p className="text-sm text-text-secondary leading-relaxed">
          환불 신청은 이메일(milliejiyeon@gmail.com)로 문의해 주세요.<br />
          신청 시 구매 날짜, 결제 금액, 환불 사유를 함께 기재해 주시면 빠르게 처리됩니다.<br />
          환불 처리는 영업일 기준 3~5일 이내에 완료됩니다.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-base font-semibold mb-2">4. 서비스 중단 시 환불</h2>
        <p className="text-sm text-text-secondary leading-relaxed">
          회사의 귀책 사유로 서비스가 중단되는 경우, 잔여 크레딧에 대해 전액 환불을 보장합니다.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-base font-semibold mb-2">5. 문의</h2>
        <p className="text-sm text-text-secondary leading-relaxed">
          환불 관련 문의: milliejiyeon@gmail.com
        </p>
      </section>
    </div>
  )
}
