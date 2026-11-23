import React, { useState } from 'react';
import { evaluatePasswordStrength, checkPasswordLeak } from '../utils/crypto';

export default function PasswordChecker({ password, setPassword }) {
  const [showPassword, setShowPassword] = useState(false);
  const [isCheckingLeak, setIsCheckingLeak] = useState(false);
  const [leakResult, setLeakResult] = useState(null);
  const [leakError, setLeakError] = useState(null);

  // 실시간 강도 분석 (브라우저 내부에서만 순수 계산)
  const strength = evaluatePasswordStrength(password);

  const handlePasswordChange = (e) => {
    const val = e.target.value;
    setPassword(val);
    // 비밀번호가 바뀌면 이전 유출 검사 결과 초기화 (오판 방지)
    setLeakResult(null);
    setLeakError(null);
  };

  const handleCheckLeak = async () => {
    if (!password) {
      setLeakError('유출 여부를 확인할 비밀번호를 먼저 입력해 주세요.');
      return;
    }

    setIsCheckingLeak(true);
    setLeakError(null);
    setLeakResult(null);

    try {
      const result = await checkPasswordLeak(password);
      setLeakResult(result);
    } catch (err) {
      setLeakError(err.message || '유출 확인 중 네트워크 오류가 발생했습니다.');
    } finally {
      setIsCheckingLeak(false);
    }
  };

  return (
    <div className="checker-card-container">
      {/* 1. 비밀번호 입력 영역 */}
      <section className="dashboard-card">
        <div className="card-header">
          <div>
            <h2 className="card-title">1. 실시간 비밀번호 강도 검사</h2>
            <p className="card-desc">
              입력하는 즉시 브라우저 내부에서 길이, 복잡도, 취약 패턴을 분석합니다.
            </p>
          </div>
          <span className="card-tag">Client-side Only</span>
        </div>

        <div className="input-group-wrapper">
          <label htmlFor="password-input" className="input-label">
            검사할 비밀번호
          </label>
          <div className="password-input-box">
            <input
              id="password-input"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={handlePasswordChange}
              placeholder="점검할 비밀번호를 입력하세요 (예: myPassword123!)"
              className="styled-input"
              autoComplete="off"
              spellCheck="false"
            />
            <button
              type="button"
              className="toggle-visibility-btn"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? '비밀번호 숨기기' : '비밀번호 보기'}
            >
              {showPassword ? '🙈 숨기기' : '👁️ 보기'}
            </button>
          </div>
        </div>

        {/* 강도 게이지 바 & 판정 */}
        <div className="strength-meter-section">
          <div className="strength-meta">
            <span className="strength-label">비밀번호 강도:</span>
            <span
              className="strength-grade"
              style={{ color: strength.color }}
            >
              {strength.level}
            </span>
          </div>

          <div className="gauge-track">
            <div
              className="gauge-fill"
              style={{
                width: `${strength.percent}%`,
                backgroundColor: strength.color,
              }}
            ></div>
          </div>
        </div>

        {/* 항목별 체크리스트 뱃지 */}
        <div className="checks-grid">
          <span className={`check-badge ${strength.checks.length8 ? 'valid' : 'invalid'}`}>
            {strength.checks.length8 ? '✓' : '✗'} 8자 이상
          </span>
          <span className={`check-badge ${strength.checks.length12 ? 'valid' : 'invalid'}`}>
            {strength.checks.length12 ? '✓' : '✗'} 12자 이상 (권장)
          </span>
          <span className={`check-badge ${strength.checks.hasLower ? 'valid' : 'invalid'}`}>
            {strength.checks.hasLower ? '✓' : '✗'} 영문 소문자
          </span>
          <span className={`check-badge ${strength.checks.hasUpper ? 'valid' : 'invalid'}`}>
            {strength.checks.hasUpper ? '✓' : '✗'} 영문 대문자
          </span>
          <span className={`check-badge ${strength.checks.hasNumber ? 'valid' : 'invalid'}`}>
            {strength.checks.hasNumber ? '✓' : '✗'} 숫자 포함
          </span>
          <span className={`check-badge ${strength.checks.hasSymbol ? 'valid' : 'invalid'}`}>
            {strength.checks.hasSymbol ? '✓' : '✗'} 특수문자
          </span>
          <span className={`check-badge ${strength.checks.noRepeat ? 'valid' : 'invalid'}`}>
            {strength.checks.noRepeat ? '✓' : '✗'} 3회 연속 반복 없음
          </span>
          <span className={`check-badge ${strength.checks.noCommonPattern ? 'valid' : 'invalid'}`}>
            {strength.checks.noCommonPattern ? '✓' : '✗'} 쉬운 패턴 없음
          </span>
        </div>

        {/* 구체적인 개선 팁 */}
        <div className="tips-box">
          <h3 className="tips-title">💡 보안 진단 및 개선 조언</h3>
          <ul className="tips-list">
            {strength.tips.map((tip, idx) => (
              <li key={idx} className="tip-item">
                {tip}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* 2. Have I Been Pwned 유출 점검 섹션 (k-익명성) */}
      <section className="dashboard-card leak-checker-card">
        <div className="card-header">
          <div>
            <h2 className="card-title">2. Have I Been Pwned 유출 확인 (k-익명성)</h2>
            <p className="card-desc">
              비밀번호 원문이나 전체 해시는 절대 전송되지 않습니다. SHA-1 앞 5자리만 조회하는 k-익명성을 준수합니다.
            </p>
          </div>
          <span className="badge badge-info">Range API v2</span>
        </div>

        <div className="action-row">
          <button
            type="button"
            className="primary-button leak-check-btn"
            onClick={handleCheckLeak}
            disabled={isCheckingLeak || !password}
          >
            {isCheckingLeak ? (
              <>
                <span className="spinner"></span>
                k-익명성 안전 조회 중...
              </>
            ) : (
              '🚨 유출 여부 확인하기'
            )}
          </button>
          {!password && (
            <span className="helper-text">
              * 위 입력창에 비밀번호를 입력한 후 버튼을 누르세요.
            </span>
          )}
        </div>

        {/* 에러 메시지 */}
        {leakError && (
          <div className="alert alert-danger" role="alert">
            <span className="alert-icon">⚠️</span>
            <div className="alert-content">
              <strong>오류 발생:</strong> {leakError}
            </div>
          </div>
        )}

        {/* 결과 표시 */}
        {leakResult && (
          <div
            className={`leak-result-banner ${
              leakResult.isPwned ? 'pwned-danger' : 'pwned-safe'
            }`}
          >
            <div className="result-main-icon">
              {leakResult.isPwned ? '🚨' : '🛡️'}
            </div>
            <div className="result-main-text">
              {leakResult.isPwned ? (
                <>
                  <h4 className="result-headline danger-headline">
                    보안 경고: 유출된 비밀번호입니다!
                  </h4>
                  <p className="result-summary">
                    Have I Been Pwned 데이터베이스에서 총{' '}
                    <strong className="leak-highlight">
                      {leakResult.leakCount.toLocaleString()}회
                    </strong>{' '}
                    유출된 기록이 발견되었습니다.
                  </p>
                  <p className="result-action-advice">
                    이 비밀번호는 이미 해커들의 사전 공격(Dictionary Attack) 및 자격 증명 스터핑(Credential Stuffing) 목록에 포함되어 있습니다. 절대로 실제 서비스에서 사용하지 마세요!
                  </p>
                </>
              ) : (
                <>
                  <h4 className="result-headline safe-headline">
                    안전: 유출 기록이 발견되지 않았습니다.
                  </h4>
                  <p className="result-summary">
                    수억 건의 HIBP 유출 비밀번호 데이터베이스에 등록되어 있지 않습니다.
                  </p>
                  <p className="result-action-advice safe-advice">
                    안심하고 사용하셔도 좋습니다. 정기적으로 비밀번호를 점검하고 2단계 인증(2FA)을 함께 사용하세요.
                  </p>
                </>
              )}

              {/* 사이버보안 체크포인트: 실제 요청 확인 안내 */}
              <div className="k-anonymity-inspect">
                <div className="inspect-header">
                  <span>📡 실제 전송된 최소 요청 (Network 탭 검증)</span>
                  <span className="inspect-sub">비밀번호 원문 무전송 원칙</span>
                </div>
                <div className="inspect-url-box">
                  <code>GET {leakResult.requestUrl}</code>
                  <span className="inspect-prefix-badge">
                    앞 5글자: {leakResult.prefix}
                  </span>
                </div>
                <p className="inspect-note">
                  * 브라우저 개발자 도구(F12) → <strong>Network</strong> 탭에서 확인해 보세요. 외부 서버로는 오직 앞 5글자(<code>{leakResult.prefix}</code>)만 전달되고, 나머지 35글자 대조는 당신의 컴퓨터 안에서 수행되었습니다.
                </p>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
