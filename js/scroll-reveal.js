// ===================================================
// Crypto Nova LP - スクロール連動アニメーション
// 各セクションが画面に入ったら is-visible クラスを付与
// ===================================================

const observerOptions = {
  root: null,
  rootMargin: '0px 0px -15% 0px',
  threshold: 0.15
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    }
  });
}, observerOptions);

// 監視対象のセクション
document.querySelectorAll('.question').forEach(section => {
  observer.observe(section);
});

document.querySelectorAll('.anxiety').forEach(section => {
  observer.observe(section);
});
document.querySelectorAll('.alone').forEach(section => {
  observer.observe(section);
});
document.querySelectorAll('.failure-point').forEach(section => {
  observer.observe(section);
});
document.querySelectorAll('.failure-answer').forEach(section => {
  observer.observe(section);
});
// 今後セクション追加時はここに追加
// document.querySelectorAll('.anxiety').forEach(section => observer.observe(section));