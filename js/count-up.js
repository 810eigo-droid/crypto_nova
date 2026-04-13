// ===================================================
// count-up.js
// 数字カウントアップアニメーション
// data-count-to 属性を持つ要素が画面に入ったら発火
// ===================================================

(function() {
  'use strict';

  function formatNumber(num) {
    return Math.floor(num).toLocaleString('ja-JP');
  }

  function animateCount(element) {
    const target = parseInt(element.dataset.countTo, 10);
    const suffix = element.dataset.countSuffix || '';
    const duration = 2000; // 2秒
    const startTime = performance.now();

    function update(now) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // easeOutQuart
      const eased = 1 - Math.pow(1 - progress, 4);
      const current = target * eased;
      element.textContent = formatNumber(current) + suffix;

      if (progress < 1) {
        requestAnimationFrame(update);
      } else {
        element.textContent = formatNumber(target) + suffix;
      }
    }

    requestAnimationFrame(update);
  }

  const observer = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting) {
        animateCount(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }, {
    root: null,
    rootMargin: '0px 0px -15% 0px',
    threshold: 0.3
  });

  document.querySelectorAll('[data-count-to]').forEach(function(el) {
    observer.observe(el);
  });
})();