import React, { useState } from 'react';
import { encryptVaultData, decryptVaultData } from '../utils/crypto';

export default function Vault() {
  const [activeVaultMode, setActiveVaultMode] = useState('encrypt'); // 'encrypt' | 'decrypt'

  // 암호화 폼 상태
  const [encryptPassword, setEncryptPassword] = useState('');
  const [plainText, setPlainText] = useState('');
  const [encryptedPayload, setEncryptedPayload] = useState('');
  const [isEncrypting, setIsEncrypting] = useState(false);
  const [encryptError, setEncryptError] = useState('');
  const [encryptCopied, setEncryptCopied] = useState(false);

  // 복호화 폼 상태
  const [decryptPassword, setDecryptPassword] = useState('');
  const [inputCiphertext, setInputCiphertext] = useState('');
  const [decryptedResult, setDecryptedResult] = useState('');
  const [isDecrypting, setIsDecrypting] = useState(false);
  const [decryptError, setDecryptError] = useState('');

  // 브라우저 세션 메모리 보관함 (localStorage 절대 미사용, 페이지 새로고침 시 초기화)
  const [sessionVaults, setSessionVaults] = useState([]);

  // 암호화 핸들러
  const handleEncrypt = async (e) => {
    e.preventDefault();
    setEncryptError('');
    setEncryptedPayload('');

    if (!encryptPassword) {
      setEncryptError('마스터 비밀번호를 입력해 주세요.');
      return;
    }
    if (!plainText) {
      setEncryptError('암호화할 메모 내용을 입력해 주세요.');
      return;
    }

    setIsEncrypting(true);
    try {
      const base64 = await encryptVaultData(plainText, encryptPassword);
      setEncryptedPayload(base64);

      // 세션 메모리 목록에 추가 (평문은 저장하지 않고 암호문과 라벨만 저장)
      const newItem = {
        id: Date.now(),
        label: plainText.slice(0, 15) + (plainText.length > 15 ? '...' : ''),
        cipher: base64,
        createdAt: new Date().toLocaleTimeString(),
      };
      setSessionVaults((prev) => [newItem, ...prev]);
    } catch (err) {
      setEncryptError(err.message || '암호화 처리 중 오류가 발생했습니다.');
    } finally {
      setIsEncrypting(false);
    }
  };

  // 복호화 핸들러
  const handleDecrypt = async (e) => {
    e.preventDefault();
    setDecryptError('');
    setDecryptedResult('');

    if (!decryptPassword) {
      setDecryptError('마스터 비밀번호를 입력해 주세요.');
      return;
    }
    if (!inputCiphertext) {
      setDecryptError('복호화할 암호문(Base64)을 입력해 주세요.');
      return;
    }

    setIsDecrypting(true);
    try {
      const text = await decryptVaultData(inputCiphertext, decryptPassword);
      setDecryptedResult(text);
    } catch (err) {
      setDecryptError(err.message || '복호화 실패: 비밀번호 또는 암호문을 확인하세요.');
    } finally {
      setIsDecrypting(false);
    }
  };

  const copyEncryptedText = async () => {
    if (!encryptedPayload) return;
    await navigator.clipboard.writeText(encryptedPayload);
    setEncryptCopied(true);
    setTimeout(() => setEncryptCopied(false), 2000);
  };

  const handleSelectFromSession = (cipher) => {
    setInputCiphertext(cipher);
    setActiveVaultMode('decrypt');
    setDecryptedResult('');
    setDecryptError('');
  };

  return (
    <div className="vault-container">
      <section className="dashboard-card">
        <div className="card-header">
          <div>
            <h2 className="card-title">3. AES-GCM 암호화 메모 금고 (확장 기능)</h2>
            <p className="card-desc">
              PBKDF2(100,000회)로 비밀번호에서 암호화 키를 파생하고, 군사 등급의 AES-256-GCM으로 메모를 브라우저 안에서 직접 암호화·복호화합니다.
            </p>
          </div>
          <span className="badge badge-purple">PBKDF2 + AES-256-GCM</span>
        </div>

        {/* 금고 서브 탭 */}
        <div className="vault-tabs">
          <button
            type="button"
            className={`vault-tab-btn ${activeVaultMode === 'encrypt' ? 'active' : ''}`}
            onClick={() => setActiveVaultMode('encrypt')}
          >
            🔒 메모 암호화 (Encrypt)
          </button>
          <button
            type="button"
            className={`vault-tab-btn ${activeVaultMode === 'decrypt' ? 'active' : ''}`}
            onClick={() => setActiveVaultMode('decrypt')}
          >
            🔓 메모 복호화 (Decrypt)
          </button>
        </div>

        {/* 1) 암호화 패널 */}
        {activeVaultMode === 'encrypt' && (
          <form onSubmit={handleEncrypt} className="vault-form">
            <div className="input-group-wrapper">
              <label htmlFor="encrypt-master-pw" className="input-label">
                마스터 비밀번호
              </label>
              <input
                id="encrypt-master-pw"
                type="password"
                className="styled-input"
                placeholder="메모를 잠글 마스터 비밀번호를 입력하세요"
                value={encryptPassword}
                onChange={(e) => setEncryptPassword(e.target.value)}
                autoComplete="off"
              />
              <span className="field-hint">
                * 이 비밀번호를 잊어버리면 그 누구도(개발자, 서버도) 복구할 수 없습니다!
              </span>
            </div>

            <div className="input-group-wrapper">
              <label htmlFor="plain-memo" className="input-label">
                암호화할 비밀 메모 평문
              </label>
              <textarea
                id="plain-memo"
                rows="4"
                className="styled-textarea"
                placeholder="비밀 계정 정보, 개인 메모, 백업 코드 등 안전하게 보관할 내용을 적으세요."
                value={plainText}
                onChange={(e) => setPlainText(e.target.value)}
              ></textarea>
            </div>

            <button
              type="submit"
              className="primary-button"
              disabled={isEncrypting || !encryptPassword || !plainText}
            >
              {isEncrypting ? 'AES-GCM 암호화 중...' : '🔒 안전하게 암호화하기'}
            </button>

            {encryptError && (
              <div className="alert alert-danger" style={{ marginTop: '1rem' }}>
                {encryptError}
              </div>
            )}

            {encryptedPayload && (
              <div className="encrypted-output-card">
                <div className="output-header">
                  <span>🔐 암호화된 데이터 (Salt + IV + Ciphertext, Base64)</span>
                  <button
                    type="button"
                    className="copy-button small"
                    onClick={copyEncryptedText}
                  >
                    {encryptCopied ? '✓ 복사됨!' : '📋 암호문 복사'}
                  </button>
                </div>
                <pre className="output-code-block">{encryptedPayload}</pre>
                <p className="output-guide">
                  위 문자열은 암호화된 안전한 토큰입니다. 복호화 탭에서 마스터 비밀번호와 함께 입력하면 언제든 원본 메모를 되살릴 수 있습니다.
                </p>
              </div>
            )}
          </form>
        )}

        {/* 2) 복호화 패널 */}
        {activeVaultMode === 'decrypt' && (
          <form onSubmit={handleDecrypt} className="vault-form">
            <div className="input-group-wrapper">
              <label htmlFor="decrypt-cipher" className="input-label">
                암호화된 텍스트 (Base64)
              </label>
              <textarea
                id="decrypt-cipher"
                rows="4"
                className="styled-textarea mono"
                placeholder="암호화된 Base64 문자열을 붙여넣으세요."
                value={inputCiphertext}
                onChange={(e) => setInputCiphertext(e.target.value)}
              ></textarea>
            </div>

            <div className="input-group-wrapper">
              <label htmlFor="decrypt-master-pw" className="input-label">
                마스터 비밀번호
              </label>
              <input
                id="decrypt-master-pw"
                type="password"
                className="styled-input"
                placeholder="암호화 시 사용했던 마스터 비밀번호 입력"
                value={decryptPassword}
                onChange={(e) => setDecryptPassword(e.target.value)}
                autoComplete="off"
              />
            </div>

            <button
              type="submit"
              className="primary-button"
              disabled={isDecrypting || !decryptPassword || !inputCiphertext}
            >
              {isDecrypting ? '복호화 및 검증 중...' : '🔓 메모 복호화하기'}
            </button>

            {decryptError && (
              <div className="alert alert-danger" style={{ marginTop: '1rem' }}>
                ⚠️ {decryptError}
              </div>
            )}

            {decryptedResult && (
              <div className="decrypted-output-card">
                <div className="output-header">
                  <span>✅ 복호화 성공 원본 메모</span>
                </div>
                <div className="decrypted-content-box">{decryptedResult}</div>
              </div>
            )}
          </form>
        )}

        {/* 세션 내 임시 암호문 보관함 (메모리 전용) */}
        {sessionVaults.length > 0 && (
          <div className="session-vaults-section">
            <h3 className="sub-title">📦 현재 세션 임시 암호문 목록 (In-Memory Only)</h3>
            <p className="sub-desc">
              * 브라우저 저장소(localStorage/sessionStorage)에는 전혀 남지 않으며, 새로고침 시 완전 소멸합니다.
            </p>
            <div className="session-items-list">
              {sessionVaults.map((item) => (
                <div key={item.id} className="session-item-row">
                  <div className="session-info">
                    <span className="session-label">📝 {item.label}</span>
                    <span className="session-time">{item.createdAt}</span>
                  </div>
                  <button
                    type="button"
                    className="secondary-btn"
                    onClick={() => handleSelectFromSession(item.cipher)}
                  >
                    이 암호문 불러오기
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 암호학 원리 설명 박스 */}
        <div className="crypto-notice-box" style={{ marginTop: '2rem' }}>
          <div className="notice-icon">🛡️</div>
          <div className="notice-text">
            <strong>AES-GCM과 PBKDF2의 보안 원리</strong>
            <p>
              1. <strong>PBKDF2</strong>: 입력된 마스터 비밀번호에 무작위 16바이트 Salt와 100,000회의 SHA-256 해시 연산을 거쳐 GPU를 통한 무차별 대입(Brute-force) 공격을 방어합니다.<br />
              2. <strong>AES-GCM</strong>: 기밀성(Confidentiality)뿐만 아니라 무결성(Integrity) 인증 태그를 함께 생성하므로 암호문이 1비트라도 변조되면 복호화 과정에서 즉시 차단됩니다.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
