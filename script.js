const taskForm = document.getElementById("taskForm");
const taskInput = document.getElementById("taskInput");
const dueDateInput = document.getElementById("dueDate");
const taskList = document.getElementById("taskList");
const themeSelect = document.getElementById("themeSelect");

// Load theme from localStorage or default
function loadTheme() {
  const savedTheme = localStorage.getItem("theme") || "light";
  document.body.className = savedTheme;
  themeSelect.value = savedTheme;
}

// Save theme to localStorage
function saveTheme(theme) {
  localStorage.setItem("theme", theme);
}

// Check if date is overdue
function isOverdue(dateStr) {
  if (!dateStr) return false;
  const today = new Date();
  const dueDate = new Date(dateStr + "T23:59:59");
  return dueDate < today;
}

// Create a task element with checklist support
function createTaskElement(task) {
  const li = document.createElement("li");
  li.classList.add("task-item");
  if (task.completed) li.classList.add("completed");

  // Header div: title, due date, delete btn
  const header = document.createElement("div");
  header.classList.add("task-header");

  // Task title span
  const titleSpan = document.createElement("span");
  titleSpan.classList.add("task-title");
  titleSpan.textContent = task.text;
  titleSpan.onclick = () => {
    li.classList.toggle("completed");
    task.completed = li.classList.contains("completed");
    saveTasks();
  };

  // Due date span
  const dueSpan = document.createElement("span");
  dueSpan.classList.add("due-date");
  dueSpan.textContent = task.dueDate ? `Due: ${task.dueDate}` : "";
  if (isOverdue(task.dueDate) && !li.classList.contains("completed")) {
    dueSpan.classList.add("overdue");
  }

  // Delete button
  const delBtn = document.createElement("button");
  delBtn.classList.add("delete-btn");
  delBtn.innerHTML = "&#128465;";
  delBtn.title = "Delete task";
  delBtn.onclick = () => {
    li.remove();
    deleteTask(task.id);
    saveTasks();
  };

  header.appendChild(titleSpan);
  header.appendChild(dueSpan);
  header.appendChild(delBtn);

  li.appendChild(header);

  // Checklist ul
  const checklist = document.createElement("ul");
  checklist.classList.add("checklist");
  if (task.checklist && Array.isArray(task.checklist)) {
    task.checklist.forEach(subtask => {
      const subLi = document.createElement("li");
      subLi.textContent = subtask.text;
      if (subtask.completed) subLi.classList.add("completed");

      // Checkbox for subtask
      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.checked = subtask.completed;
      checkbox.onchange = () => {
        subLi.classList.toggle("completed");
        subtask.completed = checkbox.checked;
        saveTasks();
      };

      subLi.prepend(checkbox);
      checklist.appendChild(subLi);
    });
  }
  li.appendChild(checklist);

  // Add subtask input and button
  const addSubtaskDiv = document.createElement("div");
  addSubtaskDiv.classList.add("add-subtask-container");

  const subtaskInput = document.createElement("input");
  subtaskInput.type = "text";
  subtaskInput.placeholder = "Add subtask...";

  const addSubtaskBtn = document.createElement("button");
  addSubtaskBtn.type = "button";
  addSubtaskBtn.textContent = "+";
  addSubtaskBtn.title = "Add subtask";

  addSubtaskBtn.onclick = () => {
    const val = subtaskInput.value.trim();
    if (val === "") return;
    const subLi = document.createElement("li");

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = false;
    checkbox.onchange = () => {
      subLi.classList.toggle("completed");
      // Update checklist data in task object
      const idx = task.checklist.findIndex(st => st.text === val);
      if (idx >= 0) task.checklist[idx].completed = checkbox.checked;
      saveTasks();
    };

    subLi.textContent = val;
    subLi.prepend(checkbox);

    checklist.appendChild(subLi);

    // Update task object checklist
    if (!task.checklist) task.checklist = [];
    task.checklist.push({ text: val, completed: false });

    subtaskInput.value = "";
    saveTasks();
  };

  addSubtaskDiv.appendChild(subtaskInput);
  addSubtaskDiv.appendChild(addSubtaskBtn);

  li.appendChild(addSubtaskDiv);

  return li;
}

// Store tasks in array
let tasks = [];

// Generate unique id for task
function generateId() {
  return Date.now() + Math.random().toString(36).slice(2);
}

// Save tasks to localStorage
function saveTasks() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
  renderTasks();
}

// Load tasks from localStorage
function loadTasks() {
  const savedTasks = JSON.parse(localStorage.getItem("tasks"));
  if (savedTasks && Array.isArray(savedTasks)) {
    tasks = savedTasks;
  }
}

// Delete a task by id
function deleteTask(id) {
  tasks = tasks.filter(t => t.id !== id);
}

// Render tasks to the page
function renderTasks() {
  taskList.innerHTML = "";
  tasks.forEach(task => {
    const taskEl = createTaskElement(task);
    taskList.appendChild(taskEl);
  });
}

// Add new task from form
taskForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const text = taskInput.value.trim();
  if (!text) return;

  const dueDate = dueDateInput.value || null;

  const newTask = {
    id: generateId(),
    text,
    dueDate,
    completed: false,
    checklist: []
  };

  tasks.push(newTask);
  saveTasks();

  taskInput.value = "";
  dueDateInput.value = "";
});

// Theme change handler
themeSelect.addEventListener("change", () => {
  const selected = themeSelect.value;
  document.body.className = selected;
  saveTheme(selected);
});

// Initial load
loadTheme();
loadTasks();
renderTasks();
