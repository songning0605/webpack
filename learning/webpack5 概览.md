# Webpack 的核心本质：图构建器 + 调度器 + 生成器

webpack的整个生命周期可以粗略的分为 5 个阶段.

1. INIT（初始化阶段）

- 生成全局编译对象 Compiler
- 单次构建上下文对象 Compilation

2. MAKE（构建模块图阶段）

- webpack 从入口开始,解析文件里的 import 和 require
- 把单个文件变成 Module
- webpack 会把所有解析出来的 Module 以及他们之间的依赖关系连接在一起,形成一个关系网, 叫做 ModuleGraph (模块图).

3. SEAL（封装与优化阶段）

- 模块图生成后, webpack 不再接收新的模块, 开始封印(SEAL)并对图进行优化.
- 在 SEAL 阶段, webpack 会广播事件,监听了广播事件的插件会加入到 SEAL 阶段的构建工作.

4. EMIT 阶段

- 内存中的 Module 和 Chunk 需要最终变为真实的 js.

Webpack 在拼装最终代码时，不是简单的字符串拼接，而是把代码拆成了很多个小片段（Fragment）。HarmonyExportInitFragment 就是专门用来生成 ES6 export 语法的那块“代码生成器小零件”。它一看这个导出被标记为未使用，就生成一句 /_ unused harmony export _/ 的注释塞进代码里。

5. WATCH/HMR 阶段
   监听文件变化，重新触发 MAKE 阶段。

如果把 Webpack 比作一条汽车组装流水线：

- ModuleGraph 相当于流水线上拼装好的汽车骨架图纸。
- hooks.optimizeDependencies 相当于流水线到了“质检优化工位”，系统广播通知质检员（Plugin）来工作。
- HarmonyExportInitFragment 相当于“喷漆机器手”，负责最后组装输出时喷上特定的涂装（生成特定代码）。
