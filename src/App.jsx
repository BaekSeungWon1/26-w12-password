import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import PasswordChecker from './components/PasswordChecker';
import PasswordGenerator from './components/PasswordGenerator';
import Vault from './components/Vault';
import SecurityGuide from './components/SecurityGuide';
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState('checker');
  const [password, setPassword] = useState('');

  // 테마 상태 초기화: localStorage에 테마 이름만 보관(비밀번호 절대 미보관)
  const [theme, setTheme] = useState(() => {
    try {
      const savedTheme = localStorage.getItem('cybersec_theme');
      if (savedTheme === 'light' || savedTheme === 'dark') {
        return savedTheme;
      }
    } catch {
      // localStorage 접근 불가 시 fallback
    }

    if (
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-color-scheme: light)').matches
    ) {
      return 'light';
    }
    return 'dark'; // 기본값 다크 모드
  });

  // 테마 변경 시 html 태그 속성 및 localStorage 동기화
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    try {
      localStorage.setItem('cybersec_theme', theme);
    } catch {
      // fallback
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  // 생성기에서 "이 비밀번호 바로 점검하기" 클릭 시 호출
  const handleUsePassword = (generatedPwd) => {
    setPassword(generatedPwd);
    setActiveTab('checker');
  };

  return (
    <div className="dashboard-layout">
      {/* 최상단 헤더 및 네비게이션 */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        theme={theme}
        toggleTheme={toggleTheme}
      />

      {/* 대시보드 메인 본문 콘텐츠 */}
      <main className="dashboard-main">
        {activeTab === 'checker' && (
          <PasswordChecker
            password={password}
            setPassword={setPassword}
          />
        )}

        {activeTab === 'generator' && (
          <PasswordGenerator onUsePassword={handleUsePassword} />
        )}

        {activeTab === 'vault' && <Vault />}
      </main>

      {/* 사이버보안 가이드 & 개념 아코디언 */}
      <SecurityGuide />

      {/* 푸터 */}
      <footer className="dashboard-footer">
        <p>
          한국폴리텍대학 강서캠퍼스 사이버보안과 실습 프로젝트 | Web Crypto API & k-익명성 보안 대시보드
        </p>
        <p className="footer-sub">
          보안 원칙: Zero Storage, Client-side Evaluation, CSPRNG Random Generation, 5-Char Prefix Range Query
        </p>
      </footer>
    </div>
  );
}

export default App;
