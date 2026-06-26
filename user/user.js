let data = window.getDramaConfig ? window.getDramaConfig() : window.DRAMA_DATA;
let nodes = data.nodes;
const app = document.querySelector("#app");

const state = {
  view: "home",
  current: "n1",
  visited: ["n1"],
  history: [],
  endings: [],
  paid: false,
  trust: 0,
  toast: "",
  pendingNode: null
};

function escapeHtml(value = "") {
  return String(value).replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "\"": "&quot;",
    "'": "&#39;"
  }[char]));
}

function safeMediaUrl(value = "", kind = "video") {
  const url = String(value).trim();
  if (!url) return "";
  if (kind === "video" && url.startsWith("data:video/")) return url;
  if (kind === "image" && url.startsWith("data:image/")) return url;
  try {
    const parsed = new URL(url, window.location.href);
    return ["http:", "https:", "blob:"].includes(parsed.protocol) ? parsed.href : "";
  } catch (error) {
    return "";
  }
}

function applyConfig(nextConfig) {
  data = window.normalizeDramaConfig ? window.normalizeDramaConfig(nextConfig) : nextConfig;
  nodes = data.nodes;
  if (!nodes.some((node) => node.id === state.current)) {
    state.current = nodes[0]?.id || "";
    state.visited = state.current ? [state.current] : [];
  }
}

function getNode(id = state.current) {
  return nodes.find((node) => node.id === id) || nodes[0];
}

function setView(view) {
  state.view = view;
  render();
}

function progress() {
  return nodes.length ? Math.round((state.visited.length / nodes.length) * 100) : 0;
}

function showToast(message) {
  state.toast = message;
  render();
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => {
    state.toast = "";
    render();
  }, 1400);
}

function visitNode(targetId) {
  const target = getNode(targetId);
  state.current = target.id;
  if (!state.visited.includes(target.id)) state.visited.push(target.id);
  if (target.type === "ending" && !state.endings.includes(target.id)) {
    state.endings.push(target.id);
  }
  state.view = target.type === "ending" ? "ending" : "player";
  render();
}

function choose(index) {
  const current = getNode();
  const choice = current.choices[index];
  if (!choice) return;

  const target = getNode(choice.target);
  if (target.type === "paid" && !state.paid) {
    state.pendingNode = target.id;
    state.view = "pay";
    render();
    return;
  }

  state.history.push({
    from: current.title,
    choice: choice.label,
    to: target.title
  });
  state.trust += choice.trust;
  visitNode(target.id);
  showToast("已自动存档");
}

function pay(success) {
  if (!success) {
    showToast("支付未完成，可稍后继续解锁");
    return;
  }
  state.paid = true;
  state.history.push({
    from: "付费解锁",
    choice: `¥${data.project.price.toFixed(2)}`,
    to: getNode(state.pendingNode || data.project.unlockNode).title
  });
  visitNode(state.pendingNode || data.project.unlockNode);
  showToast("支付成功，剧情已解锁");
}

function resetRun() {
  state.view = "home";
  state.current = "n1";
  state.visited = ["n1"];
  state.history = [];
  state.endings = [];
  state.trust = 0;
  state.pendingNode = null;
  render();
  showToast("进度已重置");
}

function hasPlayableVideo(node) {
  return Boolean(safeMediaUrl(node?.video?.url));
}

function renderNodeVideo(node) {
  const videoUrl = safeMediaUrl(node?.video?.url);
  if (!videoUrl) return "";
  const posterUrl = safeMediaUrl(node?.video?.poster, "image");
  const playMode = node?.video?.playMode || "manual";
  const autoAttrs = playMode === "autoplay" ? " autoplay muted loop" : "";
  const mutedAttr = playMode === "muted" ? " muted" : "";
  return `
    <video
      class="node-video"
      src="${escapeHtml(videoUrl)}"
      ${posterUrl ? `poster="${escapeHtml(posterUrl)}"` : ""}
      controls
      playsinline
      preload="metadata"${autoAttrs}${mutedAttr}>
    </video>
  `;
}

function statusBar() {
  return `
    <header class="mini-top">
      <div>
        <span class="mini-time">9:41</span>
        <strong>${escapeHtml(data.project.title)}</strong>
      </div>
      <button class="icon-button" data-action="reset" aria-label="重置进度">↻</button>
    </header>
  `;
}

function bottomTabs(active) {
  const tabs = [
    ["home", "剧场", "home"],
    ["player", "剧情", "play"],
    ["map", "剧情图", "map"],
    ["profile", "我的", "user"]
  ];
  return `
    <nav class="bottom-tabs" aria-label="用户端导航">
      ${tabs.map(([view, label, icon]) => `
        <button class="${active === view ? "is-active" : ""}" data-action="view" data-view="${view}">
          <span class="tab-icon tab-${icon}"></span>
          ${label}
        </button>
      `).join("")}
    </nav>
  `;
}

function homeView() {
  const current = getNode();
  return `
    ${statusBar()}
    <section class="hero-card">
      <div class="hero-cover"></div>
      <div class="hero-copy">
        <span class="eyebrow">${escapeHtml(data.project.subtitle)}</span>
        <h1>${escapeHtml(data.project.title)}</h1>
        <p>每一次选择都会改变信任值、剧情路线和结局收集。</p>
        <div class="hero-actions">
          <button class="primary-action" data-action="start">继续观看</button>
          <button class="ghost-action" data-action="view" data-view="map">剧情图</button>
        </div>
      </div>
    </section>

    <section class="content-section">
      <div class="section-title">
        <h2>当前进度</h2>
        <span>${progress()}%</span>
      </div>
      <button class="continue-card" data-action="start">
        <div class="continue-thumb"></div>
        <div>
          <strong>${escapeHtml(current.title)}</strong>
          <p>${escapeHtml(current.summary)}</p>
          <small>已探索 ${state.visited.length}/${nodes.length} · 信任值 ${state.trust}</small>
        </div>
      </button>
    </section>

    <section class="content-section">
      <div class="section-title">
        <h2>热门分支</h2>
        <span>实时</span>
      </div>
      <div class="mini-grid">
        ${nodes.filter((node) => node.type !== "ending").slice(0, 4).map((node) => `
          <button class="mini-card" data-action="node" data-node="${node.id}">
            <span class="mini-card-poster"></span>
            <strong>${escapeHtml(node.title)}</strong>
            <small>${node.type === "paid" ? "付费节点" : "剧情节点"}</small>
          </button>
        `).join("")}
      </div>
    </section>
    ${bottomTabs("home")}
  `;
}

function playerView() {
  const node = getNode();
  if (node.type === "ending") return endingView();

  return `
    ${statusBar()}
    <section class="player-page">
      <div class="player-media ${hasPlayableVideo(node) ? "has-video" : ""}">
        ${renderNodeVideo(node)}
        <div class="player-controls">
          <button class="ghost-on-dark" data-action="view" data-view="home">返回</button>
          <button class="ghost-on-dark" data-action="view" data-view="map">剧情图</button>
        </div>
        <div class="player-progress">
          <span style="width:${progress()}%"></span>
        </div>
        <div class="caption-panel">
          <span class="eyebrow">${escapeHtml(node.duration)} · ${hasPlayableVideo(node) ? "视频节点" : "未配视频"} · ${node.type === "paid" ? "已解锁" : "互动剧情"}</span>
          <h1>${escapeHtml(node.title)}</h1>
          <p>${escapeHtml(node.summary)}</p>
        </div>
      </div>
      <div class="choice-panel">
        <strong>你会如何选择？</strong>
        ${node.choices.map((choice, index) => `
          <button class="choice-button" data-action="choice" data-index="${index}">
            <span>${escapeHtml(choice.label)}</span>
            <small>${choice.trust >= 0 ? "+" : ""}${choice.trust} 信任</small>
          </button>
        `).join("")}
        <p class="support-text">选择后自动存档，可在剧情图中回看已探索节点。</p>
      </div>
    </section>
  `;
}

function mapView() {
  return `
    ${statusBar()}
    <section class="story-map-page">
      <div class="map-head">
        <div>
          <span class="eyebrow">Story Graph</span>
          <h1>剧情图</h1>
          <p>探索 ${state.visited.length}/${nodes.length} · 结局 ${state.endings.length}/4 · 信任值 ${state.trust}</p>
        </div>
        <button class="ghost-action" data-action="start">继续</button>
      </div>
      <div class="map-board">
        ${nodes.map((node) => {
          const isVisited = state.visited.includes(node.id);
          const isLocked = node.type === "paid" && !state.paid;
          const isActive = node.id === state.current;
          return `
            <button
              class="story-node ${isVisited ? "is-visited" : ""} ${isLocked ? "is-locked" : ""} ${isActive ? "is-current" : ""}"
              style="left:${node.position.x}%;top:${node.position.y}%"
              data-action="node"
              data-node="${node.id}">
              <small>${isLocked ? "待解锁" : node.type}</small>
              <strong>${escapeHtml(node.title.replace("第", ""))}</strong>
            </button>
          `;
        }).join("")}
        <svg class="map-lines" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
          <path d="M17 52 C22 30,24 26,32 27 S43 40,52 50" />
          <path d="M17 52 C23 68,25 70,32 70 S43 57,52 50" />
          <path d="M57 50 C63 24,70 19,80 21" />
          <path d="M57 50 C65 43,70 41,80 45" />
          <path d="M57 50 C66 60,70 64,80 69" />
          <path d="M58 50 C58 62,58 72,60 80" />
        </svg>
      </div>
    </section>
    ${bottomTabs("map")}
  `;
}

function payView() {
  const node = getNode(state.pendingNode || data.project.unlockNode);
  return `
    ${statusBar()}
    <section class="pay-page">
      <div class="pay-card">
        <span class="eyebrow">付费节点</span>
        <h1>${escapeHtml(node.title)}</h1>
        <p>${escapeHtml(node.summary)}</p>
        <div class="price">¥${data.project.price.toFixed(2)}</div>
        <button class="primary-action" data-action="pay-ok">模拟支付成功</button>
        <button class="danger-action" data-action="pay-fail">模拟支付失败</button>
        <button class="ghost-action" data-action="view" data-view="player">关闭</button>
      </div>
    </section>
  `;
}

function endingView() {
  const node = getNode();
  return `
    ${statusBar()}
    <section class="ending-page">
      <div class="ending-card">
        <span class="eyebrow">已达成结局</span>
        <h1>${escapeHtml(node.ending)}</h1>
        <p>${escapeHtml(node.summary)}</p>
        <dl>
          <div><dt>信任值</dt><dd>${state.trust}</dd></div>
          <div><dt>探索进度</dt><dd>${progress()}%</dd></div>
          <div><dt>已解锁</dt><dd>${state.paid ? "是" : "否"}</dd></div>
        </dl>
        <button class="primary-action" data-action="view" data-view="map">查看剧情图</button>
        <button class="ghost-action" data-action="reset">从头重玩</button>
      </div>
    </section>
  `;
}

function profileView() {
  return `
    ${statusBar()}
    <section class="content-section profile-page">
      <div class="profile-card">
        <div class="avatar">剧</div>
        <div>
          <h1>我的互动剧场</h1>
          <p>云端存档、权益和结局收集集中管理。</p>
        </div>
      </div>
      <div class="profile-grid">
        <div><strong>${progress()}%</strong><span>探索</span></div>
        <div><strong>${state.endings.length}</strong><span>结局</span></div>
        <div><strong>${state.paid ? "1" : "0"}</strong><span>权益</span></div>
      </div>
      <div class="history-list">
        <h2>最近选择</h2>
        ${state.history.length ? state.history.slice(-5).reverse().map((item) => `
          <article>
            <strong>${escapeHtml(item.from)}</strong>
            <p>${escapeHtml(item.choice)} → ${escapeHtml(item.to)}</p>
          </article>
        `).join("") : "<p class=\"support-text\">暂无选择记录</p>"}
      </div>
    </section>
    ${bottomTabs("profile")}
  `;
}

function render() {
  const viewMap = {
    home: homeView,
    player: playerView,
    map: mapView,
    pay: payView,
    ending: endingView,
    profile: profileView
  };
  app.innerHTML = `
    <div class="mini-screen">
      ${(viewMap[state.view] || homeView)()}
      ${state.toast ? `<div class="toast">${state.toast}</div>` : ""}
    </div>
  `;
}

app.addEventListener("click", (event) => {
  const button = event.target.closest("[data-action]");
  if (!button) return;

  const action = button.dataset.action;
  if (action === "view") setView(button.dataset.view);
  if (action === "start") {
    const node = getNode();
    state.view = node.type === "ending" ? "ending" : "player";
    render();
  }
  if (action === "choice") choose(Number(button.dataset.index));
  if (action === "pay-ok") pay(true);
  if (action === "pay-fail") pay(false);
  if (action === "reset") resetRun();
  if (action === "node") {
    const node = getNode(button.dataset.node);
    if (node.type === "paid" && !state.paid) {
      state.pendingNode = node.id;
      setView("pay");
      return;
    }
    visitNode(node.id);
  }
});

render();

window.addEventListener("storage", (event) => {
  if (event.key !== window.DRAMA_CONFIG_KEY) return;
  applyConfig(window.getDramaConfig ? window.getDramaConfig() : window.DRAMA_DATA);
  render();
  showToast("后台配置已同步");
});
