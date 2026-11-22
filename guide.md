# guide.md — 비밀번호 보안 도구 (`26-w12-password`)

> **이번 주의 새로운 도전: "빈 저장소에서 Vite 프로젝트를 직접 차린다"**
> 11주차까지는 `package.json`과 `vite.config.js`가 미리 준비된 저장소에서 시작했습니다.
> 이번 주에는 **`npm create vite`로 React 프로젝트를 처음부터 직접 구성**하고, 그 위에 나만의 비밀번호 보안 도구를 기획·구현·배포합니다.
> 지난주처럼 **복사할 프롬프트는 없습니다.**

---

## 🌟 오늘 우리는 무엇을 만드나요

회원가입 화면에서 흔히 보는 "비밀번호 강도 표시", 비밀번호 관리자 앱의 "안전한 비밀번호 생성", 그리고 **"이 비밀번호가 해킹 사고로 유출된 적이 있는지 확인"** 기능을 한데 모은 **비밀번호 보안 도구 웹앱**입니다.

- **정해진 정답 화면이 없습니다**: 회원가입 폼 시뮬레이터로 만들어도 좋고, 보안 점검 대시보드로 만들어도 좋습니다.
- **사이버보안과의 눈**: 유출 확인을 하려면 외부 서버에 물어봐야 합니다. 그런데 **비밀번호를 서버에 보내지 않고** 물어볼 수 있을까요? 오늘은 그 방법(**k-익명성**)을 직접 구현하고, 개발자 도구 Network 탭으로 눈으로 확인합니다.

### 🔁 11주차와 무엇이 달라졌나요

| | 11주차 모바일 OTP | 12주차 비밀번호 보안 도구 |
|---|---|---|
| 프로젝트 구성 | 미리 준비된 Vite 템플릿 | **`npm create vite`로 직접 구성** |
| 외부 통신 | 없음 (**무전송 원칙**) | 꼭 필요한 5글자만 전송 (**최소 전송 원칙**) |
| Web Crypto API | `getRandomValues`, HMAC-SHA1 | `getRandomValues`, **SHA-1 해시** |

---

## ⏱️ 오늘의 수업 타임라인 (총 130분)

| 시간 | 단계 | 진행 내용 |
|---|---|---|
| **준비 (10분)** | 환경 준비 | 저장소 Fork → 로컬 Clone → Antigravity IDE(또는 VS Code) 열기 → `dev` 브랜치 생성 |
| **1교시 (45분)** | Vite 직접 구성 & 원리 이해 | Vite 프로젝트 직접 구성(20분) → 유출 확인 원리 브리핑(10분) → 앱 컨셉 자율 기획(15분) |
| *(휴식 15분)* | — | — |
| **2교시 (45분)** | 자율 구현 & 검증 | 강도 검사·생성기·유출 확인 구현 → **Network 탭에서 5글자만 전송되는지 확인** → 고도화 |
| *(휴식 15분)* | — | — |
| **3교시 (30분)** | 회고·듀얼 배포·제출 | `dev` 병합 → `README.md` 회고 작성 → Netlify & GitHub Pages 배포 → `v1.0` 태그 & PR 제출 → **13주차 사전과제 안내** |

---

## 1단계 — 환경 준비 & `dev` 브랜치 시작 (준비 10분)

1. [`26-w12-password`](https://github.com/kopo-kangseo-cybersec/26-w12-password) 저장소를 본인 GitHub 계정으로 **Fork**하고 내 컴퓨터로 Clone합니다.
   ```bash
   git clone https://github.com/<내-GitHub-아이디>/26-w12-password.git
   cd 26-w12-password
   ```
2. **Antigravity IDE**(또는 VS Code)에서 `26-w12-password` 폴더를 엽니다.
3. 파일 목록을 확인해 보세요. `package.json`도, `src` 폴더도 없습니다. **거의 빈 저장소**입니다.
   ```
   26-w12-password/
   ├── .github/            ← 자동 채점·PR 템플릿 (건드리지 않습니다)
   ├── AGENTS.md / GEMINI.md
   ├── guide.md            ← 지금 읽고 있는 문서
   ├── README.md           ← 저장소 첫 화면 안내 (곧 Vite가 덮어씁니다)
   └── README.template.md  ← 나중에 README.md가 될 회고 양식
   ```
4. 하단 터미널에서 `dev` 브랜치를 만듭니다.
   ```bash
   git checkout -b dev
   ```

---

## 2단계 — Vite 프로젝트 직접 구성하기 (1교시 20분)

### 🍳 비유로 이해하기 — "밀키트 상자로 주방 차리기"

- 지금까지는 **선생님이 미리 차려 둔 주방**(템플릿 저장소)에서 요리만 했습니다.
- 오늘은 **밀키트 상자(`create-vite`)**를 직접 뜯어서 주방을 차립니다. 상자 안에는 React 요리에 필요한 도구(`package.json`, `vite.config.js`, `src/`)가 한 세트로 들어 있습니다.
- 예전에는 이 역할을 **Webpack**(Create React App)이 맡았지만 설정이 복잡하고 느렸습니다. **Vite**는 "필요한 재료만 그때그때 꺼내 쓰는" 방식이라 개발 서버가 거의 즉시 켜집니다. (Next.js가 쓰는 **Turbopack**도 같은 문제를 풀기 위해 나온 도구입니다.)

### ① `create-vite` 실행

터미널에 아래 명령을 입력합니다. 마지막의 **`.`(점)**은 "새 폴더를 만들지 말고 **지금 이 폴더**에 차려라"라는 뜻입니다.

```bash
npm create vite@latest .
```

> `Need to install the following packages: create-vite ... Ok to proceed? (y)`가 나오면 `y`를 누르고 Enter.

질문이 차례로 나옵니다. **방향키(↑/↓)로 고르고 Enter**를 누르세요.

| 질문 | 선택 | ⚠️ 주의 |
|---|---|---|
| `Current directory is not empty. Please choose how to proceed:` | **`Ignore files and continue`** (세 번째) | ❌ `Remove existing files`를 고르면 **guide.md와 .github가 지워집니다!** |
| `Select a framework:` | **`React`** | |
| `Select a variant:` | **`JavaScript`** (세 번째) | ❌ 기본값이 **TypeScript**입니다. 바로 Enter 누르지 마세요! |
| `Which linter to use?` | **`Oxlint`** (기본값) | |
| `Install with npm and start now?` | **`No`** | 설치는 다음 단계에서 직접 합니다 |

> 💡 `Package name:`을 묻는 경우(폴더 이름에 대문자가 있을 때 등)에는 그냥 Enter를 누르면 됩니다.

### ② 덮어써진 파일 확인 — `README.md`와 `.gitignore`

`create-vite`는 **같은 이름의 파일이 있으면 자기 것으로 덮어씁니다.** 그래서 템플릿의 회고 양식을 `README.template.md`라는 다른 이름으로 준비해 두었습니다.

1. `README.md`를 열어 보세요. `# React + Vite`로 시작하는 Vite 기본 안내문입니다.
2. VS Code 탐색기에서 **`README.md`를 삭제**하고, **`README.template.md`의 이름을 `README.md`로 변경**합니다.

### ③ 🛡️ 보안 체크포인트 — `.gitignore` 보강

`create-vite`가 만든 `.gitignore`를 열어 보세요. `node_modules`, `dist`는 있지만, 환경변수 파일은 `*.local`(예: `.env.local`)만 막혀 있고 **`.env` 파일 자체는 막혀 있지 않습니다.**
맨 아래에 다음 내용을 직접 추가합니다.

```gitignore
# 환경변수 — 절대 커밋하지 않습니다
.env
.env.*
!.env.example
```

> 이번 앱은 API 키가 필요 없지만, **"프로젝트를 차릴 때 비밀 파일 차단부터"**는 보안 개발자의 기본 습관입니다. 9주차 Supabase 키를 떠올려 보세요.

### ④ 패키지 설치 & 배포 준비

```bash
npm install
npm install -D gh-pages
```

**`vite.config.js`**를 열어 `base: './'` 한 줄을 추가합니다. (Netlify와 GitHub Pages 하위 경로 양쪽에서 화면이 깨지지 않게 해 줍니다.)

```js
export default defineConfig({
  base: './', // Netlify 및 GitHub Pages 배포 경로 호환
  plugins: [react()],
})
```

**`package.json`**의 `"scripts"`에 `deploy` 한 줄을 추가합니다. (앞 줄 끝의 쉼표 `,`를 잊지 마세요!)

```json
"scripts": {
  "dev": "vite",
  "build": "vite build",
  "lint": "oxlint",
  "preview": "vite preview",
  "deploy": "gh-pages -d dist"
}
```

### ⑤ 실행 확인 & 첫 커밋

```bash
npm run dev
```

브라우저에서 `http://localhost:5173`을 열어 Vite + React 기본 화면(카운터 버튼)이 보이면 성공입니다. 확인 후 터미널에서 `Ctrl + C`로 서버를 끄고 커밋합니다.

```bash
git add .
git commit -m "chore: Vite React 프로젝트 직접 구성"
git push -u origin dev
git checkout -b password
```

> 💡 `git status`를 쳐서 `node_modules`가 목록에 **보이지 않는지** 확인해 보세요. `.gitignore`가 제대로 동작하고 있다는 증거입니다.

---

## 3단계 — 핵심 원리와 최소 완성 기준 이해 (1교시 10분)

### 🔍 유출 확인은 어떻게 비밀번호를 보내지 않고 물어볼까? — k-익명성

[Have I Been Pwned](https://haveibeenpwned.com/Passwords)는 실제 해킹 사고로 유출된 비밀번호 수억 개를 모아 둔 서비스입니다. 그런데 *"제 비밀번호 `qwer1234` 유출됐나요?"*라고 묻는 순간, 그 비밀번호를 남에게 알려 주는 셈이 됩니다.

> **📚 비유 — 책 제목을 말하지 않고 도서관에서 책 찾기**
> 사서에게 *"'ㅂ'으로 시작하는 책 목록 전부 주세요"*라고만 말하고, 받은 목록에서 내 책이 있는지는 **내가 직접** 찾습니다.
> 사서는 내가 수백 권 중 **어떤 책**을 찾았는지 알 수 없습니다.

비밀번호 `password`로 예를 들면:

```
[1. 브라우저 안에서]  "password"  ──SHA-1 해시──>  5BAA61E4C9B93F3F0682250B6CF8331B7EE68FD8
                                                   └─앞 5글자─┘└──────── 뒤 35글자 ────────┘

[2. 서버로 전송]      GET https://api.pwnedpasswords.com/range/5BAA6    ← 앞 5글자만!

[3. 서버의 응답]      5BAA6으로 시작하는 해시들의 "뒤 35글자:유출횟수" 목록 수백 줄
                      ...
                      1E4C9B93F3F0682250B6CF8331B7EE68FD8:52256179
                      ...

[4. 브라우저 안에서]  내 해시의 뒤 35글자가 목록에 있나? → 있으면 "유출됨! (52,256,179회)"
```

- API 키가 필요 없는 **무료 공개 API**입니다.
- 브라우저에서 SHA-1 해시는 11주차에 쓴 **Web Crypto API**로 계산합니다: `crypto.subtle.digest('SHA-1', ...)`
- ⚠️ **완전한 익명은 아닙니다.** 서버는 여전히 앞 5글자, 내 IP 주소, 요청 시각을 봅니다. "비밀번호는 지키지만, 내가 물어봤다는 사실까지 숨기지는 못한다"는 한계를 기억하세요.

### ✅ 반드시 만족해야 할 4가지 완성 기준

1. **강도 검사**: 비밀번호를 입력하면 강도(예: 약함/보통/강함)를 실시간으로 보여 준다. **이 검사는 브라우저 안에서만** 이루어진다.
2. **안전한 생성기**: 길이와 문자 종류(대문자·소문자·숫자·특수문자)를 고르면 **`crypto.getRandomValues()`**로 비밀번호를 만든다. `Math.random()`은 사용 금지!
3. **유출 확인**: SHA-1 해시의 **앞 5글자만** range API로 보내고, 응답 목록과의 대조는 **브라우저에서** 한다. 유출됐다면 유출 횟수를 보여 준다.
4. **Network 탭 검증**: 개발자 도구(`F12`) → **Network** 탭에서 실제로 전송된 요청 주소를 확인하고, 그 결과를 `README.md`에 기록한다.

### 🛡️ 사이버보안과 필수 체크포인트

- **비밀번호를 남기지 않기**: 입력한 비밀번호를 `console.log`로 찍거나 `localStorage`에 저장하지 마세요.
- **최소 전송 원칙**: Network 탭에서 `range/` 뒤에 **5글자만** 붙어 있는지, 비밀번호나 전체 해시가 어디에도 보이지 않는지 확인하세요.

---

## 4단계 — 나만의 AI 기획·구현 방식 선택 & 제작 (1교시 15분 + 2교시 45분)

11주차와 같이 편한 방식을 고르세요.

- **방식 A. Gemini(웹 무료)에서 먼저 기획 → Antigravity IDE에서 구현** *(할당량 절약 추천!)*
- **방식 B. Antigravity IDE에서 Implementation Plan을 받아 검토·수정 → 단계별 구현**
- **방식 C. VS Code + GitHub Copilot 병행 (보조 트랙)**

### 💡 스스로에게 던져볼 기획 질문 5가지 (힌트)

1. **앱의 정체성**: *"회원가입 폼 시뮬레이터"*인가요, *"비밀번호 점검 대시보드"*인가요, 아니면 *"생성기 중심의 비밀번호 관리 도구"*인가요?
2. **강도의 기준**: "강하다"는 무엇으로 판단할까요? 길이? 문자 종류 수? 흔한 패턴(`1234`, `qwer`, 반복 문자)? 기준을 **내가 먼저 정하고** AI에게 알려 주세요.
3. **대조 로직의 함정**: 서버 응답의 해시는 **대문자**입니다. 브라우저에서 만든 해시를 소문자로 비교하면 유출된 비밀번호도 "안전"으로 나옵니다. 내 코드는 어떻게 비교하고 있나요?
4. **사용자 경험**: 글자를 하나 칠 때마다 서버에 물어볼까요, "확인" 버튼을 눌렀을 때만 물어볼까요? 어느 쪽이 보안상, 성능상 더 나을까요?
5. **확장 기능(선택)**: 기본 기능이 끝났다면 같은 앱에 무엇을 더할까요?
   - **`Add-Padding: true` 헤더**: 응답에 가짜 항목(유출횟수 `0`)을 섞어 응답 크기로도 추측하지 못하게 합니다. 가짜 항목은 대조에서 걸러내야 합니다.
   - **AES 암호화 금고 탭**: 비밀번호로 키를 만들고(PBKDF2) 메모를 AES-GCM으로 암호화·복호화합니다. 비밀번호를 잊으면 왜 **아무도** 복구할 수 없는지 체험해 보세요.

> 💾 **중간 커밋 습관**: 기능이 하나 동작할 때마다 커밋해 세이브포인트를 남기세요.
> - Antigravity IDE Chat: `"지금까지 작업한 내용 프로젝트 커밋 규칙에 맞춰서 커밋해줘"`
> - 터미널 직접 입력: `git add .` → `git commit -m "feat: 비밀번호 강도 검사 구현"`

---

## 5단계 — `dev` 병합, 회고 작성 및 듀얼 배포 (3교시)

### 1. 통합 브랜치(`dev`)로 병합 및 빌드 확인

```bash
git checkout dev
git merge password
npm run build
npm run lint
```

### 2. `README.md` 회고 작성 및 커밋

2단계에서 이름을 바꾼 `README.md`의 질문에 답을 채웁니다. 특히 **Network 탭에서 확인한 실제 요청 주소**를 꼭 적어 주세요.

### 3. Netlify & GitHub Pages 듀얼 배포

1. **Netlify 배포**: [app.netlify.com](https://app.netlify.com) → Add new project → Import an existing project → 본인의 `26-w12-password` 선택 → Branch: `dev`, Build command: `npm run build`, Publish directory: `dist` → 배포 후 `https://<사이트이름>.netlify.app` 복사
2. **GitHub Pages 배포**: 2단계에서 직접 추가한 `deploy` 스크립트를 사용합니다.
   ```bash
   npm run build
   npm run deploy
   ```
   - GitHub 저장소 **Settings → Pages**에서 `gh-pages` 브랜치가 연결되었는지 확인하고 `https://<내아이디>.github.io/26-w12-password/` 주소를 확인합니다.
   - ⚠️ 배포 URL에 `.git` 주소나 `http://localhost:5173` 로컬 주소를 적지 마세요!
3. `README.md`에 두 배포 URL을 채워 넣고 푸시합니다.
   ```bash
   git add README.md
   git commit -m "docs: README 회고 및 배포 링크 작성"
   git push origin dev
   ```

---

## 6단계 — 마일스톤 태그 & PR 제출

1. `v1.0` 태그 생성 및 푸시:
   ```bash
   git tag v1.0
   git push origin v1.0
   ```
2. GitHub에서 **Pull requests → New pull request** 클릭:
   - **base**: `kopo-kangseo-cybersec/26-w12-password` (`main`)
   - **compare**: `<내아이디>/26-w12-password` (`dev`)
3. PR 템플릿의 이름, 배포 URL 2개, 태그(`v1.0`), 체크리스트, 한 줄 소감을 작성해 제출합니다.
4. 1~2분 뒤 AI 자동 채점 리포트와 `'통과'` 라벨을 확인합니다!

---

## 📣 13주차 사전과제 안내

다음 주(13주차, 마지막 수업)에는 지금까지 만든 결과물을 **포트폴리오**로 묶습니다. 그 전에 **4주차부터 12주차까지의 배포 링크가 모두 살아 있는지** 점검해 제출합니다.

👉 [`26-final-checkup`](https://github.com/kopo-kangseo-cybersec/26-final-checkup) 저장소의 안내를 따라 제출하세요. 봇이 링크와 PR을 자동으로 점검해 줍니다.

---

## ❓ FAQ / Troubleshooting

**Q1. `create-vite`를 실행했더니 `guide.md`와 `.github` 폴더가 사라졌어요!**
→ `Remove existing files`를 골랐기 때문입니다. Git이 기억하고 있으니 되살릴 수 있습니다.
```bash
git restore guide.md README.md README.template.md AGENTS.md GEMINI.md .github
```

**Q2. TypeScript로 만들어 버렸어요 (`.tsx`, `tsconfig.json` 파일이 보여요).**
→ 이번 실습은 JavaScript로 진행합니다. 생성된 파일을 모두 지우고 다시 실행하세요.
```bash
git clean -fd
git restore .
npm create vite@latest .
```
> `git clean -fd`는 Git이 추적하지 않는 새 파일을 모두 지웁니다. 아직 커밋 전이라 Vite가 만든 파일만 지워집니다.

**Q3. `npm run dev`를 했더니 `vite: command not found`가 나와요.**
→ `npm install`을 먼저 실행했는지 확인하세요. (`Install with npm and start now?`에서 `No`를 골랐다면 직접 설치해야 합니다.)

**Q4. `password`를 넣었는데 "유출되지 않음"으로 나와요.**
→ 대소문자 비교 문제일 가능성이 큽니다. 서버 응답은 **대문자** 해시입니다. 내 해시를 `.toUpperCase()`로 바꿨는지 확인하세요. `password`는 수천만 번 유출된 대표적인 비밀번호라 반드시 "유출됨"이 나와야 정상입니다.

**Q5. 유출 확인 요청이 실패해요 (Network 탭에 빨간 줄).**
→ 브라우저 주소창에 `https://api.pwnedpasswords.com/range/5BAA6`을 직접 열어 보세요. 목록이 보이면 코드 문제, 안 보이면 네트워크(학교망 등) 문제입니다. 네트워크 문제라면 휴대폰 핫스팟으로 확인해 보세요.

**Q6. GitHub Pages에 배포했는데 흰 화면만 나와요.**
→ `vite.config.js`에 `base: './'`를 추가했는지 확인하고, 다시 `npm run build` → `npm run deploy` 하세요.

**Q7. `npm run deploy`에서 `Missing script: "deploy"` 오류가 나요.**
→ `package.json`의 `"scripts"` 안에 `"deploy": "gh-pages -d dist"`를 추가했는지, 앞 줄 끝에 쉼표가 있는지 확인하세요.

---

## [보너스] 다른 컴퓨터(집)에서 이어서 작업하는 법

```bash
git clone https://github.com/<내-GitHub-아이디>/26-w12-password.git
cd 26-w12-password
git checkout dev
npm install
npm run dev
```

> `node_modules`는 `.gitignore`로 제외되어 GitHub에 없습니다. 새 컴퓨터에서는 **항상 `npm install`부터** 하세요. `package.json`에 적힌 목록대로 다시 설치해 줍니다.
