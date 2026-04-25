export default function Refund() {
  return (
    <div className="max-w-2xl mx-auto py-10 px-4">
      <h1 className="text-2xl font-bold mb-2">환불/취소 규정</h1>
      <p className="text-text-secondary text-sm mb-8">최종 수정일: 2026년 4월</p>

      <section className="mb-8">
        <h2 className="text-base font-semibold mb-2">1. 환불 원칙</h2>
        <p className="text-sm text-text-secondary leading-relaxed">
          결제 후 3일 이내, 어떤 기능도 사용하지 않으신 경우 100% 전액 환불이 가능합니다.
          (Writing 첨삭, Speaking 피드백, 모의고사, 자료실 다운로드 등 일체의 사용 내역이 없는 경우에 한함)
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-base font-semibold mb-2">2. 환불 불가 항목</h2>
        <p className="text-sm text-text-secondary leading-relaxed">
          결제 후 단 한 번이라도 첨삭/모의고사/Speaking 피드백/자료실 등을 사용하신 경우 환불이 어렵습니다.<br />
          결제일로부터 3일이 지난 경우에는 사용 여부와 관계없이 환불이 어렵습니다.<br />
          이벤트·프로모션으로 무상 지급된 혜택은 환불 대상이 아닙니다.
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
