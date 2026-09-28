/* my.js — 개인 글 만들기 (네이버 FRAME / 스레드 공식)
   기준: naver-frame-prompt, thread-commercial-writing(반응폭발 프롬프트),
   naver-blog-content(hlee047 스타일·납품규칙·오타스캔) */
'use strict';
function switchTab(which) {
  var n = which === 'naver';
  document.getElementById('tabNaver').className = n ? 'on' : '';
  document.getElementById('tabThreads').className = n ? '' : 'on';
  document.getElementById('panel-naver').className = 'panel' + (n ? ' on' : '');
  document.getElementById('panel-threads').className = 'panel' + (n ? '' : ' on');
}
function copyOut(id) {
  var el = document.getElementById(id);
  var t = el.innerText;
  if (!t) return;
  function done(btn) { if (!btn) return; var o = btn.innerText; btn.innerText = '복사됨 ✓'; setTimeout(function () { btn.innerText = o; }, 1200); }
  var btn = el.parentElement ? el.parentElement.querySelector('button[id^="copyBtn"]') : null;
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(t).then(function () { done(btn); }, function () { fallback(); });
  } else fallback();
  function fallback() {
    try {
      var r = document.createRange(); r.selectNodeContents(el);
      var s = window.getSelection(); s.removeAllRanges(); s.addRange(r);
      document.execCommand('copy'); s.removeAllRanges(); done(btn);
    } catch (_e) {
      var ta = document.createElement('textarea'); ta.value = t; document.body.appendChild(ta); ta.select();
      try { document.execCommand('copy'); done(btn); } catch (_e2) {} ta.remove();
    }
  }
}
/* ---------- 히스토리 (localStorage, 탭별 최근 5개) ---------- */
function histGet(key) { try { return JSON.parse(localStorage.getItem(key) || '[]'); } catch (_e) { return []; } }
function histPut(key, entry) {
  var h = histGet(key); h.unshift(entry); h = h.slice(0, 5);
  try { localStorage.setItem(key, JSON.stringify(h)); } catch (_e) {}
  return h;
}
function histRender(key, boxId, onPick) {
  var box = document.getElementById(boxId); if (!box) return;
  var h = histGet(key);
  window[onPick] = function (i) {
    var e = histGet(key)[i]; if (!e) return;
    histPick(key, e);
  };
  box.innerHTML = h.length ? h.map(function (e, i) {
    return '<button onclick="' + onPick + '(' + i + ')" style="text-align:left;border:1px solid var(--line);background:#f8fafc;border-radius:8px;padding:8px 10px;font-size:12px;cursor:pointer;font-family:inherit">'
      + '<b>' + escHtml(e.title) + '</b><br><span style="color:var(--dim)">' + e.time + ' · ' + e.chars + '자</span></button>';
  }).join('') : '<div style="font-size:12px;color:var(--dim)">아직 없음 — 만들면 여기 저장됩니다</div>';
}
function escHtml(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
function nowTime() { var d = new Date(); function p(n) { return (n < 10 ? '0' : '') + n; } return (d.getMonth() + 1) + '/' + d.getDate() + ' ' + p(d.getHours()) + ':' + p(d.getMinutes()); }
/* ---------- 결과 이미지 2장 ---------- */
function renderImgs(boxId, _topic, _kind) {
  var box = document.getElementById(boxId); if (!box) return;
  box.innerHTML = '<div style="font-size:11px;color:var(--dim);padding:8px">이미지 자동생성은 품질 문제로 제거됨 — nano-banana급은 서버 키 없이 불가. 필요하면 별도 요청.</div>';
}
/* ---------- 다운로드 (.txt) ---------- */
function histPick(key, e) {
  if (key === 'myNaverHist') {
    document.getElementById('nTopic').value = e.topic || '';
    document.getElementById('nMemo').value = e.memo || '';
    if (e.faqN) document.getElementById('nFaq').value = String(e.faqN);
    document.getElementById('nOut').innerText = e.text;
    renderChk('nChk', scan(e.text));
    document.getElementById('nMeta').textContent = '공백제외 ' + charCount(e.text) + '자 · 히스토리에서 불러옴 (' + e.time + ')';
    renderImgs('nImgs', e.topic, 'health infographic');
  } else {
    document.getElementById('tMemo').value = e.memo || '';
    document.getElementById('tOut').innerText = e.text;
    renderChk('tChk', scan(e.text).filter(function (s) { return s !== '오프닝 자기소개 패턴'; }));
    document.getElementById('tMeta').textContent = e.text.length + '자 · 히스토리에서 불러옴 (' + e.time + ')';
    renderImgs('tImgs', e.memo, 'social media');
  }
}
function bootHist() {
  histRender('myNaverHist', 'nHist', 'pickNaver');
  histRender('myThreadsHist', 'tHist', 'pickThreads');
}
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', bootHist);
else bootHist();
function dlText(name, text) {
  var b = new Blob(['﻿' + text], { type: 'text/plain;charset=utf-8' });
  var a = document.createElement('a'); a.href = URL.createObjectURL(b); a.download = name;
  document.body.appendChild(a); a.click(); setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 500);
}
function dlNaver() { var t = document.getElementById('nOut').innerText; if (t) dlText('naver.txt', t); }
function dlThreads() { var t = document.getElementById('tOut').innerText; if (t) dlText('threads.txt', t); }
/* ---------- 네이버 포맷 전환 ---------- */
var naverFmt = 'blog';
var lastNaver = { topic: '', memo: '', faqN: 5 };
function setNaverFmt(f) {
  naverFmt = f;
  document.getElementById('fmtNaverBlog').className = f === 'blog' ? 'on' : '';
  document.getElementById('fmtNaverDocx').className = f === 'docx' ? 'on' : '';
  document.getElementById('fmtNaverBlog').style.background = f === 'blog' ? 'var(--gold)' : '#fff';
  document.getElementById('fmtNaverBlog').style.color = f === 'blog' ? '#fff' : '#1a2333';
  document.getElementById('fmtNaverDocx').style.background = f === 'docx' ? 'var(--gold)' : '#fff';
  document.getElementById('fmtNaverDocx').style.color = f === 'docx' ? '#fff' : '#1a2333';
  if (lastNaver.topic) genNaver(true);
}
/* ---------- 공통 검사 ---------- */
var CJK_RE = /[぀-ヿ㐀-䶿豈-﫫]/;
var DBL_RE = /(에에|을을|를를|은은|것이다다|합니다합니다|입니다입니다|한다한다|요요)/;
var AI_RE = /(하는 것이 중요합니다|할 수 있습니다|하는 것은 어떨까요|요약하자면|결론적으로|노력합시다|꾸준함이 답)/;
var INTRO_RE = /^(안녕하십니까|본 포스팅에서는|요즘 .* 중요합니다|많은 사람들이 .*합니다|오늘은 .*에 대해)/m;
function scan(text) {
  var issues = [];
  if (CJK_RE.test(text)) issues.push('비한국 CJK 잔재');
  var dbl = text.match(new RegExp(DBL_RE.source, 'g'));
  if (dbl) issues.push('조사/어미 중복 ' + dbl.length + '건');
  var ai = text.match(new RegExp(AI_RE.source, 'g'));
  if (ai) issues.push('AI 냄새 ' + ai.length + '건');
  if (INTRO_RE.test(text)) issues.push('오프닝 자기소개 패턴');
  var sp = text.match(/ [,.!?]/g);
  if (sp) issues.push('구둣점 앞 공백');
  return issues;
}
function charCount(text) { return text.replace(/\s/g, '').length; }
function renderChk(id, issues) {
  var el = document.getElementById(id);
  el.innerHTML = issues.length
    ? issues.map(function (s) { return '<div class="no">✕ ' + s + '</div>'; }).join('')
    : '<div class="ok">✓ 오타·CJK·AI냄새·오프닝 검사 통과</div>';
}
/* ---------- v2: 메모 재료 추출 ---------- */
function memoSents(memo) {
  var parts = String(memo || '').split(/[\n]+/).join(' ');
  var out = parts.match(/[^.!?。]+[.!?。]+|[^.!?。]+$/g) || [];
  return out.map(function (s) { return s.replace(/^[.\s、。]+/, '').trim(); })
    .filter(function (s) { return s.length > 4; });
}
function memoNums(memo) {
  var m = String(memo || '').match(/\d+\s*(년|개월|번|차례|일|주|시간|분)|\d+[\-~]\d+\s*(년|번|회)?|수차례|여러\s?차례|매일|매주|매달/g);
  return m ? m.slice(0, 6) : [];
}
function memoKeys(memo, topic) {
  var stop = /합니다|합니다요|입니다|합니다만|때문에|그리고|그래서|하지만|그런데|제가|저는|나는|것을|것이|수있|해야|하면|하면요|같은|같이|정도|정말|너무|매우|아주|좀|것|수|등|및/;
  var words = {};
  String(memo || '').replace(/[a-zA-Z0-9가-힣]{2,}/g, function (w) {
    if (!stop.test(w) && w.length >= 2) words[w] = (words[w] || 0) + 1;
    return w;
  });
  var t = String(topic || '');
  return Object.keys(words).filter(function (w) {
    if (t.indexOf(w) >= 0) return false;
    if (/^[a-zA-Z]+$/.test(w)) return false;
    if (w.length < 3 && !/^[가-힣]{2,}$/.test(w)) return false;
    return true;
  }).sort(function (a, b) { return (words[b] - words[a]) || (b.length - a.length); }).slice(0, 8);
}
/* v2: 문장 예산은 buildThreads 내 take()가 담당 */
/* ---------- 네이버 FRAME ---------- */
function buildNaver(topic, memo, faqN) {
  var sents = memoSents(memo);
  var nums = memoNums(memo);
  var keys = memoKeys(memo, topic);
  var usedS = {};
  function S(i) { if (usedS[i]) return ''; usedS[i] = 1; return sents[i] || ''; }
  function K(i) { return keys[i] || topic; }
  var L = [];
  var benefit = nums.length ? nums.slice(0, 2).join('·') + ' 경험으로 풀어봅니다' : (memo ? '경험으로 풀어봅니다' : '핵심만 정리합니다');
  L.push('◆ 제목: ' + topic + ' --- ' + benefit);
  L.push('');
  L.push('연관키워드: ' + [topic].concat(keys.slice(0, 4)).join(', '));
  L.push('');
  var intro = S(0);
  L.push((intro ? intro + ' ' : '') + topic + ' 때문에 찾아보는 분이 많다고 합니다. 직접 겪어보니 교과서 말과 다른 지점이 있었습니다. 검색하면 말이 많지만 정작 겪은 얘기는 드뭅니다. 그래서 겪은 순서대로 풀어봅니다.');
  L.push('');
  var core = S(1);
  L.push((core ? core + ' ' : '') + '겪어본 입장에서 ' + topic + '의 핵심을 먼저 말하면, 기준을 아는 쪽이 편하다고 합니다. 기준이 있으면 흔들릴 일이 줄어듭니다.');
  L.push('');
  var b1 = S(2);
  L.push('먼저 ' + topic + '의 기준을 잡습니다. ' + (b1 ? b1 + ' ' : '') + '상황을 숫자로 적어두면 판단이 빨라진다고 합니다. 막연히 걱정하는 대신 기록부터 시작하라는 말이 여기서 나옵니다. 기준이 있으면 흔들릴 일이 줄어듭니다. 수치가 오르내리는 날도 기록에 남기면 흐름이 보입니다. 혼자 머리 아프게 고민하는 시간도 줄어듭니다. 가족에게 보여주면 걱정도 덜어줍니다. 병원에선 기록 있는 환자를 더 빨리 파악합니다. 아래 기준이 편합니다.');
  L.push('항목: 매일 같은 조건에서 잽니다');
  L.push('기준: 2주 기록을 갖고 판단합니다');
  L.push('예시: ' + (nums.length ? nums.slice(0, 2).join('·') + ' 같은 변화를 들고 갑니다' : K(0) + ' 관련 기록을 들고 갑니다'));
  L.push('');
  var b2 = S(3);
  L.push('다음은 ' + topic + '의 실천입니다. ' + (b2 ? b2 + ' ' : '') + '거창한 계획보다 작은 반복이 낫다고 합니다. 해본 뒤 기록에 남기면 다음 판단이 쉬워집니다. 안 되면 방식을 바꾸면 됩니다. 꾸준히 잰다는 말보다, 잰 것을 본다는 말이 정확합니다. 일주일 단위로 돌아보면 무엇이 통했는지 보입니다. 통하는 것만 남기고 나머지는 버리면 됩니다. 식사·수면·운동 중 하나만 바꿔봐도 수치가 움직입니다. 한 번에 다 바꾸면 뭐가 통한 건지 모릅니다. 아래 기준이 편합니다.');
  L.push('항목: 못한 날도 기록합니다');
  L.push('기준: 빠진 날은 비워둡니다');
  L.push('예시: 일주일 중 5일이면 충분합니다');
  L.push('');
  var b3 = S(4);
  L.push('마지막으로 ' + topic + '의 함정입니다. ' + (b3 ? b3 + ' ' : '') + '겪고 알게 된 건데, 잘될 때 방심이 가장 크다고 합니다. 수치가 좋아져도 기록은 이어갑니다. 중단이 반복의 적입니다. 병원은 기록을 좋아합니다. 기록이 있으면 진료실에서 말이 짧아져도 알차게 끝납니다. 다음 예약 때까지 이어갈 동력도 됩니다. 약을 줄이자는 말이 나와도 기록이 근거가 됩니다. 좋아진 수치도 기록이 있어야 믿어줍니다. 아래 기준이 편합니다.');
  L.push('항목: 좋아져도 2주는 더 봅니다');
  L.push('기준: 중단 사유를 적어둡니다');
  L.push('예시: 여행·명절 같은 깨지는 구간을 표시합니다');
  L.push('');
  L.push('요령 세 가지. 첫째, 같은 시간에 잽니다. 아침 기상 직후가 비교가 쉽습니다. 둘째, 컨디션을 같이 적습니다. 잠·커피·운동 세 글자면 됩니다. 셋째, ' + topic + ' 관련 질문을 미리 적어갑니다. 물어볼 게 있으면 진료가 짧아져도 알찹니다. 질문지는 진료 전날 밤에 씁니다. 급한 것부터 앞에 둡니다.');
  L.push('');
  L.push('이렇게 물어보세요: "' + topic + ', 제 기록 보니 어떤가요?"');
  L.push('');
  L.push('FAQ');
  var faqPool = [
    [topic + '은 매일 해야 하나요?', '매일이 이상적이지만 일주일 5일이면 흐름이 보인다고 합니다. 빠진 날은 비워두고 이어가면 됩니다.'],
    ['기록은 뭐로 하나요?', '종이·메모앱 다 됩니다. 날짜·수치·컨디션 세 가지만 있으면 됩니다.'],
    ['언제 병원에 가야 하나요?', '수치가 기준을 넘나들거나 증상이 있으면 기록을 들고 갑니다. 판단은 의사가 합니다.'],
    ['가족도 같이 하나요?', (nums.length ? nums[0] + ' 해보니 ' : '') + '생활이 겹치면 같이 하는 쪽이 낫습니다. 서로 리마인드됩니다.'],
    ['비용이 드나요?', (memo ? '메모에 적힌 대로 해보니 ' : '') + '집에서 하는 건 장비값뿐입니다. 병원 진료는 보험 적용 여부를 확인하세요.'],
    ['중단해도 되나요?', '좋아져도 2주는 더 봅니다. 중단 사유를 적어두면 재개가 쉽습니다.'],
    [K(0) + '는 어떻게 고르나요?', '성분·함량을 따져보고 논문도 찾아봅니다. 광고보다 기록이 답을 줍니다.'],
    ['아침·저녁 중 언제가 낫나요?', '같은 시간대가 핵심이라 아침 기상 직후를 권합니다. 저녁은 컨디션 편차가 큽니다.'],
    ['약 먹으면 기록 끝인가요?', '약 시작 뒤가 더 중요하다고 합니다. 용량 조절 근거가 기록에서 나옵니다.'],
    [topic + ' 얼마나 걸리나요?', (nums.length ? nums.join('·') + ' 정도 해보니 ' : '') + '무리한 강도보다 매일 이어가는 쪽이 낫습니다.']
  ];
  var faqWant = faqN;
  if ((!memo || memo.length < 30) && faqWant < 7) faqWant = 7;
  for (var i = 0; i < faqWant && i < faqPool.length; i++) {
    L.push('Q: ' + faqPool[i][0]);
    L.push('A: ' + faqPool[i][1] + ' ' + topic + ' 기준으로 보면 ' + (memo ? '경험상 ' : '') + '기록이 답을 줍니다.');
  }
  L.push('');
  var rest = sents.filter(function (_, i) { return !usedS[i]; }).slice(0, 2).join(' ');
  L.push('정리하면 ' + topic + '은 기록이 먼저입니다. ' + (rest ? rest + ' ' : '') + '겪어보니 기준 없는 걱정보다 기록 있는 판단이 낫습니다. 오늘부터 같은 시간에 재봅니다. 2주 뒤 기록을 들고 갑니다. 그게 가장 빠른 길입니다. 기록은 쌓을수록 힘이 붙습니다. 다음 진료가 기다려지는 쪽이 이깁니다.');
  if (!memo || memo.length < 30) {
    L.push('');
    L.push('기록이 짧은 분께 덧붙입니다. 완벽한 기록을 기다리면 시작이 늦어진다고 합니다. 오늘 수치 하나, 컨디션 한 줄이면 됩니다. 내일 또 적으면 이틀이 됩니다. 일주일이면 흐름이 됩니다. 흐름이 보이면 병원에 갈 타이밍도 보입니다. 타이밍을 아는 쪽이 진료를 잘 받습니다.');
    L.push('');
    L.push('시작 도구가 고민이면 종이 한 장이면 됩니다. 냉장고에 붙여두면 잊지 않는다고 합니다. 아침에 눈뜨면 바로 적는 자리를 정합니다. 자리가 정해지면 습관이 됩니다. 습관이 되면 기록이 쌓입니다. 쌓인 기록이 다음 판단을 돕습니다.');
  }
  L.push('');
  L.push('============');
  var raw = L.join('\n');
  return { text: raw, faqCount: Math.min(faqWant, faqPool.length) };
}
function toBlogFmt(r) { return r.text; }
function toDocxFmt(r) {
  return r.text.replace(/^◆ 제목: (.*)$/m, '제목: $1').replace(/^============$/m, '');
}
function genNaver(rerender) {
  var topic = document.getElementById('nTopic').value.trim();
  var memo = document.getElementById('nMemo').value.trim();
  var faqN = parseInt(document.getElementById('nFaq').value, 10) || 5;
  if (!topic) { if (!rerender) document.getElementById('nOut').innerText = '주제를 입력하세요.'; return; }
  lastNaver = { topic: topic, memo: memo, faqN: faqN };
  var r = buildNaver(topic, memo, faqN);
  var text = naverFmt === 'docx' ? toDocxFmt(r) : toBlogFmt(r);
  document.getElementById('nOut').innerText = text;
  renderChk('nChk', scan(text));
  document.getElementById('nMeta').textContent = '공백제외 ' + charCount(text) + '자 · FAQ ' + r.faqCount + '개 · ' + (naverFmt === 'docx' ? '워드용' : '블로그 복붙용');
  renderImgs('nImgs', topic, 'health infographic');
  renderCoup(topic, memo);
  histPut('myNaverHist', { title: topic, topic: topic, memo: memo, faqN: faqN, text: text, chars: charCount(text), time: nowTime() });
  histRender('myNaverHist', 'nHist', 'pickNaver');
}
/* ---------- 스레드 ---------- */
function genThreads() {
  var memo = document.getElementById('tMemo').value.trim();
  var parts = parseInt(document.getElementById('tParts').value, 10) || 3;
  var goal = document.getElementById('tGoal').value;
  if (!memo) { document.getElementById('tOut').innerText = '메모를 입력하세요.'; return; }
  var sents = memoSents(memo);
  var nums = memoNums(memo);
  var u = {};
  function take(budget) {
    var out = [], len = 0;
    for (var i = 0; i < sents.length; i++) {
      if (u[i]) continue;
      if (len + sents[i].length > budget && out.length) break;
      u[i] = 1; out.push(sents[i]); len += sents[i].length;
    }
    return out.join(' ');
  }
  var numBit = nums.filter(function (x) { return /\d+\s*년|\d+\s*개월|매일|매주|매달|수차례/.test(x); }).slice(0, 2).join('·');
  numBit = numBit ? numBit + '. ' : '';
  var L = [];
  L.push('1편');
  var hook = take(120);
  L.push(hook.replace(/\.+$/, '') + 'ㅎ');
  L.push('말그대로 몸으로 깨달았다. ' + numBit + '이건 책에서 배운 게 아니다.');
  if (parts === 1) {
    var one = take(300);
    L.push(one);
    L.push('그래서 뭘 하냐고? 겪은 대로 하면 된다. 오늘부터다.');
  } else {
    L.push('근데 진짜 얘기는 따로 있다.');
  }
  if (parts >= 2) {
    L.push('');
    L.push('2편');
    var bef = take(150);
    L.push('그전엔 당연한 줄 알았다. ' + bef);
    L.push('막상 겪어보니 뒤집혔다. 아는 거랑 해보는 거랑 다르더라.');
    var did = take(150);
    L.push(did ? '그래서 ' + did : '남들은 말로만 하더라. 나는 몸으로 했다.');
    if (parts === 2) L.push('기록이 답이다. 오늘부터다.');
    else L.push('그래서 뭘 했겠냐고?');
  }
  if (parts >= 3) {
    L.push('');
    L.push('3편');
    var ans = take(200);
    L.push(ans ? '결국 뼈저리게(말그대로ㅎ) 깨달은 건 단순했다. ' + ans : '답은 단순했다. 깨끗한 식단과 운동, 매일의 반복이다.');
    L.push('못한 날은 비워둔다. 흐름만 보이면 된다.');
    L.push('기록 들고 가면 말이 짧아져도 알차더라.');
    if (parts === 3) {
      if (goal === 'biz') L.push('이런 기록 들고 오는 분이 제일 돕기 쉽다. 무슨 일 하는지 궁금하면 프로필 본다.');
      else if (goal === 'share') L.push('주변에 같은 고민하는 사람 있으면 공유해준다.');
      else L.push('다음 주엔 기록지 양식 그대로 푼다. 놓치기 싫다면 팔로우한다.');
    } else L.push('그런데 함정이 하나 남았다.');
  }
  if (parts >= 4) {
    L.push('');
    L.push('4편');
    var last = take(200);
    L.push(last || '잘될 때 방심이 제일 크더라.');
    L.push('중단이 반복의 적이다. 사유만 적어둬도 재개가 쉽더라.');
    if (goal === 'biz') L.push('이런 분이 제일 돕기 쉽다. 무슨 일 하는지 궁금하면 프로필 본다.');
    else L.push('다음 주엔 깨지는 구간(명절·여행) 대처법 푼다. 놓치기 싫다면 팔로우한다.');
  }
  var text = L.join('\n');
  document.getElementById('tOut').innerText = text;
  var issues = scan(text).filter(function (s) { return s !== '오프닝 자기소개 패턴'; });
  if (text.length > parts * 480) issues.push('편당 480자 초과 (' + text.length + '자/' + parts + '편)');
  renderChk('tChk', issues);
  document.getElementById('tMeta').textContent = text.length + '자 · ' + parts + '편 · 목적 ' + goal;
  renderImgs('tImgs', memo, 'social media');
  renderCoup('', memo);
  histPut('myThreadsHist', { title: memo.slice(0, 30), memo: memo, text: text, chars: text.length, time: nowTime() });
  histRender('myThreadsHist', 'tHist', 'pickThreads');
}
/* ---------- 쿠팡 추천 3 + 고지문 ---------- */
var COUP_DISC = '이 포스팅은 쿠팡 파트너스 활동의 일환으로, 이에 따른 일정액의 수수료를 제공받습니다.';
function coupPicks(topic, memo) {
  var t = ((topic || '') + ' ' + (memo || '')).toLowerCase();
  function has() { for (var i = 0; i < arguments.length; i++) if (t.indexOf(arguments[i]) >= 0) return true; return false; }
  if (has('혈압', '혈당', '당뇨', '건강', '몸', '허리', '무릎', '관절', '눈', '수면'))
    return ['가정용 혈압계', '혈당 측정기 세트', '저염 식단 책'];
  if (has('골프', '라운드', '필드', '코스', '스윙'))
    return ['골프 거리측정기', '골프 장갑 2팩', '골프공 로스트볼 20구'];
  if (has('여행', '호텔', '비행', '짐', '캐리어', '부산', '투어'))
    return ['여행용 캐리어 20인치', '목베개 메모리폼', '여행 파우치 세트'];
  if (has('주방', '요리', '레시피', '식단', '반찬'))
    return ['저염 간장 세트', '밀프렙 용기 10P', '식단 기록 노트'];
  if (has('운동', '걷기', '러닝', '헬스', '홈트'))
    return ['만보기 스마트밴드', '홈트 매트', '마사지건 미니'];
  return ['기록 노트', '건강검진 예약 가이드북', '생활습관 플래너'];
}
function renderCoup(topic, memo) {
  var box = document.getElementById('coupItems'); if (!box) return;
  box.innerHTML = coupPicks(topic, memo).map(function (name, i) {
    return '<div style="display:flex;gap:8px;align-items:center;border:1px solid var(--line);border-radius:8px;padding:8px 10px;font-size:13px">'
      + '<b style="flex:1">' + (i + 1) + '. ' + escHtml(name) + '</b>'
      + '<input type="text" data-couplink="' + i + '" placeholder="링크 붙여넣기" style="flex:1.4;margin:0">'
      + '</div>';
  }).join('');
}
function copyCoup() {
  var link = (document.getElementById('coupLink').value || '').trim();
  var links = [];
  var inputs = document.querySelectorAll('[data-couplink]');
  for (var i = 0; i < inputs.length; i++) if (inputs[i].value.trim()) links.push(inputs[i].value.trim());
  var all = links.length ? links : (link ? [link] : []);
  var text = COUP_DISC + (all.length ? '\n' + all.join('\n') : '');
  var box = document.getElementById('coupOut'); box.innerText = text;
  if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text);
}
void [switchTab, copyOut, genNaver, genThreads, setNaverFmt, dlNaver, dlThreads, renderCoup, copyCoup];
