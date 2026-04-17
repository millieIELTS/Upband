export default function Privacy() {
  return (
    <div className="max-w-2xl mx-auto py-10 px-4">
      <h1 className="text-2xl font-bold mb-2">개인정보처리방침</h1>
      <p className="text-text-secondary text-sm mb-8">최종 수정일: 2026년 4월</p>

      <section className="mb-8">
        <h2 className="text-base font-semibold mb-2">1. 수집하는 개인정보</h2>
        <p className="text-sm text-text-secondary leading-relaxed">
          회원가입 시: 이메일 주소, 이름(닉네임)<br />
          서비스 이용 시: 작성한 글, 피드백 내용, 학습 기록<br />
          자동 수집: 접속 IP, 브라우저 정보, 서비스 이용 기록
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-base font-semibold mb-2">2. 개인정보 이용 목적</h2>
        <p className="text-sm text-text-secondary leading-relaxed">
          서비스 제공 및 운영, AI 피드백 생성, 고객 문의 응대, 서비스 개선을 위한 통계 분석에 이용됩니다.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-base font-semibold mb-2">3. 개인정보 보관 기간</h2>
        <p className="text-sm text-text-secondary leading-relaxed">
          회원 탈퇴 시까지 보관하며, 탈퇴 시 즉시 삭제합니다. 단, 관계 법령에 따라 일정 기간 보관이 필요한 경우 해당 기간 동안 보관합니다.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-base font-semibold mb-2">4. 제3자 제공</h2>
        <p className="text-sm text-text-secondary leading-relaxed">
          원칙적으로 이용자의 개인정보를 제3자에게 제공하지 않습니다. 다만 AI 피드백 서비스 제공을 위해 Anthropic API에 작성 내용이 전달될 수 있습니다.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-base font-semibold mb-2">5. 이용자의 권리</h2>
        <p className="text-sm text-text-secondary leading-relaxed">
          이용자는 언제든지 본인의 개인정보를 조회·수정·삭제할 수 있으며, 계정 삭제를 요청할 수 있습니다. 문의: milliejiyeon@gmail.com
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-base font-semibold mb-2">6. 개인정보 보호 책임자</h2>
        <p className="text-sm text-text-secondary leading-relaxed">
          이름: 박지연<br />
          이메일: milliejiyeon@gmail.com
        </p>
      </section>
    </div>
  )
}
