# 计算器系统 · 前端（Calculator Frontend）

> 软件工程实践 · 第一次作业《前后端分离计算器系统》—— 前端仓库

## 一、技术栈

| 项 | 选型 | 说明 |
| --- | --- | --- |
| 结构 | 纯静态 HTML / CSS / 原生 JavaScript（**无框架、无构建步骤**） | 打开即用，零安装 |
| UI | 原生 DOM + CSS Grid | 计算器键盘 + 历史面板 |
| 通信 | `fetch` + JSON | 仅通过 HTTP API 与后端交互 |

## 二、核心原则：前端不做计算

本前端**不实现任何算术运算**。所有表达式都通过 `POST /api/calculate` 发送给后端，
结果显示、历史读取、历史删除全部依赖后端 API。一旦后端不可用，前端无法独立得到
任何新的有效计算结果——这正是作业对“前后端分离”的硬性验证点。

## 三、运行方式

### 方式 A：配合本仓库后端一并部署（推荐，单一地址）
将本仓库的 `index.html / app.js / style.css` 复制到后端仓库的 `static/` 目录，
由后端统一托管。前端默认以 `window.location.origin + "/api"` 同源调用。

### 方式 B：独立打开 / 独立部署
直接用浏览器打开 `index.html` 即可看到界面；若要指向某个后端，可加查询参数：

```
index.html?api=https://你的后端地址
```

例如：`https://example.com/index.html?api=https://calc-api.example.com`

## 四、目录结构

```
calculator_frontend/
├── index.html     # 页面结构：显示区、按键、历史面板
├── app.js         # 交互逻辑 + API 调用（无计算）
├── style.css      # 样式
├── codestyle.md   # 代码规范
└── README.md
```

## 五、与后端的交互

| 动作 | 前端行为 | 后端接口 |
| --- | --- | --- |
| 按 `=` | 发送 `{expression}` → 展示返回的 `result` | `POST /api/calculate` |
| 页面加载 / 刷新 | 拉取历史并渲染 | `GET /api/history` |
| 点「删除」 | 删除对应 id 后重新拉取 | `DELETE /api/history/{id}` |
| 后端不可达 | 明确提示“无法连接后端，无法计算结果” | — |

## 六、安全

- 所有用户可控文本（表达式 / 结果 / 时间）在插入 DOM 前统一 `escapeHtml` 转义，
  防止存储型 XSS。
- 输入框为受控组件，表达式仅由按键 / 受限制键盘事件拼接，不接受自由文本框直输。
