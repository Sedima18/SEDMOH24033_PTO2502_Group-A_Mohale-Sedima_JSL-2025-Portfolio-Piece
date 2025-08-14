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
