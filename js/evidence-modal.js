/* ============================================
   エビデンスモーダル制御 v2
   ★修正⑧: ピンチで拡大後、自由に上下左右移動可能
============================================ */

(function() {
  'use strict';

  const modal = document.getElementById('evidenceModal');
  const modalImage = document.getElementById('evidenceModalImage');
  const wrapper = document.getElementById('evidenceImageWrapper');

  if (!modal || !modalImage || !wrapper) return;

  // ===== 状態管理 =====
  let scale = 1;
  let translateX = 0;
  let translateY = 0;
  let lastScale = 1;
  let lastTranslateX = 0;
  let lastTranslateY = 0;
  let startX = 0;
  let startY = 0;
  let startDistance = 0;
  let isPanning = false;
  let isPinching = false;

  const MIN_SCALE = 1;
  const MAX_SCALE = 5;

  // ===== 変換適用 =====
  function applyTransform() {
    modalImage.style.transform = `translate(${translateX}px, ${translateY}px) scale(${scale})`;
  }

  // ===== リセット =====
  function resetTransform() {
    scale = 1;
    translateX = 0;
    translateY = 0;
    lastScale = 1;
    lastTranslateX = 0;
    lastTranslateY = 0;
    applyTransform();
  }

  // ===== 2点間の距離を計算 =====
  function getDistance(t1, t2) {
    const dx = t2.clientX - t1.clientX;
    const dy = t2.clientY - t1.clientY;
    return Math.sqrt(dx * dx + dy * dy);
  }

  // ===== 2点の中心 =====
  function getMidpoint(t1, t2) {
    return {
      x: (t1.clientX + t2.clientX) / 2,
      y: (t1.clientY + t2.clientY) / 2
    };
  }

  // ===== タッチ開始 =====
  modalImage.addEventListener('touchstart', function(e) {
    e.preventDefault();
    if (e.touches.length === 2) {
      // ピンチ開始
      isPinching = true;
      isPanning = false;
      startDistance = getDistance(e.touches[0], e.touches[1]);
      lastScale = scale;
    } else if (e.touches.length === 1) {
      // パン開始（拡大されている時のみ）
      if (scale > 1) {
        isPanning = true;
        isPinching = false;
        startX = e.touches[0].clientX - translateX;
        startY = e.touches[0].clientY - translateY;
      }
    }
  }, { passive: false });

  // ===== タッチ移動 =====
  modalImage.addEventListener('touchmove', function(e) {
    e.preventDefault();
    if (isPinching && e.touches.length === 2) {
      const distance = getDistance(e.touches[0], e.touches[1]);
      const newScale = Math.max(MIN_SCALE, Math.min(MAX_SCALE, lastScale * (distance / startDistance)));
      scale = newScale;
      applyTransform();
    } else if (isPanning && e.touches.length === 1) {
      translateX = e.touches[0].clientX - startX;
      translateY = e.touches[0].clientY - startY;
      applyTransform();
    }
  }, { passive: false });

  // ===== タッチ終了 =====
  modalImage.addEventListener('touchend', function(e) {
    if (e.touches.length === 0) {
      isPinching = false;
      isPanning = false;
      // 縮小しすぎたらリセット
      if (scale <= 1) {
        resetTransform();
      }
      lastScale = scale;
      lastTranslateX = translateX;
      lastTranslateY = translateY;
    } else if (e.touches.length === 1) {
      isPinching = false;
      // ピンチ終了後、1本指残った場合はパンに切り替え
      if (scale > 1) {
        isPanning = true;
        startX = e.touches[0].clientX - translateX;
        startY = e.touches[0].clientY - translateY;
      }
    }
  });

  // ===== マウス操作（PC対応）=====
  let isMouseDown = false;
  let mouseStartX = 0;
  let mouseStartY = 0;

  modalImage.addEventListener('mousedown', function(e) {
    if (scale > 1) {
      isMouseDown = true;
      mouseStartX = e.clientX - translateX;
      mouseStartY = e.clientY - translateY;
      modalImage.style.cursor = 'grabbing';
      e.preventDefault();
    }
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

  // ===== ホイールでズーム（PC）=====
  wrapper.addEventListener('wheel', function(e) {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    const newScale = Math.max(MIN_SCALE, Math.min(MAX_SCALE, scale + delta));
    scale = newScale;
    if (scale <= 1) {
      translateX = 0;
      translateY = 0;
    }
    modalImage.style.cursor = scale > 1 ? 'grab' : 'default';
    applyTransform();
  }, { passive: false });

  // ===== ダブルタップでズームトグル =====
  let lastTap = 0;
  modalImage.addEventListener('touchend', function(e) {
    const now = Date.now();
    if (now - lastTap < 300 && e.touches.length === 0) {
      // ダブルタップ
      if (scale === 1) {
        scale = 2.5;
      } else {
        resetTransform();
      }
      applyTransform();
    }
    lastTap = now;
  });

  // ===== ボタンクリックで開く =====
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

  // ===== 閉じる =====
  function closeModal() {
    modal.setAttribute('aria-hidden', 'true');
    modalImage.src = '';
    resetTransform();
    document.body.style.overflow = '';
  }

  document.querySelectorAll('[data-close-modal]').forEach(el => {
    el.addEventListener('click', closeModal);
  });

  // ESCキーで閉じる
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && modal.getAttribute('aria-hidden') === 'false') {
      closeModal();
    }
  });
})();