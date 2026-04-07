# 多词库英语词汇标注设计

## 背景

Easy Translator 当前已经具备一套围绕 CEFR 的英语词汇增强能力：

- 内置 CEFR 词典资源
- 通过设置页完成快速 CEFR 测级或手动调整等级
- 在整页双语翻译场景中，对高于用户当前 CEFR 等级的英文单词显示中文释义

现阶段产品能力仍然偏单一。用户已经提出新的明确需求：在 CEFR 之外，继续扩展四级、六级、雅思高频等英语考试词库，并允许用户自由组合选择。

本次需求不只是“再加几份词表”，而是要把当前以 CEFR 为中心的实现，升级成一个可以组合多个词库的通用词汇系统，同时保留现有 CEFR 测级与等级过滤能力。

## 目标

- 在现有 CEFR 能力之上，新增 `CET4`、`CET6`、`IELTS` 三类可选词库。
- 支持用户多选词库，并使用并集命中规则。
- 保留现有 CEFR 等级测试、手动改级和“只标注高于当前等级单词”的逻辑。
- 对 `CET4`、`CET6`、`IELTS` 这类纯词表词库，采用“命中即标注”的规则，不额外叠加用户等级过滤。
- 保持当前整页翻译主流程稳定，不影响已有双语翻译结果。
- 为后续继续扩展考研、托福或专业词库预留清晰的数据结构和模块边界。

## 非目标

- 本阶段不改造划词翻译、输入框翻译、字幕翻译、鼠标悬停翻译等其他入口。
- 本阶段不做词库来源标签的正文可视化展示，正文上仍然只显示中文释义。
- 本阶段不做短语库、例句库、词根词缀库或生词复习面板。
- 本阶段不引入交集命中、优先级排序、按词库单独着色等高级规则。
- 本阶段不将 IELTS 词库描述为官方发布的固定词表。

## 用户需求结论

在本轮确认中，需求已收敛为以下产品行为：

- 用户可以同时勾选 `CEFR`、`CET4`、`CET6`、`IELTS`
- 词库命中规则采用并集
- 单词只要命中任一已选词库，就进入标注候选
- `CEFR` 仍然保留基于用户等级的超纲过滤
- `CET4`、`CET6`、`IELTS` 不做等级过滤
- 同一个词即使命中多个词库，也只渲染一次

## 数据来源策略

### 总体原则

- 优先选择可公开访问、可重复抓取、结构稳定、许可清晰的数据源。
- 词表资源必须能被构建脚本自动处理，避免手工维护大批静态数据。
- 词库来源需要与产品文案一致，尤其不能把社区整理词表描述成官方标准词表。

### 现有 CEFR

当前 CEFR 词典已经由 [src/scripts/build-cefr-dict.mjs](/Users/kaen/Projects/easy-translator/src/scripts/build-cefr-dict.mjs) 生成，并已在项目中使用。该部分保持现状，不在本次设计中更换来源。

### CET4 / CET6

`CET4` 与 `CET6` 第一版采用以下来源策略：

- 主输入源使用 `RealKai42/qwerty-learner-vscode` 仓库中的 `assets/dicts/CET4_T.json` 与 `assets/dicts/CET6_T.json`
- 该仓库许可证为 `MIT`
- 数据结构已经是可直接处理的 JSON 数组，适合纳入自动构建脚本
- 作为交叉校验源，使用 `JavaProgrammerLB/cet-word-list`
- `JavaProgrammerLB/cet-word-list` 的 README 明确说明其词表来自官方 [《全国大学英语四、六级考试大纲（2016 年修订版）》](https://cet.neea.edu.cn/res/Home/1704/55b02330ac17274664f06d9d3db8249d.pdf)

产品口径上，`CET4` 与 `CET6` 可以被描述为“基于公开整理并对照官方考纲的考试词库”。

### IELTS

`IELTS` 第一版采用以下来源策略：

- 主输入源使用 `RealKai42/qwerty-learner-vscode` 仓库中的 `assets/dicts/IELTS_order.json`
- 该仓库许可证为 `MIT`
- 文件可直接被自动处理，且与 `CET4/CET6` 词表结构一致

同时，产品文案必须明确：

- 该词库是“雅思高频词汇库”或“雅思高频近似词库”
- 它是社区整理词表，不是 IELTS 官方发布的固定标准词表

未来如果需要更接近学术英语场景，可以新增一套基于 `NGSL/AWL/AVL` 的 `IELTS Academic` 风格词库，但这不属于本阶段范围。

## 产品决策

### 配置模型拆分

现有的 `cefrSetting` 不再承担所有词库选择职责，而是收敛为“用户 CEFR 能力画像”：

```js
{
  enabled: false,
  level: 0,
  assessmentCompleted: false,
  levelSource: "unset",
  lastPromptFrom: ""
}
```

新增独立的 `vocabularyProfile`，专门表示“词汇标注系统是否启用，以及启用了哪些词库”：

```js
{
  enabled: false,
  selectedLibraries: ["cefr"],
  matchMode: "union"
}
```

职责边界固定为：

- `cefrSetting`：用户 CEFR 等级、来源、测级完成状态
- `vocabularyProfile`：词库总开关、已选词库、命中策略

### 默认行为

- 新安装用户默认不启用词汇标注
- 完成 CEFR 测级后，若此前没有旧数据，则默认启用 `vocabularyProfile.enabled`
- 默认选中 `["cefr"]`
- 其他考试词库由用户手动勾选
- `CEFR` 本身仍然属于可选词库；用户可以取消勾选它，但取消勾选不会清除 CEFR 测级结果

### 多选命中规则

系统只支持一种命中规则：`union`

执行顺序如下：

1. 根据 `selectedLibraries` 聚合所有候选词库
2. 单词命中任一词库即进入候选
3. 若候选来源包含 `cefr`，则仅当 `wordLevelScore > userLevel` 时，`cefr` 这一来源才视为有效命中
4. 若候选来源包含 `cet4`、`cet6`、`ielts`，这些来源直接视为有效命中
5. 至少存在一个有效命中来源时，单词才渲染标注

### 正文展示

正文展示行为第一版保持克制：

- 仍然只显示中文释义
- 不在正文中显示词库来源标签
- 如果单词命中多个词库，内部保留 `matchedLibraries` 元数据，但只渲染一次

这样可以控制页面噪音，同时为后续 hover 提示、统计或调试输出保留空间。

## 技术设计

### 资源组织

为避免继续把所有逻辑绑定在单一 CEFR 资源上，词库资源统一迁移到一个并列目录中：

- `public/assets/vocabulary/cefr.json`
- `public/assets/vocabulary/cet4.json`
- `public/assets/vocabulary/cet6.json`
- `public/assets/vocabulary/ielts.json`

现有 `public/assets/cefr_dict.json` 在迁移完成前可以保留作为兼容资源，但新实现应只依赖新目录。

### 词库元数据表

新增一份词库目录元数据，例如放在 `src/libs/vocabularyCatalog.js`：

```js
export const VOCABULARY_LIBRARIES = {
  cefr: {
    id: "cefr",
    assetPath: "assets/vocabulary/cefr.json",
    type: "level_based",
  },
  cet4: {
    id: "cet4",
    assetPath: "assets/vocabulary/cet4.json",
    type: "word_list",
  },
  cet6: {
    id: "cet6",
    assetPath: "assets/vocabulary/cet6.json",
    type: "word_list",
  },
  ielts: {
    id: "ielts",
    assetPath: "assets/vocabulary/ielts.json",
    type: "word_list",
  },
};
```

该目录元数据负责：

- 定义可选词库集合
- 定义每份词库对应的资源路径
- 定义词库类型，区分 `level_based` 与 `word_list`

### 统一数据格式

构建后的词库资源统一为“单词索引对象”格式：

```json
{
  "mitigate": {
    "zh": "减轻，缓和",
    "level": "C1",
    "libraries": ["cefr", "ielts"]
  }
}
```

约束如下：

- `zh` 为主释义，不能为空
- `level` 只在 CEFR 词库中要求存在
- `libraries` 表示该词在哪些词库中出现

对于纯词表来源，可以在单词级资源中省略 `level`。构建阶段只需要保证运行时合并后 `libraries` 信息完整。

### 运行时模块拆分

当前 [src/libs/cefr.js](/Users/kaen/Projects/easy-translator/src/libs/cefr.js) 同时承担了词典加载、等级判定、DOM 标注等职责。扩展为多词库后，需要拆分为更清晰的边界：

- `src/libs/cefr.js`
  - 保留 CEFR 等级映射、等级比较、与 CEFR 专有逻辑相关的 helper
- `src/libs/vocabularyCatalog.js`
  - 提供词库目录、默认选项和基础元数据
- `src/libs/vocabulary.js`
  - 负责加载并缓存词库资源
  - 负责按 `selectedLibraries` 聚合词条
  - 负责返回单词命中的来源集合与主释义
- `src/libs/translator.js`
  - 在整页翻译成功后，调用统一词汇标注能力
  - 将标注纳入现有翻译生命周期与清理流程

### 聚合命中算法

对文本中的每个英文单词，运行时执行以下逻辑：

1. 将原词归一化为小写
2. 依次查询所有已选词库
3. 收集所有命中来源
4. 若命中来源中包含 `cefr`，则额外校验是否高于当前用户等级
5. 过滤掉无效来源后，若来源集合为空，则跳过
6. 从有效来源中选择一份中文释义作为正文展示文本
7. 将 `matchedLibraries` 挂到 DOM 元数据中

中文释义优先级建议如下：

1. `cefr`
2. `cet6`
3. `cet4`
4. `ielts`

这样可以优先使用当前项目已验证过的 CEFR 释义，其余词库只作为补充。

### 标注 DOM 与样式

正文 DOM 结构保持当前模式，不引入新的布局类型：

```html
<span
  class="easy-cefr-word"
  data-easy-cefr="1"
  data-word="mitigate"
  data-libraries="cefr,ielts"
>
  mitigate
  <span class="easy-cefr-gloss" aria-hidden="true">减轻，缓和</span>
</span>
```

现有绝对定位样式继续复用：

- 不改变原文正常文档流
- 释义浮在单词上方
- 单词只包裹一次

虽然类名中仍然包含 `cefr`，但这是实现细节，不影响本阶段功能。后续如果需要统一命名，再单独做命名清理。

### 构建脚本

新增一条多词库构建链路，建议拆为以下职责：

- 保留现有 `src/scripts/build-cefr-dict.mjs`
- 新增 `src/scripts/build-vocabulary-dicts.mjs`
  - 抓取并清洗 `CET4`、`CET6`、`IELTS` 公开源
  - 生成 `public/assets/vocabulary/cet4.json`
  - 生成 `public/assets/vocabulary/cet6.json`
  - 生成 `public/assets/vocabulary/ielts.json`
- 迁移或复用 CEFR 资源到 `public/assets/vocabulary/cefr.json`

构建脚本必须保证以下行为：

- 对源词条做大小写归一化
- 过滤明显不适合当前分词规则的词条
- 去重
- 保留最简释义文本
- 输出稳定、可测试的 JSON

## UI 设计

### 设置页结构

现有 [src/views/Options/CEFRSetting.js](/Users/kaen/Projects/easy-translator/src/views/Options/CEFRSetting.js) 不再只是单纯的 CEFR 页面，而是升级为“词汇学习设置”入口。页面内部保留两个语义区块：

1. `CEFR 等级`
   - 保留快速测级入口
   - 保留手动调整等级
   - 保留当前 CEFR 状态展示
2. `附加词库`
   - 展示 `CET4`、`CET6`、`IELTS`
   - 允许多选
   - 使用用户更容易理解的描述文案

为了避免破坏现有深链和用户认知，页面路由 `#/cefr` 可以暂时保留，但页面标题和正文文案应升级成更通用的词汇学习表述。

### 控件行为

- 顶部保留总开关，控制整个词汇标注系统是否启用
- `CEFR` 作为内置基础词库，默认出现在已选列表中，并允许用户取消勾选
- `CET4`、`CET6`、`IELTS` 采用多选按钮或复选框
- 当 `vocabularyProfile.enabled === false` 时，所有词库标注在运行时整体关闭
- 取消勾选 `CEFR` 时，设置页中的 CEFR 等级信息仍然保留，用户之后可以重新勾回参与命中

### 文案口径

文案必须避免误导：

- `CET4 / CET6` 可以描述为考试词汇库
- `IELTS` 描述为“雅思高频词汇库”
- 不使用“官方 IELTS 词表”措辞

## 兼容与迁移

### 老用户升级

对已有设置做回填时遵循以下规则：

- 现有 `cefrSetting` 完整保留
- 新增 `vocabularyProfile`
- 若老用户已经存在 `cefrSetting`：
  - `selectedLibraries` 回填为 `["cefr"]`
  - `enabled` 回填为 `cefrSetting.enabled`
  - `matchMode` 回填为 `"union"`

这样可以保证老用户升级后的行为与升级前基本一致，不会突然出现新的考试词库命中。

### 路由兼容

现有 popup、安装引导和设置页中的 `#/cefr` 深链继续保留，避免已有入口失效。只是页面内部内容扩展为更通用的多词库配置。

## 错误处理与降级

- 任意单个词库资源加载失败时，跳过该词库，但其他已选词库仍然继续工作
- 所有词库都加载失败时，静默跳过标注，不影响翻译
- `CEFR` 等级缺失或非法时，只影响 `cefr` 词库判断，不影响 `CET4/CET6/IELTS`
- 单词同时命中多个词库但释义缺失时，继续尝试下一个有效来源
- 若某个词无法安全插入 DOM，则跳过该词，不影响其余节点

## 性能考虑

- 保持“翻译成功后在当前节点组内做词汇标注”的模式，不引入额外整页扫描
- 所有词库资源采用懒加载和内存缓存
- 只加载用户已选词库，未选中的词库不发起请求
- 聚合命中逻辑在单次标注中复用同一份缓存映射，避免重复查找

## 测试策略

### 配置与迁移测试

补充 [src/config/setting.test.js](/Users/kaen/Projects/easy-translator/src/config/setting.test.js)，覆盖：

- `vocabularyProfile` 默认值
- 老用户设置回填
- `cefrSetting` 与 `vocabularyProfile` 并存时的归一化结果

### 词库资源测试

新增词库资源测试，覆盖：

- `cefr/cet4/cet6/ielts` 资源文件可读取
- 资源结构符合统一格式
- 词条数量在合理范围内
- 词条 key 与主释义合法

### 词汇聚合测试

新增 `src/libs/vocabulary.test.js`，覆盖：

- 单词命中单一词库
- 单词命中多个词库
- `CEFR` 因用户等级不足而被过滤
- `CET4/CET6/IELTS` 命中即标注
- 多来源命中时只返回一次渲染结果

### UI 测试

扩展 [src/views/Options/CEFRSetting.test.js](/Users/kaen/Projects/easy-translator/src/views/Options/CEFRSetting.test.js)，覆盖：

- 页面显示词汇学习总开关
- 可以多选 `CET4/CET6/IELTS`
- 更新后正确写入 `vocabularyProfile`
- 关闭总开关后，词库选择仍然保留但运行时停用

## 风险与接受的权衡

- `IELTS` 词库第一版属于社区整理高频词库，覆盖面和排序方式不等同于官方标准
- 不同词库对同一单词的释义可能存在风格差异，第一版接受这一不一致性
- 仍然只处理简单英文单词，带撇号、连字符或复杂大小写形式的覆盖率有限
- 继续沿用当前 CEFR 命名的 DOM class 会带来一定命名历史包袱，但可以显著降低本次重构风险

## 主要影响范围

预计主要改动点如下：

- [src/config/setting.js](/Users/kaen/Projects/easy-translator/src/config/setting.js)
  - 新增 `DEFAULT_VOCABULARY_PROFILE`
  - 新增 `normalizeVocabularyProfile`
  - 扩展 `normalizeSetting`
- [src/hooks/Setting.js](/Users/kaen/Projects/easy-translator/src/hooks/Setting.js)
  - 增加 `vocabularyProfile` 的老数据回填
- [src/libs/cefr.js](/Users/kaen/Projects/easy-translator/src/libs/cefr.js)
  - 收敛为 CEFR 专有等级与 DOM 标注辅助
- `src/libs/vocabularyCatalog.js`
  - 新增词库目录定义
- `src/libs/vocabulary.js`
  - 新增词库加载、聚合、去重与命中逻辑
- [src/views/Options/CEFRSetting.js](/Users/kaen/Projects/easy-translator/src/views/Options/CEFRSetting.js)
  - 升级为多词库配置 UI
- [src/libs/translator.js](/Users/kaen/Projects/easy-translator/src/libs/translator.js)
  - 接入新的多词库标注逻辑
- `src/scripts/build-vocabulary-dicts.mjs`
  - 新增考试词库构建脚本
- `public/assets/vocabulary/*.json`
  - 新增统一词库资源目录

## 结论

本次设计的核心是把当前“CEFR 个性化增强”升级成“可组合的英语词汇库系统”：

- `CEFR` 继续承担用户能力分级
- `CET4/CET6/IELTS` 作为可叠加附加词库接入
- 运行时使用并集命中
- 正文展示保持简单
- 数据结构、模块边界和测试策略都围绕“后续还能继续加词库”来设计

这样可以在不推翻现有 CEFR 能力的前提下，平滑把产品扩展成更完整的英语词汇学习辅助系统。
