/**
 * 비밀번호 보안 점검, 생성 및 Web Crypto API 암호화 유틸리티
 * 
 * 보안 원칙 준수:
 * 1. 비밀번호 및 전체 해시 console.log 출력 금지
 * 2. 비밀번호를 localStorage/sessionStorage에 저장하지 않음
 * 3. HIBP API에는 SHA-1 앞 5글자만 전송 (k-익명성)
 * 4. Math.random() 대신 window.crypto.getRandomValues() 사용
 */

const CHARSETS = {
  uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  lowercase: 'abcdefghijklmnopqrstuvwxyz',
  numbers: '0123456789',
  symbols: '!@#$%^&*()_+-=[]{}|;:,.<>?',
};

/**
 * 문자열의 SHA-1 해시를 계산하여 대문자 16진수 문자열로 반환
 * @param {string} text
 * @returns {Promise<string>} 40자리의 대문자 SHA-1 해시
 */
export async function computeSha1Hex(text) {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const hashBuffer = await window.crypto.subtle.digest('SHA-1', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
    .toUpperCase();
}

/**
 * Have I Been Pwned API를 사용한 k-익명성 기반 유출 검사
 * - 앞 5글자만 외부 서버로 전송
 * - Add-Padding: true 헤더 적용
 * - 유출 횟수가 0인 패딩 항목 필터링
 * - 브라우저 내부에서 뒤 35글자 대문자 대조
 * @param {string} password 
 * @returns {Promise<{ prefix: string, requestUrl: string, isPwned: boolean, leakCount: number }>}
 */
export async function checkPasswordLeak(password) {
  if (!password) {
    throw new Error('비밀번호를 입력해 주세요.');
  }

  // 브라우저 내부에서만 SHA-1 계산
  const fullHash = await computeSha1Hex(password);
  const prefix = fullHash.slice(0, 5);
  const suffix = fullHash.slice(5);

  const requestUrl = `https://api.pwnedpasswords.com/range/${prefix}`;

  const response = await fetch(requestUrl, {
    method: 'GET',
    headers: {
      'Add-Padding': 'true',
    },
  });

  if (!response.ok) {
    throw new Error(`유출 확인 서버 응답 오류 (상태 코드: ${response.status})`);
  }

  const responseText = await response.text();
  const lines = responseText.split('\n');

  let leakCount = 0;

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) continue;

    const [hashSuffix, countStr] = line.split(':');
    if (!hashSuffix || !countStr) continue;

    const count = parseInt(countStr, 10);

    // Add-Padding으로 채워진 가짜 항목(count === 0)은 무시
    if (isNaN(count) || count === 0) {
      continue;
    }

    // 서버 응답과 내 해시의 뒤 35자리를 대문자로 비교
    if (hashSuffix.toUpperCase() === suffix) {
      leakCount = count;
      break;
    }
  }

  return {
    prefix,
    requestUrl,
    isPwned: leakCount > 0,
    leakCount,
  };
}

/**
 * 비밀번호 강도 실시간 분석
 * @param {string} password
 * @returns {{
 *   score: number,
 *   level: '매우 약함' | '약함' | '보통' | '강함',
 *   color: string,
 *   percent: number,
 *   tips: string[],
 *   checks: {
 *     length8: boolean,
 *     length12: boolean,
 *     hasLower: boolean,
 *     hasUpper: boolean,
 *     hasNumber: boolean,
 *     hasSymbol: boolean,
 *     noRepeat: boolean,
 *     noCommonPattern: boolean
 *   }
 * }}
 */
export function evaluatePasswordStrength(password) {
  if (!password) {
    return {
      score: 0,
      level: '매우 약함',
      color: '#94a3b8',
      percent: 0,
      tips: ['비밀번호를 입력하면 실시간으로 강도를 분석합니다.'],
      checks: {
        length8: false,
        length12: false,
        hasLower: false,
        hasUpper: false,
        hasNumber: false,
        hasSymbol: false,
        noRepeat: true,
        noCommonPattern: true,
      },
    };
  }

  const length8 = password.length >= 8;
  const length12 = password.length >= 12;
  const hasLower = /[a-z]/.test(password);
  const hasUpper = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSymbol = /[^a-zA-Z0-9]/.test(password);

  // 동일 문자 3회 이상 연속 반복 검사 (예: aaa, 111)
  const hasRepeat = /(.)\1{2,}/.test(password);
  const noRepeat = !hasRepeat;

  // 흔한 키보드 및 단어 패턴 감점 검사 (대소문자 무시)
  const lower = password.toLowerCase();
  const commonPatterns = [
    'password',
    '1234',
    '2345',
    '3456',
    '4567',
    '5678',
    '6789',
    '7890',
    '0123',
    'qwer',
    'asdf',
    'zxcv',
    'qwerty',
    'admin',
    'welcome',
    'test',
  ];
  const hasCommonPattern = commonPatterns.some((pattern) => lower.includes(pattern));
  const noCommonPattern = !hasCommonPattern;

  const tips = [];

  if (!length8) {
    tips.push('최소 8자 이상으로 늘려주세요. (권장: 12자 이상)');
  } else if (!length12) {
    tips.push('12자 이상으로 늘리면 무차별 대입 공격에 훨씬 안전합니다.');
  }

  if (!hasLower) tips.push('영문 소문자(a-z)를 최소 1자 이상 포함해 주세요.');
  if (!hasUpper) tips.push('영문 대문자(A-Z)를 최소 1자 이상 포함해 주세요.');
  if (!hasNumber) tips.push('숫자(0-9)를 최소 1자 이상 포함해 주세요.');
  if (!hasSymbol) tips.push('특수문자(!@#$%^&* 등)를 최소 1자 이상 포함해 주세요.');
  if (hasCommonPattern) tips.push('연속 키보드 패턴이나 흔한 단어(1234, qwer, password 등)는 피하세요.');
  if (hasRepeat) tips.push('동일한 문자가 3회 이상 반복되지 않도록 해 주세요.');

  // 점수 산정 로직
  let score = 0;
  if (length8) score += 1;
  if (length12) score += 1;
  if (hasLower) score += 1;
  if (hasUpper) score += 1;
  if (hasNumber) score += 1;
  if (hasSymbol) score += 1;

  // 감점 처리
  if (hasCommonPattern) score = Math.max(0, score - 2);
  if (hasRepeat) score = Math.max(0, score - 1);
  if (!length8) score = Math.min(score, 1);

  // 문자 종류 개수 계산 (소문자, 대문자, 숫자, 특수문자)
  const charTypeCount = [hasLower, hasUpper, hasNumber, hasSymbol].filter(Boolean).length;
  if (charTypeCount <= 1 && length8) {
    score = Math.min(score, 2);
  }

  let level = '매우 약함';
  let color = '#ef4444'; // red-500
  let percent = 20;

  if (score <= 1 || !length8) {
    level = '매우 약함';
    color = '#ef4444';
    percent = Math.min(25, Math.max(10, password.length * 3));
  } else if (score === 2 || score === 3) {
    level = '약함';
    color = '#f97316'; // orange-500
    percent = 50;
  } else if (score === 4 || score === 5) {
    level = '보통';
    color = '#3b82f6'; // blue-500
    percent = 75;
  } else {
    level = '강함';
    color = '#10b981'; // emerald-500
    percent = 100;
  }

  if (tips.length === 0) {
    tips.push('모든 보안 기준을 만족하는 매우 안전하고 강력한 비밀번호입니다! 👍');
  }

  return {
    score,
    level,
    color,
    percent,
    tips,
    checks: {
      length8,
      length12,
      hasLower,
      hasUpper,
      hasNumber,
      hasSymbol,
      noRepeat,
      noCommonPattern,
    },
  };
}

/**
 * crypto.getRandomValues()를 사용해 바이어스 없이 안전한 난수 문자를 선택
 * @param {string} charset
 * @returns {string}
 */
function getRandomChar(charset) {
  const len = charset.length;
  const maxValid = 256 - (256 % len);
  const randomBytes = new Uint8Array(1);

  while (true) {
    window.crypto.getRandomValues(randomBytes);
    if (randomBytes[0] < maxValid) {
      return charset[randomBytes[0] % len];
    }
  }
}

/**
 * crypto.getRandomValues()를 사용한 안전한 Fisher-Yates 셔플
 * @param {string[]} array
 * @returns {string[]}
 */
function secureShuffle(array) {
  const shuffled = [...array];
  const randomValues = new Uint32Array(shuffled.length);

  for (let i = shuffled.length - 1; i > 0; i--) {
    const range = i + 1;
    const maxValid = 0x100000000 - (0x100000000 % range);
    let r = 0;

    while (true) {
      window.crypto.getRandomValues(randomValues.subarray(0, 1));
      if (randomValues[0] < maxValid) {
        r = randomValues[0] % range;
        break;
      }
    }

    [shuffled[i], shuffled[r]] = [shuffled[r], shuffled[i]];
  }

  return shuffled;
}

/**
 * 안전한 비밀번호 생성기
 * Math.random()은 절대 사용하지 않고 오직 window.crypto.getRandomValues()만 사용
 * @param {{
 *   length: number,
 *   uppercase: boolean,
 *   lowercase: boolean,
 *   numbers: boolean,
 *   symbols: boolean
 * }} options
 * @returns {string}
 */
export function generateSecurePassword({
  length = 16,
  uppercase = true,
  lowercase = true,
  numbers = true,
  symbols = true,
}) {
  const selectedCategories = [];

  if (uppercase) selectedCategories.push(CHARSETS.uppercase);
  if (lowercase) selectedCategories.push(CHARSETS.lowercase);
  if (numbers) selectedCategories.push(CHARSETS.numbers);
  if (symbols) selectedCategories.push(CHARSETS.symbols);

  if (selectedCategories.length === 0) {
    throw new Error('최소 1개 이상의 문자 종류를 선택해야 합니다.');
  }

  const allChars = selectedCategories.join('');
  const passwordChars = [];

  // 각 선택된 카테고리에서 최소 1자씩 보장
  for (const category of selectedCategories) {
    passwordChars.push(getRandomChar(category));
  }

  // 나머지 길이만큼 전체 문자 집합에서 난수 추출
  while (passwordChars.length < length) {
    passwordChars.push(getRandomChar(allChars));
  }

  // 난수 셔플로 카테고리 고정 순서 제거
  const shuffled = secureShuffle(passwordChars);
  return shuffled.join('');
}

/**
 * ArrayBuffer를 Base64 문자열로 변환
 * @param {ArrayBuffer} buffer
 * @returns {string}
 */
function bufferToBase64(buffer) {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}

/**
 * Base64 문자열을 Uint8Array로 변환
 * @param {string} base64
 * @returns {Uint8Array}
 */
function base64ToUint8Array(base64) {
  const binary = window.atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

/**
 * PBKDF2를 통해 마스터 비밀번호로부터 AES-GCM 키 파생
 * @param {string} masterPassword 
 * @param {Uint8Array} salt 
 * @returns {Promise<CryptoKey>}
 */
async function deriveVaultKey(masterPassword, salt) {
  const encoder = new TextEncoder();
  const passwordBuffer = encoder.encode(masterPassword);

  const baseKey = await window.crypto.subtle.importKey(
    'raw',
    passwordBuffer,
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );

  return window.crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt,
      iterations: 100000,
      hash: 'SHA-256',
    },
    baseKey,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

/**
 * AES-GCM으로 메모 내용 암호화 (Salt + IV + Ciphertext 결합 후 Base64 반환)
 * @param {string} plainText 
 * @param {string} masterPassword 
 * @returns {Promise<string>} Base64 인코딩된 암호화 페이로드
 */
export async function encryptVaultData(plainText, masterPassword) {
  if (!plainText || !masterPassword) {
    throw new Error('암호화할 메모 내용과 마스터 비밀번호를 모두 입력해 주세요.');
  }

  const salt = new Uint8Array(16);
  window.crypto.getRandomValues(salt);

  const iv = new Uint8Array(12);
  window.crypto.getRandomValues(iv);

  const key = await deriveVaultKey(masterPassword, salt);
  const encoder = new TextEncoder();
  const data = encoder.encode(plainText);

  const ciphertextBuffer = await window.crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    data
  );

  const ciphertext = new Uint8Array(ciphertextBuffer);

  // 패키징: [16 bytes Salt] + [12 bytes IV] + [Ciphertext + 16 bytes AuthTag]
  const combined = new Uint8Array(salt.length + iv.length + ciphertext.length);
  combined.set(salt, 0);
  combined.set(iv, salt.length);
  combined.set(ciphertext, salt.length + iv.length);

  return bufferToBase64(combined.buffer);
}

/**
 * Base64 암호화 페이로드를 마스터 비밀번호로 복호화
 * @param {string} base64Payload 
 * @param {string} masterPassword 
 * @returns {Promise<string>} 복호화된 평문
 */
export async function decryptVaultData(base64Payload, masterPassword) {
  if (!base64Payload || !masterPassword) {
    throw new Error('복호화할 암호문과 마스터 비밀번호를 모두 입력해 주세요.');
  }

  let combined;
  try {
    combined = base64ToUint8Array(base64Payload.trim());
  } catch {
    throw new Error('올바르지 않은 Base64 암호문 형식입니다.');
  }

  if (combined.length < 16 + 12 + 16) {
    throw new Error('암호화 데이터가 손상되었거나 길이가 유효하지 않습니다.');
  }

  const salt = combined.slice(0, 16);
  const iv = combined.slice(16, 28);
  const ciphertext = combined.slice(28);

  try {
    const key = await deriveVaultKey(masterPassword, salt);
    const decryptedBuffer = await window.crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      key,
      ciphertext
    );

    const decoder = new TextDecoder();
    return decoder.decode(decryptedBuffer);
  } catch {
    throw new Error('복호화 실패: 마스터 비밀번호가 일치하지 않거나 데이터가 변조되었습니다.');
  }
}
