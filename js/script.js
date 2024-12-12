$(document).ready(function () {
  let tasks = [];
  let currentPage = 1;
  const tasksPerPage = 20;
  let filteredTasks = [];

  // Fetch tasks from API
  async function fetchTasks() {
    try {
      const response = await fetch(
        "https://jsonplaceholder.typicode.com/todos"
      );
      const data = await response.json();
      tasks = data.map((task) => ({
        id: task.id,
        title: task.title,
        description: `Task description ${task.id}`,
        status: task.completed ? "Done" : "To Do",
      }));
      filterAndDisplayTasks();
      updateCounters();
    } catch (error) {
      console.error("Error fetching tasks:", error);
    }
  }

  // Initialize editable cells
  function initializeEditableCells() {
    $(".editable")
      .off("click")
      .on("click", function () {
        const cell = $(this);
        const currentValue = cell.text();
        const taskId = cell.closest("tr").data("id");
        const field = cell.data("field");

        if (field === "status") {
          const select = $("<select>")
            .addClass("border rounded p-1")
            .append("<option>To Do</option>")
            .append("<option>In Progress</option>")
            .append("<option>Done</option>")
            .val(currentValue);

          cell.html(select);
          select.focus();

          select.on("change blur", function () {
            const newValue = $(this).val();
            cell.text(newValue);
            updateTask(taskId, field, newValue);
          });
        } else {
          const input = $("<input>")
            .attr("type", "text")
            .addClass("border rounded p-1 w-full")
            .val(currentValue);

          cell.html(input);
          input.focus();

          input.on("blur", function () {
            const newValue = $(this).val();
            cell.text(newValue);
            updateTask(taskId, field, newValue);
          });
        }
      });
  }

  // Update task in array
  function updateTask(id, field, value) {
    const task = tasks.find((t) => t.id === id);
    if (task) {
      task[field] = value;
      updateCounters();
    }
  }

  // Filter and display tasks
  function filterAndDisplayTasks() {
    const searchQuery = $("#searchInput").val().toLowerCase();
    const statusFilter = $("#statusFilter").val();

    filteredTasks = tasks.filter((task) => {
      const matchesSearch =
        task.title.toLowerCase().includes(searchQuery) ||
        task.description.toLowerCase().includes(searchQuery);
      const matchesStatus =
        statusFilter === "all" || task.status === statusFilter;
      return matchesSearch && matchesStatus;
    });

    displayTasks();
    updatePagination();
  }

  // Display tasks for current page
  function displayTasks() {
    const start = (currentPage - 1) * tasksPerPage;
    const end = start + tasksPerPage;
    const pageData = filteredTasks.slice(start, end);

    const tbody = $("#taskTable tbody");
    tbody.empty();

    pageData.forEach((task) => {
      const row = $("<tr>").addClass("hover:bg-gray-50").data("id", task.id);

      row.append(
        `<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${task.id}</td>`
      );
      row.append(
        `<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 editable" data-field="title">${task.title}</td>`
      );
      row.append(
        `<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 editable" data-field="description">${task.description}</td>`
      );

      const statusClass =
        task.status === "Done"
          ? "bg-green-100 text-green-800"
          : task.status === "In Progress"
          ? "bg-yellow-100 text-yellow-800"
          : "bg-gray-100 text-gray-800";

      row.append(`
                <td class="px-6 py-4 whitespace-nowrap">
                    <span class="editable px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${statusClass}" data-field="status">
                        ${task.status}
                    </span>
                </td>
            `);

      row.append(`
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button class="delete-btn text-red-600 hover:text-red-900">Delete</button>
                </td>
            `);

      tbody.append(row);
    });

    initializeEditableCells();
  }

  // Update pagination info
  function updatePagination() {
    const totalPages = Math.ceil(filteredTasks.length / tasksPerPage);
    const start = (currentPage - 1) * tasksPerPage + 1;
    const end = Math.min(currentPage * tasksPerPage, filteredTasks.length);

    $("#pageInfo").text(
      `Showing ${start} to ${end} of ${filteredTasks.length} tasks`
    );
    $("#pageNumbers").text(`Page ${currentPage} of ${totalPages}`);

    $("#prevPage").prop("disabled", currentPage === 1);
    $("#nextPage").prop("disabled", currentPage === totalPages);
  }

  // Update task counters
  function updateCounters() {
    $("#totalTasks").text(tasks.length);
    $("#todoTasks").text(tasks.filter((t) => t.status === "To Do").length);
    $("#inProgressTasks").text(
      tasks.filter((t) => t.status === "In Progress").length
    );
    $("#doneTasks").text(tasks.filter((t) => t.status === "Done").length);
  }

  // Event Listeners
  $("#searchInput").on("input", function () {
    currentPage = 1;
    filterAndDisplayTasks();
  });

  $("#statusFilter").on("change", function () {
    currentPage = 1;
    filterAndDisplayTasks();
  });

  $("#prevPage").on("click", function () {
    if (currentPage > 1) {
      currentPage--;
      filterAndDisplayTasks();
    }
  });

  $("#nextPage").on("click", function () {
    const totalPages = Math.ceil(filteredTasks.length / tasksPerPage);
    if (currentPage < totalPages) {
      currentPage++;
      filterAndDisplayTasks();
    }
  });

  $("#taskTable").on("click", ".delete-btn", function () {
    const row = $(this).closest("tr");
    const taskId = row.data("id");
    tasks = tasks.filter((t) => t.id !== taskId);
    filterAndDisplayTasks();
    updateCounters();
  });

  $("#addTaskBtn").on("click", function () {
    const newTask = {
      id: tasks.length + 1,
      title: "New Task",
      description: "New Task Description",
      status: "To Do",
    };
    tasks.unshift(newTask);
    filterAndDisplayTasks();
    updateCounters();
  });

  // Initial load
  fetchTasks();
});
