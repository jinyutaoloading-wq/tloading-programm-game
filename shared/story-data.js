window.DRAMA_DATA = {
  project: {
    id: "drama-fate-choice",
    title: "命运的抉择",
    subtitle: "都市悬疑互动短剧",
    version: "v1.2.0",
    status: "灰度中",
    publishChannel: "H5 / 小程序双端",
    price: 3,
    unlockNode: "n4"
  },
  nodes: [
    {
      id: "n1",
      title: "第1章 初遇",
      type: "story",
      status: "published",
      duration: "01:18",
      summary: "雨夜重逢后，她提出一个无法回避的问题。",
      choices: [
        { label: "坦诚相告", target: "n2", trust: 20 },
        { label: "保持沉默", target: "n3", trust: 0 }
      ],
      position: { x: 8, y: 44 }
    },
    {
      id: "n2",
      title: "第2章 扶持时刻",
      type: "story",
      status: "published",
      duration: "01:42",
      summary: "舆论突然爆发，你决定是否站出来。",
      choices: [
        { label: "替她挡下质疑", target: "n4", trust: 25 },
        { label: "暂时隐藏证据", target: "n5", trust: 5 }
      ],
      position: { x: 29, y: 18 }
    },
    {
      id: "n3",
      title: "第2章 误会",
      type: "story",
      status: "draft",
      duration: "01:29",
      summary: "沉默让距离拉开，解释与离开只差一个选择。",
      choices: [
        { label: "追出去解释", target: "n4", trust: 10 },
        { label: "独自离开", target: "n6", trust: -10 }
      ],
      position: { x: 29, y: 62 }
    },
    {
      id: "n4",
      title: "第3章 坦白真相",
      type: "paid",
      status: "published",
      duration: "02:05",
      summary: "关键证据出现，解锁后继续观看主线分支。",
      choices: [
        { label: "公开证据", target: "n7", trust: 30 },
        { label: "私下交易", target: "n8", trust: 5 }
      ],
      position: { x: 51, y: 42 }
    },
    {
      id: "n5",
      title: "结局 迟来的告白",
      type: "ending",
      status: "published",
      duration: "00:48",
      summary: "秘密被保住了，但重新开始的机会消失了。",
      choices: [],
      ending: "遗憾结局",
      position: { x: 75, y: 14 }
    },
    {
      id: "n6",
      title: "结局 遗憾错过",
      type: "ending",
      status: "published",
      duration: "00:42",
      summary: "没有解释的离开，成为两个人共同的遗憾。",
      choices: [],
      ending: "失败结局",
      position: { x: 75, y: 38 }
    },
    {
      id: "n7",
      title: "结局 真爱相守",
      type: "ending",
      status: "published",
      duration: "00:54",
      summary: "真相公开后，你们选择共同面对未来。",
      choices: [],
      ending: "完美结局",
      position: { x: 75, y: 62 }
    },
    {
      id: "n8",
      title: "结局 暗潮未散",
      type: "ending",
      status: "review",
      duration: "00:58",
      summary: "交易换来短暂平静，新的危机仍在靠近。",
      choices: [],
      ending: "开放结局",
      position: { x: 54, y: 73 }
    }
  ],
  metrics: {
    exposure: 128430,
    playRate: 61.8,
    choiceRate: 48.4,
    payRate: 18.6,
    completionRate: 12.8,
    revenue: 84260
  }
};
