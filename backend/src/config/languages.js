// backend/src/config/languages.js
// All supported languages for STT and translation

export const LANGUAGES = {
  // ── Indian languages ──────────────────────────────────────────
  hi:    { name: 'Hindi',      native: 'हिन्दी',      region: 'India', stt: 'hi-IN', flag: '🇮🇳' },
  bn:    { name: 'Bengali',    native: 'বাংলা',        region: 'India/Bangladesh', stt: 'bn-IN', flag: '🇮🇳' },
  te:    { name: 'Telugu',     native: 'తెలుగు',       region: 'India', stt: 'te-IN', flag: '🇮🇳' },
  mr:    { name: 'Marathi',    native: 'मराठी',        region: 'India', stt: 'mr-IN', flag: '🇮🇳' },
  ta:    { name: 'Tamil',      native: 'தமிழ்',        region: 'India/Sri Lanka', stt: 'ta-IN', flag: '🇮🇳' },
  ur:    { name: 'Urdu',       native: 'اردو',         region: 'India/Pakistan', stt: 'ur-IN', flag: '🇮🇳' },
  gu:    { name: 'Gujarati',   native: 'ગુજરાતી',      region: 'India', stt: 'gu-IN', flag: '🇮🇳' },
  kn:    { name: 'Kannada',    native: 'ಕನ್ನಡ',        region: 'India', stt: 'kn-IN', flag: '🇮🇳' },
  ml:    { name: 'Malayalam',  native: 'മലയാളം',       region: 'India', stt: 'ml-IN', flag: '🇮🇳' },
  pa:    { name: 'Punjabi',    native: 'ਪੰਜਾਬੀ',       region: 'India', stt: 'pa-IN', flag: '🇮🇳' },
  or:    { name: 'Odia',       native: 'ଓଡ଼ିଆ',        region: 'India', stt: 'or-IN', flag: '🇮🇳' },
  as:    { name: 'Assamese',   native: 'অসমীয়া',      region: 'India', stt: 'as-IN', flag: '🇮🇳' },
  mai:   { name: 'Maithili',   native: 'मैथिली',       region: 'India', stt: 'mai-IN', flag: '🇮🇳' },
  sat:   { name: 'Santali',    native: 'ᱥᱟᱱᱛᱟᱲᱤ',      region: 'India', stt: 'sat-IN', flag: '🇮🇳' },
  ks:    { name: 'Kashmiri',   native: 'کٲشُر',        region: 'India', stt: 'ks-IN', flag: '🇮🇳' },
  ne:    { name: 'Nepali',     native: 'नेपाली',       region: 'India/Nepal', stt: 'ne-IN', flag: '🇳🇵' },
  si:    { name: 'Sinhala',    native: 'සිංහල',        region: 'Sri Lanka', stt: 'si-LK', flag: '🇱🇰' },

  // ── Middle East ───────────────────────────────────────────────
  ar:    { name: 'Arabic',     native: 'العربية',      region: 'Middle East', stt: 'ar-SA', flag: '🇸🇦' },
  fa:    { name: 'Persian',    native: 'فارسی',        region: 'Iran', stt: 'fa-IR', flag: '🇮🇷' },
  tr:    { name: 'Turkish',    native: 'Türkçe',       region: 'Turkey', stt: 'tr-TR', flag: '🇹🇷' },
  he:    { name: 'Hebrew',     native: 'עברית',        region: 'Israel', stt: 'he-IL', flag: '🇮🇱' },
  ku:    { name: 'Kurdish',    native: 'Kurdî',        region: 'Middle East', stt: 'ku', flag: '🏳️' },

  // ── Asian ─────────────────────────────────────────────────────
  zh:    { name: 'Chinese (Mandarin)', native: '中文',  region: 'China', stt: 'zh-CN', flag: '🇨🇳' },
  'zh-TW': { name: 'Chinese (Traditional)', native: '繁體中文', region: 'Taiwan', stt: 'zh-TW', flag: '🇹🇼' },
  ja:    { name: 'Japanese',   native: '日本語',        region: 'Japan', stt: 'ja-JP', flag: '🇯🇵' },
  ko:    { name: 'Korean',     native: '한국어',        region: 'Korea', stt: 'ko-KR', flag: '🇰🇷' },
  vi:    { name: 'Vietnamese', native: 'Tiếng Việt',   region: 'Vietnam', stt: 'vi-VN', flag: '🇻🇳' },
  th:    { name: 'Thai',       native: 'ภาษาไทย',      region: 'Thailand', stt: 'th-TH', flag: '🇹🇭' },
  id:    { name: 'Indonesian', native: 'Bahasa Indonesia', region: 'Indonesia', stt: 'id-ID', flag: '🇮🇩' },
  ms:    { name: 'Malay',      native: 'Bahasa Melayu', region: 'Malaysia', stt: 'ms-MY', flag: '🇲🇾' },
  tl:    { name: 'Filipino',   native: 'Filipino',     region: 'Philippines', stt: 'fil-PH', flag: '🇵🇭' },
  my:    { name: 'Burmese',    native: 'မြန်မာဘာသာ',   region: 'Myanmar', stt: 'my-MM', flag: '🇲🇲' },
  km:    { name: 'Khmer',      native: 'ខ្មែរ',         region: 'Cambodia', stt: 'km-KH', flag: '🇰🇭' },
  lo:    { name: 'Lao',        native: 'ລາວ',           region: 'Laos', stt: 'lo-LA', flag: '🇱🇦' },

  // ── European ──────────────────────────────────────────────────
  en:    { name: 'English',    native: 'English',      region: 'Global', stt: 'en-US', flag: '🌐' },
  fr:    { name: 'French',     native: 'Français',     region: 'France', stt: 'fr-FR', flag: '🇫🇷' },
  de:    { name: 'German',     native: 'Deutsch',      region: 'Germany', stt: 'de-DE', flag: '🇩🇪' },
  es:    { name: 'Spanish',    native: 'Español',      region: 'Spain/LATAM', stt: 'es-ES', flag: '🇪🇸' },
  pt:    { name: 'Portuguese', native: 'Português',    region: 'Portugal/Brazil', stt: 'pt-PT', flag: '🇵🇹' },
  it:    { name: 'Italian',    native: 'Italiano',     region: 'Italy', stt: 'it-IT', flag: '🇮🇹' },
  ru:    { name: 'Russian',    native: 'Русский',      region: 'Russia', stt: 'ru-RU', flag: '🇷🇺' },
  pl:    { name: 'Polish',     native: 'Polski',       region: 'Poland', stt: 'pl-PL', flag: '🇵🇱' },
  nl:    { name: 'Dutch',      native: 'Nederlands',   region: 'Netherlands', stt: 'nl-NL', flag: '🇳🇱' },
  sv:    { name: 'Swedish',    native: 'Svenska',      region: 'Sweden', stt: 'sv-SE', flag: '🇸🇪' },
  no:    { name: 'Norwegian',  native: 'Norsk',        region: 'Norway', stt: 'no-NO', flag: '🇳🇴' },
  da:    { name: 'Danish',     native: 'Dansk',        region: 'Denmark', stt: 'da-DK', flag: '🇩🇰' },
  fi:    { name: 'Finnish',    native: 'Suomi',        region: 'Finland', stt: 'fi-FI', flag: '🇫🇮' },
  cs:    { name: 'Czech',      native: 'Čeština',      region: 'Czech Republic', stt: 'cs-CZ', flag: '🇨🇿' },
  sk:    { name: 'Slovak',     native: 'Slovenčina',   region: 'Slovakia', stt: 'sk-SK', flag: '🇸🇰' },
  ro:    { name: 'Romanian',   native: 'Română',       region: 'Romania', stt: 'ro-RO', flag: '🇷🇴' },
  hu:    { name: 'Hungarian',  native: 'Magyar',       region: 'Hungary', stt: 'hu-HU', flag: '🇭🇺' },
  uk:    { name: 'Ukrainian',  native: 'Українська',   region: 'Ukraine', stt: 'uk-UA', flag: '🇺🇦' },
  el:    { name: 'Greek',      native: 'Ελληνικά',     region: 'Greece', stt: 'el-GR', flag: '🇬🇷' },
  bg:    { name: 'Bulgarian',  native: 'Български',    region: 'Bulgaria', stt: 'bg-BG', flag: '🇧🇬' },
  hr:    { name: 'Croatian',   native: 'Hrvatski',     region: 'Croatia', stt: 'hr-HR', flag: '🇭🇷' },
  sr:    { name: 'Serbian',    native: 'Српски',       region: 'Serbia', stt: 'sr-RS', flag: '🇷🇸' },
  ca:    { name: 'Catalan',    native: 'Català',       region: 'Spain', stt: 'ca-ES', flag: '🇪🇸' },

  // ── African ───────────────────────────────────────────────────
  sw:    { name: 'Swahili',    native: 'Kiswahili',    region: 'East Africa', stt: 'sw-KE', flag: '🇰🇪' },
  am:    { name: 'Amharic',    native: 'አማርኛ',        region: 'Ethiopia', stt: 'am-ET', flag: '🇪🇹' },
  yo:    { name: 'Yoruba',     native: 'Yorùbá',       region: 'Nigeria', stt: 'yo-NG', flag: '🇳🇬' },
  ig:    { name: 'Igbo',       native: 'Asụsụ Igbo',   region: 'Nigeria', stt: 'ig-NG', flag: '🇳🇬' },
  ha:    { name: 'Hausa',      native: 'Harshen Hausa', region: 'Nigeria/Niger', stt: 'ha-NG', flag: '🇳🇬' },
  af:    { name: 'Afrikaans',  native: 'Afrikaans',    region: 'South Africa', stt: 'af-ZA', flag: '🇿🇦' },
  zu:    { name: 'Zulu',       native: 'isiZulu',      region: 'South Africa', stt: 'zu-ZA', flag: '🇿🇦' },
  xh:    { name: 'Xhosa',      native: 'isiXhosa',     region: 'South Africa', stt: 'xh-ZA', flag: '🇿🇦' },
  so:    { name: 'Somali',     native: 'Soomaali',     region: 'Somalia', stt: 'so-SO', flag: '🇸🇴' },

  // ── Americas ──────────────────────────────────────────────────
  'es-MX': { name: 'Spanish (Mexico)', native: 'Español (México)', region: 'Mexico', stt: 'es-MX', flag: '🇲🇽' },
  'pt-BR': { name: 'Portuguese (Brazil)', native: 'Português (Brasil)', region: 'Brazil', stt: 'pt-BR', flag: '🇧🇷' },
  'en-GB': { name: 'English (UK)',   native: 'English (UK)',      region: 'United Kingdom', stt: 'en-GB', flag: '🇬🇧' },
  'en-AU': { name: 'English (AUS)',  native: 'English (Australia)', region: 'Australia', stt: 'en-AU', flag: '🇦🇺' },
  'en-IN': { name: 'English (India)', native: 'English (India)',  region: 'India', stt: 'en-IN', flag: '🇮🇳' },
  ht:    { name: 'Haitian Creole', native: 'Kreyòl ayisyen',     region: 'Haiti', stt: 'ht-HT', flag: '🇭🇹' },
};

export const LANGUAGE_GROUPS = {
  'Indian Languages': ['hi','bn','te','mr','ta','ur','gu','kn','ml','pa','or','as','mai','ne','si','en-IN'],
  'Middle East':      ['ar','fa','tr','he','ku'],
  'East Asian':       ['zh','zh-TW','ja','ko'],
  'Southeast Asian':  ['vi','th','id','ms','tl','my','km','lo'],
  'European':         ['en','en-GB','en-AU','fr','de','es','pt','it','ru','pl','nl','sv','no','da','fi','cs','sk','ro','hu','uk','el','bg','hr','sr','ca'],
  'African':          ['sw','am','yo','ig','ha','af','zu','xh','so'],
  'Americas':         ['es-MX','pt-BR','ht'],
};

export function getLanguage(code) {
  return LANGUAGES[code] || { name: code, native: code, region: 'Unknown', stt: code, flag: '🌐' };
}

export function getSTTCode(langCode) {
  return LANGUAGES[langCode]?.stt || langCode;
}
