// 카드 넘김 버튼 + 부드러운 화면 전환 (모든 카드 공통)
// - 이전/다음 버튼, 키보드 ←/→, 카드 안의 card??.html 링크 모두 같은 전환 효과로 이동
// - PNG 저장(render.ps1)은 주소에 ?render 가 붙어 버튼·애니메이션을 끕니다.
(function () {
  const LAST = 11;           // 지금까지 만든 마지막 카드 번호 (새 카드 만들면 올려주세요)
  const DUR = 450;           // 전환 시간(ms)

  if (location.search.includes('render')) return;

  const m = location.pathname.match(/card(\d+)\.html$/);
  if (!m) return;
  const cur = parseInt(m[1], 10);
  const file = n => 'card' + String(n).padStart(2, '0') + '.html';
  const card = document.querySelector('.card');

  // 한 페이지 뷰어(index.html) 안에 들어가 있을 때:
  // 카드 자체 버튼은 숨기고, 클릭·키보드·스와이프를 뷰어에 전달만 함
  if (window.self !== window.top) {
    const tell = n => parent.postMessage({ type: 'card-go', n: n }, '*');
    addEventListener('keydown', e => {
      if (e.key === 'ArrowRight') tell(cur + 1);
      if (e.key === 'ArrowLeft') tell(cur - 1);
    });
    document.querySelectorAll('a[href^="card"]').forEach(a => {
      const t = a.getAttribute('href').match(/card(\d+)\.html/);
      if (t) a.addEventListener('click', e => { e.preventDefault(); tell(parseInt(t[1], 10)); });
    });
    let sx = null, sy = null;
    addEventListener('touchstart', e => { sx = e.touches[0].clientX; sy = e.touches[0].clientY; }, { passive: true });
    addEventListener('touchend', e => {
      if (sx === null) return;
      const dx = e.changedTouches[0].clientX - sx, dy = e.changedTouches[0].clientY - sy;
      if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) tell(dx < 0 ? cur + 1 : cur - 1);
      sx = null;
    }, { passive: true });
    return;
  }

  const style = document.createElement('style');
  style.textContent = `
    .card { transition: opacity ${DUR}ms ease, translate ${DUR}ms cubic-bezier(.22,.8,.3,1); }
    .card.is-out-next { opacity: 0; translate: -80px 0; }
    .card.is-out-prev { opacity: 0; translate: 80px 0; }
    .card.is-in-next  { opacity: 0; translate: 80px 0; transition: none; }
    .card.is-in-prev  { opacity: 0; translate: -80px 0; transition: none; }
    .nav-btn {
      position: fixed; top: 50%; z-index: 100; translate: 0 -50%;
      width: 64px; height: 64px; border-radius: 50%; border: none;
      background: rgba(255,255,255,.92); color: #007870;
      font: 900 30px/1 'Pretendard', sans-serif; cursor: pointer;
      box-shadow: 0 6px 20px rgba(0,0,0,.25);
      transition: transform .15s, background .15s;
    }
    .nav-btn:hover { transform: scale(1.08); background: #D8E040; }
    .nav-btn.prev { left: 20px; }
    .nav-btn.next { right: 20px; }
  `;
  document.head.appendChild(style);

  // 들어올 때: 이전 페이지에서 넘어온 방향으로 슬라이드 인
  const dir = sessionStorage.getItem('cardDir');
  sessionStorage.removeItem('cardDir');
  if (dir) {
    card.classList.add('is-in-' + dir);
    requestAnimationFrame(() => requestAnimationFrame(() => card.classList.remove('is-in-' + dir)));
  }

  let leaving = false;
  function go(n) {
    if (leaving || n < 1 || n > LAST || n === cur) return;
    leaving = true;
    const d = n > cur ? 'next' : 'prev';
    sessionStorage.setItem('cardDir', d);
    card.classList.add('is-out-' + d);
    setTimeout(() => { location.href = file(n); }, DUR);
  }

  function btn(cls, label, n) {
    const b = document.createElement('button');
    b.className = 'nav-btn ' + cls;
    b.textContent = label;
    b.setAttribute('aria-label', cls === 'prev' ? '이전 카드' : '다음 카드');
    b.onclick = () => go(n);
    document.body.appendChild(b);
  }
  if (cur > 1) btn('prev', '←', cur - 1);
  if (cur < LAST) btn('next', '→', cur + 1);

  addEventListener('keydown', e => {
    if (e.key === 'ArrowRight') go(cur + 1);
    if (e.key === 'ArrowLeft') go(cur - 1);
  });

  // 카드 안의 링크(예: 1장 "넘겨서 알아보기")도 같은 전환으로
  document.querySelectorAll('a[href^="card"]').forEach(a => {
    const t = a.getAttribute('href').match(/card(\d+)\.html/);
    if (t) a.addEventListener('click', e => { e.preventDefault(); go(parseInt(t[1], 10)); });
  });

  // 뒤로가기 캐시로 돌아왔을 때 사라진 상태로 남지 않게
  addEventListener('pageshow', e => {
    if (e.persisted) { leaving = false; card.className = card.className.replace(/is-(out|in)-\w+/g, '').trim(); }
  });
})();
