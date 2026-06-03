import { C } from './tokens';

export const LOADING_STEPS = {
  text: [
    { t: 700,  label: 'Parsing input',              detail: 'Tokenising 312 words, detecting language…' },
    { t: 1000, label: 'Running classifier',         detail: 'Forward pass through fine-tuned model.' },
    { t: 1100, label: 'Cross-checking sources',     detail: 'Querying Tengrinews, Informburo, Orda…' },
    { t: 900,  label: 'Scoring linguistic signals', detail: 'Urgency cues, hedging, entity density.' },
    { t: 800,  label: 'Composing verdict',          detail: 'Reconciling model output with retrieval.' },
  ],
  url: [
    { t: 800,  label: 'Fetching source URL',          detail: 'Resolving redirects · 1 hop.' },
    { t: 900,  label: 'Extracting post content',      detail: 'Caption, account metadata, media.' },
    { t: 1100, label: 'Sampling 1,247 comments',      detail: 'Pulling first 1,247 of 1,247 replies.' },
    { t: 900,  label: 'Scanning commenter behaviour', detail: 'Account-age and posting-pattern features.' },
    { t: 800,  label: 'Cross-checking sources',       detail: 'Querying Kazakhstani outlets.' },
    { t: 700,  label: 'Composing verdict',            detail: 'Combining ML, retrieval, and behaviour.' },
  ],
  claim: [
    { t: 800,  label: 'Parsing the claim',            detail: 'Extracting entities and predicates.' },
    { t: 1000, label: 'Retrieving related coverage',  detail: 'Searching 5 Kazakh news indices.' },
    { t: 1200, label: 'Reading 14 candidate articles', detail: 'Skimming for relevance to the claim.' },
    { t: 1000, label: 'Labelling each source',        detail: 'Supports · Contradicts · Unrelated.' },
    { t: 700,  label: 'Sorting by relevance',         detail: 'Ranking by recency and authority.' },
  ],
  deep: [
    { t: 1200, label: 'Fetching source URL',          detail: 'Resolving and validating the link.' },
    { t: 1300, label: 'Extracting post & account',    detail: 'Profile, follower graph snapshot, bio.' },
    { t: 1500, label: 'Sampling 1,247 comments',      detail: 'Pulling commenter accounts and timestamps.' },
    { t: 1700, label: 'Profiling 412 commenters',     detail: 'Age, posting cadence, network features.' },
    { t: 1500, label: 'Scoring follower : following', detail: 'Comparing against baseline distributions.' },
    { t: 1500, label: 'Measuring topic consistency',  detail: 'Topic-model over last 90 days of posts.' },
    { t: 1500, label: 'Detecting amplification',      detail: 'Clustering comment timing and language.' },
    { t: 1400, label: 'Cross-checking sources',       detail: 'Has this account ever cited a verified outlet?' },
    { t: 1200, label: 'Composing inspection report',  detail: 'Reconciling six signals into a score.' },
  ],
};

export const SAMPLE_TEXT =
  'СРОЧНО!!! Власти скрывают: новая вакцина, которую ввели в Казахстане в прошлом месяце, содержит микрочипы — это уже подтвердили независимые эксперты из Европы. Министерство здравоохранения молчит, но врачи в Алматы и Астане массово увольняются. Поделитесь, пока не удалили!!!';

export const SAMPLE_SOURCES = [
  {
    name: 'Tengrinews.kz',
    kind: 'contradict',
    snippet: 'Минздрав РК официально опроверг информацию о наличии посторонних компонентов в вакцинах, поставляемых в страну.',
    label: 'Contradicts',
    color: C.fake,
  },
  {
    name: 'Informburo.kz',
    kind: 'contradict',
    snippet: 'Эксперты ВОЗ и казахстанские специалисты подтвердили: ни одна из применяемых вакцин не содержит электронных компонентов.',
    label: 'Contradicts',
    color: C.fake,
  },
  {
    name: 'Orda.kz',
    kind: 'notcovered',
    snippet: 'В архивах за указанный период не обнаружено публикаций о массовых увольнениях врачей в Алматы и Астане.',
    label: 'Not covered',
    color: C.inkFaint,
  },
];

export const CLAIM_SOURCES = [
  {
    name: 'Tengrinews.kz',
    kind: 'contradict',
    title: 'Минздрав РК прокомментировал слухи о составе вакцин',
    snippet: 'Официальное заявление министерства напрямую опровергает утверждение о наличии микрочипов в любой вакцине, используемой в стране.',
    label: 'Contradicts',
    color: C.fake,
    date: '08 May 2026',
  },
  {
    name: 'Informburo.kz',
    kind: 'contradict',
    title: 'Фактчек: миф о «вакцине с микрочипами» снова распространяется в мессенджерах',
    snippet: 'Расследование издания подробно разбирает источник слуха и подтверждает, что заявление не соответствует действительности.',
    label: 'Contradicts',
    color: C.fake,
    date: '11 May 2026',
  },
  {
    name: 'Orda.kz',
    kind: 'notcovered',
    title: 'Поиск по архиву: «массовое увольнение врачей»',
    snippet: 'За последние 90 дней публикаций о массовых увольнениях врачей в Алматы или Астане не найдено. Тема не упоминается.',
    label: 'Unrelated',
    color: C.inkFaint,
    date: '—',
  },
  {
    name: 'Vlast.kz',
    kind: 'support',
    title: 'Региональная статистика медицинских кадров за апрель',
    snippet: 'Зафиксирован естественный отток специалистов в частный сектор (3.2%), что соответствует средним показателям прошлых лет.',
    label: 'Tangential',
    color: C.amber,
    date: '02 May 2026',
  },
];

export const SIGNALS = [
  { name: 'Account age',          detail: '63 days since creation',           value: '63 days',  color: C.fake  },
  { name: 'Total posts',          detail: '912 posts — 14.5 per day avg.',    value: 'Elevated', color: C.amber },
  { name: 'Follower : following', detail: '12,408 : 41 (302 : 1)',            value: 'Unusual',  color: C.amber },
  { name: 'Topic consistency',    detail: 'Spans politics, health, crime',    value: 'Low',      color: C.fake  },
  { name: 'Bot commenter rate',   detail: '38% of recent commenters flagged', value: '38%',      color: C.fake  },
  { name: 'Source verification',  detail: 'No links to verifiable outlets',   value: 'None',     color: C.fake  },
];

export const SEED_HISTORY = [
  {
    id: 'h-001',
    kind: 'deep',
    ts: Date.now() - 1000 * 60 * 12,
    preview: 't.me/almaty_news_unofficial/8421',
    verdict: 'low',
    score: 23,
    detail: 'Account behind viral vaccine post',
  },
  {
    id: 'h-002',
    kind: 'claim',
    ts: Date.now() - 1000 * 60 * 47,
    preview: 'Новая вакцина в Казахстане содержит микрочипы…',
    verdict: 'fake',
    confidence: 94,
    detail: '4 sources matched, 2 contradict',
  },
  {
    id: 'h-003',
    kind: 'text',
    ts: Date.now() - 1000 * 60 * 60 * 3,
    preview: 'Министерство финансов опубликовало новые правила…',
    verdict: 'real',
    confidence: 87,
    detail: 'All three outlets corroborate',
  },
  {
    id: 'h-004',
    kind: 'url',
    ts: Date.now() - 1000 * 60 * 60 * 20,
    preview: 'instagram.com/p/CzX9hQrIPpL/',
    verdict: 'mixed',
    confidence: 58,
    detail: 'Caption accurate, comments amplified',
  },
  {
    id: 'h-005',
    kind: 'text',
    ts: Date.now() - 1000 * 60 * 60 * 26,
    preview: 'Курс тенге к доллару рухнул до 750 за ночь после…',
    verdict: 'fake',
    confidence: 96,
    detail: 'Fabricated quote, no source confirms',
  },
];

export const KIND_META = {
  text:  { label: 'Text analysis', short: 'TEXT'  },
  url:   { label: 'URL check',     short: 'URL'   },
  claim: { label: 'Claim verify',  short: 'CLAIM' },
  deep:  { label: 'Deep inspect',  short: 'DEEP'  },
};

export const VERDICT_META = {
  fake:      { label: 'Likely fake',        color: C.fake     },
  real:      { label: 'Likely real',        color: C.real     },
  mixed:     { label: 'Mixed evidence',     color: C.amber    },
  uncertain: { label: 'Inconclusive',       color: C.inkFaint },
  low:       { label: 'Low credibility',    color: C.fake     },
  medium:    { label: 'Medium credibility', color: C.amber    },
  high:      { label: 'High credibility',   color: C.real     },
};
