// theOPTION — 口座開設フォーム ウィザード（フロントエンドのみ・デモ送信）
(function () {
  'use strict';

  var form = document.getElementById('suForm');
  if (!form) return;

  var steps = Array.prototype.slice.call(form.querySelectorAll('.su-step'));
  var progSteps = Array.prototype.slice.call(document.querySelectorAll('.su-prog__step'));
  var bar = document.querySelector('.su-prog__bar span');
  var current = 0;

  /* ---------- helpers ---------- */
  function fieldOf(el) { return el.closest('.field') || el.closest('.check'); }
  function setError(el, msg) {
    var f = fieldOf(el); if (!f) return;
    f.classList.add('has-error');
    el.setAttribute('aria-invalid', 'true');
    var e = f.querySelector('.field__error');
    if (e && msg) { e.textContent = msg; if (el.getAttribute('aria-describedby') !== e.id && e.id) el.setAttribute('aria-describedby', e.id); }
  }
  function clearError(el) {
    var f = fieldOf(el); if (!f) return;
    f.classList.remove('has-error');
    el.removeAttribute('aria-invalid');
  }
  var emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  function validateField(el) {
    var v = (el.value || '').trim();
    if (el.hasAttribute('required') && !v && el.type !== 'checkbox') { setError(el, '入力してください'); return false; }
    if (el.type === 'email' && v && !emailRe.test(v)) { setError(el, '正しいメールアドレスを入力してください'); return false; }
    if (el.id === 'su-pw' && v && (v.length < 8 || !/[a-zA-Z]/.test(v) || !/[0-9]/.test(v))) {
      setError(el, '8文字以上・英字と数字を含めてください'); return false;
    }
    if (el.id === 'su-tel' && v && !/^[0-9+\-() ]{8,}$/.test(v)) { setError(el, '正しい電話番号を入力してください'); return false; }
    if (el.type === 'checkbox' && el.hasAttribute('required') && !el.checked) { setError(el, ''); return false; }
    clearError(el); return true;
  }

  function validateStep(i) {
    var fields = steps[i].querySelectorAll('input, select');
    var ok = true, first = null;
    Array.prototype.forEach.call(fields, function (el) {
      if (!validateField(el)) { ok = false; if (!first) first = el; }
    });
    if (first) first.focus();
    return ok;
  }

  /* ---------- step display ---------- */
  function show(i) {
    steps.forEach(function (s, idx) { s.classList.toggle('is-active', idx === i); });
    progSteps.forEach(function (p, idx) {
      p.setAttribute('data-state', idx < i ? 'done' : (idx === i ? 'active' : ''));
    });
    if (bar) bar.style.width = (i / (steps.length - 1) * 100) + '%';
    current = i;
    window.scrollTo({ top: 0, behavior: 'smooth' });
    var h = steps[i].querySelector('.su-step__title');
    if (h) h.setAttribute('tabindex', '-1'), h.focus();
  }

  function buildReview() {
    var map = [
      ['メールアドレス', 'su-email'],
      ['お名前', null],
      ['電話番号', 'su-tel'],
      ['基本通貨', 'su-cur']
    ];
    var sei = (document.getElementById('su-sei').value || '').trim();
    var mei = (document.getElementById('su-mei').value || '').trim();
    var box = document.getElementById('suReview');
    if (!box) return;
    function row(k, v) { return '<div class="su-review__row"><span class="su-review__k">' + k + '</span><span class="su-review__v">' + (v || '—') + '</span></div>'; }
    box.innerHTML =
      row('メールアドレス', escapeHtml(document.getElementById('su-email').value.trim())) +
      row('お名前', escapeHtml((sei + ' ' + mei).trim())) +
      row('電話番号', escapeHtml(document.getElementById('su-tel').value.trim())) +
      row('基本通貨', escapeHtml(document.getElementById('su-cur').value));
  }
  function escapeHtml(s) { return (s || '').replace(/[&<>"']/g, function (c) { return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]; }); }

  /* ---------- navigation ---------- */
  form.addEventListener('click', function (e) {
    var next = e.target.closest('[data-next]');
    var back = e.target.closest('[data-back]');
    if (next) {
      e.preventDefault();
      if (validateStep(current)) {
        if (current + 1 === steps.length - 1) buildReview();
        show(current + 1);
      }
    } else if (back) {
      e.preventDefault();
      show(current - 1);
    }
  });

  /* validate on blur */
  form.addEventListener('blur', function (e) {
    if (e.target.matches('input, select') && e.target.type !== 'checkbox') validateField(e.target);
  }, true);
  form.addEventListener('change', function (e) {
    if (e.target.type === 'checkbox') validateField(e.target);
  });

  /* ---------- password ---------- */
  var pw = document.getElementById('su-pw');
  var toggle = document.querySelector('.field__toggle');
  if (toggle && pw) {
    toggle.addEventListener('click', function () {
      var show = pw.type === 'password';
      pw.type = show ? 'text' : 'password';
      toggle.textContent = show ? '隠す' : '表示';
      toggle.setAttribute('aria-label', show ? 'パスワードを隠す' : 'パスワードを表示');
    });
  }
  var meter = document.querySelector('.pw-meter');
  var pwLabel = document.querySelector('.pw-label');
  if (pw && meter) {
    pw.addEventListener('input', function () {
      var v = pw.value, score = 0;
      if (v.length >= 8) score++;
      if (/[a-z]/.test(v) && /[A-Z]/.test(v)) score++;
      if (/[0-9]/.test(v)) score++;
      if (/[^a-zA-Z0-9]/.test(v)) score++;
      if (v.length === 0) score = 0;
      meter.setAttribute('data-score', String(score));
      if (pwLabel) pwLabel.textContent = v.length === 0 ? '' : ['', '弱い', 'やや弱い', '普通', '強い'][score] + 'パスワード';
    });
  }

  /* ---------- submit (front-end demo) ---------- */
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (!validateStep(current)) return;
    var card = document.getElementById('suCard');
    var done = document.getElementById('suDone');
    if (card && done) {
      card.hidden = true;
      done.hidden = false;
      window.scrollTo({ top: 0, behavior: 'smooth' });
      var h = done.querySelector('.su-done__title');
      if (h) h.setAttribute('tabindex', '-1'), h.focus();
    }
  });

  show(0);
})();
