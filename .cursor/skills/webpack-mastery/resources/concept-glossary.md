# 核心概念速查表

> `webpack-mastery` Skill 辅助资源。解释术语时查阅。

---

## 核心对象

| 概念 | 一句话解释 | 源码位置 | 类比 |
|-----|-----------|---------|------|
| **Compiler** | 全局构建控制器，整个会话只有一个 | `lib/Compiler.js` | 工厂厂长 |
| **Compilation** | 单次构建的上下文，持有所有模块/Chunk/资源 | `lib/Compilation.js` | 一次生产订单 |
| **Module** | 一个文件被加载后的内存表示 | `lib/Module.js` | 工厂里的一个零件 |
| **NormalModule** | 最常见的 Module 类型，对应一个物理文件 | `lib/NormalModule.js` | 标准零件 |
| **Chunk** | 一组 Module 的分组，对应一个输出文件 | `lib/Chunk.js` | 装箱后的一个包裹 |
| **ChunkGroup** | Chunk 的有序集合，管理加载顺序 | `lib/ChunkGroup.js` | 包裹的配送批次 |
| **Entrypoint** | 特殊的 ChunkGroup，标记应用入口 | `lib/Entrypoint.js` | 第一个要送达的包裹 |
| **Dependency** | 模块间引用关系的抽象 | `lib/Dependency.js` | 零件之间的连接螺丝 |
| **AsyncDependenciesBlock** | 异步依赖块，触发 Code Splitting | `lib/AsyncDependenciesBlock.js` | "这批零件稍后再送" |

## 图结构

| 概念 | 一句话解释 | 源码位置 |
|-----|-----------|---------|
| **ModuleGraph** | 模块间依赖关系图 | `lib/ModuleGraph.js` |
| **ChunkGraph** | 模块与 Chunk 的多对多映射 | `lib/ChunkGraph.js` |
| **ModuleGraphConnection** | ModuleGraph 中的一条边（一个依赖关系） | `lib/ModuleGraphConnection.js` |
| **ExportsInfo** | 跟踪模块的导出信息（provided/used） | `lib/ExportsInfo.js` |

## 工厂与解析

| 概念 | 一句话解释 | 源码位置 |
|-----|-----------|---------|
| **NormalModuleFactory** | 创建 NormalModule 的工厂（resolve + create） | `lib/NormalModuleFactory.js` |
| **ContextModuleFactory** | 创建 ContextModule 的工厂（require.context） | `lib/ContextModuleFactory.js` |
| **ResolverFactory** | 创建路径解析器（基于 enhanced-resolve） | `lib/ResolverFactory.js` |
| **Parser** | 解析源码为 AST 并收集依赖 | `lib/javascript/JavascriptParser.js` |
| **Generator** | 将模块的 AST 生成为最终代码 | `lib/javascript/JavascriptGenerator.js` |

## 运行时与模板

| 概念 | 一句话解释 | 源码位置 |
|-----|-----------|---------|
| **RuntimeModule** | 运行时辅助代码（`__webpack_require__` 等） | `lib/RuntimeModule.js` |
| **RuntimeGlobals** | 运行时全局变量名常量 | `lib/RuntimeGlobals.js` |
| **Template** | 生成输出代码的模板系统 | `lib/Template.js` |
| **RuntimeTemplate** | 生成运行时调用代码的工具 | `lib/RuntimeTemplate.js` |
| **InitFragment** | 模块代码顶部注入的代码片段 | `lib/InitFragment.js` |

## 插件系统

| 概念 | 一句话解释 |
|-----|-----------|
| **Tapable** | Webpack 的事件/钩子系统基础库 |
| **Hook** | 一个可被订阅(tap)和触发(call)的事件点 |
| **tap** | 同步订阅一个 Hook |
| **tapAsync** | 异步订阅一个 Hook（callback 风格） |
| **tapPromise** | 异步订阅一个 Hook（Promise 风格） |

## 优化相关

| 概念 | 一句话解释 | 源码位置 |
|-----|-----------|---------|
| **providedExports** | 模块对外提供了哪些导出 | `FlagDependencyExportsPlugin.js` |
| **usedExports** | 哪些导出被实际使用了 | `FlagDependencyUsagePlugin.js` |
| **sideEffects** | 模块是否有副作用（影响 Tree Shaking 激进程度） | `SideEffectsFlagPlugin.js` |
| **SplitChunksPlugin** | 自动拆分公共依赖到共享 Chunk | `lib/optimize/SplitChunksPlugin.js` |
| **ModuleConcatenation** | 作用域提升，把多个模块合并到一个闭包 | `lib/optimize/ModuleConcatenationPlugin.js` |

## 关键生命周期钩子

| 钩子 | 所属对象 | 管线阶段 | 常见用途 |
|------|---------|---------|---------|
| `make` | Compiler | MAKE | 启动模块构建 |
| `compilation` | Compiler | INIT | 配置新 Compilation |
| `emit` | Compiler | EMIT | 输出前最后干预 |
| `seal` | Compilation | SEAL | 冻结模块图 |
| `optimizeChunks` | Compilation | SEAL | Chunk 优化（SplitChunks） |
| `optimizeDependencies` | Compilation | SEAL | 依赖优化（Tree Shaking） |
| `processAssets` | Compilation | SEAL | 处理 assets（多 stage） |
| `finishModules` | Compilation | MAKE 尾 | 模块构建全部完成 |
| `buildModule` | Compilation | MAKE | 单个模块构建前 |
| `beforeResolve` | NMF | MAKE | 模块 resolve 前 |
