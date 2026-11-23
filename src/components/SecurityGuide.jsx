import React, { useState } from 'react';

export default function SecurityGuide() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <section className="security-guide-panel">
      <button
        type="button"
        className="guide-toggle-btn"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
      >
        <div className="guide-btn-content">
          <span className="guide-icon">📚</span>
          <span className="guide-title">
            사이버보안과 핵심 개념 브리핑: k-익명성과 무전송/최소전송 원칙
          </span>
        </div>
        <span className="accordion-arrow">{isOpen ? '▲ 닫기' : '▼ 펼치기'}</span>
      </button>

      {isOpen && (
        <div className="guide-body">
          <div className="guide-grid">
            <div className="guide-col">
              <h4>1. k-익명성(k-Anonymity)이란?</h4>
              <p>
                사서에게 <em>"‘ㅂ’으로 시작하는 책 목록을 전부 주세요"</em>라고 요청한 뒤, 내가 찾는 책이 그 목록에 있는지는 <strong>내 브라우저 안에서 직접 찾는 방식</strong>입니다.
              </p>
              <p>
                서버는 내가 수백 개의 책 중 어떤 책을 골랐는지 알 수 없으므로, 비밀번호 원문은 물론 전체 해시값조차 서버로 유출되지 않습니다.
              </p>
            </div>

            <div className="guide-col">
              <h4>2. Add-Padding과 가짜 항목(0개) 필터링</h4>
              <p>
                응답 패킷의 크기만 보고도 어떤 비밀번호인지 유추하는 부채널 공격(Side-channel Attack)을 막기 위해 <code>Add-Padding: true</code> 헤더를 전송합니다.
              </p>
              <p>
                서버는 고의로 유출 횟수가 <code>0</code>인 가짜 해시 레코드를 채워 응답 길이를 무작위화하며, 본 앱은 이를 정확히 필터링합니다.
              </p>
            </div>

            <div className="guide-col">
              <h4>3. CSPRNG vs Math.random()</h4>
              <p>
                JavaScript의 <code>Math.random()</code>은 예측 가능한 의사 난수로 암호학적 용도로 사용하면 역추적이 가능합니다.
              </p>
              <p>
                본 앱은 OS 엔트로피 기반의 <code>crypto.getRandomValues()</code>를 사용하여 예측 불가능한 안전한 난수를 생성합니다.
              </p>
            </div>

            <div className="guide-col">
              <h4>4. Zero Storage & No Logging 원칙</h4>
              <p>
                사용자가 입력한 비밀번호와 생성된 결과는 <code>localStorage</code>나 <code>sessionStorage</code>에 절대 저장하지 않습니다.
              </p>
              <p>
                또한 개발자 도구의 <code>console.log</code>로 비밀번호나 해시를 출력하지 않아 XSS 공격이나 콘솔 탈취 공격으로부터 안전합니다.
              </p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
