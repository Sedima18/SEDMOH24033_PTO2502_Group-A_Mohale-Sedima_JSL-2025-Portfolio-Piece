// ===============================
// main.js - Kanban Task Manager (logo sidebar + theme + mobile header hide + JSDoc)
// ===============================

/**
 * @typedef {Object} Task
 * @property {string} id
 * @property {string} title
 * @property {string} description
 * @property {"todo"|"doing"|"done"} status
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
    // logo in the sidebar
    kanbanLogo: document.getElementById("logo"),
    // header mobile logo (no id in your HTML — class is used)
    headerLogo: document.querySelector(".logo-mobile"),
    // header board name (to hide on mobile)
    headerBoardName: document.getElementById("header-board-name"),
  };

  /* =========================
     Sidebar & Header helpers
     ========================= */

  /**
   * Returns true for mobile viewport (<= 768px)
   * @returns {boolean}
   */
  function isMobileView() {
    return window.innerWidth <= 768;
  }

  /**
   * Update sidebar toggle UI (icon/title/aria-expanded).
   * @param {boolean} isOpen
   * @param {"mobile"|"desktop"} [mode]
   */
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
        DOM.sidebarIcon.textContent = isOpen ? "👀" : "🚫";
      }
    }
  }

  /**
   * Open sidebar for mobile (slide-in).
   */
  function openSidebarMobile() {
    if (!DOM.sidebar) return;
    DOM.sidebar.classList.add("sidebar-open");
    DOM.sidebar.style.transform = "translateX(0)";
    updateToggleUI(true, "mobile");
  }

  /**
   * Close sidebar for mobile (slide-out).
   */
  function closeSidebarMobile() {
    if (!DOM.sidebar) return;
    DOM.sidebar.classList.remove("sidebar-open");
    DOM.sidebar.style.transform = "translateX(-100%)";
    updateToggleUI(false, "mobile");
  }

  /**
   * Show sidebar in desktop mode.
   */
  function showSidebarDesktop() {
    if (!DOM.sidebar) return;
    DOM.sidebar.style.display = "";
    DOM.sidebar.style.transform = "";
    updateToggleUI(true, "desktop");
    DOM.sidebar.dataset.hidden = "false";
  }

  /**
   * Hide sidebar in desktop mode.
   */
  function hideSidebarDesktop() {
    if (!DOM.sidebar) return;
    DOM.sidebar.style.display = "none";
    DOM.sidebar.style.transform = "";
    updateToggleUI(false, "desktop");
    DOM.sidebar.dataset.hidden = "true";
  }

  /**
   * Toggle sidebar based on viewport.
   */
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

  /**
   * Hide the "Launch Career" header in mobile view and show in desktop.
   */
  function updateHeaderBoardVisibility() {
    if (!DOM.headerBoardName) return;
    if (isMobileView()) {
      DOM.headerBoardName.style.display = "none";
    } else {
      DOM.headerBoardName.style.display = "";
    }
  }

  // Initialize sidebar state and header visibility
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

  // Attach toggle listeners: desktop button + header logo (mobile)
  if (DOM.sidebarToggleBtn && DOM.sidebar) {
    initSidebarState();

    DOM.sidebarToggleBtn.addEventListener("click", (ev) => {
      ev.stopPropagation();
      toggleSidebar();
    });

    // header logo should toggle sidebar on mobile
    if (DOM.headerLogo) {
      DOM.headerLogo.addEventListener("click", (ev) => {
        ev.preventDefault();
        toggleSidebar();
      });
    }

    // also let sidebar internal logo toggle (optional)
    if (DOM.kanbanLogo) {
      DOM.kanbanLogo.addEventListener("click", (ev) => {
        ev.preventDefault();
        if (isMobileView()) toggleSidebar();
      });
    }

    // close mobile sidebar by clicking outside
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

    // close on escape
    document.addEventListener("keydown", (ev) => {
      if (
        ev.key === "Escape" &&
        isMobileView() &&
        DOM.sidebar.classList.contains("sidebar-open")
      ) {
        closeSidebarMobile();
      }
    });

    // resize handling
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
      // update header visibility on resize
      updateHeaderBoardVisibility();
    });
  }

  /* =========================
     Local Storage Helpers
     ========================= */

  /**
   * Save all tasks to localStorage
   * @function
   */
  function saveTasksToLocal() {
    localStorage.setItem("tasks", JSON.stringify(tasks));
  }

  /**
   * Load tasks from localStorage
   * @function
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
     Task Functions (UNCHANGED — preserved exactly as you provided)
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

  /**
   * Apply theme to modal box.
   * @param {boolean} isDark
   */
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

  /**
   * Apply theme to body + modal.
   * @param {boolean} isDark
   */
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
