import React from 'react';

export default function Header({ activeTab, setActiveTab, theme, toggleTheme }) {
  const tabs = [
    { id: 'checker', label: '비밀번호 강도 & 유출 점검기', icon: '🛡️' },
    { id: 'generator', label: '안전한 비밀번호 생성기', icon: '⚡' },
    { id: 'vault', label: 'AES-GCM 메모 금고', icon: '🔐' },
  ];

  return (
    <header className="dashboard-header">
      <div className="header-top">
        <div className="brand-group">
          <div className="brand-badge">CyberSec Tool</div>
          <h1 className="dashboard-title">
            비밀번호 보안 점검 & 생성 대시보드
          </h1>
          <p className="dashboard-subtitle">
            Web Crypto API 기반의 k-익명성 비밀번호 유출 검사 및 암호학적 생성기
          </p>
        </div>

        <div className="header-actions">
          <div className="security-badges">
            <span className="badge badge-success">
              <span className="badge-dot"></span>
              무저장 원칙
            </span>
            <span className="badge badge-info">
              <span className="badge-dot"></span>
              k-익명성 (5-Char)
            </span>
            <span className="badge badge-purple">
              <span className="badge-dot"></span>
              Web Crypto
            </span>
          </div>

          {/* 테마 토글 버튼 */}
          <button
            type="button"
            className="theme-toggle-btn"
            onClick={toggleTheme}
            aria-label="화면 테마 모드 전환"
            title={theme === 'dark' ? '라이트 모드로 전환' : '다크 모드로 전환'}
          >
            <span className="theme-icon">
              {theme === 'dark' ? '☀️' : '🌙'}
            </span>
            <span className="theme-text">
              {theme === 'dark' ? '라이트 모드' : '다크 모드'}
            </span>
          </button>
        </div>
      </div>

      <nav className="tab-navigation" aria-label="메인 대시보드 탭">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <span className="tab-icon">{tab.icon}</span>
            <span className="tab-label">{tab.label}</span>
          </button>
        ))}
      </nav>
    </header>
  );
}
