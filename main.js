// =========================
// Global Variables
// =========================
let tasks = [];
let currentTaskId = null;

// =========================
// DOM Elements
// =========================
const DOM = {
  openModalBtn: document.getElementById('open-modal-btn'),
  modalBackdrop: document.getElementById('modal-backdrop'),
  taskModal: document.getElementById('task-modal'),
  closeModalBtn: document.getElementById('closeModalBtn'),
  saveTaskBtn: document.getElementById('saveTask'),
  deleteFromEditBtn: document.getElementById('deleteFromEdit'),
  taskForm: document.getElementById('taskForm'),
  taskTitle: document.getElementById('taskTitle'),
  taskStatus: document.getElementById('taskStatus'),
  todoContainer: document.getElementById('todo-tasks'),
  doingContainer: document.getElementById('doing-tasks'),
  doneContainer: document.getElementById('done-tasks'),
  todoCount: document.getElementById('todo-count'),
  doingCount: document.getElementById('doing-count'),
  doneCount: document.getElementById('done-count'),
  themeToggleBtn: document.getElementById('themeToggleBtn'),
  body: document.body,
  header: document.querySelector('header'),
  sidebar: document.querySelector('.side-bar')
};

// =========================
// Theme Toggle Function
// =========================
function toggleDarkMode() {
  DOM.body.classList.toggle('dark-theme');

  // Update icon
  DOM.themeToggleBtn.textContent = DOM.body.classList.contains('dark-theme') ? '🌙' : '🌞';

  // Update all task cards dynamically
  DOM.taskCards().forEach(card => card.classList.toggle('dark-theme'));

  // Sidebar, header, modal, etc. handled by CSS using body.dark-theme
}

// Helper to select all task cards dynamically
DOM.taskCards = () => document.querySelectorAll('.task-card');

// =========================
// Theme Toggle Function
// =========================
function toggleDarkMode() {
  const isDark = DOM.body.classList.toggle('dark-theme');

  // Update toggle icon
  DOM.themeToggleBtn.textContent = isDark ? '🌙' : '🌞';

  // Update header and sidebar
  if (isDark) {
    DOM.header.classList.add('dark-theme');
    DOM.sidebar.classList.add('dark-theme');
  } else {
    DOM.header.classList.remove('dark-theme');
    DOM.sidebar.classList.remove('dark-theme');
  }

  // Update all task cards dynamically
  DOM.taskCards().forEach(card => {
    if (isDark) card.classList.add('dark-theme');
    else card.classList.remove('dark-theme');
  });

  // Modal window follows body.dark-theme via CSS
}

// =========================
// Event Listener for Theme
// =========================
DOM.themeToggleBtn.addEventListener('click', toggleDarkMode);

// =========================
// Modal Functions
// =========================
function openModal(editId = null) {
  DOM.taskForm.reset();
  currentTaskId = editId;

  if (editId) {
    const task = tasks.find(t => t.id === editId);
    DOM.taskTitle.value = task.title;
    DOM.taskStatus.value = task.status;
  }

  DOM.modalBackdrop.style.display = 'flex';
}

function closeModal() {
  DOM.modalBackdrop.style.display = 'none';
}

DOM.openModalBtn.addEventListener('click', () => openModal());
DOM.closeModalBtn.addEventListener('click', closeModal);
DOM.modalBackdrop.addEventListener('click', e => {
  if (e.target === DOM.modalBackdrop) closeModal();
});

// =========================
// Render Tasks
// =========================
function renderTasks() {
  DOM.todoContainer.innerHTML = '';
  DOM.doingContainer.innerHTML = '';
  DOM.doneContainer.innerHTML = '';

  let todo = 0, doing = 0, done = 0;

  tasks.forEach(task => {
    const taskDiv = document.createElement('div');
    taskDiv.className = 'task-card';
    if (DOM.body.classList.contains('dark-theme')) taskDiv.classList.add('dark-theme');
    taskDiv.textContent = task.title;

    // Append to correct column
    if (task.status === 'todo') { DOM.todoContainer.appendChild(taskDiv); todo++; }
    else if (task.status === 'doing') { DOM.doingContainer.appendChild(taskDiv); doing++; }
    else if (task.status === 'done') { DOM.doneContainer.appendChild(taskDiv); done++; }

    // Click to edit
    taskDiv.addEventListener('click', () => openModal(task.id));
  });

  // Update counts
  DOM.todoCount.textContent = todo;
  DOM.doingCount.textContent = doing;
  DOM.doneCount.textContent = done;
}

// =========================
// Save Task
// =========================
DOM.taskForm.addEventListener('submit', e => {
  e.preventDefault();
  if (!DOM.taskTitle.value.trim()) return;

  if (currentTaskId) {
    const task = tasks.find(t => t.id === currentTaskId);
    task.title = DOM.taskTitle.value;
    task.status = DOM.taskStatus.value;
  } else {
    tasks.push({
      id: Date.now().toString(),
      title: DOM.taskTitle.value,
      status: DOM.taskStatus.value
    });
  }

  closeModal();
  renderTasks();
});

// =========================
// Delete from Edit Modal
// =========================
DOM.deleteFromEditBtn.addEventListener('click', () => {
  if (!currentTaskId) return;
  tasks = tasks.filter(t => t.id !== currentTaskId);
  closeModal();
  renderTasks();
});

// =========================
// Initial Render
// =========================
renderTasks();
