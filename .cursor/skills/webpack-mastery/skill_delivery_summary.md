# Webpack 教学 Skill 交付总结

## 新 Skill 文件结构

```
.cursor/skills/webpack-mastery/
├── SKILL.md                              (15 KB) — 核心调度文件
└── resources/
    ├── architecture-map.md               (11 KB) — 管线钩子地图 + 核心类职责
    ├── source-reading-routes.md          ( 9 KB) — 8 条源码精读路线
    ├── examples-catalog.md               ( 8 KB) — 80+ 个 examples 映射表
    ├── test-catalog.md                   ( 2 KB) — 测试目录使用指南
    └── concept-glossary.md               ( 5 KB) — 50+ 核心概念速查表
```

**合计约 50 KB**，涵盖了 Webpack 源码教学的完整知识体系。

---

## 新旧对比

| 维度 | 旧 Skill (webpack-layered-learning) | 新 Skill (webpack-mastery) |
|------|-------------------------------------|---------------------------|
| **文件结构** | 单文件 (11KB) | 1 核心 + 5 资源 (50KB) |
| **管线划分** | 6 层（粗粒度） | 5 Phase × 15+ 子阶段（精细） |
| **教学方法** | "先现象后原理"（描述型） | CSSE 四步法（情境→概念→源码→实验） |
| **学习路径** | 无分级 | 3 条路径（🟢快速 / 🟡深潜 / 🔴精读） |
| **源码导读** | 列了几个文件名 | 8 条完整路线，标注关键函数 + 预估时间 |
| **Examples 映射** | 提了几个例子 | 80+ 个 examples 按管线阶段分类索引 |
| **测试验证** | 提到了 test 目录 | 分类对照表 + 命令速查 + 使用策略 |
| **概念索引** | 无 | 50+ 概念速查表（含类比、源码位置） |
| **钩子地图** | 无 | 完整的钩子类型 + 触发位置 + 作用说明 |
| **文档沉淀** | 简单存文件 | 索引系统 + 元数据 + 关联主题 |
| **触发条件** | 仅"架构/分层/管线" | 7 类场景全覆盖 |

## 核心改进点

### 1. 模块化分离
不再将所有知识塞进一个文件。SKILL.md 只负责**教学策略调度**，具体知识按类型拆入 `resources/`，AI 按需读取，减少上下文噪音。

### 2. CSSE 四步教学法
从模糊的"先实践后原理"升级为结构化的 **Context → Schema → Source → Experiment**，每步有明确的输出要求和长度约束。

### 3. 三条学习路径
不再一视同仁，根据用户是"初次了解"、"深入某个主题"还是"要读源码/写插件"，走完全不同的教学流程。

### 4. 源码精读路线图
8 条主题路线（主流程 / Loader / Plugin / Tree Shaking / Code Splitting / HMR / CSS / Module Federation），每条标注了阅读顺序、关键函数、预估时间。

### 5. 完整的 Examples ↔ 概念映射
将 `examples/` 下 80+ 个目录全部按管线阶段分类，AI 在教学中可以精准找到"讲 X 概念该用哪个 example"。

## 使用说明

> [!TIP]
> 旧 Skill (`webpack-layered-learning/`) 可保留或删除，新 Skill (`webpack-mastery/`) 完全独立。

在 Cursor 中对话时，当问题匹配 SKILL.md 中定义的 7 类触发场景，AI 会：
1. 自动激活 `webpack-mastery` Skill
2. 判断适合哪条学习路径
3. 按需读取 `resources/` 下的辅助文件
4. 用 CSSE 四步法组织回答
5. 讲解完成后自动沉淀文档到 `learning/`
