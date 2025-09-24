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

  // Modals
  modalBackdrop: document.getElementById("modal-backdrop"),
  taskForm: document.getElementById("task-form"),
  taskTitle: document.getElementById("task-title"),
  taskDesc: document.getElementById("task-desc"),
  taskStatus: document.getElementById("task-status"),
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

    // Click task title to open edit modal
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

// ===== Open Add/Edit Modal =====
function openModal(edit = false) {
  DOM.modalBackdrop.style.display = "flex";
  if (!edit) {
    DOM.taskForm.reset();
    currentTaskId = null;
  }
}

function closeModal() {
  DOM.modalBackdrop.style.display = "none";
}

// ===== Open Edit Modal =====
function openEditModal(taskId) {
  const task = tasks.find((t) => t.id == taskId);
  if (!task) return;
  currentTaskId = taskId;

  DOM.taskTitle.value = task.title;
  DOM.taskDesc.value = task.description;
  DOM.taskStatus.value = task.status;

  openModal(true);

  // Remove old delete button if exists
  const existingBtn = document.getElementById("modal-delete-btn");
  if (existingBtn) existingBtn.remove();

  // Add delete button inside modal
  const deleteBtn = document.createElement("button");
  deleteBtn.id = "modal-delete-btn";
  deleteBtn.textContent = "Delete Task 🗑️";
  deleteBtn.type = "button";
  deleteBtn.addEventListener("click", () => confirmDeleteModal(taskId));
  DOM.taskForm.appendChild(deleteBtn);
}

// ===== Delete Confirmation =====
function confirmDeleteModal(taskId) {
  currentTaskId = taskId;
  DOM.confirmBackdrop.style.display = "flex";
}

function closeConfirm() {
  DOM.confirmBackdrop.style.display = "none";
}

// Confirm Delete
DOM.confirmDeleteBtn.addEventListener("click", () => {
  tasks = tasks.filter((t) => t.id != currentTaskId);
  renderTasks();
  closeConfirm();
  closeModal();
});

// Cancel Delete
DOM.cancelTaskBtn.addEventListener("click", closeConfirm);

// ===== Handle Save / Add Task =====
DOM.taskForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const newTask = {
    id: currentTaskId || Date.now().toString(),
    title: DOM.taskTitle.value,
    description: DOM.taskDesc.value,
    status: DOM.taskStatus.value,
  };

  if (currentTaskId) {
    tasks = tasks.map((t) => (t.id == currentTaskId ? newTask : t));
  } else {
    tasks.push(newTask);
  }

  renderTasks();
  closeModal();
});

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


// ===== Modal Open / Close =====
DOM.openModalBtn.addEventListener("click", () => openModal(false));
document.querySelectorAll(".close-btn").forEach((btn) =>
  btn.addEventListener("click", () => {
    closeModal();
    closeConfirm();
  })
);

// ===== Init =====
fetchTasks();
