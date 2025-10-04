/* data/script.js - Smart Task Organizer (Tasks + Calendar + Reminders + Analytics) */

function toggleMenu() {
  document.getElementById("navLinks").classList.toggle("active");
  const modal = document.getElementById("proModal");
}

(() => {
  const STORAGE_KEY = "smartTasks";
  const CHARTS_KEY = "smartCharts";
  const NOTIF_ASK_KEY = "notifAsked";

  let tasks = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  let reminderTimers = [];
  let editingIndex = null;

  // DOM refs
  const taskForm = document.getElementById("taskForm");
  const taskList = document.getElementById("taskList");
  const totalEl = document.getElementById("total");
  const completedEl = document.getElementById("completed");
  const pendingEl = document.getElementById("pending");
  const searchInput = document.getElementById("searchTask");
  const filterPriority = document.getElementById("filterPriority");
  const filterType = document.getElementById("filterType");

  // Toast container (create if missing)
  const toastContainer = (function () {
    let el = document.getElementById("toastContainer");
    if (!el) {
      el = document.createElement("div");
      el.id = "toastContainer";
      document.body.appendChild(el);
    }
    return el;
  })();

  // Calendar / preview refs
  const calendarGrid = document.getElementById("calendarGrid");
  const monthYear = document.getElementById("monthYear");
  const prevMonthBtn = document.getElementById("prevMonth");
  const nextMonthBtn = document.getElementById("nextMonth");

  const previewBackdrop = document.getElementById("taskPreview");
  const previewDateEl = document.getElementById("previewDate");
  const previewList = document.getElementById("previewList");
  const closePreviewBtn = document.getElementById("closePreview");

  // Charts instances
  let completionChart = null;
  let priorityChart = null;
  let typeChart = null;

  let currentDate = new Date();
  let currentMonth = currentDate.getMonth();
  let currentYear = currentDate.getFullYear();

  // Helpers
  function saveTasks() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    try {
      scheduleAllReminders();
    } catch (e) {
      console.error("Error scheduling reminders in saveTasks:", e);
    }
    renderAnalytics();
  }
  function loadTasks() {
    tasks = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  }
  function escapeHTML(str) {
    if (str === null || str === undefined) return "";
    return String(str).replace(
      /[&<>"']/g,
      (m) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;",
        }[m])
    );
  }

  function showToast(message, type = "info") {
    const t = document.createElement("div");
    t.className = `toast ${type}`;
    t.textContent = message;
    toastContainer.appendChild(t);
    requestAnimationFrame(() => t.classList.add("show"));
    setTimeout(() => {
      t.classList.remove("show");
      setTimeout(() => t.remove(), 300);
    }, 3500);
    t.addEventListener("click", () => {
      t.classList.remove("show");
      setTimeout(() => t.remove(), 300);
    });
  }

  // Notifications
  function ensureNotificationPermission() {
    try {
      if (!localStorage.getItem(NOTIF_ASK_KEY) && "Notification" in window) {
        Notification.requestPermission().finally(() =>
          localStorage.setItem(NOTIF_ASK_KEY, "1")
        );
      }
    } catch (e) {
      localStorage.setItem(NOTIF_ASK_KEY, "1");
    }
  }

  // Reminders scheduling
  function clearAllReminders() {
    reminderTimers.forEach((id) => clearTimeout(id));
    reminderTimers = [];
  }

  function scheduleReminder(task) {
    if (!task || !task.date || !task.time || task.completed) return;

    let timeStr = task.time;
    // Ensure proper time format
    if (/^\d{1,2}:\d{2}$/.test(timeStr)) {
      const parts = timeStr.split(":");
      timeStr = `${String(parts[0]).padStart(2, "0")}:${parts[1]}:00`;
    }
    
    const when = new Date(`${task.date}T${timeStr}`).getTime();
    const now = Date.now();
    const delay = when - now;
    const MAX_TIMEOUT = 2147483647;

    // Schedule if future and within max timeout range
    if (delay > 0 && delay <= MAX_TIMEOUT) {
      try {
        const id = setTimeout(() => {
          showToast(`⏰ Task due: ${task.name}`, "warning");
          if ("Notification" in window && Notification.permission === "granted") {
            try {
              const n = new Notification("⏰ Task Reminder", {
                body: `Task "${task.name}" is due now.`,
              });
              n.onclick = () => window.focus();
            } catch (e) {}
          }
        }, delay);
        reminderTimers.push(id);
      } catch (e) {
        console.error("Failed to schedule reminder:", e);
      }
    }
    // If within last minute, show immediately
    else if (delay < 0 && delay > -60000) {
      showToast(`⏰ Task due (just now): ${task.name}`, "warning");
      if ("Notification" in window && Notification.permission === "granted") {
        try {
          const n = new Notification("⏰ Task Reminder", {
            body: `Task "${task.name}" is due now.`,
          });
          n.onclick = () => window.focus();
        } catch (e) {}
      }
    }
  }

  function scheduleAllReminders() {
    clearAllReminders();
    tasks.forEach((t) => {
      try {
        scheduleReminder(t);
      } catch (e) {
        console.error("Error scheduling reminder:", t, e);
      }
    });
  }

  // Date error box
  let errorBox = document.createElement("div");
  errorBox.id = "dateErrorBox";
  errorBox.style.color = "#ff5252";
  errorBox.style.padding = "8px 12px";
  errorBox.style.borderRadius = "8px";
  errorBox.style.margin = "8px 0";
  errorBox.style.fontSize = "14px";
  errorBox.style.textAlign = "center";
  errorBox.style.display = "none";

  const addBtn = document.querySelector("#taskForm button[type='submit']");
  if (addBtn && addBtn.parentNode) {
    addBtn.parentNode.insertBefore(errorBox, addBtn);
  }

  function checkDateError() {
    errorBox.style.display = "none";
    const dateVal = document.getElementById("taskDate").value;
    const timeVal = document.getElementById("taskTime").value;
    if (dateVal && timeVal) {
      const selected = new Date(`${dateVal}T${timeVal}`);
      if (selected.getTime() <= Date.now()) {
        errorBox.textContent = "❌ You cannot add tasks in the past.";
        errorBox.style.display = "block";
        return false;
      }
    }
    return true;
  }

  const dateInput = document.getElementById("taskDate");
  const timeInput = document.getElementById("taskTime");
  if (dateInput) dateInput.addEventListener("input", checkDateError);
  if (timeInput) timeInput.addEventListener("input", checkDateError);

  // Render task list
  function renderTasks() {
    if (!taskList) return;
    const q = (searchInput?.value || "").toLowerCase();
    const pFilter = filterPriority?.value || "";
    const tFilter = filterType?.value || "";

    const filtered = tasks.filter((task) => {
      const nm = (task.name || "").toLowerCase();
      if (!nm.includes(q)) return false;
      if (pFilter && task.priority !== pFilter) return false;
      if (tFilter && task.type !== tFilter) return false;
      return true;
    });

    taskList.innerHTML = "";

    if (filtered.length === 0) {
      const placeholder = document.createElement("div");
      placeholder.className = "placeholder";
      placeholder.textContent = "Your tasks will be listed here";
      taskList.appendChild(placeholder);
    } else {
      filtered.forEach((task) => {
        const globalIndex = tasks.indexOf(task);
        const box = document.createElement("div");
        box.className = "task-box" + (task.completed ? " completed" : "");

        box.innerHTML = `
          <div style="flex:1">
            <h4>${task.completed ? `<s>${escapeHTML(task.name)}</s>` : escapeHTML(task.name)}</h4>
            <p>${task.completed ? `<s>${escapeHTML(task.desc || "")}</s>` : escapeHTML(task.desc || "")}</p>
            <div class="task-meta">
              <span class="badge-prio ${(task.priority || "").toLowerCase()}">${escapeHTML(task.priority || "")}</span>
              <span class="badge-type">${escapeHTML(task.type || "")}</span>
              <span style="margin-left:8px">${escapeHTML(task.date || "")} ${escapeHTML(task.time || "")}</span>
            </div>
          </div>
          <div class="task-actions"></div>
        `;

        const actions = box.querySelector(".task-actions");

        if (!task.completed) {
          actions.appendChild(makeBtn("✓", "complete-btn", () => {
            tasks[globalIndex].completed = true;
            saveTasks();
            scheduleAllReminders();
            renderTasks();
            renderCalendar();
            showToast(`✅ You completed: ${task.name}`, "success");
          }));
          actions.appendChild(makeBtn("✎", "edit-btn", () => enterEditMode(globalIndex)));
        } else {
          actions.appendChild(makeBtn("↶", "undo-btn", () => {
            tasks[globalIndex].completed = false;
            saveTasks();
            scheduleAllReminders();
            renderTasks();
            renderCalendar();
            showToast(`↩️ Marked as pending: ${task.name}`, "info");
          }));
        }

        actions.appendChild(makeBtn("🗑", "delete-btn", () => {
          tasks.splice(globalIndex, 1);
          saveTasks();
          renderTasks();
          renderCalendar();
          showToast("Task deleted", "warning");
        }));

        taskList.appendChild(box);
      });
    }

    totalEl.textContent = tasks.length;
    completedEl.textContent = tasks.filter((t) => t.completed).length;
    pendingEl.textContent = tasks.filter((t) => !t.completed).length;

    renderCalendar();
    renderAnalytics();
  }

  function makeBtn(label, cls, handler) {
    const btn = document.createElement("button");
    btn.className = cls;
    btn.innerHTML = label;
    btn.addEventListener("click", handler);
    return btn;
  }

  function enterEditMode(index) {
    const t = tasks[index];
    document.getElementById("taskName").value = t.name || "";
    document.getElementById("taskDesc").value = t.desc || "";
    document.getElementById("taskTime").value = t.time || "";
    document.getElementById("taskDate").value = t.date || "";
    document.getElementById("taskPriority").value = t.priority || "";
    document.getElementById("taskType").value = t.type || "";
    document.getElementById("taskSubmitBtn").textContent = "Save Changes";
    editingIndex = index;
    
    // Remove the task from list while editing
    tasks.splice(index, 1);
    saveTasks();
    renderTasks();
    
    document.getElementById("taskName").focus();
  }

  // ✅ FIXED form submit
  if (taskForm) {
    taskForm.addEventListener("submit", (e) => {
      e.preventDefault();

      if (!checkDateError()) {
        showToast("⚠️ Fix the past date/time first", "warning");
        return;
      }

      const newTask = {
        name: document.getElementById("taskName").value.trim(),
        desc: document.getElementById("taskDesc").value.trim(),
        time: document.getElementById("taskTime").value,
        date: document.getElementById("taskDate").value,
        priority: document.getElementById("taskPriority").value,
        type: document.getElementById("taskType").value,
        completed: false,
      };
      if (!newTask.name) {
        showToast("Task name required", "warning");
        return;
      }

      // Always add as new task (edit mode already removed the old one)
      tasks.push(newTask);
      
      if (editingIndex !== null) {
        editingIndex = null;
        document.getElementById("taskSubmitBtn").textContent = "Add Task";
        showToast("✏️ Task updated", "success");
      } else {
        showToast("➕ Task added", "success");
      }

      saveTasks();
      renderTasks();
      taskForm.reset();
      errorBox.style.display = "none";
      
      // Schedule reminder for the new task after a brief delay
      setTimeout(() => scheduleReminder(newTask), 100);
    });
  }

  // Calendar render
  function renderCalendar() {
    if (!calendarGrid || !monthYear) return;
    calendarGrid.innerHTML = "";

    const monthName = new Date(currentYear, currentMonth, 1).toLocaleString("default", { month: "long" });
    monthYear.textContent = `${monthName} ${currentYear}`;

    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    dayNames.forEach((d) => {
      const div = document.createElement("div");
      div.className = "day";
      div.textContent = d;
      calendarGrid.appendChild(div);
    });

    const firstDay = new Date(currentYear, currentMonth, 1).getDay();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

    for (let i = 0; i < firstDay; i++) {
      const blank = document.createElement("div");
      blank.className = "cal-cell empty";
      calendarGrid.appendChild(blank);
    }

    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      const cell = document.createElement("div");
      cell.className = "cal-cell";

      const dayNum = document.createElement("div");
      dayNum.className = "day-num";
      dayNum.textContent = d;
      cell.appendChild(dayNum);

      const today = new Date();
      if (today.getDate() === d && today.getMonth() === currentMonth && today.getFullYear() === currentYear) {
        cell.classList.add("today");
      }

      const due = tasks.filter((t) => t.date === dateStr && !t.completed);
      if (due.length > 0) {
        const badge = document.createElement("div");
        badge.className = "due-badge";
        badge.textContent = due.length;
        cell.appendChild(badge);
        cell.addEventListener("click", () => openPreview(dateStr));
      }

      calendarGrid.appendChild(cell);
    }
  }

  prevMonthBtn?.addEventListener("click", () => {
    currentMonth--;
    if (currentMonth < 0) {
      currentMonth = 11;
      currentYear--;
    }
    renderCalendar();
  });
  nextMonthBtn?.addEventListener("click", () => {
    currentMonth++;
    if (currentMonth > 11) {
      currentMonth = 0;
      currentYear++;
    }
    renderCalendar();
  });

  // Preview modal
  function openPreview(dateStr) {
    previewDateEl.textContent = `Tasks for ${dateStr}`;
    previewList.innerHTML = "";

    const dayTasks = tasks.filter((t) => t.date === dateStr);
    if (dayTasks.length === 0) {
      const no = document.createElement("div");
      no.className = "task-item";
      no.innerHTML = `<h4>No tasks</h4>`;
      previewList.appendChild(no);
    } else {
      dayTasks.forEach((t) => {
        const item = document.createElement("div");
        item.className = "task-item";

        const title = t.completed ? `<h4><s>${escapeHTML(t.name)}</s></h4>` : `<h4>${escapeHTML(t.name)}</h4>`;
        const metaLines = `
          <div class="meta">📅 ${escapeHTML(t.date)} • ⏰ ${escapeHTML(t.time || "—")}</div>
          <div class="meta"><span class="badge-prio ${(t.priority || "").toLowerCase()}">${escapeHTML(t.priority || "")}</span>
          <span class="badge-type">${escapeHTML(t.type || "")}</span></div>
        `;
        const desc = t.desc ? `<p>${escapeHTML(t.desc)}</p>` : "";

        item.innerHTML = `${title}${metaLines}${desc}`;
        previewList.appendChild(item);
      });
    }

    previewBackdrop.classList.add("show");
    previewBackdrop.setAttribute("aria-hidden", "false");
    closePreviewBtn?.focus();
  }
  function closePreview() {
    previewBackdrop.classList.remove("show");
    previewBackdrop.setAttribute("aria-hidden", "true");
  }

  previewBackdrop.addEventListener("click", (e) => {
    if (e.target === previewBackdrop) closePreview();
  });
  closePreviewBtn?.addEventListener("click", closePreview);
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closePreview();
  });

  // Filters / search
  searchInput?.addEventListener("input", renderTasks);
  filterPriority?.addEventListener("change", renderTasks);
  filterType?.addEventListener("change", renderTasks);

  function init() {
    loadTasks();
    ensureNotificationPermission();
    scheduleAllReminders();
    renderTasks();
    renderCalendar();
    setTimeout(renderAnalytics, 100);
  }
  init();

  // Analytics
  function renderAnalytics() {
    if (!tasks || tasks.length === 0) {
      try {
        if (completionChart) { completionChart.destroy(); completionChart = null; }
        if (priorityChart) { priorityChart.destroy(); priorityChart = null; }
        if (typeChart) { typeChart.destroy(); typeChart = null; }
      } catch (e) {}
      return;
    }

    try {
      const ctx1 = document.getElementById("completionChart").getContext("2d");
      const done = tasks.filter((t) => t.completed).length;
      const not = tasks.length - done;
      if (completionChart) completionChart.destroy();
      completionChart = new Chart(ctx1, {
        type: "doughnut",
        data: {
          labels: ["Completed", "Pending"],
          datasets: [{ data: [done, not], backgroundColor: ["#4caf50", "#f44336"] }],
        },
        options: { responsive: true },
      });
    } catch (e) {}

    try {
      const ctx2 = document.getElementById("priorityChart").getContext("2d");
      const counts = { High: 0, Medium: 0, Low: 0 };
      tasks.forEach((t) => { if (t.priority) counts[t.priority] = (counts[t.priority] || 0) + 1; });
      if (priorityChart) priorityChart.destroy();
      priorityChart = new Chart(ctx2, {
        type: "bar",
        data: {
          labels: Object.keys(counts),
          datasets: [{ label: "Tasks by Priority", data: Object.values(counts), backgroundColor: ["#f44336", "#ff9800", "#4caf50"] }],
        },
        options: { responsive: true },
      });
    } catch (e) {}

    try {
      const ctx3 = document.getElementById("typeChart").getContext("2d");
      const countsT = {};
      tasks.forEach((t) => { if (t.type) countsT[t.type] = (countsT[t.type] || 0) + 1; });
      if (typeChart) typeChart.destroy();
      typeChart = new Chart(ctx3, {
        type: "pie",
        data: {
          labels: Object.keys(countsT),
          datasets: [{ data: Object.values(countsT), backgroundColor: ["#2196f3", "#9c27b0", "#009688", "#ff5722"] }],
        },
        options: { responsive: true },
      });
    } catch (e) {}
  }
})();