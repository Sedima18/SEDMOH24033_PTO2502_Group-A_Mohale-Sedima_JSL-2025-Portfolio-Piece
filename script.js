// storage.js

// Keys for localStorage
const LOCAL_KEY = 'kanban_tasks_v1';
const THEME_KEY = 'kanban_theme_v1';

/**
 * Save an array of tasks to localStorage
 * @param {Array} tasks - The list of task objects to save
 */
export function saveTasks(tasks) {
  if (!Array.isArray(tasks)) {
    console.error('saveTasks: Expected an array, got', tasks);
    return;
  }
  localStorage.setItem(LOCAL_KEY, JSON.stringify(tasks));
}

/**
 * Load tasks from localStorage
 * @returns {Array|null} Array of tasks, or null if none found
 */
export function loadTasks() {
  const stored = localStorage.getItem(LOCAL_KEY);
  return stored ? JSON.parse(stored) : null;
}

/**
 * Save the selected theme to localStorage
 * @param {string} theme - 'light' or 'dark'
 */
export function saveTheme(theme) {
  if (theme !== 'light' && theme !== 'dark') {
    console.error('saveTheme: Invalid theme value', theme);
    return;
  }
  localStorage.setItem(THEME_KEY, theme);
}

/**
 * Load the saved theme from localStorage
 * @returns {string|null} 'light', 'dark', or null if none saved
 */
export function loadTheme() {
  return localStorage.getItem(THEME_KEY);
}

// api.js

/**
 * Fetch tasks from remote API
 * @returns {Promise<Array>} Resolves to array of task objects
 * @throws Will throw an error if the network request fails
 */
export async function fetchTasks() {
  const response = await fetch('https://jsl-kanban-api.vercel.app/');

  if (!response.ok) {
    throw new Error(`Failed to fetch tasks: ${response.status}`);
  }

  return await response.json();
}

// main.js

import { fetchTasks } from './api.js';
import { saveTasks, loadTasks } from './storage.js';
import { renderTasks } from './tasks.js'; // You will create renderTasks() in step 4

// DOM references
const boardContainer = document.querySelector('#kanban-board'); // Your Kanban board wrapper
const statusMessage = document.querySelector('#status-message'); // For loading/error messages

async function init() {
  // Show loading indicator
  showStatus('Loading tasks...');

  try {
    let tasks = loadTasks();

    // If no tasks in local storage, fetch from API
    if (!tasks) {
      tasks = await fetchTasks();
      saveTasks(tasks);
    }

    // Clear message and render tasks
    clearStatus();
    renderTasks(tasks);

  } catch (error) {
    console.error(error);
    showError('Failed to load tasks. Please check your connection.', init); // Retry on click
  }
}

/**
 * Show a status message (loading, info, etc.)
 * @param {string} message
 */
function showStatus(message) {
  if (statusMessage) {
    statusMessage.textContent = message;
    statusMessage.style.display = 'block';
  }
}

/**
 * Show an error message with an optional retry button
 * @param {string} message
 * @param {Function} retryCallback
 */
function showError(message, retryCallback) {
  if (statusMessage) {
    statusMessage.innerHTML = `
      <p>${message}</p>
      <button id="retry-btn">Retry</button>
    `;
    statusMessage.style.display = 'block';

    const retryBtn = document.querySelector('#retry-btn');
    if (retryBtn) retryBtn.addEventListener('click', retryCallback);
  }
}

/**
 * Clear any status or error messages
 */
function clearStatus() {
  if (statusMessage) {
    statusMessage.textContent = '';
    statusMessage.style.display = 'none';
  }
}

// Start the app
init();

// tasks.js

/**
 * Render all tasks into their respective columns
 * @param {Array} tasks - List of task objects { id, title, description, status }
 */
export function renderTasks(tasks) {
  // Get column containers
  const todoCol = document.querySelector('[data-column="todo"]');
  const doingCol = document.querySelector('[data-column="doing"]');
  const doneCol = document.querySelector('[data-column="done"]');

  // Clear existing content
  [todoCol, doingCol, doneCol].forEach(col => {
    if (col) col.innerHTML = '';
  });

  // Loop through tasks and place in correct column
  tasks.forEach(task => {
    const taskEl = createTaskCard(task);

    switch (task.status) {
      case 'todo':
        todoCol?.appendChild(taskEl);
        break;
      case 'doing':
        doingCol?.appendChild(taskEl);
        break;
      case 'done':
        doneCol?.appendChild(taskEl);
        break;
      default:
        console.warn(`Unknown status "${task.status}" for task:`, task);
    }
  });
}

/**
 * Create a task card element
 * @param {Object} task - The task data
 * @returns {HTMLElement} The DOM element for the task card
 */
function createTaskCard(task) {
  const card = document.createElement('div');
  card.className = 'task-card';
  card.dataset.id = task.id;

  card.innerHTML = `
    <h3 class="task-title">${escapeHTML(task.title)}</h3>
    <p class="task-desc">${escapeHTML(task.description || '')}</p>
  `;

  // Click opens modal for editing (you’ll implement in step 7)
  card.addEventListener('click', () => {
    // openTaskModal(task.id) will be added later
    console.log(`Task clicked: ${task.id}`);
  });

  return card;
}

/**
 * Escape HTML to prevent XSS when rendering
 * @param {string} str
 * @returns {string}
 */
function escapeHTML(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// taskModel.js

const STORAGE_KEY = 'kanban_tasks';

/**
 * Get tasks from localStorage
 * @returns {Array} tasks
 */
export function getTasks() {
  return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
}

/**
 * Save tasks to localStorage
 * @param {Array} tasks
 */
export function saveTasks(tasks) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

/**
 * Create a new task
 * @param {string} title
 * @param {string} description
 * @param {string} status - 'todo' | 'doing' | 'done'
 * @returns {Object} newTask
 */
export function createTask(title, description, status = 'todo') {
  const tasks = getTasks();

  const newTask = {
    id: generateId(),
    title: title.trim(),
    description: description.trim(),
    status
  };

  tasks.push(newTask);
  saveTasks(tasks);

  return newTask;
}

/**
 * Update an existing task
 * @param {string} id
 * @param {Object} updates - { title?, description?, status? }
 * @returns {boolean} true if updated, false if not found
 */
export function updateTask(id, updates) {
  const tasks = getTasks();
  const index = tasks.findIndex(task => task.id === id);

  if (index === -1) return false;

  tasks[index] = { ...tasks[index], ...updates };
  saveTasks(tasks);

  return true;
}

/**
 * Delete a task by ID
 * @param {string} id
 * @returns {boolean} true if deleted, false if not found
 */
export function deleteTask(id) {
  const tasks = getTasks();
  const newTasks = tasks.filter(task => task.id !== id);

  if (tasks.length === newTasks.length) return false;

  saveTasks(newTasks);
  return true;
}

/**
 * Generate a unique ID
 */
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}
