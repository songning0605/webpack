# 源码精读路线图

> 本文件是 `webpack-mastery` Skill 的辅助资源。
> 当用户选择「路径 C：源码精读」时，根据主题选择对应路线。

---

## 使用方式

每条路线按**阅读顺序**列出文件和关键函数。
阅读时聚焦标注的「关键函数」，跳过辅助性代码。
每个文件标注了预估 LOC（重点行数）和核心职责。

---

## 路线 1：主流程 — 从 `webpack()` 到产出文件

**适合**：第一次阅读源码，想跑通完整 happy path

**时间**：60~90 分钟

```
1. lib/webpack.js                    (~100 LOC 核心)
   → webpack() 工厂函数
   → 创建 Compiler，调用 compiler.run()
   关键：createCompiler(), create()

2. lib/Compiler.js                   (~300 LOC 核心)
   → run() → compile() → make → seal → emit
   关键：run(), compile(), emitAssets()
   钩子链：beforeRun → run → beforeCompile → compile → make → ...

3. lib/Compilation.js                (~500 LOC 核心路径)
   → addEntry() → _addEntryItem() → addModuleTree()
   → handleModuleCreation() → _buildModule() → processModuleDependencies()
   → seal() → codeGeneration() → createChunkAssets()
   关键：seal() 是重中之重（~200 LOC），涵盖整个优化和生成流程

4. lib/NormalModuleFactory.js        (~200 LOC 核心)
   → create() → hooks.beforeResolve → resolve → afterResolve
   关键：create(), _resolve()

5. lib/NormalModule.js               (~250 LOC 核心)
   → build() → doBuild() (runLoaders) → parse(source)
   → codeGeneration()
   关键：doBuild(), _doBuild()

6. lib/javascript/JavascriptParser.js (~300 LOC 核心)
   → parse(source) → acorn.parse() → 遍历 AST
   → 触发 hooks.import, hooks.call, hooks.importCall 等
   注意：此文件很大(5000+ LOC)，第一遍只看 parse() 和 import/require 处理

7. lib/buildChunkGraph.js            (~400 LOC 核心)
   → buildChunkGraph(compilation)
   → visitModules() — 从 entry 出发遍历 ModuleGraph
   → 同步依赖分到同一 Chunk，异步块创建新 Chunk

8. lib/javascript/JavascriptModulesPlugin.js (~200 LOC 核心)
   → renderMain() / renderChunk() — 生成最终的 JS 包装代码
   → 安装运行时模块
```

---

## 路线 2：Loader 机制

**适合**：想写自定义 Loader 或理解 Loader 链的执行逻辑

**时间**：30~45 分钟

```
1. lib/NormalModule.js
   → doBuild() — Loader 的发起点
   → 调用 runLoaders() (来自 loader-runner 包)
   关键：观察 loaders 数组的构造和传递

2. lib/NormalModuleFactory.js
   → _resolve() 中 resolveRequestArray() — 解析 Loader 路径
   → ruleSet 匹配规则 → 确定用哪些 Loader
   关联：lib/rules/RuleSetCompiler.js — 编译 webpack.config.js 中的 module.rules

3. examples/loader/
   → loader.js — 最简 Loader 示例（接收 source，返回转换后的 source）
   → webpack.config.js — 如何配置自定义 Loader

4. test/configCases/loaders/ — Loader 相关的集成测试用例

实践要点：
- Loader 本质就是 (source: string) => string 的纯函数
- Loader 从右到左执行（compose 顺序）
- pitch 阶段从左到右，先于 normal 阶段执行
- Loader 可以返回多个值（source + sourceMap + additionalData）
- this 上下文提供了 this.callback(), this.async(), this.emitFile() 等
```

---

## 路线 3：Plugin 机制 & 钩子系统

**适合**：想写自定义 Plugin 或理解 Tapable 钩子架构

**时间**：30~45 分钟

```
1. 先读一个简单的内置 Plugin，理解 Plugin 的基本骨架：
   lib/BannerPlugin.js              (~100 LOC)
   → apply(compiler) 注册钩子
   → compilation.hooks.processAssets.tap()

2. 再读一个中等复杂度的 Plugin：
   lib/DefinePlugin.js              (~200 LOC 核心)
   → 在 Parser 层面替换表达式
   → 演示了 parser.hooks 的使用方式

3. lib/WebpackOptionsApply.js        (~300 LOC 核心)
   → 这是所有内置 Plugin 的「注册中心」
   → 揭示了 Webpack 配置项是如何映射到具体 Plugin 的

4. 理解 Tapable（外部依赖，但可以看接口）：
   → 核心概念：SyncHook, AsyncSeriesHook, SyncBailHook, HookMap
   → 在 Compiler.js / Compilation.js 的构造函数中查看所有可用钩子

实践要点：
- Plugin = { apply(compiler) { ... } }
- 一个 Plugin 可以同时 tap 多个钩子
- compiler.hooks 全局级别，compilation.hooks 单次构建级别
- processAssets 有多个 stage (ADDITIONAL → ... → REPORT)
```

---

## 路线 4：Tree Shaking 全链路

**适合**：想理解 Webpack 如何标记和消除未使用代码

**时间**：45~60 分钟

```
1. lib/dependencies/HarmonyExportInitFragment.js
   → 生成 `/* harmony export */` 或 `/* unused harmony export */`
   → 这是 Tree Shaking 在产物中的"肉眼可见"表现

2. lib/FlagDependencyExportsPlugin.js   (~200 LOC)
   → 挂载在 compilation.hooks.finishModules
   → 遍历所有模块，收集 providedExports（模块提供了哪些导出）
   → 存入 ExportsInfo

3. lib/FlagDependencyUsagePlugin.js     (~150 LOC)
   → 挂载在 compilation.hooks.optimizeDependencies
   → 从入口出发，逆推得到 usedExports（哪些导出被实际使用了）

4. lib/optimize/SideEffectsFlagPlugin.js (~200 LOC)
   → 读取 package.json 的 sideEffects 字段
   → 标记纯模块，允许跳过整个未使用的子模块

5. lib/ExportsInfo.js                   (~500 LOC)
   → 核心数据结构：per-export 级别的 provided / used / mangled 信息
   → getUsedName(), isExportUsed() 等 API

6. examples/side-effects/               — 最佳入门示例
   examples/harmony-unused/             — 对比有/无 Tree Shaking 的输出

验证命令：
yarn test:basic -- --testPathPatterns="ConfigTestCases" --testNamePattern="tree-shaking"
```

---

## 路线 5：Code Splitting & 异步加载

**适合**：想理解按需加载、SplitChunksPlugin 的工作机制

**时间**：45~60 分钟

```
1. lib/dependencies/ImportParserPlugin.js
   → Parser 遇到 import() → 创建 ImportDependency + AsyncDependenciesBlock

2. lib/AsyncDependenciesBlock.js
   → 异步依赖块的数据结构
   → 被标记在 Module 上，seal 阶段会据此创建新 Chunk

3. lib/buildChunkGraph.js              (~400 LOC)
   → visitModules() 核心逻辑
   → 遇到 AsyncDependenciesBlock 时创建新 ChunkGroup + Chunk
   → 理解 Chunk 连接与 ChunkGroup 的 parent/child 关系

4. lib/optimize/SplitChunksPlugin.js   (~600 LOC 核心)
   → 挂载在 compilation.hooks.optimizeChunks
   → 基于 cacheGroups 配置，将公共依赖抽取到共享 Chunk
   → 理解 minSize, minChunks, maxAsyncRequests 等阈值

5. lib/runtime/EnsureChunkRuntimeModule.js
   → 生成 __webpack_require__.e() — 运行时异步加载 Chunk 的代码
   → 理解 JSONP/script 标签加载机制

6. examples/code-splitting/             — 基础示例
   examples/code-splitting-harmony/     — ESM 语法的 Code Splitting
   examples/common-chunk-and-vendor-chunk/ — 共享 Chunk 示例

验证命令：
yarn test:basic -- --testPathPatterns="ConfigTestCases" --testNamePattern="split-chunks"
```

---

## 路线 6：HMR（热模块替换）

**适合**：想理解 Hot Module Replacement 的完整链路

**时间**：60~90 分钟

```
1. lib/HotModuleReplacementPlugin.js   (~400 LOC)
   → 这是 HMR 的核心 Plugin
   → 生成 hot-update.json (manifest) 和 hot-update.js (变更模块)
   → 注入 HMR runtime 到 bundle

2. lib/hmr/HotModuleReplacement.runtime.js
   → 客户端 HMR runtime
   → module.hot.accept / module.hot.check / module.hot.apply

3. lib/hmr/LazyCompilationPlugin.js    (~200 LOC)
   → 懒编译优化：只有被请求的模块才编译

4. lib/Watching.js                     (~200 LOC)
   → 监听文件变化 → 触发增量编译
   → 与 HMR 配合实现实时更新

5. test/hotCases/ — HMR 测试用例，每个目录是一个场景

HMR 数据流：
文件变更 → Watching 检测 → 增量编译 → 生成 hot-update 资源
→ 通知客户端 → 客户端 fetch 新模块 → 调用 module.hot.accept 回调

验证命令：
yarn test:base -- --testPathPatterns="HotTestCases"
```

---

## 路线 7：CSS 处理

**适合**：想理解 Webpack 5 原生 CSS 支持的实现

**时间**：30~45 分钟

```
1. lib/css/CssParser.js               — CSS 解析器
2. lib/css/CssGenerator.js            — CSS 代码生成
3. lib/css/CssModulesPlugin.js        — CSS Modules 支持
4. lib/CssModule.js                   — CSS 模块的数据结构

5. examples/css/                      — CSS 处理示例

验证命令：
yarn test:basic -- --testPathPatterns="ConfigTestCases" --testNamePattern="^css "
```

---

## 路线 8：Module Federation

**适合**：想理解跨应用模块共享的实现

**时间**：60+ 分钟

```
1. lib/container/ContainerPlugin.js     — 暴露模块的一方
2. lib/container/ContainerReferencePlugin.js — 消费模块的一方
3. lib/container/ModuleFederationPlugin.js  — 统一配置入口
4. lib/sharing/SharePlugin.js           — 依赖共享机制

5. examples/module-federation/          — 官方示例

验证命令：
yarn test:basic -- --testPathPatterns="ConfigTestCases" --testNamePattern="container"
```
