// 미리보기 창 크기에 맞춰 카드를 축소합니다. (창이 1080×1350이면 원본 크기)
function fitCard() {
  const s = Math.min(innerWidth / 1080, innerHeight / 1350, 1);
  document.documentElement.style.setProperty('--fit', s);
}
fitCard();
addEventListener('resize', fitCard);
