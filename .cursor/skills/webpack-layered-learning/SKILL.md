---
name: webpack-layered-learning
description: Guides Webpack study from architecture and design intent down to hooks, loaders, plugins, and output. Use when the user is learning Webpack, asks about webpack architecture, layering, compilation pipeline, or wants top-down explanations before configuration details.
---

# Webpack 分层学习指导 (Layered Learning)

## 核心工作流 (Workflow)

当用户询问 Webpack 相关知识时，必须严格遵守以下步骤组织回答：

1. **定位架构层级**：明确指出用户的问题属于 Webpack 管线的哪一个核心层。
2. **阐述设计意图**：解释这一层解决什么问题、在整体架构中的位置。
3. **梳理数据流向**：说明关键抽象（如 AST、Module Graph、Chunk）和输入输出。
4. **展示配置与细节**（仅在最后或用户要求时）：给出具体的 API、配置字段或代码片段。

## Webpack 六大核心分层（源码映射上下文）

回答时必须将概念映射到以下层级，**并主动结合 `lib/` 目录下的具体源码文件和核心类进行讲解**。

*(注：在查阅源码时请注意，Webpack 源码本身不使用 TypeScript 编写，而是通过 `schemas/` 下的 JSON Schema 和代码中的 JSDoc，借由 `yarn fix:special` 自动生成 `types.d.ts` 的。源码中大量的类型依赖于此。)*

**【GitNexus 辅助指引】**
由于 Webpack 源码包含数万个 Symbol 和错综复杂的生命周期钩子，遇到不熟悉的流程或 API（比如某个钩子在哪被 `call`，某个类在哪被实例化），**必须**优先使用 GitNexus 提供的工具：
- 查流程：使用 `gitnexus_query({query: "某某机制"})` 或读取 `gitnexus://repo/webpack/process/{name}`。
- 查调用链：使用 `gitnexus_context({name: "某某函数或类名"})` 查看它的来龙去脉（Incoming/Outgoing calls）。

1. **入口与 CLI (Init)**：
   - **指代**：解析配置、合并参数、调用 `webpack(options)` 生成 Compiler。
   - **源码映射**：入口函数在 `lib/webpack.js`；默认配置处理在 `lib/config/`；配置参数的合法性校验 Schema 位于 `schemas/`。

2. **Compiler / Compilation (Core Object)**：
   - **指代**：`Compiler`（单次/全生命周期对象）与 `Compilation`（单次具体构建/依赖图创建）。
   - **源码映射**：`lib/Compiler.js`，`lib/Compilation.js`。

3. **Tapable 与生命周期 (Plugin System)**：
   - **指代**：插件架构，所有核心对象都继承自 Tapable 并对外暴露 `hooks` 属性。
   - **源码映射**：所有的插件机制均基于对 `hooks`（如 `compiler.hooks.make`）的 `tap` / `tapAsync` 调用。内置 Plugin 大量散落在 `lib/` 根目录。

4. **模块图 (Module Graph)**：
   - **指代**：`resolve` 找路径，Loader 转换源文件，Parser 收集 AST 依赖，最终建图。
   - **源码映射**：依赖收集在 `lib/Parser.js`。注：不同语言的解析和生成是隔离的，如 `lib/javascript/JavascriptParser.js` 和 `lib/css/`；模块实例化在 `lib/NormalModuleFactory.js` (NMF) 及 `lib/NormalModule.js`；整体图结构位于 `lib/ModuleGraph.js`。

5. **Chunk 与代码生成 (Chunk Graph)**：
   - **指代**：依赖图切分为 Chunk，把模块包进 Chunk 里。
   - **源码映射**：图分块逻辑在 `lib/buildChunkGraph.js`，分割策略在 `lib/optimize/SplitChunksPlugin.js`；`lib/ChunkGraph.js` 管理模块和 Chunk 的多对多关系。代码生成在各类 `*Generator.js` 以及 `lib/Template.js`。

6. **输出 (Emit)**：
   - **指代**：遍历 Compilation 的 `assets` 输出到磁盘文件系统。
   - **源码映射**：依然在 `lib/Compiler.js` 中的 `emitAssets` 及对应的 `compiler.hooks.emit`。

## 输出格式模板 (Template)

每次讲解新概念时，必须使用以下 Markdown 结构：

```markdown
## 📍 在架构中的位置
[1-2句话：指出属于六大核心分层中的哪一层，以及它在管线中的上下游。]

## 🧠 核心概念与设计意图
[解释该特性/配置为什么存在？核心的数据流是怎么样的？]

## 🛠 细节与实操 (如适用)
[相关配置、钩子名、或结合当前代码库的实际示例。复杂流程可使用极其简短的 Mermaid 流程图。]
```

## 深入机制演示 (Deep Dive Examples)

当用户询问特定特性的原理（如 **Loader、Plugin、Code Splitting、HMR、Tree Shaking** 等）时，**必须**主动前往本仓库的 `examples/` 目录下寻找对应的官方示例文件夹。

例如：
- 询问 Loader：读取 `examples/loader/loader.js` 和 `examples/loader/example.js`。
- 询问 Code Splitting：去 `examples/code-splitting/` 等一系列相关文件夹寻找示例。
- 询问特定的内置 Plugin：去 `examples/` 下找对应的插件名的目录（如 `manifest-plugin` 等）。

向用户解释时，**首选阅读该示例目录下的 `README.md` 或源码文件**，不要直接丢出整个文件的代码，而是分段解释，将官方源码片段对应到前面提到的六大核心分层和数据流向中去。

## 学习文档沉淀 (Documentation)

当用户向你提问并完成一次关于 Webpack 原理、架构或源码机制的讲解后，**必须**主动将本次问答的核心内容整理并保存为 Markdown 文件，存入本仓库的 `study_docs/` 目录中。

1. **命名规范**：文件命名需从**用户的提问中提取核心关键词**，并使用全小写英文连字符分隔，如用户问「Loader 的工作原理」，文件应命名为 `loader-working-principle.md`。
2. **结构要求**：该文档内容需遵循前文提到的「输出格式模板」，即：
   - 包含用户的原问题或主题。
   - 📍 在架构中的位置。
   - 🧠 核心概念与设计意图。
   - 🛠 细节与实操（源码位置/示例）。
3. **图表补充**：为了方便后续查阅，**尽可能**在文档的「核心概念与设计意图」部分，使用 Mermaid 语法 (`flowchart` 或 `sequenceDiagram`) 补充对应的架构图或流程图。
4. **提示用户**：在对话回复的最后，告知用户已将本次学习记录保存至 `study_docs/xxx.md`。

## 问答示例 (Examples)

**示例 1：用户询问 Loader 原理**
Input: "能给我讲讲 loader 的工作原理吗？我想看看源码在哪。"
Output:
```markdown
## 📍 在架构中的位置
Loader 属于 **第4层：模块图 (Module Graph)** 构建阶段。它在 Webpack 解析到模块的物理路径后，生成 AST 之前介入。

## 🧠 核心概念与设计意图
Webpack 原生只理解 JS 和 JSON。Loader 充当了“翻译官”（Transformer），它的本质就是一个 Node.js 函数：接收源代码字符串（或者 Buffer），并返回转译后的字符串，供后续解析器继续分析（AST 收集依赖）。

## 🛠 细节与实操
在当前仓库中：
1. **调度**：调用链由 \`loader-runner\` 接管。
2. **源码映射**：你可以查看 \`lib/NormalModule.js\` 中的 \`doBuild()\` 函数，那里调用了 \`runLoaders\` 来执行 Loader 链条。（AI 思考：此时我应当主动调用 \`gitnexus_context({name: "doBuild"})\` 帮你快速查看它的调用链路和周边关系）。
3. 如果你想看直观的用法和编写示例，请查看官方的：\`examples/loader/loader.js\` 以及它在 \`examples/loader/example.js\` 中的 \`require("./loader!./file")\` 内联调用方式。
```

## 辅助源码验证与测试指引 (Test Driven Verification)

在讲解完特定模块的原理或改动后，如果需要进一步理解它的表现（例如，某个 Plugin 是如何在实际项目中生效的），**务必**引导用户去本仓库极其丰富的测试目录中寻找具体场景。Webpack 利用 `test/` 来定义功能边界：

- **验证功能原理**：参考 `test/cases/`（包含了各个功能维度的最小编译测试例）。
- **验证配置意图**：参考 `test/configCases/`。
- **验证输出结果**：参考 `test/statsCases/`（这里包含大量的最终打包产物 Snapshot 对比）。
- **验证监控与热更**：参考 `test/watchCases/`（增量编译机制）或 `test/hotCases/` (HMR 机制)。
- **运行验证**：可以使用命令如 `yarn test:basic -- --testPathPatterns="ConfigTestCases" --testNamePattern="[具体测试名称]"` 来运行对应的小型测试，帮助观察日志和结果。

## 严禁行为 (Anti-Patterns)
- ❌ **严禁**：一上来就甩出长篇的 `webpack.config.js` 逐行解释。
- ❌ **严禁**：在没有建立架构上下文的情况下，罗列一堆 Loader/Plugin 让用户死记硬背。
- ❌ **严禁**：只给“能跑的代码”，跳过其背后的设计理念。
