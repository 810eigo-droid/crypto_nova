/* ============================================
   エビデンスモーダル制御 v4
   - 拡大状態キープ
   - 最初から大きめに表示
   - ズームボタン対応
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
  let mode = 'none';

  const MIN_SCALE = 0.5;
  const MAX_SCALE = 8;
  const INITIAL_SCALE = 1.5;

  function applyTransform() {
    modalImage.style.transform = `translate(${translateX}px, ${translateY}px) scale(${scale})`;
  }

  function setInitialZoom() {
    scale = INITIAL_SCALE;
    translateX = 0;
    translateY = 0;
    lastScale = INITIAL_SCALE;
    applyTransform();
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

  wrapper.addEventListener('touchstart', function(e) {
    if (e.touches.length === 2) {
      mode = 'pinch';
      startDistance = getDistance(e.touches[0], e.touches[1]);
      lastScale = scale;
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
      mode = 'none';
      lastScale = scale;
    } else if (e.touches.length === 1) {
      mode = 'pan';
      startX = e.touches[0].clientX - translateX;
      startY = e.touches[0].clientY - translateY;
    }
  });

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
    modalImage.style.cursor = 'grab';
  });

  wrapper.addEventListener('wheel', function(e) {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.2 : 0.2;
    scale = Math.max(MIN_SCALE, Math.min(MAX_SCALE, scale + delta));
    applyTransform();
  }, { passive: false });

  let lastTap = 0;
  wrapper.addEventListener('touchend', function(e) {
    const now = Date.now();
    if (now - lastTap < 300 && e.changedTouches.length === 1 && mode === 'none') {
      if (scale > INITIAL_SCALE) {
        setInitialZoom();
      } else {
        scale = 3;
        applyTransform();
        lastScale = scale;
      }
    }
    lastTap = now;
  });

  function zoomIn() {
    scale = Math.min(MAX_SCALE, scale + 0.5);
    applyTransform();
    lastScale = scale;
  }

  function zoomOut() {
    scale = Math.max(MIN_SCALE, scale - 0.5);
    applyTransform();
    lastScale = scale;
  }

  function zoomReset() {
    setInitialZoom();
  }

  const btnZoomIn = document.getElementById('evidenceZoomIn');
  const btnZoomOut = document.getElementById('evidenceZoomOut');
  const btnZoomReset = document.getElementById('evidenceZoomReset');

  if (btnZoomIn) btnZoomIn.addEventListener('click', zoomIn);
  if (btnZoomOut) btnZoomOut.addEventListener('click', zoomOut);
  if (btnZoomReset) btnZoomReset.addEventListener('click', zoomReset);

  document.querySelectorAll('.results__evidence-btn').forEach(btn => {
    btn.addEventListener('click', function(e) {
      e.preventDefault();
      const imageSrc = this.getAttribute('data-evidence');
      if (!imageSrc) return;
      modalImage.src = imageSrc;
      modal.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
      setTimeout(setInitialZoom, 50);
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