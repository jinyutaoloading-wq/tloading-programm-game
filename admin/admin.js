const data = window.DRAMA_DATA;
const app = document.querySelector("#adminApp");

const state = {
  tab: "workbench",
  selectedNode: "n4",
  nodes: data.nodes.map((node) => ({
    ...node,
    choices: node.choices.map((choice) => ({ ...choice }))
  })),
  draftSavedAt: "23:58",
  grayPercent: 15,
  toast: ""
};

function getNode(id = state.selectedNode) {
  return state.nodes.find((node) => node.id === id) || state.nodes[0];
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

function statusLabel(status) {
  const map = {
    published: "已上线",
    draft: "草稿",
    review: "待审核"
  };
  return map[status] || status;
}

function typeLabel(type) {
  const map = {
    story: "剧情节点",
    paid: "付费节点",
    ending: "结局节点"
  };
  return map[type] || type;
}

function layout() {
  const nav = [
    ["workbench", "工作台", "grid"],
    ["editor", "节点编辑", "flow"],
    ["assets", "素材切图", "image"],
    ["rules", "付费规则", "coin"],
    ["publish", "审核发布", "rocket"],
    ["analytics", "数据看板", "chart"]
  ];

  return `
    <aside class="admin-nav">
      <a class="brand-lockup" href="../admin/" aria-label="配置后台首页">
        <span>剧</span>
        <strong>短剧配置后台</strong>
      </a>
      <nav aria-label="后台导航">
        ${nav.map(([tab, label, icon]) => `
          <button class="${state.tab === tab ? "is-active" : ""}" data-action="tab" data-tab="${tab}">
            <span class="nav-icon icon-${icon}"></span>
            ${label}
          </button>
        `).join("")}
      </nav>
    </aside>
    <section class="admin-main">
      <header class="admin-top">
        <div>
          <p>${data.project.publishChannel} · ${data.project.version}</p>
          <h1>${data.project.title}</h1>
        </div>
        <div class="top-actions">
          <a class="secondary-button" href="../user/" target="_blank" rel="noreferrer">打开用户端</a>
          <button class="primary-button" data-action="save">保存草稿</button>
        </div>
      </header>
      ${renderTab()}
    </section>
    ${state.toast ? `<div class="admin-toast">${state.toast}</div>` : ""}
  `;
}

function renderTab() {
  const tabs = {
    workbench: workbenchView,
    editor: editorView,
    assets: assetsView,
    rules: rulesView,
    publish: publishView,
    analytics: analyticsView
  };
  return (tabs[state.tab] || workbenchView)();
}

function workbenchView() {
  const publishedCount = state.nodes.filter((node) => node.status === "published").length;
  const draftCount = state.nodes.filter((node) => node.status === "draft").length;
  const reviewCount = state.nodes.filter((node) => node.status === "review").length;
  return `
    <section class="panel-grid kpi-grid">
      <article class="metric-card"><span>节点总数</span><strong>${state.nodes.length}</strong><small>含 ${state.nodes.filter((node) => node.type === "ending").length} 个结局</small></article>
      <article class="metric-card"><span>已上线</span><strong>${publishedCount}</strong><small>主链路可播放</small></article>
      <article class="metric-card"><span>草稿</span><strong>${draftCount}</strong><small>需补素材/文案</small></article>
      <article class="metric-card"><span>待审核</span><strong>${reviewCount}</strong><small>发布前校验</small></article>
    </section>

    <section class="two-col">
      <article class="panel">
        <div class="panel-head">
          <div><h2>项目列表</h2><p>点击进入节点配置</p></div>
          <button class="secondary-button" data-action="new-project">新建剧目</button>
        </div>
        <table class="admin-table">
          <thead><tr><th>剧目</th><th>版本</th><th>状态</th><th>操作</th></tr></thead>
          <tbody>
            <tr>
              <td><strong>${data.project.title}</strong><span>${data.project.subtitle}</span></td>
              <td>${data.project.version}</td>
              <td><span class="badge live">${data.project.status}</span></td>
              <td><button class="link-button" data-action="tab" data-tab="editor">进入配置</button></td>
            </tr>
          </tbody>
        </table>
      </article>

      <article class="panel">
        <div class="panel-head">
          <div><h2>上线检查</h2><p>阻断项需全部通过</p></div>
          <span class="badge ok">5/5</span>
        </div>
        <div class="check-list">
          ${["起始节点可达", "付费节点已配置价格", "结局节点已绑定", "素材切图已上传", "灰度发布已设置"].map((item) => `
            <div><span class="check-dot"></span>${item}<strong>通过</strong></div>
          `).join("")}
        </div>
      </article>
    </section>
  `;
}

function editorView() {
  const selected = getNode();
  return `
    <section class="editor-layout">
      <article class="panel editor-panel">
        <div class="panel-head">
          <div><h2>节点画布</h2><p>点击节点后编辑字段，保存为草稿</p></div>
          <div class="segmented">
            <button class="is-active">剧情图</button>
            <button data-action="tab" data-tab="rules">规则</button>
          </div>
        </div>
        <div class="node-canvas">
          <div class="canvas-art"></div>
          <svg class="admin-lines" viewBox="0 0 100 100" preserveAspectRatio="none">
            <path d="M16 52 C24 28,31 27,39 27 S47 38,54 50" />
            <path d="M16 52 C25 70,32 70,39 70 S47 61,54 50" />
            <path d="M59 50 C65 24,72 20,80 20" />
            <path d="M59 50 C66 45,72 43,80 44" />
            <path d="M59 50 C67 63,72 67,80 68" />
            <path d="M59 50 C58 64,59 74,61 80" />
          </svg>
          ${state.nodes.map((node) => `
            <button
              class="admin-node ${node.id === selected.id ? "is-selected" : ""} type-${node.type}"
              style="left:${node.position.x}%;top:${node.position.y}%"
              data-action="select-node"
              data-node="${node.id}">
              <small>${typeLabel(node.type)}</small>
              <strong>${node.title}</strong>
              <span>${statusLabel(node.status)}</span>
            </button>
          `).join("")}
        </div>
      </article>

      <aside class="panel property-panel">
        <div class="panel-head">
          <div><h2>字段配置</h2><p>${selected.id} · ${typeLabel(selected.type)}</p></div>
          <span class="badge ${selected.status === "published" ? "live" : "warn"}">${statusLabel(selected.status)}</span>
        </div>
        <form class="field-form">
          <label>节点标题<input data-field="title" value="${selected.title}"></label>
          <label>节点类型
            <select data-field="type">
              ${["story", "paid", "ending"].map((type) => `<option value="${type}" ${selected.type === type ? "selected" : ""}>${typeLabel(type)}</option>`).join("")}
            </select>
          </label>
          <label>节点状态
            <select data-field="status">
              ${["published", "draft", "review"].map((status) => `<option value="${status}" ${selected.status === status ? "selected" : ""}>${statusLabel(status)}</option>`).join("")}
            </select>
          </label>
          <label>视频时长<input data-field="duration" value="${selected.duration}"></label>
          <label class="full">剧情说明<textarea data-field="summary">${selected.summary}</textarea></label>
        </form>
        <div class="choice-config">
          <h3>选择分支</h3>
          ${selected.choices.length ? selected.choices.map((choice, index) => `
            <div class="choice-row">
              <span>${index + 1}</span>
              <strong>${choice.label}</strong>
              <small>跳转 ${choice.target} · 信任 ${choice.trust >= 0 ? "+" : ""}${choice.trust}</small>
            </div>
          `).join("") : "<p class=\"muted\">结局节点无后续分支</p>"}
        </div>
      </aside>
    </section>
  `;
}

function assetsView() {
  const assets = [
    ["用户端设计稿", "poster", "设计稿", "assets/image2/designs/user-home-design.png"],
    ["后台设计稿", "canvas", "设计稿", "assets/image2/designs/admin-console-design.png"],
    ["剧目封面切图", "poster", "运行图", "assets/image2/runtime/drama-poster.jpg"],
    ["播放页背景切图", "player", "运行图", "assets/image2/runtime/player-scene.jpg"],
    ["后台画布切图", "canvas", "运行图", "assets/image2/runtime/admin-canvas.jpg"]
  ];
  return `
    <section class="panel">
      <div class="panel-head">
        <div><h2>image2 设计稿与切图</h2><p>原创资产，无第三方品牌和可识别 IP</p></div>
        <button class="primary-button" data-action="save">同步素材</button>
      </div>
      <div class="asset-grid">
        ${assets.map(([name, preview, tag, path]) => `
          <article class="asset-card preview-${preview}">
            <span class="asset-preview" aria-label="${name}"></span>
            <div>
              <strong>${name}</strong>
              <span class="badge">${tag}</span>
              <small>${path}</small>
            </div>
          </article>
        `).join("")}
      </div>
    </section>
  `;
}

function rulesView() {
  const paidNode = state.nodes.find((node) => node.type === "paid");
  return `
    <section class="two-col">
      <article class="panel">
        <div class="panel-head">
          <div><h2>付费规则</h2><p>进入付费节点时触发支付弹层</p></div>
          <span class="badge live">启用</span>
        </div>
        <div class="rule-card">
          <label>解锁节点<input value="${paidNode.title}"></label>
          <label>价格<input value="¥${data.project.price.toFixed(2)}"></label>
          <label>权益范围<select><option>当前节点及后续主线</option></select></label>
          <label>失败回流<select><option>返回播放页并保留进度</option></select></label>
        </div>
      </article>
      <article class="panel">
        <div class="panel-head">
          <div><h2>条件分支</h2><p>根据选择与信任值进入不同结局</p></div>
          <button class="secondary-button" data-action="save">保存规则</button>
        </div>
        <table class="admin-table">
          <thead><tr><th>起点</th><th>选择</th><th>目标</th><th>变量</th></tr></thead>
          <tbody>
            ${state.nodes.flatMap((node) => node.choices.map((choice) => `
              <tr><td>${node.id}</td><td>${choice.label}</td><td>${choice.target}</td><td>trust ${choice.trust >= 0 ? "+" : ""}${choice.trust}</td></tr>
            `)).join("")}
          </tbody>
        </table>
      </article>
    </section>
  `;
}

function publishView() {
  const items = [
    ["内容素材", "封面、播放背景、节点缩略图齐全", true],
    ["剧情连通", "起始节点到至少一个结局可达", true],
    ["付费链路", "价格、失败回流、权益范围已配置", true],
    ["审核状态", "仍有 1 个节点待审核", false],
    ["灰度比例", `${state.grayPercent}% 用户可见`, true]
  ];
  return `
    <section class="two-col">
      <article class="panel">
        <div class="panel-head">
          <div><h2>审核清单</h2><p>发布前自动校验字段完整性</p></div>
          <span class="badge warn">1 项提醒</span>
        </div>
        <div class="check-list publish-list">
          ${items.map(([title, desc, ok]) => `
            <div><span class="check-dot ${ok ? "" : "warn"}"></span><strong>${title}</strong><p>${desc}</p></div>
          `).join("")}
        </div>
      </article>
      <article class="panel">
        <div class="panel-head">
          <div><h2>发布控制</h2><p>灰度上线后可随时回滚</p></div>
          <span class="badge live">${data.project.status}</span>
        </div>
        <div class="release-box">
          <label>灰度比例 <output>${state.grayPercent}%</output><input type="range" min="1" max="100" value="${state.grayPercent}" data-field="grayPercent"></label>
          <button class="primary-button" data-action="publish">发布上线</button>
          <button class="secondary-button" data-action="rollback">回滚到 v1.1.8</button>
        </div>
      </article>
    </section>
  `;
}

function analyticsView() {
  const funnel = [
    ["首页曝光", 100],
    ["详情点击", data.metrics.playRate],
    ["开始播放", 54.2],
    ["选择提交", data.metrics.choiceRate],
    ["付费成功", data.metrics.payRate],
    ["结局达成", data.metrics.completionRate]
  ];
  return `
    <section class="two-col analytics-layout">
      <article class="panel">
        <div class="panel-head">
          <div><h2>转化漏斗</h2><p>按用户端关键事件统计</p></div>
          <button class="secondary-button" data-action="export">导出</button>
        </div>
        <div class="funnel-list">
          ${funnel.map(([name, value]) => `
            <div>
              <span>${name}</span><strong>${value}%</strong>
              <i style="--value:${value}%"></i>
            </div>
          `).join("")}
        </div>
      </article>
      <article class="panel">
        <div class="panel-head">
          <div><h2>节点表现</h2><p>识别卡点、付费点和结局偏好</p></div>
          <span class="badge ok">实时</span>
        </div>
        <table class="admin-table">
          <thead><tr><th>节点</th><th>到达率</th><th>选择率</th><th>状态</th></tr></thead>
          <tbody>
            ${state.nodes.slice(0, 6).map((node, index) => `
              <tr>
                <td>${node.title}</td>
                <td>${Math.max(14, 86 - index * 11)}%</td>
                <td>${node.choices.length ? `${Math.max(18, 68 - index * 7)}%` : "-"}</td>
                <td><span class="badge ${node.status === "published" ? "live" : "warn"}">${statusLabel(node.status)}</span></td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      </article>
    </section>
  `;
}

function render() {
  app.innerHTML = `<div class="admin-app">${layout()}</div>`;
}

app.addEventListener("click", (event) => {
  const target = event.target.closest("[data-action]");
  if (!target) return;
  const action = target.dataset.action;
  if (action === "tab") {
    state.tab = target.dataset.tab;
    render();
  }
  if (action === "select-node") {
    state.selectedNode = target.dataset.node;
    render();
  }
  if (action === "save") {
    state.draftSavedAt = new Date().toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" });
    showToast(`草稿已保存 ${state.draftSavedAt}`);
  }
  if (action === "publish") showToast("已提交发布，灰度配置生效");
  if (action === "rollback") showToast("已回滚到上一稳定版本");
  if (action === "export") showToast("数据报表已生成");
  if (action === "new-project") showToast("已创建空白剧目草稿");
});

app.addEventListener("input", (event) => {
  const field = event.target.dataset.field;
  if (!field) return;
  if (field === "grayPercent") {
    state.grayPercent = Number(event.target.value);
    render();
    return;
  }

  const selected = getNode();
  selected[field] = event.target.value;
});

render();
