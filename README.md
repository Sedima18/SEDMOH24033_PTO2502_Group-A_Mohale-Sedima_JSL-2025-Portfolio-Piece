
## Kanban Board final Portfolio Piece! 

## Overview of the app
 
- * This app displays tasks across three columns—To Do, Doing, and Done—with a Figma-inspired UI. On first load, it fetches initial data from an API (or a local fallback), stores it in localStorage, and then runs entirely from the browser for fast, offline-friendly usage.

## Features

- *Initial Data Fetch + Caching
Fetch tasks from a configurable API endpoint on first load.
Cache the response in localStorage and subsequently boot from cache.

- Task CRUD
Add new tasks via a modal (title, description, status).
Edit tasks by clicking a card, modifying fields in the modal, and saving.
Delete tasks with a confirm action.

- State Persistence
All changes are persisted to localStorage using a single source-of-truth key.

- Sidebar Controls
Show/Hide sidebar on desktop.
On mobile, sidebar becomes an overlay that can be opened/closed with a button or backdrop tap.

- Theme Toggle
Seamless Dark/Light mode toggle; preference saved to localStorage.

- Task Counts
Column headers show dynamic task counts per status.

- Keyboard & A11y niceties
Esc closes modals/overlays.
Focus trapping inside modal when open.
Buttons/inputs have accessible labels.

## Tech Stack
- HTML5, CSS3 
- JavaScript 

## How It Works
- Boot
Check localStorage for kanban.tasks.
If present, render from cache.
If absent, fetch(API_URL), validate/normalize tasks, save to localStorage, then render.

- Render
Split tasks by status into the three columns.
Update column counts.

- Mutations (Add/Edit/Delete)
Open modal → update in-memory array → write to localStorage → re-render.

- Sidebar / Theme
Toggling updates the DOM (CSS classes) and saves preferences to localStorage.

## Usage Guide
- Add a Task
Click “+ Add New Task”.
Fill Title, optional Description, choose Status.
Click Create Task.
The task appears in the selected column and is saved persistently.

- Edit a Task
Click a task card.
The modal opens pre-filled.
Update fields and click Save Changes.

- Delete a Task
Click a task card → Delete.
Confirm deletion in the prompt.
Task is removed and counts update automatically.

- Toggle Dark/Light Mode
Click the sun/moon button in the sidebar.
The choice is remembered for next visits.

- Show/Hide Sidebar
Desktop: Click the Hide Sidebar button; layout expands.
Mobile: Tap the menu icon to open; tap the backdrop or close icon to hide.

## Link for presentation


## deployment link
https://gleeful-fenglisu-644752.netlify.app/