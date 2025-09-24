// ===============================
// main.js - Kanban Task Manager
// ===============================

let tasks = [];
let currentTaskId = null;

document.addEventListener("DOMContentLoaded", () => {
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
    modalBox: document.querySelector("#modal-backdrop .modal-box"),
  };

  // Sidebar elements
  const sidebarToggleBtn = document.getElementById("sidebar-toggle");
  const sidebar = document.getElementById("side-bar-div");
  const sidebarIcon = document.getElementById("sidebar-icon");

  /* =========================
     Sidebar Functions
     ========================= */

  function updateToggleUI(isOpen, mode) {
    if (sidebarToggleBtn) {
      sidebarToggleBtn.setAttribute("aria-expanded", String(Boolean(isOpen)));
      sidebarToggleBtn.title =
        mode === "mobile"
          ? isOpen
            ? "Close Sidebar"
            : "Open Sidebar"
          : isOpen
          ? "Hide Sidebar"
          : "Show Sidebar";
    }

    if (sidebarIcon) {
      if (sidebarIcon.tagName === "IMG") {
        sidebarIcon.alt = isOpen ? "menu open" : "menu closed";
      } else {
        sidebarIcon.textContent = isOpen ? "🚫" : "👀";
      }
    }
  }

  function openSidebarMobile() {
    sidebar.classList.add("sidebar-open");
    sidebar.style.transform = "translateX(0)";
    updateToggleUI(true, "mobile");
  }

  function closeSidebarMobile() {
    sidebar.classList.remove("sidebar-open");
    sidebar.style.transform = "translateX(-100%)";
    updateToggleUI(false, "mobile");
  }

  function showSidebarDesktop() {
    sidebar.style.display = "";
    sidebar.style.transform = "";
    updateToggleUI(true, "desktop");
    sidebar.dataset.hidden = "false";
  }

  function hideSidebarDesktop() {
    sidebar.style.display = "none";
    sidebar.style.transform = "";
    updateToggleUI(false, "desktop");
    sidebar.dataset.hidden = "true";
  }

  function isMobileView() {
    return window.innerWidth <= 768;
  }

  function initSidebarState() {
    if (!sidebar || !sidebarToggleBtn) return;
    if (isMobileView()) {
      if (!sidebar.classList.contains("sidebar-open")) {
        sidebar.style.transform = "translateX(-100%)";
        updateToggleUI(false, "mobile");
      } else {
        updateToggleUI(true, "mobile");
      }
      sidebar.style.display = "";
    } else {
      if (sidebar.dataset.hidden === "true") {
        hideSidebarDesktop();
      } else {
        showSidebarDesktop();
      }
    }
  }

  function toggleSidebar() {
    if (!sidebar || !sidebarToggleBtn) return;

    if (isMobileView()) {
      const open = sidebar.classList.contains("sidebar-open");
      open ? closeSidebarMobile() : openSidebarMobile();
    } else {
      const hidden =
        sidebar.style.display === "none" || sidebar.dataset.hidden === "true";
      hidden ? showSidebarDesktop() : hideSidebarDesktop();
    }
  }

  if (sidebarToggleBtn && sidebar) {
    initSidebarState();

    sidebarToggleBtn.addEventListener("click", (ev) => {
      ev.stopPropagation();
      toggleSidebar();
    });

    document.addEventListener("click", (event) => {
      if (!isMobileView()) return;
      if (!sidebar.classList.contains("sidebar-open")) return;
      if (
        !sidebar.contains(event.target) &&
        !sidebarToggleBtn.contains(event.target)
      ) {
        closeSidebarMobile();
      }
    });

    document.addEventListener("keydown", (ev) => {
      if (
        ev.key === "Escape" &&
        isMobileView() &&
        sidebar.classList.contains("sidebar-open")
      ) {
        closeSidebarMobile();
      }
    });

    window.addEventListener("resize", () => {
      if (isMobileView()) {
        if (!sidebar.classList.contains("sidebar-open")) {
          sidebar.style.transform = "translateX(-100%)";
          updateToggleUI(false, "mobile");
        }
        sidebar.style.display = "";
      } else {
        sidebar.classList.remove("sidebar-open");
        sidebar.style.transform = "";
        if (sidebar.dataset.hidden === "true") {
          sidebar.style.display = "none";
          updateToggleUI(false, "desktop");
        } else {
          sidebar.style.display = "";
          updateToggleUI(true, "desktop");
        }
      }
    });
  }

  /* =========================
     Local Storage Helpers
     ========================= */

  /**
   * Save all tasks to localStorage
   * @function saveTasksToLocal
   */
  function saveTasksToLocal() {
    localStorage.setItem("tasks", JSON.stringify(tasks));
  }

  /**
   * Load tasks from localStorage
   * @function loadTasksFromLocal
   */
  function loadTasksFromLocal() {
    const stored = localStorage.getItem("tasks");
    if (stored) {
      try {
        tasks = JSON.parse(stored);
      } catch (err) {
        console.error("Failed to parse tasks from localStorage", err);
        tasks = [];
      }
    }
  }

  /* =========================
     Task Functions
     ========================= */

  /**
   * Fetch tasks from API
   * Falls back to localStorage if API fails
   * @async
   * @function fetchTasks
   */
  async function fetchTasks() {
    if (DOM.loadingMessage) DOM.loadingMessage.style.display = "block";
    if (DOM.errorMessage) DOM.errorMessage.style.display = "none";

    try {
      const res = await fetch("https://jsl-kanban-api.vercel.app/");
      if (!res.ok) throw new Error("API error");
      tasks = await res.json();
      renderTasks();
    } catch (err) {
      console.error("Fetch tasks error:", err);
      if (DOM.errorMessage) DOM.errorMessage.style.display = "block";
      // fallback: use local storage if available
      loadTasksFromLocal();
      renderTasks();
    } finally {
      if (DOM.loadingMessage) DOM.loadingMessage.style.display = "none";
    }
  }

  /**
   * Render tasks into their containers
   * Updates counts and persists to localStorage
   * @function renderTasks
   */
  function renderTasks() {
    if (DOM.todoContainer) DOM.todoContainer.innerHTML = "";
    if (DOM.doingContainer) DOM.doingContainer.innerHTML = "";
    if (DOM.doneContainer) DOM.doneContainer.innerHTML = "";

    let todo = 0,
      doing = 0,
      done = 0;

    tasks.forEach((task) => {
      const taskEl = document.createElement("div");
      taskEl.className = "task-card";
      taskEl.textContent = task.title || "(no title)";
      taskEl.addEventListener("click", () => openModal(true, task));

      if (task.status === "todo" && DOM.todoContainer) {
        DOM.todoContainer.appendChild(taskEl);
        todo++;
      }
      if (task.status === "doing" && DOM.doingContainer) {
        DOM.doingContainer.appendChild(taskEl);
        doing++;
      }
      if (task.status === "done" && DOM.doneContainer) {
        DOM.doneContainer.appendChild(taskEl);
        done++;
      }
    });

    if (DOM.todoCount) DOM.todoCount.textContent = todo;
    if (DOM.doingCount) DOM.doingCount.textContent = doing;
    if (DOM.doneCount) DOM.doneCount.textContent = done;

    saveTasksToLocal();
  }

  /**
   * Open the modal for adding or editing a task
   * @function openModal
   * @param {boolean} isEdit - Whether editing an existing task
   * @param {Object} [task] - The task to edit
   */
  function openModal(isEdit, task = null) {
    if (DOM.modalBackdrop) DOM.modalBackdrop.style.display = "flex";

    if (isEdit && task) {
      DOM.modalHeading.textContent = "Task";
      DOM.taskTitle.value = task.title || "";
      DOM.taskDesc.value = task.description || "";
      DOM.taskStatus.value = task.status || "todo";
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

    const isDark = DOM.themeSwitch ? DOM.themeSwitch.checked : false;
    applyModalTheme(isDark);
  }

  if (DOM.closeModalBtn) {
    DOM.closeModalBtn.addEventListener("click", () => {
      if (DOM.modalBackdrop) DOM.modalBackdrop.style.display = "none";
    });
  }

  // Create Task
  if (DOM.createTaskBtn) {
    DOM.createTaskBtn.addEventListener("click", () => {
      const newTask = {
        id: Date.now().toString(),
        title: DOM.taskTitle ? DOM.taskTitle.value : "Untitled",
        description: DOM.taskDesc ? DOM.taskDesc.value : "",
        status: DOM.taskStatus ? DOM.taskStatus.value : "todo",
      };
      tasks.push(newTask);
      renderTasks();
      if (DOM.modalBackdrop) DOM.modalBackdrop.style.display = "none";
    });
  }

  // Save Task
  if (DOM.saveTaskBtn) {
    DOM.saveTaskBtn.addEventListener("click", () => {
      tasks = tasks.map((t) =>
        t.id === currentTaskId
          ? {
              ...t,
              title: DOM.taskTitle ? DOM.taskTitle.value : t.title,
              description: DOM.taskDesc ? DOM.taskDesc.value : t.description,
              status: DOM.taskStatus ? DOM.taskStatus.value : t.status,
            }
          : t
      );
      renderTasks();
      if (DOM.modalBackdrop) DOM.modalBackdrop.style.display = "none";
    });
  }

  // Delete Task
  if (DOM.deleteTaskBtn) {
    DOM.deleteTaskBtn.addEventListener("click", () => {
      if (DOM.confirmBackdrop) DOM.confirmBackdrop.style.display = "flex";
    });
  }

  if (DOM.confirmDeleteBtn) {
    DOM.confirmDeleteBtn.addEventListener("click", () => {
      tasks = tasks.filter((t) => t.id !== currentTaskId);
      renderTasks();
      if (DOM.confirmBackdrop) DOM.confirmBackdrop.style.display = "none";
      if (DOM.modalBackdrop) DOM.modalBackdrop.style.display = "none";
    });
  }

  if (DOM.cancelTaskBtn) {
    DOM.cancelTaskBtn.addEventListener("click", () => {
      if (DOM.confirmBackdrop) DOM.confirmBackdrop.style.display = "none";
    });
  }

  if (DOM.openModalBtn) {
    DOM.openModalBtn.addEventListener("click", () => openModal(false));
  }

  /* =========================
     Theme Toggle
     ========================= */

  function applyModalTheme(isDark) {
    if (!DOM.modalBox) return;
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

  const savedTheme = localStorage.getItem("theme");
  const isDarkSaved = savedTheme === "dark-theme";
  if (DOM.themeSwitch) {
    DOM.themeSwitch.checked = isDarkSaved;
  }
  applyTheme(isDarkSaved);

  if (DOM.themeSwitch) {
    DOM.themeSwitch.addEventListener("change", () => {
      const isDark = DOM.themeSwitch.checked;
      applyTheme(isDark);
      localStorage.setItem("theme", isDark ? "dark-theme" : "light-theme");
    });
  }

  /* =========================
     Init App
     ========================= */
  loadTasksFromLocal();
  if (tasks.length === 0) {
    // if no tasks saved locally, fetch from API
    fetchTasks();
  } else {
    renderTasks();
  }
});
