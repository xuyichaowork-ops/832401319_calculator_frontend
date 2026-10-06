/* Front-end logic for the calculator.
 *
 * IMPORTANT: this file contains NO arithmetic evaluation. The expression
 * is sent to the back-end and the result is rendered as returned. If the
 * back-end is unreachable, the front-end cannot produce a result on its own,
 * which is exactly what the assignment requires (separation of concerns).
 */

// API base: same origin by default (back-end also serves these static files).
// Override with ?api=https://your-backend.example.com if testing cross-origin.
const params = new URLSearchParams(window.location.search);
const API_BASE = (params.get("api") || window.location.origin).replace(/\/+$/, "");

const display = document.getElementById("display");
const statusEl = document.getElementById("status");
const historyList = document.getElementById("history-list");

let expression = "";

function setStatus(msg, kind) {
  statusEl.textContent = msg || "";
  statusEl.className = "status" + (kind ? " status-" + kind : "");
}

function render() {
  display.textContent = expression === "" ? "0" : expression;
}

function append(value) {
  // Avoid leading zeros like "007"; allow "0.x".
  if (expression === "0" && /[0-9]/.test(value)) {
    expression = value;
  } else {
    expression += value;
  }
  render();
}

function backspace() {
  expression = expression.slice(0, -1);
  render();
}

function clearAll() {
  expression = "";
  render();
  setStatus("");
}

async function calculate() {
  if (expression.trim() === "") {
    setStatus("请输入表达式", "error");
    return;
  }
  setStatus("计算中…");
  try {
    const resp = await fetch(API_BASE + "/api/calculate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ expression: expression }),
    });
    const data = await resp.json();
    if (!resp.ok) {
      setStatus("错误：" + (data.error || "请求失败"), "error");
      return;
    }
    // Show the result returned by the back-end.
    expression = String(data.result);
    render();
    setStatus(`✓ 已保存 (id=${data.id})`, "ok");
    loadHistory();
  } catch (err) {
    // If the back-end is down, the front-end genuinely cannot compute.
    setStatus("无法连接后端，无法计算结果：" + err.message, "error");
  }
}

async function loadHistory() {
  try {
    const resp = await fetch(API_BASE + "/api/history");
    const data = await resp.json();
    const items = data.history || [];
    if (items.length === 0) {
      historyList.innerHTML = '<li class="empty">暂无历史记录</li>';
      return;
    }
    historyList.innerHTML = "";
    for (const item of items) {
      const li = document.createElement("li");
      li.className = "history-item";
      li.innerHTML =
        `<span class="h-expr">${escapeHtml(item.expression)}</span>` +
        `<span class="h-res">= ${escapeHtml(item.result)}</span>` +
        `<span class="h-time">${escapeHtml(item.created_at)}</span>`;
      const del = document.createElement("button");
      del.className = "btn-del";
      del.textContent = "删除";
      del.addEventListener("click", () => deleteHistory(item.id));
      li.appendChild(del);
      historyList.appendChild(li);
    }
  } catch (err) {
    historyList.innerHTML =
      '<li class="empty">历史加载失败：' + escapeHtml(err.message) + "</li>";
  }
}

async function deleteHistory(id) {
  try {
    const resp = await fetch(API_BASE + "/api/history/" + id, { method: "DELETE" });
    const data = await resp.json();
    if (resp.ok && data.deleted) {
      loadHistory();
    } else {
      setStatus("删除失败：" + (data.error || ""), "error");
    }
  } catch (err) {
    setStatus("删除失败：" + err.message, "error");
  }
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  }[c]));
}

// Event wiring
document.querySelectorAll(".key").forEach((btn) => {
  btn.addEventListener("click", () => {
    const action = btn.dataset.action;
    const value = btn.dataset.value;
    if (action === "clear") return clearAll();
    if (action === "back") return backspace();
    if (action === "equal") return calculate();
    if (value !== undefined) return append(value);
  });
});

document.getElementById("refresh").addEventListener("click", loadHistory);

// Keyboard support (optional convenience; still routes through the back-end).
document.addEventListener("keydown", (e) => {
  if (e.key >= "0" && e.key <= "9") append(e.key);
  else if (e.key === ".") append(".");
  else if (e.key === "+" || e.key === "-" || e.key === "*" || e.key === "/") {
    append(e.key === "*" ? "×" : e.key === "/" ? "÷" : e.key);
  } else if (e.key === "(" || e.key === ")") append(e.key);
  else if (e.key === "Enter") calculate();
  else if (e.key === "Backspace") backspace();
  else if (e.key === "Escape") clearAll();
});

render();
loadHistory();
