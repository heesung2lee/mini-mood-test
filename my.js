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
  var t = document.getElementById(id).innerText;
  if (!t) return;
  if (navigator.clipboard) navigator.clipboard.writeText(t);
  else { var ta = document.createElement('textarea'); ta.value = t; document.body.appendChild(ta); ta.select(); try { document.execCommand('copy'); } catch (e) {} ta.remove(); }
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
/* ---------- 네이버 FRAME ---------- */
function genNaver() {
  var topic = document.getElementById('nTopic').value.trim();
  var memo = document.getElementById('nMemo').value.trim();
  var faqN = parseInt(document.getElementById('nFaq').value, 10) || 5;
  if (!topic) { document.getElementById('nOut').innerText = '주제를 입력하세요.'; return; }
  var exp = memo ? memo + ' ' : '';
  var memoBits = memo ? memo.split(/[,，.。、\n]/).map(function (s) { return s.trim(); }).filter(function (s) { return s; }) : [];
  var memoUse = memoBits.length
    ? ' 메모에 적힌 ' + memoBits.map(function (s) { return '\'' + s + '\''; }).join(', ') + '가 판단 재료가 된다고 합니다.'
    : '';
  var extra = memo && memo.length < 30
    ? ' 기록이 짧아도 상관없다고 합니다. 날짜·수치·컨디션 세 가지만 있으면 시작입니다. 길게 쓰려고 미루는 쪽이 손해입니다. 짧은 기록이 쌓이면 흐름이 됩니다.'
    : ' 메모를 길게 적어둘수록 판단 재료가 는다고 합니다. 컨디션·식사·운동까지 같이 적으면 원인이 보입니다.';
  var L = [];
  L.push('◆ 제목: ' + topic + ' --- ' + (memo ? '경험으로 풀어봅니다' : '핵심만 정리합니다'));
  L.push('');
  L.push('연관키워드: ' + topic + ', ' + topic + ' 방법, ' + topic + ' 요령, ' + topic + ' 주의점, ' + topic + ' FAQ');
  L.push('');
  L.push(exp + topic + ' 때문에 찾아보는 분이 많다고 합니다. 직접 겪어보니 교과서 말과 다른 지점이 있었습니다. 검색하면 말이 많지만 정작 겪은 얘기는 드뭅니다. 그래서 겪은 순서대로 풀어봅니다.');
  L.push('');
  L.push(exp + '겪어본 입장에서 ' + topic + '의 핵심을 먼저 말하면, 기준을 아는 쪽이 편하다고 합니다.' + extra + memoUse);
  L.push('');
  L.push('먼저 ' + topic + '의 기준을 잡습니다. ' + exp + '상황을 숫자로 적어두면 판단이 빨라진다고 합니다. 막연히 걱정하는 대신 기록부터 시작하라는 말이 여기서 나옵니다. 기준이 있으면 흔들릴 일이 줄어듭니다. 수치가 오르내리는 날도 기록에 남기면 흐름이 보입니다. 혼자 머리 아프게 고민하는 시간도 줄어듭니다. 가족에게 보여주면 걱정도 덜어줍니다. 병원에선 기록 있는 환자를 더 빨리 파악합니다. 같은 약을 먹어도 기록 유무로 처방이 달라집니다. 아래 기준이 편합니다.');
  L.push('항목: 매일 같은 조건에서 잽니다');
  L.push('기준: 2주 기록을 갖고 판단합니다');
  L.push('예시: ' + (memo || '기록 2주치') + '를 들고 갑니다');
  L.push('');
  L.push('다음은 ' + topic + '의 실천입니다. 거창한 계획보다 작은 반복이 낫다고 합니다. ' + exp + '해본 뒤 기록에 남기면 다음 판단이 쉬워집니다. 안 되면 방식을 바꾸면 됩니다. 꾸준히 잰다는 말보다, 잰 것을 본다는 말이 정확합니다. 일주일 단위로 돌아보면 무엇이 통했는지 보입니다. 통하는 것만 남기고 나머지는 버리면 됩니다. 식사·수면·운동 중 하나만 바꿔봐도 수치가 움직입니다. 한 번에 다 바꾸면 뭐가 통한 건지 모릅니다. 아래 기준이 편합니다.');
  L.push('항목: 못한 날도 기록합니다');
  L.push('기준: 빠진 날은 비워둡니다');
  L.push('예시: 일주일 중 5일이면 충분합니다');
  L.push('');
  L.push('마지막으로 ' + topic + '의 함정입니다. ' + exp + '겪고 알게 된 건데, 잘될 때 방심이 가장 크다고 합니다. 수치가 좋아져도 기록은 이어갑니다. 중단이 반복의 적입니다. 병원은 기록을 좋아합니다. 기록이 있으면 진료실에서 말이 짧아져도 알차게 끝납니다. 다음 예약 때까지 이어갈 동력도 됩니다. 약을 줄이자는 말이 나와도 기록이 근거가 됩니다. 좋아진 수치도 기록이 있어야 믿어줍니다. 아래 기준이 편합니다.');
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
    ['매일 해야 하나요?', '매일이 이상적이지만 일주일 5일이면 흐름이 보인다고 합니다. 빠진 날은 비워두고 이어가면 됩니다.'],
    ['기록은 뭐로 하나요?', '종이·메모앱 다 됩니다. 날짜·수치·컨디션 세 가지만 있으면 됩니다.'],
    ['언제 병원에 가야 하나요?', '수치가 기준을 넘나들거나 증상이 있으면 기록을 들고 갑니다. 판단은 의사가 합니다.'],
    ['가족도 같이 하나요?', '생활이 겹치면 같이 재는 쪽이 낫습니다. 서로 리마인드됩니다.'],
    ['비용이 드나요?', '집에서 재는 건 장비값뿐입니다. 병원 진료는 보험 적용 여부를 확인하세요.'],
    ['중단해도 되나요?', '좋아져도 2주는 더 봅니다. 중단 사유를 적어두면 재개가 쉽습니다.'],
    ['숫자가 들쭉날쭉하면요?', '컨디션 메모와 대조합니다. 잠·커피·운동이 원인인 경우가 많습니다.'],
    ['아침·저녁 중 언제가 낫나요?', '같은 시간대가 핵심이라 아침 기상 직후를 권합니다. 저녁은 컨디션 편차가 큽니다.'],
    ['약 먹으면 기록 끝인가요?', '약 시작 뒤가 더 중요하다고 합니다. 용량 조절 근거가 기록에서 나옵니다.'],
    ['운동은 얼마나 하나요?', '30분 걷기부터 시작합니다. 무리한 강도보다 매일 이어가는 쪽이 낫습니다.']
  ];
  var faqWant = faqN;
  if ((!memo || memo.length < 30) && faqWant < 7) faqWant = 7;
  for (var i = 0; i < faqWant && i < faqPool.length; i++) {
    L.push('Q: ' + faqPool[i][0]);
    L.push('A: ' + faqPool[i][1] + ' ' + topic + ' 기준으로 보면 ' + (memo ? '경험상 ' : '') + '기록이 답을 줍니다.');
  }
  L.push('');
  L.push('정리하면 ' + topic + '은 기록이 먼저입니다. ' + exp + '겪어보니 기준 없는 걱정보다 기록 있는 판단이 낫습니다. 오늘부터 같은 시간에 재봅니다. 2주 뒤 기록을 들고 갑니다. 그게 가장 빠른 길입니다. 기록은 쌓을수록 힘이 붙습니다. 다음 진료가 기다려지는 쪽이 이깁니다.');
  if (!memo || memo.length < 30) {
    L.push('');
    L.push('기록이 짧은 분께 덧붙입니다. 완벽한 기록을 기다리면 시작이 늦어진다고 합니다. 오늘 수치 하나, 컨디션 한 줄이면 됩니다. 내일 또 적으면 이틀이 됩니다. 일주일이면 흐름이 됩니다. 흐름이 보이면 병원에 갈 타이밍도 보입니다. 타이밍을 아는 쪽이 진료를 잘 받습니다.');
    L.push('');
    L.push('시작 도구가 고민이면 종이 한 장이면 됩니다. 냉장고에 붙여두면 잊지 않는다고 합니다. 아침에 눈뜨면 바로 적는 자리를 정합니다. 자리가 정해지면 습관이 됩니다. 습관이 되면 기록이 쌓입니다. 쌓인 기록이 다음 판단을 돕습니다.');
  }
  L.push('');
  L.push('============');
  var text = L.join('\n');
  document.getElementById('nOut').innerText = text;
  renderChk('nChk', scan(text));
  document.getElementById('nMeta').textContent = '공백제외 ' + charCount(text) + '자 · FAQ ' + Math.min(faqWant, faqPool.length) + '개 · 복붙용(제목/키워드/본문/FAQ/구분선)';
}
/* ---------- 스레드 ---------- */
function genThreads() {
  var memo = document.getElementById('tMemo').value.trim();
  var parts = parseInt(document.getElementById('tParts').value, 10) || 3;
  var goal = document.getElementById('tGoal').value;
  if (!memo) { document.getElementById('tOut').innerText = '메모를 입력하세요.'; return; }
  var core = memo.split(/[.。\n]/)[0].trim();
  var L = [];
  L.push('1편');
  L.push(core);
  L.push('직접 겪은 얘기다. 숫자는 못 박지 않지만 장면은 또렷하다.');
  L.push(memo.length > core.length ? memo.slice(core.length).trim().split('\n')[0] : '그날 이후로 기준이 바뀌었다.');
  if (parts === 1) {
    L.push('그래서 뭘 하냐고? 기록부터다. 오늘 같은 시간에 재고 적는다. 2주 뒤 들고 간다.');
  } else {
    L.push('그런데 진짜 얘기는 따로 있다.');
  }
  if (parts >= 2) {
    L.push('');
    L.push('2편');
    L.push('겪기 전엔 당연한 줄 알았다. ' + core);
    L.push('막상 부딪히니 반전이 있었다. 아는 것과 해보는 건 다르다.');
    L.push('남들은 말로만 한다. 나는 적었다. 그 차이가 결과를 갈랐다.');
    if (parts === 2) L.push('기록이 답이다. 오늘부터 적는다.');
    else L.push('그래서 뭘 했겠냐고?');
  }
  if (parts >= 3) {
    L.push('');
    L.push('3편');
    L.push('답은 단순했다. 같은 시간, 같은 조건, 매일 적는다.');
    L.push('못한 날은 비워둔다. 5일이면 흐름이 보인다.');
    L.push('기록을 들고 가면 진료가 짧아져도 알차다.');
    if (parts === 3) {
      if (goal === 'biz') L.push('이런 기록 들고 오는 분이 제일 돕기 쉽다. 무슨 일 하는지 궁금하면 프로필 본다.');
      else if (goal === 'share') L.push('주변에 같은 고민하는 사람 있으면 공유해준다.');
      else L.push('다음 주엔 기록지 양식 그대로 푼다. 놓치기 싫다면 팔로우한다.');
    } else L.push('그런데 함정이 하나 남았다.');
  }
  if (parts >= 4) {
    L.push('');
    L.push('4편');
    L.push('잘될 때 방심이 제일 크다. 수치가 좋아져도 2주는 더 본다.');
    L.push('중단이 반복의 적이다. 사유를 적어두면 재개가 쉽다.');
    if (goal === 'biz') L.push('이런 분이 제일 돕기 쉽다. 무슨 일 하는지 궁금하면 프로필 본다.');
    else L.push('다음 주엔 깨지는 구간(명절·여행) 대처법 푼다. 놓치기 싫다면 팔로우한다.');
  }
  var text = L.join('\n');
  document.getElementById('tOut').innerText = text;
  var issues = scan(text).filter(function (s) { return s !== '오프닝 자기소개 패턴'; });
  if (text.length > parts * 480) issues.push('편당 480자 초과 (' + text.length + '자/' + parts + '편)');
  renderChk('tChk', issues);
  document.getElementById('tMeta').textContent = text.length + '자 · ' + parts + '편 · 목적 ' + goal;
}
void [switchTab, copyOut, genNaver, genThreads];
