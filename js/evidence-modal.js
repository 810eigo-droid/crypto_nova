/* ============================================
   エビデンスモーダル制御 v3
   ピンチ拡大・自由移動対応（改良版）
============================================ */

(function() {
  'use strict';

  const modal = document.getElementById('evidenceModal');
  const modalImage = document.getElementById('evidenceModalImage');
  const wrapper = document.getElementById('evidenceImageWrapper');

  if (!modal || !modalImage || !wrapper) return;

  let scale = 1;
  let translateX = 0;
  let translateY = 0;
  let lastScale = 1;
  let startX = 0;
  let startY = 0;
  let startDistance = 0;
  let startMidX = 0;
  let startMidY = 0;
  let mode = 'none'; // 'none' | 'pan' | 'pinch'

  const MIN_SCALE = 0.5;
  const MAX_SCALE = 8;

  function applyTransform() {
    modalImage.style.transform = `translate(${translateX}px, ${translateY}px) scale(${scale})`;
  }

  function resetTransform() {
    scale = 1;
    translateX = 0;
    translateY = 0;
    lastScale = 1;
    applyTransform();
  }

  function getDistance(t1, t2) {
    const dx = t2.clientX - t1.clientX;
    const dy = t2.clientY - t1.clientY;
    return Math.sqrt(dx * dx + dy * dy);
  }

  // ===== タッチイベントは wrapper に統一 =====
  wrapper.addEventListener('touchstart', function(e) {
    if (e.touches.length === 2) {
      mode = 'pinch';
      startDistance = getDistance(e.touches[0], e.touches[1]);
      lastScale = scale;
      startMidX = (e.touches[0].clientX + e.touches[1].clientX) / 2 - translateX;
      startMidY = (e.touches[0].clientY + e.touches[1].clientY) / 2 - translateY;
      e.preventDefault();
    } else if (e.touches.length === 1) {
  mode = 'pan';
      startX = e.touches[0].clientX - translateX;
      startY = e.touches[0].clientY - translateY;
      e.preventDefault();
    }
  }, { passive: false });

  wrapper.addEventListener('touchmove', function(e) {
    if (mode === 'pinch' && e.touches.length === 2) {
      const distance = getDistance(e.touches[0], e.touches[1]);
      scale = Math.max(MIN_SCALE, Math.min(MAX_SCALE, lastScale * (distance / startDistance)));
      applyTransform();
      e.preventDefault();
    } else if (mode === 'pan' && e.touches.length === 1) {
      translateX = e.touches[0].clientX - startX;
      translateY = e.touches[0].clientY - startY;
      applyTransform();
      e.preventDefault();
    }
  }, { passive: false });

  wrapper.addEventListener('touchend', function(e) {
    if (e.touches.length === 0) {
      if (scale <= 0.5) {
        resetTransform();
      }
      mode = 'none';
      lastScale = scale;
    } else if (e.touches.length === 1) {
      // ピンチ → パンへ切り替え
      if (scale > 1) {
        mode = 'pan';
        startX = e.touches[0].clientX - translateX;
        startY = e.touches[0].clientY - translateY;
      } else {
        mode = 'none';
      }
    }
  });

  // ===== マウス操作（PC）=====
  let isMouseDown = false;
  let mouseStartX = 0;
  let mouseStartY = 0;

  wrapper.addEventListener('mousedown', function(e) {
    isMouseDown = true;
    mouseStartX = e.clientX - translateX;
    mouseStartY = e.clientY - translateY;
    modalImage.style.cursor = 'grabbing';
    e.preventDefault();
  });

  document.addEventListener('mousemove', function(e) {
    if (isMouseDown) {
      translateX = e.clientX - mouseStartX;
      translateY = e.clientY - mouseStartY;
      applyTransform();
    }
  });

  document.addEventListener('mouseup', function() {
    isMouseDown = false;
    modalImage.style.cursor = scale > 1 ? 'grab' : 'default';
  });

  // ===== ホイールズーム（PC）=====
  wrapper.addEventListener('wheel', function(e) {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.15 : 0.15;
    scale = Math.max(MIN_SCALE, Math.min(MAX_SCALE, scale + delta));
    if (scale <= 0.5) {
      translateX = 0;
      translateY = 0;
    }
    modalImage.style.cursor = scale > 1 ? 'grab' : 'default';
    applyTransform();
  }, { passive: false });

  // ===== ダブルタップ =====
  let lastTap = 0;
  wrapper.addEventListener('touchend', function(e) {
    const now = Date.now();
    if (now - lastTap < 300 && e.changedTouches.length === 1 && mode === 'none') {
      if (scale === 1) {
        scale = 2.5;
      } else {
        resetTransform();
      }
      applyTransform();
    }
    lastTap = now;
  });

  // ===== ボタン制御 =====
  document.querySelectorAll('.results__evidence-btn').forEach(btn => {
    btn.addEventListener('click', function(e) {
      e.preventDefault();
      const imageSrc = this.getAttribute('data-evidence');
      if (!imageSrc) return;
      modalImage.src = imageSrc;
      resetTransform();
      modal.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
    });
  });

  function closeModal() {
    modal.setAttribute('aria-hidden', 'true');
    modalImage.src = '';
    resetTransform();
    document.body.style.overflow = '';
  }

  document.querySelectorAll('[data-close-modal]').forEach(el => {
    el.addEventListener('click', closeModal);
  });

  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && modal.getAttribute('aria-hidden') === 'false') {
      closeModal();
    }
  });
})();