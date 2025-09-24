// ===============================
// main.js - Kanban Task Manager
// ===============================

// ===== Global State =====
let tasks = [];
let currentTaskId = null;

// ===== DOM Elements =====
const DOM = {
  loadingMessage: document.getElementById("loading-message"),
  errorMessage: document.getElementById("error-message"),
  todoContainer: document.getElementById("todo-tasks"),
  doingContainer: document.getElementById("doing-tasks"),
  doneContainer: document.getElementById("done-tasks"),
  todoCount: document.getElementById("todo-count"),
  doingCount: document.getElementById("doing-count"),
  doneCount: document.getElementById("done-count"),

  modalBackdrop: document.getElementById("modal-backdrop"),
  openModalBtn: document.getElementById("open-modal-btn"),

  confirmBackdrop: document.getElementById("confirm-backdrop"),
  confirmDeleteBtn: document.getElementById("confirm-delete"),
  cancelTaskBtn: document.getElementById("cancelTask"),

  // Toggles
  themeSwitch: document.getElementById("theme-switch"),
  sidebar: document.getElementById("side-bar-div"),
  sidebarToggle: document.getElementById("sidebar-toggle"),

  body: document.body,
  layout: document.getElementById("layout"),
};

// ===== Fetch Tasks =====
async function fetchTasks() {
  DOM.loadingMessage.style.display = "block";
  DOM.errorMessage.style.display = "none";

  try {
    const res = await fetch("https://jsl-kanban-api.vercel.app/");
    if (!res.ok) throw new Error("API error");
    tasks = await res.json();
    renderTasks();
  } catch {
    DOM.errorMessage.style.display = "block";
  } finally {
    DOM.loadingMessage.style.display = "none";
  }
}

// ===== Render Tasks =====
function renderTasks() {
  DOM.todoContainer.innerHTML = "";
  DOM.doingContainer.innerHTML = "";
  DOM.doneContainer.innerHTML = "";

  let todoCount = 0,
    doingCount = 0,
    doneCount = 0;

  tasks.forEach((task) => {
    const taskEl = document.createElement("div");
    taskEl.className = "task-card";
    taskEl.textContent = task.title;

    // Open edit modal on click
    taskEl.addEventListener("click", () => openEditModal(task.id));

    if (task.status === "todo") {
      DOM.todoContainer.appendChild(taskEl);
      todoCount++;
    } else if (task.status === "doing") {
      DOM.doingContainer.appendChild(taskEl);
      doingCount++;
    } else if (task.status === "done") {
      DOM.doneContainer.appendChild(taskEl);
      doneCount++;
    }
  });

  DOM.todoCount.textContent = todoCount;
  DOM.doingCount.textContent = doingCount;
  DOM.doneCount.textContent = doneCount;
}

// ===== Modal Helpers =====
function closeModal() {
  DOM.modalBackdrop.style.display = "none";
  DOM.modalBackdrop.innerHTML = ""; // clear modal content
}

// ===== Add Task Modal =====
function openAddModal() {
  DOM.modalBackdrop.style.display = "flex";

  const modalContent = `
    <div class="modal">
      <div class="modal-header">
        <h2>Add New Task</h2>
        <button class="close-modal-btn" id="close-add-modal">✖</button>
      </div>
      <form id="add-task-form">
        <label>Title</label>
        <input type="text" id="new-task-title" required />

        <label>Description</label>
        <textarea id="new-task-desc"></textarea>

        <label>Status</label>
        <select id="new-task-status">
          <option value="todo">To Do</option>
          <option value="doing">Doing</option>
          <option value="done">Done</option>
        </select>

        <div class="modal-actions">
          <button type="submit" class="save-btn">Create Task</button>
        </div>
      </form>
    </div>
  `;

  DOM.modalBackdrop.innerHTML = modalContent;

  // Close
  document.getElementById("close-add-modal").addEventListener("click", closeModal);

  // Create Task
  document.getElementById("add-task-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const newTask = {
      id: Date.now().toString(),
      title: document.getElementById("new-task-title").value.trim(),
      description: document.getElementById("new-task-desc").value.trim(),
      status: document.getElementById("new-task-status").value,
    };
    tasks.push(newTask);
    renderTasks();
    closeModal();
  });
}

// ===== Edit Task Modal =====
function openEditModal(taskId) {
  const task = tasks.find((t) => t.id == taskId);
  if (!task) return;
  currentTaskId = taskId;

  DOM.modalBackdrop.style.display = "flex";

  const modalContent = `
    <div class="modal">
      <div class="modal-header">
        <h2>Task</h2>
        <button class="close-modal-btn" id="close-edit-modal">✖</button>
      </div>
      <form id="edit-task-form">
        <label>Title</label>
        <input type="text" id="edit-task-title" value="${task.title}" required />

        <label>Description</label>
        <textarea id="edit-task-desc">${task.description || ""}</textarea>

        <label>Status</label>
        <select id="edit-task-status">
          <option value="todo" ${task.status === "todo" ? "selected" : ""}>To Do</option>
          <option value="doing" ${task.status === "doing" ? "selected" : ""}>Doing</option>
          <option value="done" ${task.status === "done" ? "selected" : ""}>Done</option>
        </select>

        <div class="modal-actions">
          <button type="submit" class="save-btn">Save Changes</button>
          <button type="button" class="delete-btn" id="delete-task-btn">Delete Task</button>
        </div>
      </form>
    </div>
  `;

  DOM.modalBackdrop.innerHTML = modalContent;

  // Close modal
  document.getElementById("close-edit-modal").addEventListener("click", closeModal);

  // Save
  document.getElementById("edit-task-form").addEventListener("submit", (e) => {
    e.preventDefault();
    task.title = document.getElementById("edit-task-title").value.trim();
    task.description = document.getElementById("edit-task-desc").value.trim();
    task.status = document.getElementById("edit-task-status").value;
    renderTasks();
    closeModal();
  });

  // Delete (with confirmation)
  document.getElementById("delete-task-btn").addEventListener("click", () => {
    if (confirm("Are you sure you want to delete this task?")) {
      tasks = tasks.filter((t) => t.id != taskId);
      renderTasks();
      closeModal();
    }
  });
}

// ===== Theme Toggle =====
function applyTheme(isDark) {
  if (isDark) {
    DOM.body.classList.add("dark-theme");
    DOM.body.classList.remove("light-theme");
  } else {
    DOM.body.classList.add("light-theme");
    DOM.body.classList.remove("dark-theme");
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const savedTheme = localStorage.getItem("theme");
  const isDark = savedTheme === "dark-theme";
  DOM.themeSwitch.checked = isDark;
  applyTheme(isDark);
});

DOM.themeSwitch.addEventListener("change", () => {
  const isDark = DOM.themeSwitch.checked;
  applyTheme(isDark);
  localStorage.setItem("theme", isDark ? "dark-theme" : "light-theme");
});

// ===== Sidebar Toggle =====
DOM.sidebarToggle.addEventListener("click", () => {
  DOM.sidebar.classList.toggle("hidden");
  DOM.layout.classList.toggle("full-width");
});

// ===== Modal Open =====
DOM.openModalBtn.addEventListener("click", openAddModal);

// ===== Init =====
fetchTasks();
