/* === Vanilla Tweaks panel for landing.html ===
   Implements the host protocol: register listener BEFORE announcing
   __edit_mode_available. Persists via __edit_mode_set_keys → host
   rewrites the EDITMODE-BEGIN/END JSON block in this file on disk. */

(function () {
  const DEFAULTS = /*EDITMODE-BEGIN*/{
    "surface": "frosted",
    "atmosphere": "midnight",
    "hero": "split"
  }/*EDITMODE-END*/;

  let state = { ...DEFAULTS };

  // === Configuration of controls (label + options) ===
  const CONTROLS = [
    {
      key: "surface",
      label: "サーフェス",
      desc: "ガラス感の強度。フロステッドが標準、ヴェイパーは極限まで透ける。",
      options: [
        { v: "solid",    l: "ソリッド" },
        { v: "frosted",  l: "フロステッド" },
        { v: "vapor",    l: "ヴェイパー" },
      ],
    },
    {
      key: "atmosphere",
      label: "アトモスフィア",
      desc: "背景の温度と色。ミッドナイトは深夜、オーロラは虹彩、ポーセリンは白磁。",
      options: [
        { v: "midnight",  l: "ミッドナイト" },
        { v: "aurora",    l: "オーロラ" },
        { v: "porcelain", l: "ポーセリン" },
      ],
    },
    {
      key: "hero",
      label: "ヒーロー構成",
      desc: "ファーストビューの構成。スプリットは現状、シネマティックは中央巨大、ミニマルはデバイス無し。",
      options: [
        { v: "split",     l: "スプリット" },
        { v: "cinematic", l: "シネマティック" },
        { v: "minimal",   l: "ミニマル" },
      ],
    },
  ];

  function apply() {
    const root = document.documentElement;
    root.dataset.surface = state.surface;
    root.dataset.atmosphere = state.atmosphere;
    root.dataset.hero = state.hero;
  }

  // === Build panel DOM ===
  function buildPanel() {
    const panel = document.createElement("div");
    panel.className = "tw-panel";
    panel.innerHTML = `
      <div class="tw-head">
        <span class="ti">Tweaks</span>
        <button class="x" aria-label="閉じる">×</button>
      </div>
      <div class="tw-body"></div>
      <div class="tw-foot">変更は<b>保存</b>されます · リロード後も維持</div>
    `;
    const body = panel.querySelector(".tw-body");
    for (const ctrl of CONTROLS) {
      const sect = document.createElement("div");
      sect.className = "tw-sect";
      sect.innerHTML = `
        <div class="tw-sect-label">${ctrl.label}</div>
        <div class="tw-sect-desc">${ctrl.desc}</div>
        <div class="tw-segs" data-key="${ctrl.key}"></div>
      `;
      const segs = sect.querySelector(".tw-segs");
      for (const opt of ctrl.options) {
        const b = document.createElement("button");
        b.className = "tw-seg" + (state[ctrl.key] === opt.v ? " active" : "");
        b.textContent = opt.l;
        b.dataset.value = opt.v;
        b.addEventListener("click", () => {
          state[ctrl.key] = opt.v;
          // mark active
          segs.querySelectorAll(".tw-seg").forEach((s) => s.classList.remove("active"));
          b.classList.add("active");
          apply();
          // persist via host
          window.parent.postMessage(
            { type: "__edit_mode_set_keys", edits: { [ctrl.key]: opt.v } },
            "*"
          );
        });
        segs.appendChild(b);
      }
      body.appendChild(sect);
    }
    panel.querySelector(".x").addEventListener("click", () => {
      panel.classList.remove("open");
      window.parent.postMessage({ type: "__edit_mode_dismissed" }, "*");
    });
    document.body.appendChild(panel);
    return panel;
  }

  // === Init ===
  function init() {
    apply();
    const panel = buildPanel();

    // Register listener FIRST, then announce availability
    window.addEventListener("message", (e) => {
      const data = e.data;
      if (!data || typeof data !== "object") return;
      if (data.type === "__activate_edit_mode") {
        panel.classList.add("open");
      } else if (data.type === "__deactivate_edit_mode") {
        panel.classList.remove("open");
      }
    });
    window.parent.postMessage({ type: "__edit_mode_available" }, "*");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
