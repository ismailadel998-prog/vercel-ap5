/**
 * Answer key, roster, and marking logic.
 * Ported from Code.gs — all grading stays server-side.
 */

const WORKSHEET_TITLE = 'Additional Practice · Pages 27–28, 31–34';
const TEACHER_PIN = '1234';

const KEY = {
  'L1-1':  { a: '3', b: '61', c: '61000' },
  'L1-2':  { p1: '75', p2: '750', p3: '7500', p4: '75000', p5: '750000' },
  'L1-3':  { p1: '50', p2: '500', p3: '5000', p4: '50000', p5: '500000' },
  'L1-4':  { p1: '60', p2: '600', p3: '6000', p4: '60000', p5: '600000' },
  'L1-5':  { p1: '18', p2: '180', p3: '1800', p4: '18000', p5: '180000' },
  'L1-6':  { a: '8400' }, 'L1-7': { a: '900' }, 'L1-8': { a: '5400' },
  'L1-9':  { a: '12000' }, 'L1-10': { a: '45000' },
  'L1-11': { a: '1296' }, 'L1-12': { a: '4' }, 'L1-13': { a: '300000' },
  'L1-14': { a: '2' }, 'L1-15': { a: '3' },
  'L1-16': { c: 'Yes' }, 'L1-17': { a: '85000' }, 'L1-18': { a: '42400' },
  'L1-19': { c: '87' }, 'L1-20': { a: '14' }, 'L1-21': { c: 'B' },
  'L1-22': { m: ['0', '3', '4'] },
  'L3-1':  { d: '39' }, 'L3-2': { d: '119' }, 'L3-3': { d: '2223' }, 'L3-4': { d: '1761' },
  'L3-5':  { a: '2478' }, 'L3-6': { a: '3750' }, 'L3-7': { a: '180' }, 'L3-8': { a: '6579' },
  'L3-9':  { a: '440' }, 'L3-10': { a: '416' }, 'L3-11': { a: '1056' }, 'L3-12': { a: '795' },
  'L3-13': { a: '820' }, 'L3-14': { a: '152' }, 'L3-15': { a: '956' }, 'L3-16': { a: '6034' },
  'L3-17': { a: '60' }, 'L3-18': { a: '42' }, 'L3-19': { a: '450' }, 'L3-20': { a: '380' },
  'L3-21': { a: '20246', b: '40246' }, 'L3-22': { c: 'tens' }, 'L3-23': { c: 'No' },
  'L3-24': { c: 'Tyrone' }, 'L3-25': { a: '4557' }, 'L3-26': { a: '13866' },
  'L4-1':  { d: '10836468' }, 'L4-2': { d: '8534425' },
  'L4-3':  { a: '2816' }, 'L4-4': { a: '2544' }, 'L4-5': { a: '1386' }, 'L4-6': { a: '1809' },
  'L4-7':  { a: '2278' }, 'L4-8': { a: '4186' }, 'L4-9': { a: '1736' }, 'L4-10': { a: '3819' },
  'L4-11': { a: '1350' }, 'L4-12': { a: '735' }, 'L4-13': { a: '782' }, 'L4-14': { a: '6912' },
  'L4-15': { c: 'No' }, 'L4-16': { c: 'C' }, 'L4-17': { c: 'C' }
};

const DISPLAY = {
  'L1-1': '3 zeros · 61 · 61,000',
  'L1-2': '75 · 750 · 7,500 · 75,000 · 750,000',
  'L1-3': '50 · 500 · 5,000 · 50,000 · 500,000',
  'L1-4': '60 · 600 · 6,000 · 60,000 · 600,000',
  'L1-5': '18 · 180 · 1,800 · 18,000 · 180,000',
  'L1-12': '10⁴', 'L1-14': '10²', 'L1-15': '10³',
  'L1-16': 'Yes. The roundtrip is 3,300 miles and the free gas lasts 3,500 miles.',
  'L1-17': '85,000 pounds', 'L1-18': '$42,400',
  'L1-19': '87', 'L1-20': '14 pounds', 'L1-21': 'B', 'L1-22': '5 × 10,000 · 50,000 · 50 × 10³',
  'L3-17': '60 mm', 'L3-18': '42 mm', 'L3-19': '450 miles', 'L3-20': '380 miles',
  'L3-21': '20,246 and 40,246', 'L3-22': 'the tens place',
  'L3-23': 'No. 423 × 7 = 2,961', 'L3-24': 'Tyrone (6 × 34 = 204)',
  'L4-1': '108 + 360 = 468', 'L4-2': '85 + 340 = 425',
  'L4-11': '1,350 miles', 'L4-12': '735 pounds', 'L4-13': '782 pounds', 'L4-14': '6,912 square inches',
  'L4-15': 'No. 62 × 22 = 1,364', 'L4-16': 'C', 'L4-17': 'C'
};

const DEFAULT_ROSTER = {
  '5A': [
    'Abdulrahem Mohammad Abdel-Haleem Mohammad Naser','Radwan Mohammad Eyad Albiriss','Hamza Ahmed Bahaa Saleh',
    'Moaaz Ahmed Ragab','Anas Mohammad Jamal Hotheel','Karam Muhanad Mahmoud Abunazzal',
    'Hussien Mohamed Hussien Amin Zekry','Omar Emad Mohamed Elmokaid','Kenan Ameen Shayah',
    'Anas Abdulmaqsoud Yosseri Abdulmaqsoud Hussien','Abdel Majeed Amjed Abed Alhameed Taneenah','Odai Motasem Alchikh Ali',
    'Mohammad Hussein Hafez Abuayyash','Amir Sahuoni','Kareem Ihab Mohammad Abedalla','Youssef Mhd Belal Bachir',
    'Khaled Tariq Salim Alkayyat','Omar Mohammad Almokaddam','Saleh Mohammad Saleh Alsahaf','Tariq Ammar Sedki',
    'Mohammad Rashad Mohammad Leloa','Emomali Gadozoda'
  ],
  '5B': [
    'Ryan Sameh Mohamed Osman','Aws Malek Nayif Manasrah','Sanad Waseem Ibraheem Al Masri',
    'Mohammad Bassam Rabhi Al-Arab','Selim Ahmed Mohamed Elgendy','Abdallah Amro Monther Alassi','Jalal Sheikh Turab',
    'Jawad Sami Mohammad Gharib','Kareem Mohamad Abo Shar','Omar Obada Almadani','Yazan Alhabian','Sulayman Asim',
    'Majdaldeen Ahmed Shabareq','Rayan Rafat Waleed Izzeddin','Yahia Mohamed Hanafy Abdelsalam',
    'Yahia Mohammed Ahmed Abdelrazeq','Mohammad Abdallah Yousef Abedalqader','Mamdouh Turki A Alotaibi',
    'Saud Abdulaziz Safar Alodhayani','Zhenyan Li','Rashid Mustafa Ishaq Abu Adas','Mayar Nawar Alshawaf',
    'Eyad Mohamed Ismail Hamed Mostafa'
  ],
  'Test': ['Test Student']
};

const QIDS = Object.keys(KEY);

function lessonOf(q) { return { L1: '3-1', L3: '3-3', L4: '3-4' }[q.split('-')[0]]; }
function qLabel(q) { return lessonOf(q) + ' · ' + q.split('-')[1]; }
function clean(s) { return String(s == null ? '' : s).trim(); }
function digits(s) { return clean(s).replace(/[^0-9]/g, '').replace(/^0+(?=\d)/, ''); }
function studentKey(name, cls) { return (clean(name) + '|' + clean(cls)).toLowerCase().replace(/\s+/g, ' '); }

function partEmpty(v) {
  if (Array.isArray(v)) return v.length === 0;
  return clean(v).replace(/_/g, '') === '';
}

function partRight(p, key, given) {
  if (Array.isArray(key)) {
    const g = (Array.isArray(given) ? given : []).map(String).sort().join('|');
    return g === key.slice().sort().join('|');
  }
  if (p === 'd') return clean(given).replace(/[^0-9_]/g, '') === key;
  if (/^[0-9]+$/.test(key)) return digits(given) === key;
  return clean(given).toLowerCase() === key.toLowerCase();
}

function markAll(answers) {
  answers = answers || {};
  const out = {};
  QIDS.forEach(q => {
    const a = answers[q] || {}, parts = {};
    let right = true, blank = true;
    Object.keys(KEY[q]).forEach(p => {
      const ok = partRight(p, KEY[q][p], a[p]);
      parts[p] = ok;
      if (!ok) right = false;
      if (!partEmpty(a[p])) blank = false;
    });
    out[q] = { right, blank, parts };
  });
  return out;
}

function givenText(q, a) {
  a = a || {};
  return Object.keys(KEY[q]).map(p => {
    const v = a[p];
    if (Array.isArray(v)) return v.map(x => String.fromCharCode(65 + Number(x))).join('+');
    return clean(v);
  }).filter(Boolean).join(' · ');
}

function writtenText(answers) {
  const out = [];
  QIDS.forEach(q => {
    const t = clean((answers[q] || {}).t);
    if (t) out.push(qLabel(q) + ': ' + t);
  });
  return out.join('\n');
}

function displayFromKey(q) {
  return Object.keys(KEY[q]).map(p => {
    const v = KEY[q][p];
    if (p !== 'd' && /^[0-9]+$/.test(v)) return Number(v).toLocaleString('en-US');
    return String(v);
  }).join(' · ');
}

function mmss(sec) {
  sec = Math.max(0, Math.round(sec));
  return Math.floor(sec / 60) + ':' + ('0' + (sec % 60)).slice(-2);
}

function countAnswered(a) {
  return QIDS.filter(q => Object.keys(KEY[q]).every(p => !partEmpty((a[q] || {})[p]))).length;
}

module.exports = {
  WORKSHEET_TITLE, TEACHER_PIN, KEY, DISPLAY, DEFAULT_ROSTER, QIDS,
  lessonOf, qLabel, clean, digits, studentKey, partEmpty, partRight,
  markAll, givenText, writtenText, displayFromKey, mmss, countAnswered
};
