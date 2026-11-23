import React, { useState } from 'react';
import { generateSecurePassword, evaluatePasswordStrength } from '../utils/crypto';

export default function PasswordGenerator({ onUsePassword }) {
  const [length, setLength] = useState(16);
  const [uppercase, setUppercase] = useState(true);
  const [lowercase, setLowercase] = useState(true);
  const [numbers, setNumbers] = useState(true);
  const [symbols, setSymbols] = useState(true);

  const [generatedPassword, setGeneratedPassword] = useState(() => {
    return generateSecurePassword({
      length: 16,
      uppercase: true,
      lowercase: true,
      numbers: true,
      symbols: true,
    });
  });

  const [copied, setCopied] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleGenerate = () => {
    try {
      setErrorMsg('');
      const pwd = generateSecurePassword({
        length,
        uppercase,
        lowercase,
        numbers,
        symbols,
      });
      setGeneratedPassword(pwd);
      setCopied(false);
    } catch (err) {
      setErrorMsg(err.message || '비밀번호를 생성할 수 없습니다.');
    }
  };

  const handleCopy = async () => {
    if (!generatedPassword) return;
    try {
      await navigator.clipboard.writeText(generatedPassword);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setErrorMsg('클립보드 복사에 실패했습니다.');
    }
  };

  const handleInspect = () => {
    if (onUsePassword && generatedPassword) {
      onUsePassword(generatedPassword);
    }
  };

  const currentStrength = evaluatePasswordStrength(generatedPassword);

  return (
    <div className="generator-container">
      <section className="dashboard-card">
        <div className="card-header">
          <div>
            <h2 className="card-title">안전한 비밀번호 생성기</h2>
            <p className="card-desc">
              예측 불가능한 Web Crypto API(<code>crypto.getRandomValues()</code>) 기반 암호학적 난수로 생성됩니다.
            </p>
          </div>
          <span className="card-tag">CSPRNG 난수 엔진</span>
        </div>

        {/* 생성된 비밀번호 표시창 */}
        <div className="generated-display-panel">
          <div className="password-display-box">
            <span className="generated-password-text">{generatedPassword}</span>
          </div>

          <div className="button-group">
            <button
              type="button"
              className={`copy-button ${copied ? 'copied' : ''}`}
              onClick={handleCopy}
            >
              {copied ? '✓ 복사 완료!' : '📋 원클릭 복사'}
            </button>
            <button
              type="button"
              className="inspect-link-button"
              onClick={handleInspect}
            >
              🔍 이 비밀번호 바로 점검하기
            </button>
            <button
              type="button"
              className="refresh-button"
              onClick={handleGenerate}
              title="새로고침"
            >
              🔄 새로 생성
            </button>
          </div>
        </div>

        {/* 생성된 비밀번호 강도 상태 바 */}
        <div className="gen-strength-indicator">
          <span>생성된 비밀번호 안전도: </span>
          <strong style={{ color: currentStrength.color }}>
            {currentStrength.level} ({generatedPassword.length}자)
          </strong>
        </div>

        {errorMsg && (
          <div className="alert alert-danger" style={{ marginTop: '1rem' }}>
            {errorMsg}
          </div>
        )}

        {/* 옵션 설정 패널 */}
        <div className="generator-options-grid">
          {/* 길이 슬라이더 */}
          <div className="option-group length-slider-group">
            <div className="slider-header">
              <label htmlFor="length-slider" className="option-label">
                비밀번호 길이: <strong>{length}자</strong>
              </label>
              <span className="length-recommendation">
                {length < 12 ? '⚠️ 12자 이상 권장' : '✨ 안전한 길이'}
              </span>
            </div>
            <input
              id="length-slider"
              type="range"
              min="8"
              max="32"
              value={length}
              onChange={(e) => setLength(Number(e.target.value))}
              className="slider"
            />
            <div className="slider-ticks">
              <span>8</span>
              <span>12</span>
              <span>16</span>
              <span>24</span>
              <span>32</span>
            </div>
          </div>

          {/* 문자 종류 체크박스 */}
          <div className="option-group checkbox-options">
            <span className="option-label">포함할 문자 종류</span>
            <div className="checkboxes-wrapper">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={uppercase}
                  onChange={(e) => setUppercase(e.target.checked)}
                />
                대문자 (A-Z)
              </label>
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={lowercase}
                  onChange={(e) => setLowercase(e.target.checked)}
                />
                소문자 (a-z)
              </label>
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={numbers}
                  onChange={(e) => setNumbers(e.target.checked)}
                />
                숫자 (0-9)
              </label>
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={symbols}
                  onChange={(e) => setSymbols(e.target.checked)}
                />
                특수문자 (!@#$...)
              </label>
            </div>
          </div>
        </div>

        {/* 보안 안내 메모 */}
        <div className="crypto-notice-box">
          <div className="notice-icon">🛡️</div>
          <div className="notice-text">
            <strong>CSPRNG(암호학적으로 안전한 의사 난수 생성기) 적용</strong>
            <p>
              일반적인 <code>Math.random()</code>은 선형 합동 생성기 또는 xorshift 기반으로 패턴 예측이 가능하여 보안상 위험합니다.
              본 생성기는 오직 운영체제 하드웨어 엔트로피를 사용하는 <code>window.crypto.getRandomValues()</code>만을 사용하여 예측 불가능한 안전한 비밀번호를 생성합니다.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
