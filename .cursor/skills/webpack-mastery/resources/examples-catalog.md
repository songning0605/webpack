# Examples 目录 ↔ 概念映射表

> 本文件是 `webpack-mastery` Skill 的辅助资源。
> 教学中需要找示例时，查阅此表快速定位。

---

## 按管线阶段分类

### Phase 1: INIT（入口与配置）

| Example 目录 | 演示概念 | 关键文件 |
|-------------|---------|---------|
| `examples/commonjs/` | 最基础的 CommonJS 模块打包 | `example.js` |
| `examples/harmony/` | ESM (import/export) 基础用法 | `example.js`, `increment.js` |
| `examples/mixed/` | CommonJS 和 ESM 混用 | `example.js` |
| `examples/multiple-entry-points/` | 多入口配置 | `webpack.config.js` |
| `examples/multi-compiler/` | 多个 Compiler 实例 | `webpack.config.js` |

### Phase 2: MAKE（模块解析与构建）

| Example 目录 | 演示概念 | 关键文件 |
|-------------|---------|---------|
| `examples/loader/` | **自定义 Loader 基础** | `loader.js`, `example.js` |
| `examples/coffee-script/` | CoffeeScript Loader | `webpack.config.js` |
| `examples/typescript/` | TypeScript 处理 | `webpack.config.js` |
| `examples/markdown/` | Markdown → HTML Loader | `loader.js` |
| `examples/custom-json-modules/` | 自定义 JSON 解析器 | `webpack.config.js` |
| `examples/custom-javascript-parser/` | 自定义 JS 解析器 | `webpack.config.js` |
| `examples/require.context/` | `require.context` 动态模块 | `example.js` |
| `examples/require.resolve/` | `require.resolve` 路径解析 | `example.js` |
| `examples/externals/` | 外部模块排除 | `webpack.config.js` |
| `examples/virtual-modules/` | 虚拟模块（非物理文件） | `webpack.config.js` |
| `examples/nodejs-addons/` | Node.js 原生模块 | `webpack.config.js` |

### Phase 3: SEAL（优化与代码生成）

#### Code Splitting 系列
| Example 目录 | 演示概念 | 关键文件 |
|-------------|---------|---------|
| `examples/code-splitting/` | **入门：`import()` 动态导入** | `example.js` |
| `examples/code-splitting-harmony/` | ESM 风格的 Code Splitting | `example.js` |
| `examples/code-splitting-bundle-loader/` | Bundle Loader 方式拆分 | `example.js` |
| `examples/code-splitting-specify-chunk-name/` | `webpackChunkName` 魔法注释 | `example.js` |
| `examples/code-splitting-native-import-context/` | 动态路径 import | `example.js` |
| `examples/code-splitting-native-import-context-filter/` | 带过滤的动态 import | `example.js` |
| `examples/code-splitting-depend-on-simple/` | Chunk 依赖（简单） | `webpack.config.js` |
| `examples/code-splitting-depend-on-advanced/` | Chunk 依赖（高级） | `webpack.config.js` |
| `examples/code-splitted-require.context/` | require.context + Code Splitting | `example.js` |

#### Tree Shaking 与优化
| Example 目录 | 演示概念 | 关键文件 |
|-------------|---------|---------|
| `examples/harmony-unused/` | **未使用导出的处理** | `example.js` |
| `examples/side-effects/` | **sideEffects 字段对 Tree Shaking 的影响** | `example.js`, `package.json` |
| `examples/cjs-tree-shaking/` | CommonJS 的 Tree Shaking | `example.js` |
| `examples/scope-hoisting/` | 作用域提升 / Module Concatenation | `webpack.config.js` |
| `examples/reexport-components/` | 重导出场景的优化 | `example.js` |

#### Chunk 策略
| Example 目录 | 演示概念 | 关键文件 |
|-------------|---------|---------|
| `examples/common-chunk-and-vendor-chunk/` | 公共 Chunk + Vendor Chunk | `webpack.config.js` |
| `examples/common-chunk-grandchildren/` | 嵌套共享 Chunk | `webpack.config.js` |
| `examples/explicit-vendor-chunk/` | 显式拆分 Vendor | `webpack.config.js` |
| `examples/two-explicit-vendor-chunks/` | 多个 Vendor Chunk | `webpack.config.js` |
| `examples/extra-async-chunk/` | 额外异步 Chunk | `webpack.config.js` |
| `examples/extra-async-chunk-advanced/` | 高级异步 Chunk 拆分 | `webpack.config.js` |
| `examples/aggressive-merging/` | 激进合并策略 | `webpack.config.js` |
| `examples/http2-aggressive-splitting/` | HTTP/2 优化的 Chunk 拆分 | `webpack.config.js` |
| `examples/chunkhash/` | 基于内容的 Chunk Hash | `webpack.config.js` |
| `examples/named-chunks/` | 命名 Chunk | `webpack.config.js` |

### Phase 4: EMIT（输出）

| Example 目录 | 演示概念 | 关键文件 |
|-------------|---------|---------|
| `examples/source-map/` | Source Map 生成 | `webpack.config.js` |
| `examples/source-mapping-url/` | Source Mapping URL | `webpack.config.js` |
| `examples/manifest-plugin/` | Manifest 文件输出 | `webpack.config.js` |
| `examples/stats-detailed/` | 详细构建信息 | `webpack.config.js` |
| `examples/stats-minimal/` | 最小构建信息 | `webpack.config.js` |
| `examples/stats-normal/` | 标准构建信息 | `webpack.config.js` |
| `examples/stats-summary/` | 摘要构建信息 | `webpack.config.js` |
| `examples/stats-none/` | 不输出构建信息 | `webpack.config.js` |

### Phase 5: 特殊特性

| Example 目录 | 演示概念 | 关键文件 |
|-------------|---------|---------|
| `examples/dll/` | DLL Plugin | `webpack.config.js` |
| `examples/dll-app-and-vendor/` | DLL 应用端 | `webpack.config.js` |
| `examples/dll-user/` | DLL 使用端 | `webpack.config.js` |
| `examples/dll-entry-only/` | DLL 仅入口 | `webpack.config.js` |
| `examples/lazy-compilation/` | 懒编译 | `webpack.config.js` |
| `examples/persistent-caching/` | 持久化缓存 | `webpack.config.js` |
| `examples/module-federation/` | **Module Federation 模块联邦** | `webpack.config.js` |
| `examples/module-worker/` | Web Worker | `example.js` |
| `examples/worker/` | Worker 基础 | `example.js` |
| `examples/build-http/` | HTTP 远程模块 | `webpack.config.js` |
| `examples/dotenv/` | .env 环境变量 | `webpack.config.js` |
| `examples/top-level-await/` | 顶级 await 支持 | `example.js` |

### 资源类型处理

| Example 目录 | 演示概念 | 关键文件 |
|-------------|---------|---------|
| `examples/asset/` | Asset Modules（图片/字体等） | `webpack.config.js` |
| `examples/asset-svg-data-uri/` | SVG 内联为 data URI | `webpack.config.js` |
| `examples/css/` | **原生 CSS 支持** | `webpack.config.js` |
| `examples/wasm-simple/` | WASM 基础 | `example.js` |
| `examples/wasm-complex/` | WASM 复杂场景 | `example.js` |
| `examples/wasm-bindgen-esm/` | WASM + Rust bindgen | `example.js` |

### Library 输出

| Example 目录 | 演示概念 | 关键文件 |
|-------------|---------|---------|
| `examples/harmony-library/` | ESM 库输出 | `webpack.config.js` |
| `examples/harmony-interop/` | ESM ↔ CJS 互操作 | `webpack.config.js` |
| `examples/module/` | Module 类型输出 | `webpack.config.js` |
| `examples/module-library/` | Module 库格式 | `webpack.config.js` |
| `examples/multi-part-library/` | 多部分库 | `webpack.config.js` |

### 综合场景

| Example 目录 | 演示概念 | 关键文件 |
|-------------|---------|---------|
| `examples/many-pages/` | 多页面应用 | `webpack.config.js` |
| `examples/hybrid-routing/` | 混合路由（同步 + 异步） | `webpack.config.js` |
| `examples/module-code-splitting/` | Module 类型 + Code Splitting | `webpack.config.js` |

---

## 推荐学习顺序

如果用户没有特定方向，建议按以下顺序体验 examples：

1. `commonjs/` → 理解最基础的打包
2. `harmony/` → 理解 ESM 打包
3. `loader/` → 理解 Loader
4. `code-splitting/` → 理解 Code Splitting
5. `side-effects/` → 理解 Tree Shaking
6. `css/` → 理解原生 CSS 支持
7. `persistent-caching/` → 理解缓存机制
8. `module-federation/` → 理解模块联邦
