document.addEventListener("DOMContentLoaded", () => {
  const monthYear = document.getElementById("monthYear");
  const calendarGrid = document.getElementById("calendarGrid");
  const prevBtn = document.getElementById("prevMonth");
  const nextBtn = document.getElementById("nextMonth");

  const preview = document.getElementById("taskPreview");
  const previewDate = document.getElementById("previewDate");
  const previewList = document.getElementById("previewList");
  const closePreview = document.getElementById("closePreview");

  let currentDate = new Date();

  function getTasks() {
    const data = localStorage.getItem("smartTasks");
    return data ? JSON.parse(data) : [];
  }

  function renderCalendar() {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const tasks = getTasks();

    const monthNames = [
      "January","February","March","April","May","June",
      "July","August","September","October","November","December"
    ];
    monthYear.textContent = `${monthNames[month]} ${year}`;

    calendarGrid.innerHTML = "";

    // Day headers
    const dayNames = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
    dayNames.forEach(d => {
      const div = document.createElement("div");
      div.className = "day";
      div.textContent = d;
      calendarGrid.appendChild(div);
    });

    // Empty slots before 1st day
    for (let i = 0; i < firstDay; i++) {
      const empty = document.createElement("div");
      calendarGrid.appendChild(empty);
    }

    // Days
    for (let day = 1; day <= daysInMonth; day++) {
      const cell = document.createElement("div");
      cell.className = "cal-cell";
      cell.textContent = day;

      const dateStr = `${year}-${String(month+1).padStart(2,"0")}-${String(day).padStart(2,"0")}`;

      const today = new Date();
      if (
        day === today.getDate() &&
        month === today.getMonth() &&
        year === today.getFullYear()
      ) {
        cell.classList.add("today");
      }

      const dueTasks = tasks.filter(t => t.date === dateStr);
      if (dueTasks.length > 0) {
        cell.classList.add("due");
        const badge = document.createElement("div");
        badge.className = "due-badge";
        badge.textContent = dueTasks.length;
        cell.appendChild(badge);

        cell.addEventListener("click", () => {
          preview.style.display = "flex";
          previewDate.textContent = `Tasks for ${dateStr}`;
          previewList.innerHTML = "";
          dueTasks.forEach(t => {
            const item = document.createElement("div");
            item.className = "task-item";
            item.textContent = `${t.name} (${t.priority}, ${t.type})`;
            previewList.appendChild(item);
          });
        });
      }

      calendarGrid.appendChild(cell);
    }
  }

  prevBtn.addEventListener("click", () => {
    currentDate.setMonth(currentDate.getMonth() - 1);
    renderCalendar();
  });

  nextBtn.addEventListener("click", () => {
    currentDate.setMonth(currentDate.getMonth() + 1);
    renderCalendar();
  });

  closePreview.addEventListener("click", () => {
    preview.style.display = "none";
  });

  renderCalendar();
});
