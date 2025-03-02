// DOM Elements
const taskForm = document.getElementById('task-form');
const taskNameInput = document.getElementById('task-name');
const taskDescriptionInput = document.getElementById('task-description');
const taskCategorySelect = document.getElementById('task-category');
const taskPrioritySelect = document.getElementById('task-priority');
const hasDeadlineCheckbox = document.getElementById('has-deadline');
const deadlineContainer = document.getElementById('deadline-container');
const taskDeadlineInput = document.getElementById('task-deadline');
const tasksContainer = document.getElementById('tasks-container');
const noTasksMessage = document.getElementById('no-tasks-message');
const filterButtons = document.querySelectorAll('.filter-btn');
const categoryButtons = document.querySelectorAll('.category-btn');
const completionPercentage = document.getElementById('completion-percentage');
const completionBar = document.getElementById('completion-bar');
const completedCount = document.getElementById('completed-count');
const pendingCount = document.getElementById('pending-count');
const totalCount = document.getElementById('total-count');
const todaysDateElement = document.getElementById('todays-date');
const editModal = document.getElementById('edit-modal');
const editForm = document.getElementById('edit-form');
const editTaskId = document.getElementById('edit-task-id');
const editTaskName = document.getElementById('edit-task-name');
const editTaskDescription = document.getElementById('edit-task-description');
const editTaskCategory = document.getElementById('edit-task-category');
const editTaskPriority = document.getElementById('edit-task-priority');
const editHasDeadline = document.getElementById('edit-has-deadline');
const editDeadlineContainer = document.getElementById('edit-deadline-container');
const editTaskDeadline = document.getElementById('edit-task-deadline');
const cancelEditButton = document.getElementById('cancel-edit');
const categoryChart = document.getElementById('category-chart');
const weeklyChart = document.getElementById('weekly-chart');
const reflectButton = document.getElementById('reflect-button');
const reflectionContainer = document.getElementById('reflection-container');
const reflectionInput = document.getElementById('reflection-input');
const saveReflectionButton = document.getElementById('save-reflection');
const savedReflection = document.getElementById('saved-reflection');
const editReflectionButton = document.getElementById('edit-reflection');

// App State
let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
let currentFilter = 'all';
let currentCategory = 'all';
let categoryChartInstance = null;
let weeklyChartInstance = null;
let timerInterval = null;
let timerRunning = false;
let seconds = 0;
let minutes = 0;
let hours = 0;

// Category Icons
const categoryIcons = {
    work: '<i class="fas fa-briefcase"></i>',
    personal: '<i class="fas fa-user"></i>',
    fitness: '<i class="fas fa-dumbbell"></i>',
    chores: '<i class="fas fa-home"></i>',
    learning: '<i class="fas fa-book"></i>'
};

// Priority Colors
const priorityColors = {
    high: '#ef4444',
    medium: '#f59e0b',
    low: '#10b981'
};

// Initialize the app
function init() {
    setupEventListeners();
    updateTodaysDate();
    renderTasks();
    updateStats();
    initCharts();
    loadReflection();
}

// Update today's date
function updateTodaysDate() {
    const today = new Date();
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    todaysDateElement.textContent = today.toLocaleDateString('en-US', options);
}

// Setup Event Listeners
function setupEventListeners() {
    // Task form submission
    taskForm.addEventListener('submit', addTask);
    
    // Deadline checkbox toggle
    hasDeadlineCheckbox.addEventListener('change', function() {
        deadlineContainer.classList.toggle('hidden', !this.checked);
        if (this.checked && !taskDeadlineInput.value) {
            // Set default deadline to tomorrow
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            tomorrow.setHours(23, 59, 0, 0);
            taskDeadlineInput.value = formatDateTimeForInput(tomorrow);
        }
    });
    
    // Filter buttons
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            setFilter(button.dataset.filter);
        });
    });
    
    // Category buttons
    categoryButtons.forEach(button => {
        button.addEventListener('click', () => {
            setCategory(button.dataset.category);
        });
    });
    
    // Edit form submission
    editForm.addEventListener('submit', saveEditedTask);
    
    // Edit deadline checkbox toggle
    editHasDeadline.addEventListener('change', function() {
        editDeadlineContainer.classList.toggle('hidden', !this.checked);
        if (this.checked && !editTaskDeadline.value) {
            // Set default deadline to tomorrow
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            tomorrow.setHours(23, 59, 0, 0);
            editTaskDeadline.value = formatDateTimeForInput(tomorrow);
        }
    });
    
    // Cancel edit button
    cancelEditButton.addEventListener('click', closeEditModal);
    
    // Close modal when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target === editModal) {
            closeEditModal();
        }
    });
    
    // Reflection button
    reflectButton.addEventListener('click', toggleReflection);
    
    // Save reflection button
    saveReflectionButton.addEventListener('click', saveReflection);
    
    // Edit reflection button
    editReflectionButton.addEventListener('click', editReflection);
}

// Toggle reflection container
function toggleReflection() {
    const todayReflection = getTodayReflection();
    
    if (todayReflection) {
        // Show saved reflection
        savedReflection.querySelector('p').textContent = todayReflection.text;
        reflectionContainer.classList.add('hidden');
        savedReflection.classList.remove('hidden');
    } else {
        // Show reflection input
        reflectionContainer.classList.remove('hidden');
        savedReflection.classList.add('hidden');
    }
}

// Save reflection
function saveReflection() {
    const reflectionText = reflectionInput.value.trim();
    
    if (!reflectionText) return;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const reflection = {
        date: today.toISOString(),
        text: reflectionText
    };
    
    // Get existing reflections
    let reflections = JSON.parse(localStorage.getItem('reflections')) || [];
    
    // Remove any existing reflection for today
    reflections = reflections.filter(r => {
        const reflectionDate = new Date(r.date);
        reflectionDate.setHours(0, 0, 0, 0);
        return reflectionDate.getTime() !== today.getTime();
    });
    
    // Add new reflection
    reflections.push(reflection);
    
    // Save to localStorage
    localStorage.setItem('reflections', JSON.stringify(reflections));
    
    // Update UI
    savedReflection.querySelector('p').textContent = reflectionText;
    reflectionContainer.classList.add('hidden');
    savedReflection.classList.remove('hidden');
}

// Edit reflection
function editReflection() {
    const todayReflection = getTodayReflection();
    
    if (todayReflection) {
        reflectionInput.value = todayReflection.text;
        savedReflection.classList.add('hidden');
        reflectionContainer.classList.remove('hidden');
    }
}

// Get today's reflection
function getTodayReflection() {
    const reflections = JSON.parse(localStorage.getItem('reflections')) || [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return reflections.find(reflection => {
        const reflectionDate = new Date(reflection.date);
        reflectionDate.setHours(0, 0, 0, 0);
        return reflectionDate.getTime() === today.getTime();
    });
}

// Load reflection
function loadReflection() {
    const todayReflection = getTodayReflection();
    
    if (todayReflection) {
        savedReflection.querySelector('p').textContent = todayReflection.text;
        savedReflection.classList.remove('hidden');
    }
}

// Add a new task
function addTask(e) {
    e.preventDefault();
    
    const taskName = taskNameInput.value.trim() || "Untitled Task";
    const taskDescription = taskDescriptionInput.value.trim();
    const taskCategory = taskCategorySelect.value;
    const taskPriority = taskPrioritySelect.value;
    const hasDeadline = hasDeadlineCheckbox.checked;
    const taskDeadline = hasDeadline ? new Date(taskDeadlineInput.value) : null;
    
    const newTask = {
        id: Date.now().toString(),
        name: taskName,
        description: taskDescription,
        category: taskCategory,
        priority: taskPriority,
        completed: false,
        createdAt: new Date().toISOString(),
        deadline: taskDeadline,
        completedAt: null
    };
    
    tasks.push(newTask);
    saveTasks();
    renderTasks();
    updateStats();
    updateCharts();
    
    // Reset form
    taskForm.reset();
    deadlineContainer.classList.add('hidden');
}

// Save tasks to localStorage
function saveTasks() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

// Render tasks based on current filter and category
function renderTasks() {
    const filteredTasks = getFilteredTasks();
    
    if (filteredTasks.length === 0) {
        tasksContainer.innerHTML = '';
        noTasksMessage.style.display = 'block';
        return;
    }
    
    noTasksMessage.style.display = 'none';
    tasksContainer.innerHTML = '';
    
    filteredTasks.forEach(task => {
        const taskElement = createTaskElement(task);
        tasksContainer.appendChild(taskElement);
    });
}

// Get filtered tasks based on current filter and category
function getFilteredTasks() {
    let filtered = [...tasks];
    
    // Apply category filter
    if (currentCategory !== 'all') {
        filtered = filtered.filter(task => task.category === currentCategory);
    }
    
    // Apply status filter
    switch (currentFilter) {
        case 'today':
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 1);
            
            return filtered.filter(task => {
                if (!task.deadline) return false;
                const deadline = new Date(task.deadline);
                return deadline >= today && deadline < tomorrow;
            });
            
        case 'upcoming':
            const now = new Date();
            return filtered.filter(task => {
                if (!task.deadline || task.completed) return false;
                return new Date(task.deadline) > now;
            });
            
        case 'completed':
            return filtered.filter(task => task.completed);
            
        default: // 'all'
            return filtered;
    }
}

// Create a task element
function createTaskElement(task) {
    const taskItem = document.createElement('div');
    taskItem.classList.add('task-item', 'p-4', 'bg-white', 'rounded-lg', 'shadow-sm', 'border', 'border-gray-100');
    taskItem.classList.add(`priority-${task.priority}`);
    
    if (task.completed) {
        taskItem.classList.add('task-completed');
    }
    
    // Determine deadline status
    let deadlineHTML = '';
    let deadlineStatus = '';
    
    if (task.deadline) {
        const now = new Date();
        const deadline = new Date(task.deadline);
        const timeRemaining = deadline - now;
        
        // Format deadline for display
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        const formattedDeadline = deadline.toLocaleDateString('en-US', options);
        
        if (timeRemaining < 0 && !task.completed) {
            deadlineStatus = 'deadline-overdue';
            deadlineHTML = `<div class="deadline-indicator ${deadlineStatus}">
                <i class="fas fa-exclamation-circle"></i> Overdue: ${formattedDeadline}
            </div>`;
        } else if (timeRemaining < 24 * 60 * 60 * 1000 && !task.completed) { // Less than 24 hours
            deadlineStatus = 'deadline-approaching';
            deadlineHTML = `<div class="deadline-indicator ${deadlineStatus}">
                <i class="fas fa-clock"></i> Due soon: ${formattedDeadline}
            </div>`;
        } else {
            deadlineHTML = `<div class="deadline-indicator text-gray-500">
                <i class="fas fa-calendar-alt"></i> Due: ${formattedDeadline}
            </div>`;
        }
    }
    
    // Get category icon
    const categoryIcon = categoryIcons[task.category] || '<i class="fas fa-tasks"></i>';
    
    // Get category color
    const categoryColorClass = `category-${task.category}`;
    
    const completeButtonClass = task.completed ? 'bg-gray-200 text-gray-600' : 'bg-green-100 text-green-600';
    const completeIconClass = task.completed ? 'fa-undo' : 'fa-check';
    const titleClass = task.completed ? 'line-through text-gray-400' : '';
    
    taskItem.innerHTML = `
        <div class="flex justify-between items-start">
            <div class="flex-1">
                <div class="flex items-center mb-1">
                    <span class="category-indicator ${categoryColorClass}"></span>
                    <span class="text-xs text-gray-500 font-medium mr-2">${categoryIcon} ${task.category.charAt(0).toUpperCase() + task.category.slice(1)}</span>
                </div>
                <h3 class="task-title text-lg font-medium ${titleClass}">${task.name}</h3>
                <p class="task-description text-gray-600 text-sm mb-2">${task.description || 'No description'}</p>
                ${deadlineHTML}
                <div class="flex items-center mt-2 text-xs text-gray-500">
                    <span class="capitalize mr-3">
                        <i class="fas fa-flag" style="color: ${priorityColors[task.priority]};"></i> 
                        ${task.priority} priority
                    </span>
                </div>
            </div>
            <div class="task-actions flex space-x-2">
                <button class="complete-btn p-2 rounded-full ${completeButtonClass}" data-id="${task.id}">
                    <i class="fas ${completeIconClass}"></i>
                </button>
                <button class="edit-btn p-2 rounded-full bg-blue-100 text-blue-600" data-id="${task.id}">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="delete-btn p-2 rounded-full bg-red-100 text-red-600" data-id="${task.id}">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `;
    
    // Add event listeners to buttons
    const completeBtn = taskItem.querySelector('.complete-btn');
    const editBtn = taskItem.querySelector('.edit-btn');
    const deleteBtn = taskItem.querySelector('.delete-btn');
    
    completeBtn.addEventListener('click', () => toggleTaskComplete(task.id));
    editBtn.addEventListener('click', () => openEditModal(task.id));
    deleteBtn.addEventListener('click', () => deleteTask(task.id));
    
    return taskItem;
}

// Toggle task complete status
function toggleTaskComplete(taskId) {
    const taskIndex = tasks.findIndex(task => task.id === taskId);
    if (taskIndex !== -1) {
        tasks[taskIndex].completed = !tasks[taskIndex].completed;
        
        // Set or clear completedAt timestamp
        if (tasks[taskIndex].completed) {
            tasks[taskIndex].completedAt = new Date();
            
            // Add animation class to the task element
            const taskElement = document.querySelector(`.task-item .complete-btn[data-id="${taskId}"]`).closest('.task-item');
            taskElement.classList.add('task-complete-animation');
            
            // Remove animation class after animation completes
            setTimeout(() => {
                taskElement.classList.remove('task-complete-animation');
            }, 800);
        } else {
            tasks[taskIndex].completedAt = null;
        }
        
        saveTasks();
        renderTasks();
        updateStats();
        updateCharts();
    }
}

// Delete a task
function deleteTask(taskId) {
    if (confirm('Are you sure you want to delete this task?')) {
        tasks = tasks.filter(task => task.id !== taskId);
        saveTasks();
        renderTasks();
        updateStats();
        updateCharts();
    }
}

// Open edit modal
function openEditModal(taskId) {
    const task = tasks.find(task => task.id === taskId);
    if (!task) return;
    
    // Populate form fields
    editTaskId.value = task.id;
    editTaskName.value = task.name;
    editTaskDescription.value = task.description || '';
    editTaskCategory.value = task.category;
    editTaskPriority.value = task.priority;
    
    // Handle deadline
    if (task.deadline) {
        editHasDeadline.checked = true;
        editDeadlineContainer.classList.remove('hidden');
        editTaskDeadline.value = formatDateTimeForInput(new Date(task.deadline));
    } else {
        editHasDeadline.checked = false;
        editDeadlineContainer.classList.add('hidden');
        editTaskDeadline.value = '';
    }
    
    // Show modal with animation
    editModal.classList.remove('hidden');
    setTimeout(() => {
        document.getElementById('modal-content').classList.add('scale-100', 'opacity-100');
    }, 10);
}

// Close edit modal
function closeEditModal() {
    document.getElementById('modal-content').classList.remove('scale-100', 'opacity-100');
    setTimeout(() => {
        editModal.classList.add('hidden');
        editForm.reset();
    }, 300);
}

// Save edited task
function saveEditedTask(e) {
    e.preventDefault();
    
    const taskId = editTaskId.value;
    const taskIndex = tasks.findIndex(task => task.id === taskId);
    
    if (taskIndex === -1) return;
    
    const taskName = editTaskName.value.trim() || "Untitled Task";
    const taskDescription = editTaskDescription.value.trim();
    const taskCategory = editTaskCategory.value;
    const taskPriority = editTaskPriority.value;
    const hasDeadline = editHasDeadline.checked;
    const taskDeadline = hasDeadline ? new Date(editTaskDeadline.value) : null;
    
    // Update task
    tasks[taskIndex].name = taskName;
    tasks[taskIndex].description = taskDescription;
    tasks[taskIndex].category = taskCategory;
    tasks[taskIndex].priority = taskPriority;
    tasks[taskIndex].deadline = taskDeadline;
    
    saveTasks();
    closeEditModal();
    renderTasks();
    updateStats();
    updateCharts();
}

// Set current filter
function setFilter(filter) {
    currentFilter = filter;
    
    // Update active filter button
    filterButtons.forEach(button => {
        if (button.dataset.filter === filter) {
            button.classList.add('active');
        } else {
            button.classList.remove('active');
        }
    });
    
    renderTasks();
}

// Set current category
function setCategory(category) {
    currentCategory = category;
    
    // Update active category button
    categoryButtons.forEach(button => {
        if (button.dataset.category === category) {
            button.classList.add('active');
        } else {
            button.classList.remove('active');
        }
    });
    
    renderTasks();
}

// Update statistics
function updateStats() {
    // Get today's tasks
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const todaysTasks = tasks.filter(task => {
        if (!task.deadline) return false;
        const deadline = new Date(task.deadline);
        return deadline >= today && deadline < tomorrow;
    });
    
    const completedTodaysTasks = todaysTasks.filter(task => task.completed);
    
    // Calculate completion percentage
    const completionRate = todaysTasks.length > 0 
        ? Math.round((completedTodaysTasks.length / todaysTasks.length) * 100) 
        : 0;
    
    // Update UI
    completionPercentage.textContent = `${completionRate}%`;
    completionBar.style.width = `${completionRate}%`;
    completedCount.textContent = completedTodaysTasks.length;
    pendingCount.textContent = todaysTasks.length - completedTodaysTasks.length;
    totalCount.textContent = todaysTasks.length;
}

// Initialize charts
function initCharts() {
    // Category distribution chart
    const categoryData = getCategoryData();
    categoryChartInstance = new Chart(categoryChart, {
        type: 'doughnut',
        data: {
            labels: categoryData.labels,
            datasets: [{
                data: categoryData.data,
                backgroundColor: categoryData.colors,
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            cutout: '70%',
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        padding: 20,
                        boxWidth: 12,
                        font: {
                            family: "'SF Pro Display', sans-serif",
                            size: 12
                        }
                    }
                },
                title: {
                    display: true,
                    text: 'Tasks by Category',
                    font: {
                        family: "'SF Pro Display', sans-serif",
                        size: 16,
                        weight: 'medium'
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.7)',
                    padding: 12,
                    titleFont: {
                        family: "'SF Pro Display', sans-serif",
                        size: 14
                    },
                    bodyFont: {
                        family: "'SF Pro Display', sans-serif",
                        size: 13
                    },
                    displayColors: false
                }
            }
        }
    });
    
    // Weekly overview chart
    const weeklyData = getWeeklyData();
    weeklyChartInstance = new Chart(weeklyChart, {
        type: 'bar',
        data: {
            labels: weeklyData.labels,
            datasets: [{
                label: 'Completed Tasks',
                data: weeklyData.completed,
                backgroundColor: '#10b981',
                borderColor: '#10b981',
                borderWidth: 0,
                borderRadius: 6
            }, {
                label: 'Total Tasks',
                data: weeklyData.total,
                backgroundColor: '#e5e7eb',
                borderColor: '#e5e7eb',
                borderWidth: 0,
                borderRadius: 6
            }]
        },
        options: {
            responsive: true,
            scales: {
                x: {
                    grid: {
                        display: false
                    },
                    ticks: {
                        font: {
                            family: "'SF Pro Display', sans-serif",
                            size: 12
                        }
                    }
                },
                y: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                    },
                    ticks: {
                        precision: 0,
                        font: {
                            family: "'SF Pro Display', sans-serif",
                            size: 12
                        }
                    }
                }
            },
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        padding: 20,
                        boxWidth: 12,
                        font: {
                            family: "'SF Pro Display', sans-serif",
                            size: 12
                        }
                    }
                },
                title: {
                    display: true,
                    text: 'Weekly Task Completion',
                    font: {
                        family: "'SF Pro Display', sans-serif",
                        size: 16,
                        weight: 'medium'
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.7)',
                    padding: 12,
                    titleFont: {
                        family: "'SF Pro Display', sans-serif",
                        size: 14
                    },
                    bodyFont: {
                        family: "'SF Pro Display', sans-serif",
                        size: 13
                    }
                }
            }
        }
    });
}

// Update charts
function updateCharts() {
    // Update category chart
    const categoryData = getCategoryData();
    categoryChartInstance.data.labels = categoryData.labels;
    categoryChartInstance.data.datasets[0].data = categoryData.data;
    categoryChartInstance.data.datasets[0].backgroundColor = categoryData.colors;
    categoryChartInstance.update();
    
    // Update weekly chart
    const weeklyData = getWeeklyData();
    weeklyChartInstance.data.labels = weeklyData.labels;
    weeklyChartInstance.data.datasets[0].data = weeklyData.completed;
    weeklyChartInstance.data.datasets[1].data = weeklyData.total;
    weeklyChartInstance.update();
}

// Get category data for chart
function getCategoryData() {
    const categories = {
        work: { count: 0, color: '#3b82f6' },
        personal: { count: 0, color: '#8b5cf6' },
        fitness: { count: 0, color: '#10b981' },
        chores: { count: 0, color: '#f59e0b' },
        learning: { count: 0, color: '#ec4899' }
    };
    
    tasks.forEach(task => {
        if (categories[task.category]) {
            categories[task.category].count++;
        }
    });
    
    const labels = [];
    const data = [];
    const colors = [];
    
    for (const [category, info] of Object.entries(categories)) {
        if (info.count > 0) {
            labels.push(category.charAt(0).toUpperCase() + category.slice(1));
            data.push(info.count);
            colors.push(info.color);
        }
    }
    
    return { labels, data, colors };
}

// Get weekly data for chart
function getWeeklyData() {
    const days = [];
    const completed = [];
    const total = [];
    
    // Get dates for the last 7 days
    for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        date.setHours(0, 0, 0, 0);
        
        const nextDay = new Date(date);
        nextDay.setDate(nextDay.getDate() + 1);
        
        // Count tasks for this day
        const dayTasks = tasks.filter(task => {
            if (!task.deadline) return false;
            const deadline = new Date(task.deadline);
            return deadline >= date && deadline < nextDay;
        });
        
        const dayCompleted = dayTasks.filter(task => task.completed).length;
        
        // Format day label (e.g., "Mon")
        const dayLabel = date.toLocaleDateString('en-US', { weekday: 'short' });
        
        days.push(dayLabel);
        completed.push(dayCompleted);
        total.push(dayTasks.length);
    }
    
    return { labels: days, completed, total };
}

// Helper function to format date for display
function formatDateTime(date) {
    return date.toLocaleDateString('en-US', { 
        year: 'numeric',
        month: 'long', 
        day: 'numeric'
    });
}

// Helper function to format date for datetime-local input
function formatDateTimeForInput(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    
    return `${year}-${month}-${day}T${hours}:${minutes}`;
}

// Initialize the app
document.addEventListener('DOMContentLoaded', init); 