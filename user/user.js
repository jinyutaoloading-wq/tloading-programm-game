let data = window.getDramaConfig ? window.getDramaConfig() : window.DRAMA_DATA;
let nodes = data.nodes;
const app = document.querySelector("#app");

const state = {
  view: "home",
  activeDramaId: "config",
  currentByDrama: { config: "n1" },
  visitedByDrama: { config: ["n1"] },
  historyByDrama: { config: [] },
  endingsByDrama: { config: [] },
  paidByDrama: { config: false },
  trustByDrama: { config: 0 },
  toast: "",
  pendingNode: null
};

const staticDramas = [
  {
    id: "palace",
    title: "风栖梧桐",
    subtitle: "古风权谋互动剧",
    desc: "女主入局朝堂，你的每一次选择都会影响盟友、权势与最终归宿。",
    coverClass: "cover-palace",
    tags: ["古风", "权谋", "高热度"],
    status: "新章上线",
    price: 6,
    score: "9.2",
    heat: "82.6万",
    unlockNode: "n4",
    template: {
      first: "第1集 凤仪入局",
      secondA: "第2集 夜宴试探",
      secondB: "第2集 密信失踪",
      paid: "第3集 梧桐旧盟",
      endingA: "结局 执掌凤印",
      endingB: "结局 江湖远行",
      endingC: "结局 宫墙月冷",
      endingD: "结局 权谋未歇",
      summary: "宫宴之夜，一封密信把你推入权力中心。"
    }
  },
  {
    id: "sci",
    title: "星海边缘",
    subtitle: "科幻冒险互动剧",
    desc: "深空任务失联，玩家要在情感、真相和幸存者之间做出选择。",
    coverClass: "cover-sci",
    tags: ["科幻", "冒险", "强分支"],
    status: "预约破万",
    price: 5,
    score: "9.0",
    heat: "43.1万",
    unlockNode: "n4",
    template: {
      first: "第1集 失联信号",
      secondA: "第2集 打开舱门",
      secondB: "第2集 隐藏坐标",
      paid: "第3集 星门协议",
      endingA: "结局 归航黎明",
      endingB: "结局 黑匣真相",
      endingC: "结局 孤舰远行",
      endingD: "结局 星海未尽",
      summary: "边缘星港收到求救信号，你决定是否越过禁区。"
    }
  },
  {
    id: "city",
    title: "逆风翻盘",
    subtitle: "都市逆袭互动剧",
    desc: "从项目危机到商业对决，剧情围绕合作、背叛和成长展开。",
    coverClass: "cover-city",
    tags: ["都市", "逆袭", "爽感"],
    status: "本周推荐",
    price: 4,
    score: "8.9",
    heat: "65.4万",
    unlockNode: "n4",
    template: {
      first: "第1集 危机来电",
      secondA: "第2集 公开反击",
      secondB: "第2集 私下谈判",
      paid: "第3集 关键合同",
      endingA: "结局 逆风上市",
      endingB: "结局 体面告别",
      endingC: "结局 错失窗口",
      endingD: "结局 新局已开",
      summary: "融资前夜合同突变，你必须决定相信谁。"
    }
  }
];

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

function makeTemplateNodes(template) {
  return [
    {
      id: "n1",
      title: template.first,
      type: "story",
      status: "published",
      duration: "01:26",
      summary: template.summary,
      choices: [
        { label: "主动靠近真相", target: "n2", trust: 20 },
        { label: "先观察局势", target: "n3", trust: 0 }
      ],
      position: { x: 10, y: 46 }
    },
    {
      id: "n2",
      title: template.secondA,
      type: "story",
      status: "published",
      duration: "01:48",
      summary: "你选择公开站队，短时间内得到更多线索，也让风险暴露在眼前。",
      choices: [
        { label: "继续推进主线", target: "n4", trust: 25 },
        { label: "保护关键人物", target: "n5", trust: 10 }
      ],
      position: { x: 31, y: 22 }
    },
    {
      id: "n3",
      title: template.secondB,
      type: "story",
      status: "published",
      duration: "01:36",
      summary: "保守选择带来短暂安全，但也让误会开始发酵。",
      choices: [
        { label: "补救并解释", target: "n4", trust: 10 },
        { label: "独自承担后果", target: "n6", trust: -10 }
      ],
      position: { x: 31, y: 68 }
    },
    {
      id: "n4",
      title: template.paid,
      type: "paid",
      status: "published",
      duration: "02:05",
      summary: "核心证据即将揭开，解锁后继续进入关键分支。",
      choices: [
        { label: "公开核心证据", target: "n7", trust: 30 },
        { label: "与对手交易", target: "n8", trust: 5 }
      ],
      position: { x: 54, y: 46 }
    },
    {
      id: "n5",
      title: template.endingA,
      type: "ending",
      status: "published",
      duration: "00:54",
      summary: "你守住了最重要的人，也拿到了最明亮的结局。",
      choices: [],
      ending: "高光结局",
      position: { x: 80, y: 17 }
    },
    {
      id: "n6",
      title: template.endingB,
      type: "ending",
      status: "published",
      duration: "00:46",
      summary: "没有人能替你承担选择，但这一次你保住了自由。",
      choices: [],
      ending: "独立结局",
      position: { x: 80, y: 39 }
    },
    {
      id: "n7",
      title: template.endingC,
      type: "ending",
      status: "published",
      duration: "00:58",
      summary: "真相公开，代价也随之到来，故事停在了最冷的一刻。",
      choices: [],
      ending: "遗憾结局",
      position: { x: 80, y: 63 }
    },
    {
      id: "n8",
      title: template.endingD,
      type: "ending",
      status: "review",
      duration: "00:52",
      summary: "短暂胜利并不是终点，新的分支已经出现。",
      choices: [],
      ending: "开放结局",
      position: { x: 60, y: 82 }
    }
  ];
}

function buildConfiguredDrama() {
  return {
    id: "config",
    title: data.project.title || "深渊回响",
    subtitle: data.project.subtitle || "都市悬疑互动剧",
    desc: "后台配置内容实时驱动：项目信息、剧情节点、付费节点和节点视频都会同步到前台。",
    coverClass: "cover-deep",
    tags: ["后台配置", "视频节点", "多结局"],
    status: data.project.status || "已上线",
    price: Number(data.project.price || 0),
    score: "9.4",
    heat: "128.4万",
    unlockNode: data.project.unlockNode || "n4",
    source: data.project.publishChannel || "H5 / 小程序双端",
    nodes
  };
}

function getDramas() {
  return [
    buildConfiguredDrama(),
    ...staticDramas.map((drama) => ({
      ...drama,
      nodes: makeTemplateNodes(drama.template)
    }))
  ];
}

function getDrama(id = state.activeDramaId) {
  return getDramas().find((drama) => drama.id === id) || getDramas()[0];
}

function getDramaNodes(drama = getDrama()) {
  return Array.isArray(drama.nodes) && drama.nodes.length ? drama.nodes : [];
}

function ensureDramaState(drama = getDrama()) {
  const firstNode = getDramaNodes(drama)[0]?.id || "";
  if (!state.currentByDrama[drama.id]) state.currentByDrama[drama.id] = firstNode;
  if (!state.visitedByDrama[drama.id]) {
    state.visitedByDrama[drama.id] = state.currentByDrama[drama.id] ? [state.currentByDrama[drama.id]] : [];
  }
  if (!state.historyByDrama[drama.id]) state.historyByDrama[drama.id] = [];
  if (!state.endingsByDrama[drama.id]) state.endingsByDrama[drama.id] = [];
  if (state.paidByDrama[drama.id] === undefined) state.paidByDrama[drama.id] = false;
  if (state.trustByDrama[drama.id] === undefined) state.trustByDrama[drama.id] = 0;
}

function getNode(id, drama = getDrama()) {
  const dramaNodes = getDramaNodes(drama);
  return dramaNodes.find((node) => node.id === id) || dramaNodes[0];
}

function getCurrentNode(drama = getDrama()) {
  ensureDramaState(drama);
  return getNode(state.currentByDrama[drama.id], drama);
}

function getVisited(drama = getDrama()) {
  ensureDramaState(drama);
  return state.visitedByDrama[drama.id] || [];
}

function getHistory(drama = getDrama()) {
  ensureDramaState(drama);
  return state.historyByDrama[drama.id] || [];
}

function getEndings(drama = getDrama()) {
  ensureDramaState(drama);
  return state.endingsByDrama[drama.id] || [];
}

function getTrust(drama = getDrama()) {
  ensureDramaState(drama);
  return state.trustByDrama[drama.id] || 0;
}

function isPaid(drama = getDrama()) {
  ensureDramaState(drama);
  return Boolean(state.paidByDrama[drama.id]);
}

function setView(view) {
  state.view = view;
  render();
}

function selectDrama(id, view = "detail") {
  const drama = getDrama(id);
  state.activeDramaId = drama.id;
  ensureDramaState(drama);
  state.view = view;
  render();
}

function progress(drama = getDrama()) {
  const dramaNodes = getDramaNodes(drama);
  return dramaNodes.length ? Math.round((getVisited(drama).length / dramaNodes.length) * 100) : 0;
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

function resetScrollPosition() {
  window.requestAnimationFrame(() => window.scrollTo(0, 0));
  window.setTimeout(() => window.scrollTo(0, 0), 60);
}

function applyConfig(nextConfig) {
  data = window.normalizeDramaConfig ? window.normalizeDramaConfig(nextConfig) : nextConfig;
  nodes = data.nodes;
  const configDrama = buildConfiguredDrama();
  const current = state.currentByDrama.config;
  if (!getDramaNodes(configDrama).some((node) => node.id === current)) {
    state.currentByDrama.config = getDramaNodes(configDrama)[0]?.id || "";
    state.visitedByDrama.config = state.currentByDrama.config ? [state.currentByDrama.config] : [];
  }
}

function visitNode(targetId, drama = getDrama()) {
  ensureDramaState(drama);
  const target = getNode(targetId, drama);
  if (!target) return;
  state.currentByDrama[drama.id] = target.id;
  if (!state.visitedByDrama[drama.id].includes(target.id)) {
    state.visitedByDrama[drama.id].push(target.id);
  }
  if (target.type === "ending" && !state.endingsByDrama[drama.id].includes(target.id)) {
    state.endingsByDrama[drama.id].push(target.id);
  }
  state.view = target.type === "ending" ? "ending" : "player";
  render();
}

function choose(index) {
  const drama = getDrama();
  const current = getCurrentNode(drama);
  const choice = current?.choices[index];
  if (!choice) return;

  const target = getNode(choice.target, drama);
  if (target.type === "paid" && !isPaid(drama)) {
    state.pendingNode = { dramaId: drama.id, nodeId: target.id };
    state.view = "pay";
    render();
    return;
  }

  state.historyByDrama[drama.id].push({
    from: current.title,
    choice: choice.label,
    to: target.title
  });
  state.trustByDrama[drama.id] += choice.trust;
  visitNode(target.id, drama);
  showToast("已自动存档");
}

function pay(success) {
  const drama = getDrama(state.pendingNode?.dramaId || state.activeDramaId);
  if (!success) {
    showToast("支付未完成，可稍后继续解锁");
    return;
  }
  ensureDramaState(drama);
  state.paidByDrama[drama.id] = true;
  const unlockedNode = getNode(state.pendingNode?.nodeId || drama.unlockNode, drama);
  state.historyByDrama[drama.id].push({
    from: "付费解锁",
    choice: `¥${Number(drama.price || 0).toFixed(2)}`,
    to: unlockedNode.title
  });
  state.activeDramaId = drama.id;
  visitNode(unlockedNode.id, drama);
  showToast("支付成功，剧情已解锁");
}

function resetRun() {
  const drama = getDrama();
  const firstNode = getDramaNodes(drama)[0]?.id || "";
  const returnView = ["player", "map", "pay", "ending"].includes(state.view) ? "detail" : state.view;
  state.currentByDrama[drama.id] = firstNode;
  state.visitedByDrama[drama.id] = firstNode ? [firstNode] : [];
  state.historyByDrama[drama.id] = [];
  state.endingsByDrama[drama.id] = [];
  state.trustByDrama[drama.id] = 0;
  state.pendingNode = null;
  state.view = returnView;
  render();
  showToast("当前剧进度已重置");
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

function statusBar(title = "互动剧场", backView = "") {
  return `
    <header class="mini-top">
      <div class="top-title">
        <span class="mini-time">9:41</span>
        <strong>${escapeHtml(title)}</strong>
      </div>
      <div class="top-actions">
        ${backView ? `<button class="icon-button icon-back" data-action="view" data-view="${backView}" aria-label="返回"></button>` : ""}
        <button class="icon-button icon-refresh" data-action="reset" aria-label="重置当前剧进度"></button>
      </div>
    </header>
  `;
}

function bottomTabs(active) {
  const tabs = [
    ["home", "首页", "home"],
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

function tagsHtml(tags) {
  return tags.map((tag) => `<span>${escapeHtml(tag)}</span>`).join("");
}

function cleanNodeTitle(title = "") {
  return String(title).replace(/^第\d+章\s*/, "").replace(/^第\d+集\s*/, "");
}

function progressMarkup(value) {
  const safeValue = Math.max(0, Math.min(100, Number(value) || 0));
  return `<span class="progress-track"><span style="width:${safeValue}%"></span></span>`;
}

function dramaCard(drama, compact = false) {
  return `
    <button class="drama-card ${compact ? "is-compact" : ""}" data-action="drama" data-drama="${drama.id}">
      <span class="poster-wrap">
        <span class="poster-surface ${drama.coverClass}"></span>
        ${compact ? "" : `<span class="card-badge">${escapeHtml(drama.status)}</span>`}
        ${compact ? "" : "<span class=\"branch-dot\" aria-hidden=\"true\"></span>"}
      </span>
      <span class="drama-info">
        <strong>${escapeHtml(drama.title)}</strong>
        <small>${escapeHtml(drama.subtitle)}</small>
        <span class="mini-tags">${tagsHtml(drama.tags.slice(0, 2))}</span>
        ${compact ? "" : `<span class="update-line">已更新至 ${getDramaNodes(drama).length} 节点</span>`}
      </span>
    </button>
  `;
}

function homeView() {
  const dramas = getDramas();
  const featured = dramas[0];
  const continueList = dramas.slice(0, 3);
  return `
    <section class="catalog-page catalog-home">
      <div class="catalog-toolbar">
        <label class="search-box">
          <span class="search-icon"></span>
          <input type="search" placeholder="搜索剧名 / 标签 / 剧情关键词" aria-label="搜索剧集">
        </label>
        <button class="wallet-chip" data-action="view" data-view="profile" aria-label="查看余额">
          <span class="coin-icon">S</span>
          <strong>120</strong>
          <em>充值</em>
        </button>
      </div>

      <div class="category-row" aria-label="题材筛选">
        <button class="is-active">推荐</button>
        <button>悬疑</button>
        <button>恋爱</button>
        <button>古风</button>
        <button>科幻</button>
        <button>逆袭</button>
        <button>成长</button>
        <button>都市</button>
      </div>

      <button class="feature-card ${featured.coverClass}" data-action="drama" data-drama="${featured.id}">
        <span class="feature-media"></span>
        <span class="feature-badge">热门推荐</span>
        <span class="feature-copy">
          <strong>${escapeHtml(featured.title)}</strong>
          <small>你的选择，决定真相与结局</small>
          <span class="mini-tags">${tagsHtml(featured.tags.slice(0, 3))}</span>
          <span class="feature-cta"><span class="play-mini"></span>开始体验</span>
          <span class="hero-dots" aria-hidden="true"><i></i><i class="is-active"></i><i></i><i></i><i></i></span>
        </span>
      </button>

      <section class="content-section">
        <div class="section-title">
          <h2><span class="title-icon play-title"></span>继续观看</h2>
          <span>查看全部</span>
        </div>
        <div class="continue-strip">
          ${continueList.map((drama) => {
            const current = getCurrentNode(drama);
            const watched = progress(drama);
            return `
              <button class="continue-card" data-action="drama" data-drama="${drama.id}">
                <span class="poster-surface ${drama.coverClass}"></span>
                <span class="float-play"></span>
                <span class="continue-copy">
                  <strong>${escapeHtml(drama.title)}</strong>
                  <small>${escapeHtml(cleanNodeTitle(current?.title || "未开始"))}</small>
                  ${progressMarkup(watched)}
                  <small>已观看 ${watched}%</small>
                </span>
              </button>
            `;
          }).join("")}
        </div>
      </section>

      <section class="content-section">
        <div class="section-title">
          <h2><span class="title-icon fire-title"></span>热门互动剧</h2>
          <span>更多</span>
        </div>
        <div class="drama-grid">
          ${dramas.map((drama) => dramaCard(drama)).join("")}
        </div>
      </section>
    </section>
    ${bottomTabs("home")}
  `;
}

function detailView() {
  const drama = getDrama();
  const current = getCurrentNode(drama);
  const dramaNodes = getDramaNodes(drama);
  const endings = dramaNodes.filter((node) => node.type === "ending");
  const watched = progress(drama);
  const recentChoices = current?.choices || [];

  return `
    <section class="detail-page">
      <div class="detail-hero ${drama.coverClass}">
        <div class="detail-topbar">
          <button class="detail-icon icon-back" data-action="view" data-view="home" aria-label="返回首页"></button>
          <div class="detail-top-actions">
            <button class="detail-tool" type="button"><span>♡</span>追剧</button>
            <button class="detail-tool" type="button"><span>↗</span>分享</button>
          </div>
        </div>
        <button class="hero-play" data-action="start" aria-label="开始观看"><span></span></button>
        <button class="ending-hint" data-action="view" data-view="map">
          <span class="branch-mark"></span>
          <strong>多结局</strong>
          <small>选择会改变结局</small>
        </button>
        <div class="hero-watch">
          <span>已看到 <strong>${watched}%</strong></span>
          ${progressMarkup(watched)}
        </div>
      </div>
      <div class="detail-body">
        <div class="detail-title">
          <div>
            <h1>${escapeHtml(drama.title)}</h1>
            <div class="tag-list">${tagsHtml(drama.tags)}</div>
          </div>
          <span class="score"><strong>${escapeHtml(drama.score)}</strong><small>12.4万人评分</small></span>
        </div>
        <p class="detail-desc">${escapeHtml(drama.desc)}</p>
        <p class="detail-meta">🔥 已更新至 第${Math.min(8, dramaNodes.length)}集 ｜ 共${dramaNodes.length * 3}集</p>

        <div class="detail-actions">
          <button class="primary-action watch-action" data-action="start"><span class="play-large"></span><strong>${watched > 13 ? "继续观看" : "开始观看"}</strong><small>${escapeHtml(cleanNodeTitle(current?.title || "第1集"))}</small></button>
          <button class="secondary-button map-action" data-action="view" data-view="map"><span class="branch-mark"></span><strong>剧情线</strong><small>探索全部分支</small></button>
        </div>

        <section class="episode-section">
          <div class="section-title">
            <h2>选集</h2>
            <span>顺序⌄</span>
          </div>
          <div class="episode-list episode-rail">
            ${dramaNodes.map((node) => {
              const visited = getVisited(drama).includes(node.id);
              const locked = node.type === "paid" && !isPaid(drama);
              const currentNode = current?.id === node.id;
              return `
                <button class="episode-item ${visited ? "is-visited" : ""} ${locked ? "is-locked" : ""} ${currentNode ? "is-current" : ""}" data-action="node" data-node="${node.id}">
                  <span>${escapeHtml(cleanNodeTitle(node.title))}</span>
                  <small>${locked ? "付费" : hasPlayableVideo(node) ? "视频" : node.type === "ending" ? "结局" : node.duration}</small>
                </button>
              `;
            }).join("")}
            <button class="episode-item all-episodes" type="button"><span>全部选集</span><small>${dramaNodes.length}节点</small></button>
          </div>
        </section>

        <section class="now-card">
          <span class="poster-surface ${drama.coverClass}"></span>
          <div class="now-copy">
            <small>当前节点</small>
            <strong>${escapeHtml(current?.title || "未开始")}</strong>
            <p>${escapeHtml(current?.summary || "")}</p>
            <span class="trust-pill">信任值 +5</span>
          </div>
          <div class="unlock-panel">
            <small>${current?.type === "paid" && !isPaid(drama) ? "付费节点" : "已解锁"}</small>
            <button class="unlock-button" data-action="${current?.type === "paid" && !isPaid(drama) ? "node" : "start"}" ${current?.id ? `data-node="${current.id}"` : ""}>${current?.type === "paid" && !isPaid(drama) ? `解锁 ¥${Number(drama.price || 0).toFixed(0)}` : "观看本节"}</button>
          </div>
        </section>

        <section class="choice-preview">
          <div class="section-title">
            <h2>最近选择</h2>
            <span>查看全部</span>
          </div>
          <div class="choice-preview-grid">
            ${recentChoices.slice(0, 2).map((choice, index) => `
              <button class="choice-preview-card ${index === 0 ? "is-picked" : ""}" data-action="choice" data-index="${index}">
                <strong>${escapeHtml(choice.label)}</strong>
                <small>信任值 ${choice.trust >= 0 ? "+" : ""}${choice.trust}</small>
                ${progressMarkup(index === 0 ? 43 : 57)}
              </button>
            `).join("")}
          </div>
        </section>
      </div>
      <div class="detail-dock">
        <span class="poster-surface ${drama.coverClass}"></span>
        <span class="dock-copy">
          <strong>继续观看：${escapeHtml(cleanNodeTitle(current?.title || "第1集"))}</strong>
          <small>已看到 ${watched}%</small>
          ${progressMarkup(watched)}
        </span>
        <button class="dock-button" data-action="start">继续观看 <span class="play-mini"></span></button>
      </div>
    </section>
    ${bottomTabs("home")}
  `;
}

function playerView() {
  const drama = getDrama();
  const node = getCurrentNode(drama);
  if (node?.type === "ending") return endingView();

  return `
    <section class="player-page">
      <div class="player-media ${drama.coverClass} ${hasPlayableVideo(node) ? "has-video" : ""}">
        ${renderNodeVideo(node)}
        <div class="player-controls">
          <button class="ghost-on-dark" data-action="view" data-view="detail">详情</button>
          <button class="ghost-on-dark" data-action="view" data-view="map">剧情线</button>
        </div>
        <div class="player-progress">
          <span style="width:${progress(drama)}%"></span>
        </div>
        <div class="caption-panel">
          <span class="eyebrow">${escapeHtml(node.duration)} · ${hasPlayableVideo(node) ? "视频节点" : "海报预览"} · ${node.type === "paid" ? "已解锁" : "互动剧情"}</span>
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
        <p class="support-text">选择后自动存档，可在剧情线中回看已探索节点。</p>
      </div>
    </section>
    ${bottomTabs("home")}
  `;
}

function mapView() {
  const drama = getDrama();
  const dramaNodes = getDramaNodes(drama);
  const endings = dramaNodes.filter((node) => node.type === "ending");
  const current = getCurrentNode(drama);
  const currentChoices = current?.choices || [];

  return `
    <section class="story-map-page">
      <div class="map-nav">
        <button class="map-back icon-back" data-action="view" data-view="detail" aria-label="返回详情"></button>
        <h1>剧情线</h1>
        <button class="map-help" type="button" aria-label="剧情线说明">?</button>
      </div>
      <div class="map-stats">
        <span><em>探索</em><strong>${getVisited(drama).length}/${dramaNodes.length}</strong></span>
        <span><em>结局</em><strong>${getEndings(drama).length}/${endings.length}</strong></span>
        <span><em>信任值</em><strong>${getTrust(drama)}</strong></span>
      </div>
      <div class="map-board">
        ${dramaNodes.map((node) => {
          const isVisited = getVisited(drama).includes(node.id);
          const isLocked = node.type === "paid" && !isPaid(drama);
          const isActive = node.id === current?.id;
          const x = Math.max(13, Math.min(87, Number(node.position.x) || 50));
          const y = Math.max(12, Math.min(86, Number(node.position.y) || 50));
          return `
            <button
              class="story-node ${isVisited ? "is-visited" : ""} ${isLocked ? "is-locked" : ""} ${isActive ? "is-current" : ""}"
              style="left:${x}%;top:${y}%"
              data-action="node"
              data-node="${node.id}">
              <span class="node-thumb ${drama.coverClass}"></span>
              <small>${isLocked ? "付费节点" : isActive ? "当前节点" : node.type === "ending" ? "结局" : "剧情"}</small>
              <strong>${escapeHtml(cleanNodeTitle(node.title))}</strong>
            </button>
          `;
        }).join("")}
        <svg class="map-lines" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
          <path d="M10 46 C22 22,24 22,31 22 S44 34,54 46" />
          <path d="M10 46 C21 64,24 68,31 68 S44 56,54 46" />
          <path d="M54 46 C62 20,68 17,80 17" />
          <path d="M54 46 C64 38,70 38,80 39" />
          <path d="M54 46 C64 55,70 61,80 63" />
          <path d="M54 46 C57 62,58 74,60 82" />
        </svg>
      </div>
      <section class="map-detail-card">
        <span class="poster-surface ${drama.coverClass}"></span>
        <div class="map-detail-copy">
          <span class="eyebrow">当前节点</span>
          <h2>${escapeHtml(current?.title || "未开始")}</h2>
          <p>${escapeHtml(current?.summary || "")}</p>
          <div class="map-choice-row">
            ${currentChoices.slice(0, 2).map((choice, index) => `
              <button class="map-choice ${index === 0 ? "is-hot" : ""}" data-action="choice" data-index="${index}">
                <strong>${escapeHtml(choice.label)}</strong>
                <small>信任值 ${choice.trust >= 0 ? "+" : ""}${choice.trust}</small>
              </button>
            `).join("")}
          </div>
          <div class="map-actions">
            <button class="primary-action" data-action="start"><span class="play-mini"></span>观看本节点</button>
            <button class="ghost-on-dark" data-action="view" data-view="detail">回看详情</button>
            <button class="gold-button" data-action="node" data-node="${escapeHtml(drama.unlockNode)}">解锁 ♡ ${Number(drama.price || 0).toFixed(0)}</button>
          </div>
        </div>
      </section>
    </section>
    ${bottomTabs("home")}
  `;
}

function payView() {
  const drama = getDrama(state.pendingNode?.dramaId || state.activeDramaId);
  const node = getNode(state.pendingNode?.nodeId || drama.unlockNode, drama);
  return `
    ${statusBar("解锁剧情", "detail")}
    <section class="pay-page ${drama.coverClass}">
      <div class="pay-card">
        <span class="eyebrow">付费节点</span>
        <h1>${escapeHtml(node.title)}</h1>
        <p>${escapeHtml(node.summary)}</p>
        <div class="price">¥${Number(drama.price || 0).toFixed(2)}</div>
        <button class="primary-action" data-action="pay-ok">模拟支付成功</button>
        <button class="danger-action" data-action="pay-fail">模拟支付失败</button>
        <button class="ghost-action" data-action="view" data-view="detail">关闭</button>
      </div>
    </section>
  `;
}

function endingView() {
  const drama = getDrama();
  const node = getCurrentNode(drama);
  return `
    ${statusBar(drama.title, "detail")}
    <section class="ending-page ${drama.coverClass}">
      <div class="ending-card">
        <span class="eyebrow">已达成结局</span>
        <h1>${escapeHtml(node.ending || node.title)}</h1>
        <p>${escapeHtml(node.summary)}</p>
        <dl>
          <div><dt>信任值</dt><dd>${getTrust(drama)}</dd></div>
          <div><dt>探索进度</dt><dd>${progress(drama)}%</dd></div>
          <div><dt>已解锁</dt><dd>${isPaid(drama) ? "是" : "否"}</dd></div>
        </dl>
        <button class="primary-action" data-action="view" data-view="map">查看剧情线</button>
        <button class="ghost-action" data-action="reset">从头重玩</button>
      </div>
    </section>
    ${bottomTabs("home")}
  `;
}

function profileView() {
  const dramas = getDramas();
  const totalVisited = dramas.reduce((sum, drama) => sum + getVisited(drama).length, 0);
  const totalEndings = dramas.reduce((sum, drama) => sum + getEndings(drama).length, 0);
  const rights = dramas.filter((drama) => isPaid(drama)).length;
  const recent = dramas.flatMap((drama) => getHistory(drama).map((item) => ({ ...item, drama: drama.title }))).slice(-5).reverse();

  return `
    ${statusBar("我的")}
    <section class="profile-page">
      <div class="profile-card">
        <div class="avatar">剧</div>
        <div>
          <h1>我的互动剧场</h1>
          <p>管理最近观看、解锁权益和结局收集。</p>
        </div>
      </div>
      <div class="profile-grid">
        <div><strong>${totalVisited}</strong><span>已看节点</span></div>
        <div><strong>${totalEndings}</strong><span>结局</span></div>
        <div><strong>${rights}</strong><span>权益</span></div>
      </div>
      <section class="content-section profile-dramas">
        <div class="section-title">
          <h2>我的剧集</h2>
          <span>${dramas.length}部</span>
        </div>
        <div class="profile-drama-list">
          ${dramas.map((drama) => dramaCard(drama, true)).join("")}
        </div>
      </section>
      <div class="history-list">
        <h2>最近选择</h2>
        ${recent.length ? recent.map((item) => `
          <article>
            <strong>${escapeHtml(item.drama)} · ${escapeHtml(item.from)}</strong>
            <p>${escapeHtml(item.choice)} → ${escapeHtml(item.to)}</p>
          </article>
        `).join("") : "<p class=\"support-text\">暂无选择记录</p>"}
      </div>
    </section>
    ${bottomTabs("profile")}
  `;
}

function render() {
  const shouldResetScroll = render.lastView !== state.view;
  const viewMap = {
    home: homeView,
    detail: detailView,
    player: playerView,
    map: mapView,
    pay: payView,
    ending: endingView,
    profile: profileView
  };
  if (!getDramas().some((drama) => drama.id === state.activeDramaId)) state.activeDramaId = "config";
  app.innerHTML = `
    <div class="mini-screen">
      ${(viewMap[state.view] || homeView)()}
      ${state.toast ? `<div class="toast">${state.toast}</div>` : ""}
    </div>
  `;
  render.lastView = state.view;
  if (shouldResetScroll) {
    resetScrollPosition();
  }
}

app.addEventListener("click", (event) => {
  const button = event.target.closest("[data-action]");
  if (!button) return;

  const action = button.dataset.action;
  if (action === "view") setView(button.dataset.view);
  if (action === "drama") selectDrama(button.dataset.drama);
  if (action === "start") {
    const drama = getDrama();
    const node = getCurrentNode(drama);
    state.view = node?.type === "ending" ? "ending" : "player";
    render();
  }
  if (action === "choice") choose(Number(button.dataset.index));
  if (action === "pay-ok") pay(true);
  if (action === "pay-fail") pay(false);
  if (action === "reset") resetRun();
  if (action === "node") {
    const drama = getDrama();
    const node = getNode(button.dataset.node, drama);
    if (node.type === "paid" && !isPaid(drama)) {
      state.pendingNode = { dramaId: drama.id, nodeId: node.id };
      setView("pay");
      return;
    }
    visitNode(node.id, drama);
  }
});

render();

window.addEventListener("storage", (event) => {
  if (event.key !== window.DRAMA_CONFIG_KEY) return;
  applyConfig(window.getDramaConfig ? window.getDramaConfig() : window.DRAMA_DATA);
  render();
  showToast("后台配置已同步");
});
