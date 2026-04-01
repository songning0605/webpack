# 测试目录使用指南

> `webpack-mastery` Skill 辅助资源。在教学的「实验验证」阶段使用。

---

## 测试目录结构

```
test/
├── cases/           # 编译测试（功能级）
├── configCases/     # 配置驱动测试（⭐最常用）
├── statsCases/      # Stats 输出快照
├── watchCases/      # Watch 模式（增量编译）
├── hotCases/        # HMR 测试
├── benchmarkCases/  # 性能基准
├── *.unittest.js    # 单元测试
├── *.basictest.js   # 基础集成测试
└── *.test.js        # 完整集成测试
```

---

## configCases 分类（教学主题对照）

| 教学主题 | configCases 目录 |
|---------|-----------------|
| Tree Shaking | `tree-shaking/` |
| Code Splitting | `split-chunks*/` |
| Chunk 拆分 | `chunks/` |
| Loader | `loaders/` |
| CSS | `css/` |
| Source Map | `source-map/` |
| HMR | `hot/` |
| Externals | `externals/` |
| Library | `library/` |
| Asset Modules | `asset-modules/` |
| Module Federation | `container/` |
| Scope Hoisting | `scope-hoisting/` |
| Cache | `cache/` |
| Entry | `entry/` |
| Output | `output*/` |
| Resolve | `resolve/` |

---

## 运行命令速查

| 目标 | 命令 |
|------|------|
| 特定 configCase | `yarn test:basic -- --testPathPatterns="ConfigTestCases" --testNamePattern="<category> <name>"` |
| 所有 configCases | `yarn test:basic -- --testPathPatterns="ConfigTestCases"` |
| stats 测试 | `yarn test:basic -- --testPathPatterns="StatsTestCases"` |
| watch 测试 | `yarn test:base -- --testPathPatterns="WatchTestCases"` |
| HMR 测试 | `yarn test:base -- --testPathPatterns="HotTestCases"` |
| 单元测试 | `yarn test:base -- --testPathPatterns="<filename>"` |

---

## 教学使用策略

### 验证型（最常用）
讲完概念后，跑相关测试观察预期行为：
```bash
yarn test:basic -- --testPathPatterns="ConfigTestCases" --testNamePattern="tree-shaking"
```

### 探索型
让用户先阅读测试的 `webpack.config.js` 和 `index.js`，理解测试在验证什么。

### 调试型
修改源码后，用测试验证改动是否正确。
