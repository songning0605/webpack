---
title: 抛开缓存：Webpack 5 原生性能提升
date: 2026-04-04
tags: [Performance, Algorithm, Hash, CodeGen]
---

# 抛开缓存不说，Webpack 5 相比 4 快在哪里？

## 📍 定位：底层算法与数据流重构（单次构建性能）

## 🔭 情境 (Context)

你可能会问：“既然 Webpack 5 的速度飞跃主要靠物理缓存，那如果我禁用缓存，或者在 CI/CD 流水线上进行无缓存的**冷启动构建 (Cold Build)**，Webpack 5 还会比 4 快吗？”

答案是：**依然更快，而且内存占用显著降低。**
在 Webpack 4 时代，大型项目很容易在构建后期遭遇 `OOM (Out Of Memory)` 崩溃。Webpack 5 即使不靠缓存，也通过底层的四大算法/架构优化，极大提升了单次构建（一次性把源码变成产物）的性能。

## 🧠 概念图式 (Schema)

Webpack 5 的冷构建提速，主要归功于以下 4 点：

### 1. 更换底层哈希算法 (CPU 密集型任务减负)

Webpack 在构建中无时无刻不在计算 Hash（用于生成文件名、模块 ID、缓存对比等）。

- **Webpack 4**: 默认使用密码学安全的 `md4` 算法。
- **Webpack 5**: 默认切换到了 `xxhash64`。这是一种非密码学算法，专为极致速度而生，在处理大量字符串和文件 Buffer 时，速度比 `md4/md5` **快数倍**，极大地节省了 CPU 的计算时间。

### 2. 单次构建内的“代码生成”去重 (Code Generation Deduplication)

一个项目中，某个通用模块 `utils.js` 经常会被分配到多个不同的 Chunk 中（比如页面 A 的 Chunk 和 页面 B 的 Chunk 独立打包）。

- **Webpack 4**: 每把 `utils.js` 装进一个 Chunk，就要把它的 AST 转回 JavaScript 字符串一次。算 10 次就是 10 倍开销。
- **Webpack 5**: 代码生成被抽离成独立阶段。`utils.js` 只计算 1 次 JS 字符串。后续不管把它丢进多少个 Chunk，直接传递这串生成的字符串**引用**。

### 3. 数据结构图论化，极大降低垃圾回收 (GC) 压力

这其实还是 `ModuleGraph` 的功劳。

- **Webpack 4**: `Module` 和 `Chunk` 对象互存对方的实例数组。在大型项目中，这些数组会被来回修改、遍历成百上千次，产生海量的中间对象。V8 引擎的垃圾回收器（GC）会跑到吐血，引发构建卡顿。
- **Webpack 5**: 数据被压平，连线交给 `ModuleGraph` 统一使用 `Map`/`Set` 结构维护。数据寻址的**时间复杂度**降低，且不再产生大量的相互依赖对象，内存水位显著下降，GC 导致的停顿大幅减少。

### 4. 深度的 Tree Shaking，帮下游 Terser 减负

Webpack 自己不删代码，真正删代码、压缩耗时最长的是下游的 Terser。

- **Webpack 5** 引入了 `InnerGraph` 分析：它可以深入分析函数内部的变量引用关系，甚至能分析出 `export { a }` 但实际上 `a` 从未被使用。
- **结果**：Webpack 5 传给 Terser 的原始代码量（AST 节点）显著小于 Webpack 4。Terser 拿到的任务轻了，整个构建大盘的时间自然缩短。

## 📖 源码导读 (Source)

1. **哈希算法的切换 (`lib/util/createHash.js`)**:
   你会看到 Wp5 内部自己用 WebAssembly 编译实现了一套极速的 `xxhash64`。

   ```javascript
   // lib/config/defaults.js 1585行附近
   // Webpack 5 将 futureDefaults 下的默认哈希函数全切为了 xxhash64
   DEFAULTS.HASH_FUNCTION = "xxhash64";
   ```

2. **InnerGraphPlugin (`lib/optimize/InnerGraphPlugin.js`)**:
   在 SEAL 阶段的高级图论分析。它能跟踪如 `function a() { b(); }` 这样的闭包内部引用逻辑，把无用的符号更早地扼杀在摇篮里。

## 🧪 实验验证 (Experiment)

在这个仓库中，你可以验证哈希算法的不同表现：

运行关于 Hash 的单元测试：

```bash
yarn test:base --testPathPatterns="WasmHashes.unittest.js"
```

这里面包含了 `md4` 和 `xxhash64` 的执行对比，体会底层算法在面对巨量文本时的速度差异。
