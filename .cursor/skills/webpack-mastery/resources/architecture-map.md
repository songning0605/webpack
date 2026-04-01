# Webpack 架构全景 — 钩子地图与核心类职责

> 本文件是 `webpack-mastery` Skill 的辅助资源。
> 教学中遇到架构定位问题时，读取此文件获取精确信息。

---

## 1. 核心对象职责表

| 核心类 | 文件位置 | 职责 | 生命周期 |
|-------|---------|------|---------|
| `Compiler` | `lib/Compiler.js` | 全局构建控制器，管理整个构建流程和文件系统交互 | 整个 Webpack 会话 |
| `Compilation` | `lib/Compilation.js` | 单次构建上下文，持有 modules/chunks/assets | 单次 build（watch 模式下每次变更重建） |
| `NormalModuleFactory` | `lib/NormalModuleFactory.js` | 模块工厂，负责 resolve 路径 + 创建 NormalModule 实例 | 依附于 Compiler |
| `NormalModule` | `lib/NormalModule.js` | 单个模块的完整表示，包含 build/parse/codeGen 逻辑 | 依附于 Compilation |
| `ModuleGraph` | `lib/ModuleGraph.js` | 模块间依赖关系的图结构 | 依附于 Compilation |
| `ChunkGraph` | `lib/ChunkGraph.js` | 模块 ↔ Chunk 的多对多映射关系 | 依附于 Compilation |
| `Chunk` | `lib/Chunk.js` | 一组模块的逻辑分组，最终对应一个输出文件 | 依附于 Compilation |
| `ChunkGroup` | `lib/ChunkGroup.js` | Chunk 的有序集合，管理 Chunk 间的父子/兄弟关系 | 依附于 Compilation |
| `Entrypoint` | `lib/Entrypoint.js` | 特殊的 ChunkGroup，标记入口起点 | 依附于 Compilation |
| `Dependency` | `lib/Dependency.js` | 依赖关系的抽象基类 | 依附于 Module |
| `DependenciesBlock` | `lib/DependenciesBlock.js` | 持有 dependencies 和 blocks 的容器（Module 的基类） | 依附于 Module |
| `AsyncDependenciesBlock` | `lib/AsyncDependenciesBlock.js` | 异步依赖块，触发 Code Splitting | 依附于 Module |
| `Template` | `lib/Template.js` | 输出代码的模板系统 | 工具类 |
| `RuntimeTemplate` | `lib/RuntimeTemplate.js` | 运行时代码模板（生成 `__webpack_require__` 等） | 依附于 Compilation |
| `ResolverFactory` | `lib/ResolverFactory.js` | 创建模块路径解析器（基于 enhanced-resolve） | 依附于 Compiler |
| `ExportsInfo` | `lib/ExportsInfo.js` | 跟踪模块的导出信息（provided/used），Tree Shaking 核心 | 依附于 ModuleGraph |

---

## 2. 管线阶段详解 — 钩子索引

### Phase 1: INIT（初始化）

```
用户调用 webpack(options)
  │
  ├─ lib/webpack.js
  │   ├─ 校验 Schema → lib/validateSchema.js
  │   ├─ 归一化配置 → lib/config/normalization.js
  │   ├─ 应用默认值 → lib/config/defaults.js
  │   └─ new Compiler(context)
  │
  └─ lib/WebpackOptionsApply.js
      └─ 根据配置注册几十个内置 Plugin（这是 Webpack 可扩展性的核心）
         例如：
         ├─ EntryOptionPlugin
         ├─ ExternalsPlugin
         ├─ JavascriptModulesPlugin
         ├─ JsonModulesPlugin
         ├─ SplitChunksPlugin
         ├─ RuntimePlugin
         └─ ... 等等
```

**关键钩子**：
| 钩子 | 类型 | 触发位置 | 作用 |
|------|-----|---------|------|
| `compiler.hooks.environment` | SyncHook | Compiler 构造后 | 环境准备 |
| `compiler.hooks.afterEnvironment` | SyncHook | environment 之后 | 环境准备完成 |
| `compiler.hooks.entryOption` | SyncBailHook | 处理 entry 配置 | 注册 EntryPlugin |
| `compiler.hooks.afterPlugins` | SyncHook | 所有插件注册后 | — |
| `compiler.hooks.initialize` | SyncHook | 初始化完成 | — |

### Phase 2: MAKE（构建模块图）

```
compiler.hooks.make (AsyncParallelHook)
  │
  ├─ EntryPlugin 触发 compilation.addEntry()
  │   └─ compilation._addEntryItem()
  │       └─ addModuleTree → handleModuleCreation
  │
  ├─ NormalModuleFactory.create()
  │   ├─ hooks.beforeResolve → 可 cancel/修改请求
  │   ├─ hooks.factorize
  │   │   └─ hooks.resolve → enhanced-resolve 解析路径
  │   └─ hooks.afterResolve → 创建 NormalModule 实例
  │
  ├─ compilation.buildModule(module)
  │   └─ NormalModule.build()
  │       ├─ NormalModule.doBuild()
  │       │   └─ runLoaders() (loader-runner) — 执行 Loader 链
  │       └─ NormalModule.parser.parse(source)
  │           └─ JavascriptParser.parse()
  │               ├─ 使用 acorn 生成 AST
  │               ├─ 遍历 AST 节点
  │               ├─ 触发 hooks.import/call/expression 等
  │               └─ 收集 Dependencies
  │
  └─ compilation.processModuleDependencies(module)
      └─ 对每个 dependency 递归 → handleModuleCreation（回到上面）
```

**关键钩子**：
| 钩子 | 类型 | 触发位置 | 作用 |
|------|-----|---------|------|
| `compiler.hooks.make` | AsyncParallelHook | Compilation 创建后 | 启动模块构建 |
| `compiler.hooks.compile` | SyncHook | make 之前 | 通知新一轮编译开始 |
| `compiler.hooks.thisCompilation` | SyncHook | 创建 Compilation | 当前 Compilation |
| `compiler.hooks.compilation` | SyncHook | 创建 Compilation 之后 | 配置 Compilation |
| `compilation.hooks.buildModule` | SyncHook | 每个模块构建前 | — |
| `compilation.hooks.succeedModule` | SyncHook | 模块构建成功 | — |
| `compilation.hooks.finishModules` | AsyncSeriesHook | 所有模块构建完成 | 后处理（如标记导出） |
| `normalModuleFactory.hooks.beforeResolve` | AsyncSeriesBailHook | resolve 前 | 可取消/修改 |
| `normalModuleFactory.hooks.afterResolve` | AsyncSeriesBailHook | resolve 后 | 可修改结果 |
| `parser.hooks.import` | SyncBailHook | 遇到 import 声明 | 依赖收集 |
| `parser.hooks.call` | HookMap<SyncBailHook> | 遇到函数调用 | 如 `require()` |
| `parser.hooks.importCall` | SyncBailHook | 遇到 `import()` | 异步依赖收集 |

### Phase 3: SEAL（封装优化）

```
compilation.seal()
  │
  ├─ hooks.seal — 冻结模块图
  │
  ├─ buildChunkGraph(compilation)
  │   ├─ 从 entrypoints 出发
  │   ├─ 同步依赖 → 加入当前 Chunk
  │   └─ AsyncDependenciesBlock → 创建新 ChunkGroup + 新 Chunk
  │
  ├─ hooks.optimize → hooks.optimizeModules → hooks.optimizeChunks
  │   └─ SplitChunksPlugin 干预 Chunk 拆分策略
  │
  ├─ hooks.optimizeDependencies
  │   ├─ FlagDependencyUsagePlugin — 标记 usedExports
  │   └─ SideEffectsFlagPlugin — 评估副作用
  │
  ├─ hooks.beforeModuleIds → hooks.moduleIds → hooks.optimizeModuleIds
  │   └─ 分配模块 ID
  │
  ├─ hooks.beforeChunkIds → hooks.chunkIds → hooks.optimizeChunkIds
  │   └─ 分配 Chunk ID
  │
  ├─ compilation.codeGeneration()
  │   └─ 对每个 module 调用 module.codeGeneration()
  │       └─ JavascriptGenerator / CssGenerator 等
  │
  ├─ compilation.createChunkAssets()
  │   └─ JavascriptModulesPlugin.renderMain / renderChunk
  │       └─ Template.renderChunkModules()
  │
  └─ hooks.processAssets (多个 stage)
      ├─ STAGE_ADDITIONAL
      ├─ STAGE_PRE_PROCESS
      ├─ STAGE_ADDITIONS
      ├─ STAGE_OPTIMIZE
      ├─ STAGE_OPTIMIZE_SIZE    ← Terser 等 minifier
      ├─ STAGE_DEV_TOOLING      ← SourceMap
      ├─ STAGE_OPTIMIZE_INLINE
      ├─ STAGE_SUMMARIZE
      └─ STAGE_REPORT
```

**关键钩子**：
| 钩子 | 类型 | 作用 |
|------|-----|------|
| `compilation.hooks.seal` | SyncHook | 开始 seal |
| `compilation.hooks.optimizeModules` | SyncBailHook | 优化模块 |
| `compilation.hooks.optimizeChunks` | SyncBailHook | 优化 Chunk（SplitChunksPlugin） |
| `compilation.hooks.optimizeDependencies` | SyncBailHook | 优化依赖（Tree Shaking 标记） |
| `compilation.hooks.processAssets` | AsyncSeriesHook | 处理 assets（多 stage）|
| `compilation.hooks.afterProcessAssets` | SyncHook | assets 处理完毕 |

### Phase 4: EMIT（输出）

```
compiler.hooks.emit (AsyncSeriesHook)
  │
  ├─ compiler.emitAssets()
  │   └─ 遍历 compilation.assets
  │       └─ outputFileSystem.writeFile()
  │
  └─ compiler.hooks.afterEmit (AsyncSeriesHook)
      └─ 输出完成，记录文件信息
```

### Phase 5: WATCH / HMR

```
Watch 模式:
  compiler.watch() → new Watching()
    └─ 监听文件变更 → 触发 compiler.hooks.invalid
        └─ 创建新的 Compilation → 重走 Phase 2-4
        └─ FileSystemInfo 管理文件快照，实现增量构建

HMR:
  HotModuleReplacementPlugin
    ├─ 在 compilation 上注入 HMR runtime
    ├─ 生成 hot-update.json (manifest)
    └─ 生成 hot-update.js (changed modules)
```

---

## 3. 关键设计模式

### 3.1 Tapable 钩子类型速查

| 钩子类型 | 行为 | 典型场景 |
|---------|------|---------|
| `SyncHook` | 顺序调用所有 tap，不关心返回值 | 通知型（buildModule） |
| `SyncBailHook` | 顺序调用，返回非 undefined 则中断 | 短路型（optimizeChunks） |
| `SyncWaterfallHook` | 顺序调用，返回值传递给下一个 tap | 管道型（assetPath） |
| `AsyncSeriesHook` | 异步顺序执行 | 需要等待的流程（make、emit） |
| `AsyncSeriesBailHook` | 异步顺序，可中断 | 异步短路（beforeResolve） |
| `AsyncParallelHook` | 异步并行执行 | 并行构建（make） |
| `HookMap` | 按 key 分组的钩子映射 | 按函数名分发（parser.hooks.call） |

### 3.2 Module 类型继承

```
Module (abstract)
  ├── NormalModule        — 最常见，对应一个物理文件
  ├── ContextModule       — require.context() 生成的动态模块
  ├── ExternalModule      — externals 配置排除的模块
  ├── DelegatedModule     — DLL 引用的模块
  ├── CssModule           — CSS 模块
  ├── RawModule           — 直接包含源码的模块
  └── RuntimeModule       — 运行时辅助模块（__webpack_require__ 等）
      ├── AsyncModuleRuntimeModule
      ├── EnsureChunkRuntimeModule
      └── ... 等 30+ 个子类
```

### 3.3 Dependency 类型分类

```
Dependency (abstract)
  ├── ModuleDependency (abstract) — 指向另一个 Module 的依赖
  │   ├── HarmonyImportDependency        — import ... from "..."
  │   ├── HarmonyImportSpecifierDependency — import { x } 中的 x
  │   ├── HarmonyExportImportedSpecifierDependency — export { x } from "..."
  │   ├── ImportDependency               — import("...") 动态导入
  │   ├── CommonJsRequireDependency      — require("...")
  │   ├── CssImportDependency            — @import in CSS
  │   └── ... 等
  └── NullDependency — 不指向模块的依赖（如 HarmonyCompatibilityDependency）
```
