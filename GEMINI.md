# 🤖 Git 커밋 및 개발 워크플로우 규칙 (Rules)

이 프로젝트에서 AI(Antigravity IDE, Copilot 등)에게 커밋 생성을 요청할 때는 다음 규칙을 엄격히 준수합니다.

## 📌 Git 커밋 규칙
1. **언어**: 커밋 메시지(제목 및 본문)는 항상 한국어로 작성하되, 기술 용어나 코드 표현은 영어 원어를 사용합니다.
2. **제목 (50자 내외 요약)**:
   - 변경의 핵심 내용을 직관적이고 명확하게 요약합니다. (예: `feat: 비밀번호 유출 확인(k-익명성) 구현`)
3. **본문 (불릿 포인트 상세 목록)**:
   - 제목 아래 한 줄 띄우고, 무엇이 왜 바뀌었는지 주요 변경 사항을 `-` 불릿 포인트 목록으로 상세히 작성합니다.
4. **Co-authored-by (AI 모델 서명)**:
   - 본문 하단에 한 줄 띄우고 `Co-authored-by: <현재 LLM 모델명> <noreply@google.com>` 형식으로 현재 사용 중인 모델을 반드시 기록합니다.
   - 예시: `Co-authored-by: Gemini <noreply@google.com>`

## 🛡️ 보안 코딩 원칙
- 이 프로젝트는 React + **JavaScript**입니다. TypeScript로 변환하지 않습니다.
- 비밀번호 생성에는 `Math.random()` 대신 `crypto.getRandomValues()`를 사용합니다.
- 유출 확인은 SHA-1 해시의 앞 5글자만 `https://api.pwnedpasswords.com/range/` 로 보내고, 대조는 브라우저에서 대문자 기준으로 합니다.
- 입력된 비밀번호를 `console.log`로 출력하거나 `localStorage`에 저장하지 않습니다.

## 💡 커밋 요청 팁
AI Chat에 `"지금까지 작업한 내용 커밋해줘"`라고 요청하면 위 규칙을 적용해 커밋을 만들어 줍니다.
