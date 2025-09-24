// ===============================
// main.js - Kanban Task Manager
// ===============================

let tasks = [];
let currentTaskId = null;

// ===== DOM Elements =====
const DOM = {
  // Modals
  modalBackdrop: document.getElementById("modal-backdrop"),
  modalHeading: document.getElementById("modal-heading"),
  taskTitle: document.getElementById("task-title"),
  taskDesc: document.getElementById("task-desc"),
  taskStatus: document.getElementById("task-status"),
  createTaskBtn: document.getElementById("create-task-btn"),
  saveTaskBtn: document.getElementById("save-task-btn"),
  deleteTaskBtn: document.getElementById("delete-task-btn"),
  openModalBtn: document.getElementById("open-modal-btn"),
  closeModalBtn: document.querySelector("#modal-backdrop .close-btn"),

  // Delete Confirmation
  confirmBackdrop: document.getElementById("confirm-backdrop"),
  confirmDeleteBtn: document.getElementById("confirm-delete"),
  cancelTaskBtn: document.getElementById("cancelTask"),

  // Task Containers & Counts
  todoContainer: document.getElementById("todo-tasks"),
  doingContainer: document.getElementById("doing-tasks"),
  doneContainer: document.getElementById("done-tasks"),
  todoCount: document.getElementById("todo-count"),
  doingCount: document.getElementById("doing-count"),
  doneCount: document.getElementById("done-count"),

  // Loading/Error
  loadingMessage: document.getElementById("loading-message"),
  errorMessage: document.getElementById("error-message"),

  // Theme Toggle
  themeSwitch: document.getElementById("theme-switch"),
  body: document.body,
  modalBox: document.querySelector("#modal-backdrop .modal-box")
};

const sidebarToggleBtn = document.getElementById('sidebar-toggle');
const sidebarIcon = document.getElementById('sidebar-icon');
const sidebar = document.getElementById('side-bar-div');

let isSidebarHidden = false;

sidebarToggleBtn.addEventListener('click', () => {
  isSidebarHidden = !isSidebarHidden;

  // Hide/show the sidebar
  sidebar.style.display = isSidebarHidden ? 'none' : 'flex';

  // Update icon and tooltip
  sidebarIcon.textContent = isSidebarHidden ? '👀' : '🚫';
  sidebarToggleBtn.title = isSidebarHidden ? 'Show Sidebar' : 'Hide Sidebar';
});



// ===== Fetch Tasks from API =====
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

  let todo = 0, doing = 0, done = 0;

  tasks.forEach(task => {
    const taskEl = document.createElement("div");
    taskEl.className = "task-card";
    taskEl.textContent = task.title;

    taskEl.addEventListener("click", () => openModal(true, task));

    if (task.status === "todo") { DOM.todoContainer.appendChild(taskEl); todo++; }
    if (task.status === "doing") { DOM.doingContainer.appendChild(taskEl); doing++; }
    if (task.status === "done") { DOM.doneContainer.appendChild(taskEl); done++; }
  });

  DOM.todoCount.textContent = todo;
  DOM.doingCount.textContent = doing;
  DOM.doneCount.textContent = done;
}

// ===== Open Modal =====
function openModal(isEdit, task = null) {
  DOM.modalBackdrop.style.display = "flex";

  if (isEdit && task) {
    DOM.modalHeading.textContent = "Task";
    DOM.taskTitle.value = task.title;
    DOM.taskDesc.value = task.description || "";
    DOM.taskStatus.value = task.status;
    DOM.createTaskBtn.style.display = "none";
    DOM.saveTaskBtn.style.display = "inline-block";
    DOM.deleteTaskBtn.style.display = "inline-block";
    currentTaskId = task.id;
  } else {
    DOM.modalHeading.textContent = "Add New Task";
    DOM.taskTitle.value = "";
    DOM.taskDesc.value = "";
    DOM.taskStatus.value = "todo";
    DOM.createTaskBtn.style.display = "inline-block";
    DOM.saveTaskBtn.style.display = "none";
    DOM.deleteTaskBtn.style.display = "none";
    currentTaskId = null;
  }

  // Apply current theme to modal
  const isDark = DOM.themeSwitch.checked;
  applyModalTheme(isDark);
}

// ===== Close Modal =====
DOM.closeModalBtn.addEventListener("click", () => DOM.modalBackdrop.style.display = "none");

// ===== Create Task =====
DOM.createTaskBtn.addEventListener("click", () => {
  const newTask = {
    id: Date.now().toString(),
    title: DOM.taskTitle.value,
    description: DOM.taskDesc.value,
    status: DOM.taskStatus.value,
  };
  tasks.push(newTask);
  renderTasks();
  DOM.modalBackdrop.style.display = "none";
});

// ===== Save Task Changes =====
DOM.saveTaskBtn.addEventListener("click", () => {
  tasks = tasks.map(t => t.id === currentTaskId ? {
    ...t,
    title: DOM.taskTitle.value,
    description: DOM.taskDesc.value,
    status: DOM.taskStatus.value
  } : t);
  renderTasks();
  DOM.modalBackdrop.style.display = "none";
});

// ===== Delete Task with Confirmation =====
DOM.deleteTaskBtn.addEventListener("click", () => {
  DOM.confirmBackdrop.style.display = "flex";
});

DOM.confirmDeleteBtn.addEventListener("click", () => {
  tasks = tasks.filter(t => t.id !== currentTaskId);
  renderTasks();
  DOM.confirmBackdrop.style.display = "none";
  DOM.modalBackdrop.style.display = "none";
});

DOM.cancelTaskBtn.addEventListener("click", () => DOM.confirmBackdrop.style.display = "none");

// ===== Open Add Task Modal =====
DOM.openModalBtn.addEventListener("click", () => openModal(false));

// ===== Theme Toggle =====
function applyModalTheme(isDark) {
  if (isDark) {
    DOM.modalBox.classList.add("dark-theme-modal");
    DOM.modalBox.classList.remove("light-theme-modal");
  } else {
    DOM.modalBox.classList.add("light-theme-modal");
    DOM.modalBox.classList.remove("dark-theme-modal");
  }
}

function applyTheme(isDark) {
  if (isDark) {
    DOM.body.classList.add("dark-theme");
    DOM.body.classList.remove("light-theme");
  } else {
    DOM.body.classList.add("light-theme");
    DOM.body.classList.remove("dark-theme");
  }
  applyModalTheme(isDark);
}

// Load saved theme
document.addEventListener("DOMContentLoaded", () => {
  const savedTheme = localStorage.getItem("theme");
  const isDark = savedTheme === "dark-theme";
  DOM.themeSwitch.checked = isDark;
  applyTheme(isDark);
});

// Toggle listener
DOM.themeSwitch.addEventListener("change", () => {
  const isDark = DOM.themeSwitch.checked;
  applyTheme(isDark);
  localStorage.setItem("theme", isDark ? "dark-theme" : "light-theme");
});

// ===== Init =====
fetchTasks();
