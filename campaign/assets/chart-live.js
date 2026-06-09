/* === Live mini-chart in hero device + ticker live updates === */

(function () {
  // ── Hero device mini chart ─────────────────────────────────────────────
  function makeSeries(n, start, vol) {
    const out = [];
    let p = start;
    for (let i = 0; i < n; i++) {
      const o = p;
      p = +(p + (Math.random() - 0.5) * vol).toFixed(3);
      const h = Math.max(o, p) + Math.random() * vol * 0.4;
      const l = Math.min(o, p) - Math.random() * vol * 0.4;
      out.push({ o, h, l, c: p });
    }
    return out;
  }

  function drawChart(cvs, candles) {
    const ctx = cvs.getContext("2d");
    const dpr = window.devicePixelRatio || 1;
    const w = cvs.clientWidth, h = cvs.clientHeight;
    if (cvs.width !== w * dpr || cvs.height !== h * dpr) {
      cvs.width = w * dpr; cvs.height = h * dpr;
    }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);

    const padL = 8, padR = 50, padT = 14, padB = 14;
    const innerW = w - padL - padR, innerH = h - padT - padB;

    let min = Infinity, max = -Infinity;
    for (const c of candles) { if (c.l < min) min = c.l; if (c.h > max) max = c.h; }
    const pad = (max - min) * 0.15;
    min -= pad; max += pad;

    const xFor = (i) => padL + (i + 0.5) * (innerW / candles.length);
    const yFor = (p) => padT + (1 - (p - min) / (max - min)) * innerH;

    // grid
    ctx.strokeStyle = "rgba(255,255,255,0.04)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let i = 1; i < 5; i++) {
      const y = padT + (i * innerH) / 5;
      ctx.moveTo(padL, y); ctx.lineTo(padL + innerW, y);
    }
    ctx.stroke();

    // candles
    const cw = Math.max(1.5, Math.min(8, (innerW / candles.length) * 0.65));
    for (let i = 0; i < candles.length; i++) {
      const c = candles[i];
      const x = xFor(i);
      const isUp = c.c >= c.o;
      ctx.strokeStyle = isUp ? "#00e08a" : "#ff3b6b";
      ctx.fillStyle = isUp ? "#00e08a" : "#ff3b6b";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x, yFor(c.h));
      ctx.lineTo(x, yFor(c.l));
      ctx.stroke();
      const yO = yFor(c.o), yC = yFor(c.c);
      ctx.fillRect(x - cw / 2, Math.min(yO, yC), cw, Math.max(1, Math.abs(yC - yO)));
    }

    // strike line
    const strike = candles[Math.floor(candles.length * 0.55)].c;
    ctx.strokeStyle = "rgba(245,197,66,0.7)";
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    ctx.moveTo(padL, yFor(strike));
    ctx.lineTo(padL + innerW, yFor(strike));
    ctx.stroke();
    ctx.setLineDash([]);

    const lastY = yFor(candles[candles.length - 1].c);
    return { lastY, last: candles[candles.length - 1].c };
  }

  function initHeroChart() {
    const cvs = document.getElementById("hero-chart");
    if (!cvs) return;
    let candles = makeSeries(50, 156.234, 0.06);
    const tag = document.getElementById("hero-price-tag");

    const update = () => {
      const last = candles[candles.length - 1];
      const o = last.c;
      const c = +(o + (Math.random() - 0.5) * 0.06).toFixed(3);
      const h = Math.max(o, c) + Math.random() * 0.02;
      const l = Math.min(o, c) - Math.random() * 0.02;
      candles = [...candles.slice(-49), { o, h, l, c }];
      const info = drawChart(cvs, candles);
      if (tag) {
        tag.textContent = info.last.toFixed(3);
        tag.style.top = info.lastY + "px";
      }
    };
    update();
    setInterval(update, 900);
    new ResizeObserver(() => drawChart(cvs, candles)).observe(cvs);
  }

  // ── Mobile preview chart ────────────────────────────────────────────────
  function initMobileChart() {
    const cvs = document.getElementById("mobile-chart");
    if (!cvs) return;
    let candles = makeSeries(40, 156.234, 0.08);
    const update = () => {
      const last = candles[candles.length - 1];
      const o = last.c;
      const c = +(o + (Math.random() - 0.5) * 0.08).toFixed(3);
      const h = Math.max(o, c) + Math.random() * 0.03;
      const l = Math.min(o, c) - Math.random() * 0.03;
      candles = [...candles.slice(-39), { o, h, l, c }];
      drawChart(cvs, candles);
    };
    update();
    setInterval(update, 1100);
  }

  // ── Sparklines on asset cards ───────────────────────────────────────────
  function drawSpark(cvs, points, color) {
    const ctx = cvs.getContext("2d");
    const dpr = window.devicePixelRatio || 1;
    const w = cvs.clientWidth, h = cvs.clientHeight;
    cvs.width = w * dpr; cvs.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);
    let min = Math.min(...points), max = Math.max(...points);
    const r = max - min || 1;
    // area
    const grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, color + "60");
    grad.addColorStop(1, color + "00");
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.moveTo(0, h);
    for (let i = 0; i < points.length; i++) {
      const x = (i / (points.length - 1)) * w;
      const y = h - ((points[i] - min) / r) * (h - 4) - 2;
      ctx.lineTo(x, y);
    }
    ctx.lineTo(w, h);
    ctx.closePath();
    ctx.fill();
    // line
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    for (let i = 0; i < points.length; i++) {
      const x = (i / (points.length - 1)) * w;
      const y = h - ((points[i] - min) / r) * (h - 4) - 2;
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.stroke();
  }
  function initSparklines() {
    document.querySelectorAll(".spark").forEach((cvs) => {
      const trend = parseFloat(cvs.dataset.trend) || 0;
      const color = trend >= 0 ? "#00e08a" : "#ff3b6b";
      const points = [];
      let v = 50;
      for (let i = 0; i < 30; i++) {
        v += (Math.random() - 0.5) * 6 + (trend * 0.4);
        points.push(v);
      }
      drawSpark(cvs, points, color);
    });
  }

  // ── Ticker live updates ────────────────────────────────────────────────
  function initTickerUpdates() {
    const items = document.querySelectorAll(".ticker-item .px");
    setInterval(() => {
      items.forEach((el) => {
        const v = parseFloat(el.dataset.v);
        if (isNaN(v)) return;
        const vol = parseFloat(el.dataset.vol) || 0.01;
        const newV = v + (Math.random() - 0.5) * vol;
        el.dataset.v = newV;
        const digits = v > 1000 ? 1 : 3;
        el.textContent = newV.toLocaleString(undefined, { minimumFractionDigits: digits, maximumFractionDigits: digits });
      });
    }, 1500);
  }

  // ── Scroll reveal ──────────────────────────────────────────────────────
  function initReveal() {
    // Mark body so CSS hides .reveal items only when JS is loaded — graceful
    // degradation prevents content from staying invisible if JS fails.
    document.body.classList.add("js-reveal-init");
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (e.isIntersecting) {
          e.target.classList.add("in");
          io.unobserve(e.target);
        }
      }
    }, { threshold: 0.1 });
    document.querySelectorAll(".reveal").forEach((el) => io.observe(el));
  }

  // ── Stats count-up ─────────────────────────────────────────────────────
  function initStats() {
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (!e.isIntersecting) continue;
        const el = e.target;
        const target = parseFloat(el.dataset.target);
        const decimals = parseInt(el.dataset.decimals || "0", 10);
        const prefix = el.dataset.prefix || "";
        const suffix = el.dataset.suffix || "";
        let start = null;
        const dur = 1400;
        const step = (ts) => {
          if (!start) start = ts;
          const p = Math.min(1, (ts - start) / dur);
          const ease = 1 - Math.pow(1 - p, 3);
          const v = target * ease;
          el.firstChild.nodeValue = prefix + v.toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals }) + suffix;
          if (p < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
        io.unobserve(el);
      }
    }, { threshold: 0.4 });
    document.querySelectorAll(".count-up").forEach((el) => io.observe(el));
  }

  document.addEventListener("DOMContentLoaded", () => {
    initHeroChart();
    initMobileChart();
    initSparklines();
    initTickerUpdates();
    initReveal();
    initStats();
  });
})();
