/* ============================================
   エビデンスモーダル制御
   - エビデンスボタンタップで画像を拡大表示
   - ×ボタン or オーバーレイタップで閉じる
============================================ */

(function() {
  'use strict';

  const modal = document.getElementById('evidenceModal');
  const modalImage = document.getElementById('evidenceModalImage');

  if (!modal || !modalImage) return;

  // エビデンスボタンクリック
  document.querySelectorAll('.results__evidence-btn').forEach(btn => {
    btn.addEventListener('click', function(e) {
      e.preventDefault();
      const imageSrc = this.getAttribute('data-evidence');
      if (!imageSrc) return;

      modalImage.src = imageSrc;
      modal.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
    });
  });

  // 閉じるボタン・オーバーレイクリック
  document.querySelectorAll('[data-close-modal]').forEach(el => {
    el.addEventListener('click', function() {
      modal.setAttribute('aria-hidden', 'true');
      modalImage.src = '';
      document.body.style.overflow = '';
    });
  });

  // ESCキーで閉じる
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && modal.getAttribute('aria-hidden') === 'false') {
      modal.setAttribute('aria-hidden', 'true');
      modalImage.src = '';
      document.body.style.overflow = '';
    }
  });
})();