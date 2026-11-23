/* 滾一鍋 AI Showcase 介紹頁互動：時間軸、腳本列、聲音、分鏡橫捲、播放器同步 */
(() => {
  const S = window.SHOTS, A = window.AUDIO, TOTAL = 25.5;
  const $ = (q, el = document) => el.querySelector(q);
  const tc = (s) => { const m = Math.floor(s / 60), r = (s - m * 60).toFixed(1).padStart(4, "0"); return `${String(m).padStart(2, "0")}:${r}`; };
  const video = $("#video");

  // 時間軸
  const bar = $("#bar");
  S.forEach((s, i) => {
    const b = document.createElement("button");
    b.style.flex = `${s.t1 - s.t0} 0 0`;
    b.style.backgroundImage = `url(${s.img})`;
    b.title = `${tc(s.t0)}  ${s.code} ${s.desc}`;
    b.setAttribute("aria-label", b.title);
    b.addEventListener("click", () => seek(i));
    bar.appendChild(b);
  });

  // 腳本列
  const rows = $("#rows");
  S.forEach((s, i) => {
    const li = document.createElement("li");
    li.className = "row rv";
    li.innerHTML = `
      <div class="when"><span class="tc">${tc(s.t0)}</span><span class="dur">${(s.t1 - s.t0).toFixed(1)}s</span><i class="d ${s.act}"></i></div>
      <div class="shot"><img src="${s.img}" alt="${s.desc}" loading="lazy" data-i="${i}"></div>
      <div><h4><code>${s.code}</code></h4><p class="desc">${s.desc}</p>${s.cap ? `<span class="cap">字幕：${s.cap}</span>` : ""}</div>
      <div class="say">${s.lines.map((l) => `<p>${l}</p>`).join("") || `<p class="snd" style="margin:0">無台詞</p>`}${s.sounds.length ? `<p class="snd">${s.sounds.join("・")}</p>` : ""}</div>`;
    rows.appendChild(li);
  });

  // 聲音
  const PLAY = '<svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>';
  const STOP = '<svg viewBox="0 0 24 24"><rect x="7" y="7" width="10" height="10"/></svg>';
  const au = new Audio(); let cur = null;
  const list = $("#audio");
  A.forEach((a) => {
    const li = document.createElement("li");
    li.innerHTML = `<button aria-label="播放 ${a.who}">${PLAY}</button><div><div class="who">${a.who}</div><div class="txt">${a.text}</div><div class="prog"><i></i></div></div>`;
    $("button", li).addEventListener("click", () => {
      if (cur === li) { au.pause(); return; }
      au.src = `media/audio/${a.k}.mp3`; au.play(); video.pause();
      if (cur) reset(cur); cur = li; li.classList.add("playing"); $("button", li).innerHTML = STOP;
    });
    list.appendChild(li);
  });
  const reset = (li) => { li.classList.remove("playing"); $("button", li).innerHTML = PLAY; $(".prog i", li).style.width = "0"; };
  au.addEventListener("timeupdate", () => { if (cur && au.duration) $(".prog i", cur).style.width = `${(au.currentTime / au.duration) * 100}%`; });
  ["pause", "ended"].forEach((e) => au.addEventListener(e, () => { if (cur) reset(cur); cur = null; }));

  // 分鏡卡
  const track = $("#track");
  const boards = [];
  S.forEach((s) => {
    if (s.act === "end") {
      [["F10_endA", "尾 cut 阿翔"], ["F11_endB", "尾 cut 小琪"], ["F12_endC", "尾 cut 阿凱"], ["F13_endD", "尾 cut 老闆端肉"]].forEach(([f, d]) => boards.push({ img: `media/sb/${f}.jpg`, code: "END", t: s.t0, desc: d }));
      boards.push({ img: s.img, code: "END", t: s.t0, desc: "定版：三格吃肉＋老闆＋logo 文案" });
    } else boards.push({ img: s.img, code: s.code, t: s.t0, desc: s.desc });
  });
  boards.forEach((b) => {
    const el = document.createElement("figure");
    el.className = "card";
    el.innerHTML = `<img src="${b.img}" alt="${b.desc}" loading="lazy"><div class="meta"><span class="tc">${tc(b.t)}</span><code>${b.code}</code></div><p>${b.desc}</p>`;
    track.appendChild(el);
  });

  // 燈箱
  const lb = document.createElement("div");
  lb.className = "lb"; lb.innerHTML = "<div><img alt=''><p></p></div>";
  document.body.appendChild(lb);
  document.addEventListener("click", (e) => {
    const img = e.target.closest(".row img, .card img, .cast img, .plate-row img, .lays img");
    if (img) { $("img", lb).src = img.src; $("p", lb).textContent = img.alt; lb.classList.add("open"); }
    else if (e.target.closest(".lb")) lb.classList.remove("open");
  });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") lb.classList.remove("open"); });

  // 播放器同步
  const segs = [...bar.children];
  const nowtc = $("#nowtc"), nowtx = $("#nowtx");
  video.addEventListener("timeupdate", () => {
    const t = video.currentTime;
    const i = S.findIndex((s) => t >= s.t0 && t < s.t1);
    nowtc.textContent = tc(t);
    if (i >= 0) { nowtx.textContent = `${S[i].code} ${S[i].desc}`; segs.forEach((b, j) => b.classList.toggle("on", j === i)); }
  });
  video.addEventListener("play", () => au.pause());
  function seek(i) {
    video.currentTime = S[i].t0 + 0.01;
    lenis ? lenis.scrollTo("#film", { offset: -72 }) : $("#film").scrollIntoView();
  }

  // 捲動
  gsap.registerPlugin(ScrollTrigger);
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  let lenis = null;
  if (!reduce && window.Lenis) {
    lenis = new Lenis({ lerp: 0.1 });
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
    document.querySelectorAll('a[href^="#"]').forEach((a) => a.addEventListener("click", (e) => { e.preventDefault(); lenis.scrollTo(a.getAttribute("href"), { offset: a.getAttribute("href") === "#top" ? 0 : -72 }); }));
  }

  const nav = $(".nav");
  ScrollTrigger.create({ start: 80, onUpdate: (st) => nav.classList.toggle("solid", st.scroll() > 80) });
  // 導覽高亮要在橫捲 pin 之後建立，位置才會算進 pin 的長度
  const navActive = () => document.querySelectorAll("#idea, #script, #assets, #boards, #film").forEach((sec) => {
    const el = sec.parentElement.classList.contains("pin-spacer") ? sec.parentElement : sec;
    ScrollTrigger.create({ trigger: el, start: "top 50%", end: "bottom 50%", onToggle: (st) => { if (st.isActive) document.querySelectorAll(".nav nav a").forEach((a) => a.classList.toggle("on", a.getAttribute("href") === `#${sec.id}`)); } });
  });

  if (reduce) { navActive(); return; }
  // 進場：淡入上浮一次
  gsap.from(".hero-copy > *", { y: 24, opacity: 0, duration: 0.9, ease: "power3.out", stagger: 0.08, delay: 0.1 });
  gsap.from(".hero-img", { scale: 1.06, duration: 2.4, ease: "power2.out" });
  gsap.to(".hero-img", { yPercent: 8, ease: "none", scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true } });
  document.querySelectorAll(".rv").forEach((el) => {
    gsap.from(el, { y: 24, opacity: 0, duration: 0.8, ease: "power3.out", scrollTrigger: { trigger: el, start: "top 88%", once: true } });
  });

  // 分鏡橫捲
  const mm = gsap.matchMedia();
  mm.add("(min-width: 961px)", () => {
    const dist = () => track.scrollWidth - innerWidth;
    gsap.to(track, { x: () => -dist(), ease: "none", scrollTrigger: { trigger: "#boards", start: "top top", end: () => `+=${dist()}`, pin: true, scrub: 0.6, invalidateOnRefresh: true } });
  });
  mm.add("(max-width: 960px)", () => { $(".boards").style.height = "auto"; track.style.overflowX = "auto"; track.style.width = "auto"; track.style.paddingBottom = "16px"; });

  navActive();
  ScrollTrigger.refresh();

  // 背景跟片子一樣從冷轉暖：到了影片段落就是店裡的暖色
  gsap.to(".tone, .steps li, .audio li", { backgroundColor: "#1e1a17", ease: "none", scrollTrigger: { trigger: "#film", start: "top 90%", end: "top 30%", scrub: true } });
})();
