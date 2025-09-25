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
    if (DOM.sidebarToggleBtn) {
      DOM.sidebarToggleBtn.setAttribute("aria-expanded", String(Boolean(isOpen)));
      DOM.sidebarToggleBtn.title =
        mode === "mobile"
          ? isOpen
            ? "Close Sidebar"
            : "Open Sidebar"
          : isOpen
          ? "Hide Sidebar"
          : "Show Sidebar";
    }

    if (DOM.sidebarIcon) {
      if (DOM.sidebarIcon.tagName === "IMG") {
        DOM.sidebarIcon.alt = isOpen ? "menu open" : "menu closed";
      } else {
        DOM.sidebarIcon.textContent = isOpen ? "🚫" : "👀";
      }
    }
  }

  function openSidebarMobile() {
    if (!DOM.sidebar) return;
    DOM.sidebar.classList.add("sidebar-open");
    DOM.sidebar.style.transform = "translateX(0)";
    updateToggleUI(true, "mobile");
  }

  function closeSidebarMobile() {
    if (!DOM.sidebar) return;
    DOM.sidebar.classList.remove("sidebar-open");
    DOM.sidebar.style.transform = "translateX(-100%)";
    updateToggleUI(false, "mobile");
  }

  function showSidebarDesktop() {
    if (!DOM.sidebar) return;
    DOM.sidebar.style.display = "";
    DOM.sidebar.style.transform = "";
    updateToggleUI(true, "desktop");
    DOM.sidebar.dataset.hidden = "false";
  }

  function hideSidebarDesktop() {
    if (!DOM.sidebar) return;
    DOM.sidebar.style.display = "none";
    DOM.sidebar.style.transform = "";
    updateToggleUI(false, "desktop");
    DOM.sidebar.dataset.hidden = "true";
  }

  function toggleSidebar() {
    if (!DOM.sidebar) return;

    if (isMobileView()) {
      const open = DOM.sidebar.classList.contains("sidebar-open");
      open ? closeSidebarMobile() : openSidebarMobile();
    } else {
      const hidden =
        DOM.sidebar.style.display === "none" || DOM.sidebar.dataset.hidden === "true";
      hidden ? showSidebarDesktop() : hideSidebarDesktop();
    }
  }

  function updateHeaderBoardVisibility() {
    if (!DOM.headerBoardName) return;
    DOM.headerBoardName.style.display = isMobileView() ? "none" : "";
  }

  function initSidebarState() {
    if (!DOM.sidebar || !DOM.sidebarToggleBtn) return;
    if (isMobileView()) {
      if (!DOM.sidebar.classList.contains("sidebar-open")) {
        DOM.sidebar.style.transform = "translateX(-100%)";
        updateToggleUI(false, "mobile");
      } else {
        updateToggleUI(true, "mobile");
      }
      DOM.sidebar.style.display = "";
    } else {
      if (DOM.sidebar.dataset.hidden === "true") {
        hideSidebarDesktop();
      } else {
        showSidebarDesktop();
      }
    }
    updateHeaderBoardVisibility();
  }

  if (DOM.sidebarToggleBtn && DOM.sidebar) {
    initSidebarState();
    DOM.sidebarToggleBtn.addEventListener("click", (ev) => {
      ev.stopPropagation();
      toggleSidebar();
    });

    if (DOM.headerLogo) {
      DOM.headerLogo.addEventListener("click", (ev) => {
        ev.preventDefault();
        toggleSidebar();
      });
    }

    if (DOM.kanbanLogo) {
      DOM.kanbanLogo.addEventListener("click", (ev) => {
        ev.preventDefault();
        if (isMobileView()) toggleSidebar();
      });
    }

    document.addEventListener("click", (event) => {
      if (!isMobileView()) return;
      if (!DOM.sidebar.classList.contains("sidebar-open")) return;
      if (
        !DOM.sidebar.contains(event.target) &&
        !DOM.sidebarToggleBtn.contains(event.target) &&
        !(DOM.headerLogo && DOM.headerLogo.contains(event.target))
      ) {
        closeSidebarMobile();
      }
    });

    document.addEventListener("keydown", (ev) => {
      if (
        ev.key === "Escape" &&
        isMobileView() &&
        DOM.sidebar.classList.contains("sidebar-open")
      ) {
        closeSidebarMobile();
      }
    });

    window.addEventListener("resize", () => {
      if (isMobileView()) {
        if (!DOM.sidebar.classList.contains("sidebar-open")) {
          DOM.sidebar.style.transform = "translateX(-100%)";
          updateToggleUI(false, "mobile");
        }
        DOM.sidebar.style.display = "";
      } else {
        DOM.sidebar.classList.remove("sidebar-open");
        DOM.sidebar.style.transform = "";
        if (DOM.sidebar.dataset.hidden === "true") {
          DOM.sidebar.style.display = "none";
          updateToggleUI(false, "desktop");
        } else {
          DOM.sidebar.style.display = "";
          updateToggleUI(true, "desktop");
        }
      }
      updateHeaderBoardVisibility();
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