# 前端代码规范（codestyle）

> 本仓库 JavaScript / CSS 风格主要参照 **Airbnb JavaScript Style Guide**
> （https://github.com/airbnb/javascript）与 **Google HTML/CSS Style Guide**
> （https://google.github.io/styleguide/htmlcssguide.html）的通用约定，并结合原生
> 无框架场景做了简化。

## 1. JavaScript

- 使用 `const` / `let`，**禁用 `var`**（块级作用域，避免变量提升陷阱）。
- 函数优先使用 `function` 声明或箭头函数；事件回调多用箭头函数以保留 `this`。
- 字符串统一使用反引号模板字符串（`` `...` ``）或单引号；本仓库统一单引号。
- 缩进 **2 个空格**；语句结尾加分号。
- 变量 / 函数 **小驼峰**（`loadHistory`, `escapeHtml`）；
  常量全大写（`API_BASE`）。
- 不使用 `eval` / `Function` 构造器（与后端安全约束一致）。
- 异步请求统一 `async/await` + `try/catch`，错误向用户明确展示。

```javascript
async function calculate() {
  try {
    const resp = await fetch(API_BASE + "/api/calculate", { /* ... */ });
    const data = await resp.json();
    if (!resp.ok) { setStatus("错误：" + data.error, "error"); return; }
    expression = String(data.result);
  } catch (err) {
    setStatus("无法连接后端，无法计算结果：" + err.message, "error");
  }
}
```

## 2. HTML

- 使用语义化标签（`<main>`, `<section>`, `<h1>` …）。
- 属性值加双引号；`lang="zh-CN"`，`<meta charset="UTF-8">`。
- 为可访问性添加 `aria-live` 等属性。

## 3. CSS

- 使用 CSS 自定义属性（`:root { --var: ... }`）集中管理主题色。
- 类名 **kebab-case**（`history-item`, `status-error`）。
- 采用 Flexbox / Grid 布局，避免无意义嵌套。
- 交互元素提供 `:hover` / `:active` 反馈。

## 4. 提交前自检

- 浏览器控制台无报错；
- 确认前端不含任何算术运算实现（grep `eval` / `Math.` 求值逻辑应为空）。
