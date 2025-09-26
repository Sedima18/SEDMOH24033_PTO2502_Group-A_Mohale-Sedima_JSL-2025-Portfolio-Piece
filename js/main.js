// ===============================
// main.js - Kanban Task Manager (logo sidebar + theme + mobile header hide + priority dots + localStorage)
// ===============================

/**
 * @typedef {Object} Task
 * @property {string} id
 * @property {string} title
 * @property {string} description
 * @property {"todo"|"doing"|"done"} status
 * @property {"High"|"Medium"|"Low"} priority
 */

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
    taskPriority: document.getElementById("task-priority"),
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

    // Sidebar + logos
    sidebar: document.getElementById("side-bar-div"),
    sidebarToggleBtn: document.getElementById("sidebar-toggle"),
    sidebarIcon: document.getElementById("sidebar-icon"),
    kanbanLogo: document.getElementById("logo"),
    headerLogo: document.querySelector(".logo-mobile"),
    headerBoardName: document.getElementById("header-board-name"),
  };

  /* =========================
     Sidebar & Header helpers
     ========================= */

  function isMobileView() {
    return window.innerWidth <= 768;
  }

  function updateToggleUI(isOpen, mode = "desktop") {
    if (!DOM.sidebarToggleBtn) return;

    DOM.sidebarToggleBtn.setAttribute("aria-expanded", String(Boolean(isOpen)));
    DOM.sidebarToggleBtn.title =
      mode === "mobile"
        ? isOpen
          ? "Close Sidebar"
          : "Open Sidebar"
        : isOpen
        ? "Hide Sidebar"
        : "Show Sidebar";

    if (DOM.sidebarIcon) {
      if (DOM.sidebarIcon.tagName === "IMG") {
        DOM.sidebarIcon.alt = isOpen ? "menu open" : "menu closed";
      } else {
        DOM.sidebarIcon.textContent = isOpen ? "🚫" : "👀";
      }
    }
  }

  /* =========================
     Sidebar as Modal (Mobile)
     ========================= */
  function openSidebarModal() {
    if (!DOM.sidebar) return;

    // Add modal classes
    DOM.sidebar.classList.add("sidebar-modal");
    DOM.sidebar.style.display = "flex";

    // Backdrop
    const backdrop = document.createElement("div");
    backdrop.id = "sidebar-backdrop";
    backdrop.className = "sidebar-backdrop";
    document.body.appendChild(backdrop);

    // Close with backdrop click
    backdrop.addEventListener("click", closeSidebarModal);

    updateToggleUI(true, "mobile");
  }

  function closeSidebarModal() {
    if (!DOM.sidebar) return;

    DOM.sidebar.classList.remove("sidebar-modal");
    DOM.sidebar.style.display = "none";

    const backdrop = document.getElementById("sidebar-backdrop");
    if (backdrop) backdrop.remove();

    updateToggleUI(false, "mobile");
  }

  // Close button inside sidebar
  const sidebarCloseBtn = document.createElement("button");
  sidebarCloseBtn.className = "sidebar-close-btn";
  sidebarCloseBtn.innerHTML = "✖";
  sidebarCloseBtn.addEventListener("click", closeSidebarModal);
  if (DOM.sidebar) DOM.sidebar.prepend(sidebarCloseBtn);

  // Mobile logo opens sidebar modal
  if (DOM.headerLogo) {
    DOM.headerLogo.addEventListener("click", (ev) => {
      ev.preventDefault();
      openSidebarModal();
    });
  }
  if (DOM.kanbanLogo) {
    DOM.kanbanLogo.addEventListener("click", (ev) => {
      ev.preventDefault();
      if (isMobileView()) openSidebarModal();
    });
  }

  // Escape key
  document.addEventListener("keydown", (ev) => {
    if (ev.key === "Escape" && isMobileView()) {
      closeSidebarModal();
    }
  });

  function updateHeaderBoardVisibility() {
    if (!DOM.headerBoardName) return;
    DOM.headerBoardName.style.display = isMobileView() ? "none" : "";
  }

  function initSidebarState() {
    if (!DOM.sidebar || !DOM.sidebarToggleBtn) return;

    if (isMobileView()) {
      DOM.sidebar.style.display = "none"; // hidden until modal opens
    } else {
      if (DOM.sidebar.dataset.hidden === "true") {
        DOM.sidebar.style.display = "none";
      } else {
        DOM.sidebar.style.display = "block";
      }
    }

    updateHeaderBoardVisibility();
  }

  if (DOM.sidebarToggleBtn && DOM.sidebar) {
    initSidebarState();

    DOM.sidebarToggleBtn.addEventListener("click", (ev) => {
      ev.stopPropagation();
      if (isMobileView()) openSidebarModal();
      else
        DOM.sidebar.dataset.hidden === "true"
          ? (DOM.sidebar.style.display = "block", DOM.sidebar.dataset.hidden = "false")
          : (DOM.sidebar.style.display = "none", DOM.sidebar.dataset.hidden = "true");
    });

    window.addEventListener("resize", () => {
      initSidebarState();
    });
  }

  /* =========================
     Local Storage Helpers
     ========================= */
  function saveTasksToLocal() {
    localStorage.setItem("tasks", JSON.stringify(tasks));
  }

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
     Priority Helpers
     ========================= */
  function getPriorityColor(priority) {
    switch (priority) {
      case "High":
        return "red";
      case "Medium":
        return "orange";
      case "Low":
        return "green";
      default:
        return "gray";
    }
  }

  /* =========================
     Task Functions
     ========================= */
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
      loadTasksFromLocal();
      renderTasks();
    } finally {
      if (DOM.loadingMessage) DOM.loadingMessage.style.display = "none";
    }
  }

  function renderTasks() {
    if (DOM.todoContainer) DOM.todoContainer.innerHTML = "";
    if (DOM.doingContainer) DOM.doingContainer.innerHTML = "";
    if (DOM.doneContainer) DOM.doneContainer.innerHTML = "";

    let todo = 0,
      doing = 0,
      done = 0;

    const priorityOrder = { High: 1, Medium: 2, Low: 3 };

    const todoTasks = tasks
      .filter((t) => t.status === "todo")
      .sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
    const doingTasks = tasks
      .filter((t) => t.status === "doing")
      .sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
    const doneTasks = tasks
      .filter((t) => t.status === "done")
      .sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

    const createTaskEl = (task) => {
      const taskEl = document.createElement("div");
      taskEl.className = "task-card";
      taskEl.textContent = task.title || "(no title)";

      const dot = document.createElement("span");
      dot.className = "priority-dot";
      dot.style.backgroundColor = getPriorityColor(task.priority);
      dot.style.display = "inline-block";
      dot.style.width = "10px";
      dot.style.height = "10px";
      dot.style.borderRadius = "50%";
      dot.style.marginRight = "8px";
      taskEl.prepend(dot);

      taskEl.addEventListener("click", () => openModal(true, task));
      return taskEl;
    };

    todoTasks.forEach((task) => {
      if (DOM.todoContainer) DOM.todoContainer.appendChild(createTaskEl(task));
      todo++;
    });
    doingTasks.forEach((task) => {
      if (DOM.doingContainer) DOM.doingContainer.appendChild(createTaskEl(task));
      doing++;
    });
    doneTasks.forEach((task) => {
      if (DOM.doneContainer) DOM.doneContainer.appendChild(createTaskEl(task));
      done++;
    });

    if (DOM.todoCount) DOM.todoCount.textContent = todo;
    if (DOM.doingCount) DOM.doingCount.textContent = doing;
    if (DOM.doneCount) DOM.doneCount.textContent = done;

    saveTasksToLocal();
  }

  function openModal(isEdit, task = null) {
    if (DOM.modalBackdrop) DOM.modalBackdrop.style.display = "flex";

    if (isEdit && task) {
      DOM.modalHeading.textContent = "Task";
      DOM.taskTitle.value = task.title || "";
      DOM.taskDesc.value = task.description || "";
      DOM.taskStatus.value = task.status || "todo";
      DOM.taskPriority.value = task.priority || "Medium";
      DOM.createTaskBtn.style.display = "none";
      DOM.saveTaskBtn.style.display = "inline-block";
      DOM.deleteTaskBtn.style.display = "inline-block";
      currentTaskId = task.id;
    } else {
      DOM.modalHeading.textContent = "Add New Task";
      DOM.taskTitle.value = "";
      DOM.taskDesc.value = "";
      DOM.taskStatus.value = "todo";
      DOM.taskPriority.value = "Medium";
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

  if (DOM.createTaskBtn) {
    DOM.createTaskBtn.addEventListener("click", () => {
      const newTask = {
        id: Date.now().toString(),
        title: DOM.taskTitle ? DOM.taskTitle.value : "Untitled",
        description: DOM.taskDesc ? DOM.taskDesc.value : "",
        status: DOM.taskStatus ? DOM.taskStatus.value : "todo",
        priority: DOM.taskPriority ? DOM.taskPriority.value : "Medium",
      };
      tasks.push(newTask);
      renderTasks();
      if (DOM.modalBackdrop) DOM.modalBackdrop.style.display = "none";
    });
  }

  if (DOM.saveTaskBtn) {
    DOM.saveTaskBtn.addEventListener("click", () => {
      tasks = tasks.map((t) =>
        t.id === currentTaskId
          ? {
              ...t,
              title: DOM.taskTitle ? DOM.taskTitle.value : t.title,
              description: DOM.taskDesc ? DOM.taskDesc.value : t.description,
              status: DOM.taskStatus ? DOM.taskStatus.value : t.status,
              priority: DOM.taskPriority ? DOM.taskPriority.value : t.priority,
            }
          : t
      );
      renderTasks();
      if (DOM.modalBackdrop) DOM.modalBackdrop.style.display = "none";
    });
  }

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
  if (DOM.themeSwitch) DOM.themeSwitch.checked = isDarkSaved;
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
  if (tasks.length === 0) fetchTasks();
  else renderTasks();
});
