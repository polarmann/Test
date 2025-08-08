// Task Management Component
class TaskManager {
    constructor(storage, reviewSystem) {
        this.storage = storage;
        this.reviewSystem = reviewSystem;
        this.initializeTaskForm();
        this.loadTodayTasks();
    }

    initializeTaskForm() {
        const form = document.getElementById('add-task-form');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleAddTask();
            });
        }

        // Set current Persian date as default
        this.setDefaultDate();
    }

    setDefaultDate() {
        const today = PersianDate.today();
        const dayInput = document.getElementById('task-day');
        const monthInput = document.getElementById('task-month');
        const yearInput = document.getElementById('task-year');

        if (dayInput) dayInput.value = today.day;
        if (monthInput) monthInput.value = today.month;
        if (yearInput) yearInput.value = today.year;
    }

    handleAddTask() {
        const titleInput = document.getElementById('task-title');
        const dayInput = document.getElementById('task-day');
        const monthInput = document.getElementById('task-month');
        const yearInput = document.getElementById('task-year');
        const typeSelect = document.getElementById('task-type');

        const title = titleInput.value.trim();
        const day = parseInt(dayInput.value);
        const month = parseInt(monthInput.value);
        const year = parseInt(yearInput.value);
        const type = typeSelect.value;

        // Validate inputs
        if (!title) {
            this.showNotification('لطفاً عنوان کار را وارد کنید', 'error');
            return;
        }

        if (!PersianDate.isValid(year, month, day)) {
            this.showNotification('تاریخ وارد شده معتبر نیست', 'error');
            return;
        }

        const taskDate = new PersianDate(year, month, day);
        const task = {
            title,
            date: taskDate.format(),
            type,
            completed: false
        };

        // Add reviews if it's a study task
        if (type === 'مطالعه') {
            task.reviews = this.reviewSystem.generateReviews(taskDate);
        }

        // Save task
        const savedTask = this.storage.addTask(task);
        if (savedTask) {
            this.showNotification('کار جدید با موفقیت اضافه شد', 'success');
            this.clearForm();
            this.loadTodayTasks();
        } else {
            this.showNotification('خطا در ذخیره کار', 'error');
        }
    }

    clearForm() {
        const form = document.getElementById('add-task-form');
        if (form) {
            form.reset();
            this.setDefaultDate();
        }
    }

    loadTodayTasks() {
        const today = PersianDate.today().format();
        const tasks = this.storage.getTasksByDate(today);
        
        // Filter only main tasks (not reviews)
        const mainTasks = tasks.filter(task => !task.parentTask);
        
        this.renderTasks(mainTasks);
    }

    renderTasks(tasks) {
        const container = document.getElementById('today-tasks-list');
        if (!container) return;

        if (tasks.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                              d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                    </svg>
                    <h3 class="text-lg font-medium mb-2">کاری برای امروز ثبت نشده</h3>
                    <p>برای شروع، یک کار جدید اضافه کنید</p>
                </div>
            `;
            return;
        }

        container.innerHTML = tasks.map(task => this.createTaskHTML(task)).join('');
        
        // Add event listeners
        this.attachTaskEventListeners();
    }

    createTaskHTML(task) {
        const completedClass = task.completed ? 'completed' : '';
        const typeClass = task.type === 'مطالعه' ? 'priority-medium' : 'priority-low';
        
        return `
            <div class="task-item task-card ${completedClass} ${typeClass}" data-task-id="${task.id}">
                <div class="flex items-center justify-between">
                    <div class="flex items-center">
                        <input type="checkbox" ${task.completed ? 'checked' : ''} 
                               class="task-checkbox w-5 h-5 text-purple-600 ml-3">
                        <div>
                            <h3 class="task-title font-medium text-gray-900 dark:text-white">
                                ${task.title}
                            </h3>
                            <div class="flex items-center mt-1">
                                <span class="review-badge ${task.type === 'مطالعه' ? 'activity-study' : 'priority-low'} text-xs">
                                    ${task.type}
                                </span>
                                <span class="text-sm text-gray-500 dark:text-gray-400 mr-2">
                                    ${PersianDate.toPersianNumbers(task.date)}
                                </span>
                            </div>
                        </div>
                    </div>
                    <div class="flex items-center space-x-2 space-x-reverse">
                        <button class="edit-task text-gray-400 hover:text-blue-600 transition-colors">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                            </svg>
                        </button>
                        <button class="delete-task text-gray-400 hover:text-red-600 transition-colors">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                            </svg>
                        </button>
                    </div>
                </div>
                ${task.reviews ? this.createReviewsPreview(task.reviews) : ''}
            </div>
        `;
    }

    createReviewsPreview(reviews) {
        if (!reviews || reviews.length === 0) return '';
        
        const upcomingReviews = reviews.filter(review => !review.completed).slice(0, 3);
        
        if (upcomingReviews.length === 0) return '';
        
        return `
            <div class="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
                <div class="text-xs text-gray-500 dark:text-gray-400 mb-2">مرورهای آینده:</div>
                <div class="flex flex-wrap gap-2">
                    ${upcomingReviews.map(review => `
                        <span class="review-badge ${this.getReviewClass(review.type)} text-xs">
                            ${review.type} - ${PersianDate.toPersianNumbers(review.date)}
                        </span>
                    `).join('')}
                </div>
            </div>
        `;
    }

    getReviewClass(reviewType) {
        switch (reviewType) {
            case 'مرور اول': return 'review1';
            case 'مرور دوم': return 'review2';
            case 'مرور سوم': return 'review3';
            case 'آزمون': return 'exam';
            default: return '';
        }
    }

    attachTaskEventListeners() {
        // Checkbox events
        const checkboxes = document.querySelectorAll('.task-checkbox');
        checkboxes.forEach(checkbox => {
            checkbox.addEventListener('change', (e) => {
                const taskElement = e.target.closest('.task-item');
                const taskId = taskElement.getAttribute('data-task-id');
                this.toggleTaskComplete(taskId, e.target.checked);
            });
        });

        // Edit button events
        const editButtons = document.querySelectorAll('.edit-task');
        editButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const taskElement = e.target.closest('.task-item');
                const taskId = taskElement.getAttribute('data-task-id');
                this.editTask(taskId);
            });
        });

        // Delete button events
        const deleteButtons = document.querySelectorAll('.delete-task');
        deleteButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const taskElement = e.target.closest('.task-item');
                const taskId = taskElement.getAttribute('data-task-id');
                this.deleteTask(taskId);
            });
        });
    }

    toggleTaskComplete(taskId, completed) {
        const success = this.storage.updateTask(taskId, { 
            completed,
            completedAt: completed ? new Date().toISOString() : null
        });
        
        if (success) {
            this.showNotification(
                completed ? 'کار تکمیل شد' : 'کار به‌عنوان ناتمام علامت‌گذاری شد', 
                'success'
            );
        }
    }

    editTask(taskId) {
        // Simple edit implementation - could be enhanced with a modal
        const data = this.storage.getData();
        const task = data.tasks.find(t => t.id === taskId);
        
        if (task) {
            const newTitle = prompt('عنوان جدید:', task.title);
            if (newTitle && newTitle.trim() !== task.title) {
                const success = this.storage.updateTask(taskId, { 
                    title: newTitle.trim(),
                    updatedAt: new Date().toISOString()
                });
                
                if (success) {
                    this.showNotification('کار ویرایش شد', 'success');
                    this.loadTodayTasks();
                }
            }
        }
    }

    deleteTask(taskId) {
        if (confirm('آیا از حذف این کار اطمینان دارید؟')) {
            const success = this.storage.deleteTask(taskId);
            
            if (success) {
                this.showNotification('کار حذف شد', 'success');
                this.loadTodayTasks();
            } else {
                this.showNotification('خطا در حذف کار', 'error');
            }
        }
    }

    showNotification(message, type = 'success') {
        const notification = document.getElementById('notification');
        const messageElement = document.getElementById('notification-message');
        
        if (!notification || !messageElement) return;
        
        messageElement.textContent = message;
        
        // Set notification style based on type
        notification.className = `fixed top-4 left-4 px-6 py-3 rounded-lg shadow-lg transform transition-all duration-300 z-50 ${
            type === 'success' ? 'bg-green-500' : 'bg-red-500'
        } text-white`;
        
        // Show notification
        notification.style.transform = 'translateY(0)';
        notification.style.opacity = '1';
        
        // Hide after 3 seconds
        setTimeout(() => {
            notification.style.transform = 'translateY(-100%)';
            notification.style.opacity = '0';
        }, 3000);
    }
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TaskManager;
}
