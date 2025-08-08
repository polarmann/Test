// Review System Component
class ReviewSystem {
    constructor(storage) {
        this.storage = storage;
        this.defaultIntervals = {
            review1: 1,
            review2: 3,
            review3: 7,
            exam: 14
        };
    }

    // Generate review schedule for a study task
    generateReviews(studyDate) {
        const settings = this.storage.getSettings();
        const intervals = settings.reviewIntervals || this.defaultIntervals;
        
        const reviews = [];
        
        // Generate each review
        reviews.push({
            type: 'مرور اول',
            date: studyDate.addDays(intervals.review1).format(),
            completed: false
        });
        
        reviews.push({
            type: 'مرور دوم',
            date: studyDate.addDays(intervals.review2).format(),
            completed: false
        });
        
        reviews.push({
            type: 'مرور سوم',
            date: studyDate.addDays(intervals.review3).format(),
            completed: false
        });
        
        reviews.push({
            type: 'آزمون',
            date: studyDate.addDays(intervals.exam).format(),
            completed: false
        });
        
        return reviews;
    }

    // Load today's reviews
    loadTodayReviews() {
        const today = PersianDate.today().format();
        const reviews = this.storage.getReviewsByDate(today);
        
        this.renderReviews(reviews);
    }

    // Render reviews in the UI
    renderReviews(reviews) {
        const container = document.getElementById('reviews-list');
        if (!container) return;

        if (reviews.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                    </svg>
                    <h3 class="text-lg font-medium mb-2">مروری برای امروز وجود ندارد</h3>
                    <p>مرورهای شما با توجه به برنامه علمی تنظیم می‌شود</p>
                </div>
            `;
            return;
        }

        container.innerHTML = reviews.map(review => this.createReviewHTML(review)).join('');
        
        // Add event listeners
        this.attachReviewEventListeners();
    }

    // Create HTML for a single review
    createReviewHTML(review) {
        const completedClass = review.completed ? 'completed' : '';
        const typeClass = this.getReviewTypeClass(review.type);
        
        return `
            <div class="task-item task-card ${completedClass} ${typeClass}" 
                 data-task-id="${review.taskId}" 
                 data-review-type="${review.type}"
                 data-review-date="${review.date}">
                <div class="flex items-center justify-between">
                    <div class="flex items-center">
                        <input type="checkbox" ${review.completed ? 'checked' : ''} 
                               class="review-checkbox w-5 h-5 text-purple-600 ml-3">
                        <div>
                            <h3 class="task-title font-medium text-gray-900 dark:text-white">
                                ${review.type}: ${review.parentTask.title}
                            </h3>
                            <div class="flex items-center mt-1">
                                <span class="review-badge ${this.getReviewClass(review.type)} text-xs">
                                    ${review.type}
                                </span>
                                <span class="text-sm text-gray-500 dark:text-gray-400 mr-2">
                                    مطالعه اصلی: ${PersianDate.toPersianNumbers(review.parentTask.date)}
                                </span>
                            </div>
                        </div>
                    </div>
                    <div class="flex items-center space-x-2 space-x-reverse">
                        <button class="view-task text-gray-400 hover:text-blue-600 transition-colors" 
                                title="مشاهده کار اصلی">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                            </svg>
                        </button>
                        <button class="postpone-review text-gray-400 hover:text-yellow-600 transition-colors"
                                title="به تعویق انداختن">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                            </svg>
                        </button>
                    </div>
                </div>
                <div class="mt-2 text-sm text-gray-600 dark:text-gray-400">
                    <p class="mb-1">
                        <strong>کار اصلی:</strong> ${review.parentTask.title}
                    </p>
                    <p>
                        <strong>نوع فعالیت:</strong> ${review.parentTask.type}
                    </p>
                </div>
            </div>
        `;
    }

    // Get CSS class for review type
    getReviewTypeClass(reviewType) {
        switch (reviewType) {
            case 'مرور اول': return 'priority-medium';
            case 'مرور دوم': return 'priority-medium';
            case 'مرور سوم': return 'priority-high';
            case 'آزمون': return 'priority-high';
            default: return 'priority-low';
        }
    }

    // Get badge class for review type
    getReviewClass(reviewType) {
        switch (reviewType) {
            case 'مرور اول': return 'review1';
            case 'مرور دوم': return 'review2';
            case 'مرور سوم': return 'review3';
            case 'آزمون': return 'exam';
            default: return '';
        }
    }

    // Attach event listeners to review elements
    attachReviewEventListeners() {
        // Checkbox events
        const checkboxes = document.querySelectorAll('.review-checkbox');
        checkboxes.forEach(checkbox => {
            checkbox.addEventListener('change', (e) => {
                const reviewElement = e.target.closest('.task-item');
                const taskId = reviewElement.getAttribute('data-task-id');
                const reviewType = reviewElement.getAttribute('data-review-type');
                const reviewDate = reviewElement.getAttribute('data-review-date');
                this.toggleReviewComplete(taskId, reviewType, reviewDate, e.target.checked);
            });
        });

        // View task events
        const viewButtons = document.querySelectorAll('.view-task');
        viewButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const reviewElement = e.target.closest('.task-item');
                const taskId = reviewElement.getAttribute('data-task-id');
                this.viewParentTask(taskId);
            });
        });

        // Postpone review events
        const postponeButtons = document.querySelectorAll('.postpone-review');
        postponeButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const reviewElement = e.target.closest('.task-item');
                const taskId = reviewElement.getAttribute('data-task-id');
                const reviewType = reviewElement.getAttribute('data-review-type');
                const reviewDate = reviewElement.getAttribute('data-review-date');
                this.postponeReview(taskId, reviewType, reviewDate);
            });
        });
    }

    // Toggle review completion
    toggleReviewComplete(taskId, reviewType, reviewDate, completed) {
        const success = this.storage.completeReview(taskId, reviewType, reviewDate);
        
        if (success) {
            this.showNotification(
                completed ? 'مرور تکمیل شد' : 'مرور به‌عنوان ناتمام علامت‌گذاری شد', 
                'success'
            );
        } else {
            this.showNotification('خطا در به‌روزرسانی مرور', 'error');
        }
    }

    // View parent task details
    viewParentTask(taskId) {
        const data = this.storage.getData();
        const task = data.tasks.find(t => t.id === taskId);
        
        if (task) {
            // Show task details in an alert (could be enhanced with a modal)
            const taskDate = PersianDate.fromString(task.date);
            const info = `
                عنوان: ${task.title}
                نوع: ${task.type}
                تاریخ مطالعه: ${PersianDate.toPersianNumbers(task.date)} (${taskDate.getDayName()})
                وضعیت: ${task.completed ? 'تکمیل شده' : 'در انتظار'}
                ${task.reviews ? `\nتعداد مرورها: ${task.reviews.length}` : ''}
            `;
            alert(info);
        }
    }

    // Postpone review to next day
    postponeReview(taskId, reviewType, reviewDate) {
        if (confirm('آیا می‌خواهید این مرور را به فردا موکول کنید؟')) {
            const data = this.storage.getData();
            const task = data.tasks.find(t => t.id === taskId);
            
            if (task && task.reviews) {
                const review = task.reviews.find(r => r.type === reviewType && r.date === reviewDate);
                if (review) {
                    // Move to next day
                    const currentDate = PersianDate.fromString(review.date);
                    const nextDay = currentDate.addDays(1);
                    review.date = nextDay.format();
                    review.postponed = (review.postponed || 0) + 1;
                    
                    const success = this.storage.updateTask(taskId, { reviews: task.reviews });
                    
                    if (success) {
                        this.showNotification('مرور به فردا موکول شد', 'success');
                        this.loadTodayReviews();
                    } else {
                        this.showNotification('خطا در به‌روزرسانی مرور', 'error');
                    }
                }
            }
        }
    }

    // Show notification
    showNotification(message, type = 'success') {
        if (window.taskManager && typeof window.taskManager.showNotification === 'function') {
            window.taskManager.showNotification(message, type);
        }
    }

    // Get review statistics
    getReviewStats() {
        const data = this.storage.getData();
        const stats = {
            total: 0,
            completed: 0,
            pending: 0,
            overdue: 0,
            byType: {
                'مرور اول': { total: 0, completed: 0 },
                'مرور دوم': { total: 0, completed: 0 },
                'مرور سوم': { total: 0, completed: 0 },
                'آزمون': { total: 0, completed: 0 }
            }
        };
        
        const today = PersianDate.today();
        
        data.tasks.forEach(task => {
            if (task.reviews) {
                task.reviews.forEach(review => {
                    const reviewDate = PersianDate.fromString(review.date);
                    
                    stats.total++;
                    stats.byType[review.type].total++;
                    
                    if (review.completed) {
                        stats.completed++;
                        stats.byType[review.type].completed++;
                    } else {
                        stats.pending++;
                        if (reviewDate.isBefore(today)) {
                            stats.overdue++;
                        }
                    }
                });
            }
        });
        
        return stats;
    }
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ReviewSystem;
}
