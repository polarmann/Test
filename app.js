// Main Application Entry Point
class DailyTasksApp {
    constructor() {
        this.storage = new StorageManager();
        this.reviewSystem = new ReviewSystem(this.storage);
        this.taskManager = new TaskManager(this.storage, this.reviewSystem);
        
        this.initializeApp();
        this.setupEventListeners();
    }

    initializeApp() {
        // Set global references for components to access each other
        window.storage = this.storage;
        window.reviewSystem = this.reviewSystem;
        window.taskManager = this.taskManager;
        
        // Initialize theme
        this.initializeTheme();
        
        // Update current date display
        this.updateCurrentDate();
        
        // Load user settings
        this.loadUserSettings();
        
        console.log('Daily Tasks App initialized successfully');
    }

    initializeTheme() {
        const settings = this.storage.getSettings();
        const isDarkMode = settings.darkMode;
        
        if (isDarkMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
        
        // Update theme toggle button
        const themeToggle = document.getElementById('dark-mode-toggle');
        if (themeToggle) {
            themeToggle.checked = isDarkMode;
        }
    }

    updateCurrentDate() {
        const currentDateElement = document.getElementById('current-date');
        if (currentDateElement) {
            const today = PersianDate.today();
            const persianDate = PersianDate.toPersianNumbers(today.format());
            const dayName = today.getDayName();
            const monthName = today.getMonthName();
            
            currentDateElement.textContent = `${dayName}، ${today.day} ${monthName} ${today.year}`;
        }
    }

    loadUserSettings() {
        const settings = this.storage.getSettings();
        
        // Apply any settings that affect the UI immediately
        if (settings.notifications) {
            this.enableNotifications();
        }
    }

    setupEventListeners() {
        // Theme toggle
        const themeToggle = document.getElementById('theme-toggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', () => {
                this.toggleTheme();
            });
        }

        // Settings form
        this.setupSettingsHandlers();
        
        // Backup handlers
        this.setupBackupHandlers();
        
        // Keyboard shortcuts
        this.setupKeyboardShortcuts();
        
        // Page visibility change (for updating date when user returns)
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden) {
                this.updateCurrentDate();
                // Refresh current tab data
                if (window.tabManager) {
                    window.tabManager.handleTabSwitch(window.tabManager.getCurrentTab());
                }
            }
        });
    }

    toggleTheme() {
        const html = document.documentElement;
        const isDarkMode = html.classList.toggle('dark');
        
        // Save theme preference
        const settings = this.storage.getSettings();
        settings.darkMode = isDarkMode;
        this.storage.saveSettings(settings);
        
        // Update toggle state
        const darkModeToggle = document.getElementById('dark-mode-toggle');
        if (darkModeToggle) {
            darkModeToggle.checked = isDarkMode;
        }
        
        this.taskManager.showNotification(
            isDarkMode ? 'حالت تیره فعال شد' : 'حالت روشن فعال شد',
            'success'
        );
    }

    setupSettingsHandlers() {
        // Save settings button
        const saveSettingsBtn = document.getElementById('save-settings');
        if (saveSettingsBtn) {
            saveSettingsBtn.addEventListener('click', () => {
                this.saveSettings();
            });
        }

        // Dark mode toggle in settings
        const darkModeToggle = document.getElementById('dark-mode-toggle');
        if (darkModeToggle) {
            darkModeToggle.addEventListener('change', (e) => {
                const settings = this.storage.getSettings();
                settings.darkMode = e.target.checked;
                this.storage.saveSettings(settings);
                
                if (e.target.checked) {
                    document.documentElement.classList.add('dark');
                } else {
                    document.documentElement.classList.remove('dark');
                }
            });
        }
    }

    saveSettings() {
        const settings = this.storage.getSettings();
        
        // Get review interval values
        const review1Input = document.getElementById('review1-days');
        const review2Input = document.getElementById('review2-days');
        const review3Input = document.getElementById('review3-days');
        const examInput = document.getElementById('exam-days');
        
        if (review1Input && review2Input && review3Input && examInput) {
            const review1 = parseInt(review1Input.value);
            const review2 = parseInt(review2Input.value);
            const review3 = parseInt(review3Input.value);
            const exam = parseInt(examInput.value);
            
            // Validate values
            if (review1 < 1 || review2 < 1 || review3 < 1 || exam < 1) {
                this.taskManager.showNotification('فاصله مرورها باید حداقل ۱ روز باشد', 'error');
                return;
            }
            
            if (review1 >= review2 || review2 >= review3) {
                this.taskManager.showNotification('فاصله مرورها باید به ترتیب افزایش یابد', 'error');
                return;
            }
            
            // Save settings
            settings.reviewIntervals = {
                review1,
                review2,
                review3,
                exam
            };
            
            const success = this.storage.saveSettings(settings);
            
            if (success) {
                this.taskManager.showNotification('تنظیمات ذخیره شد', 'success');
            } else {
                this.taskManager.showNotification('خطا در ذخیره تنظیمات', 'error');
            }
        }
    }

    setupBackupHandlers() {
        // Backup data button
        const backupBtn = document.getElementById('backup-data');
        if (backupBtn) {
            backupBtn.addEventListener('click', () => {
                this.createBackup();
            });
        }

        // Restore data button
        const restoreBtn = document.getElementById('restore-data');
        if (restoreBtn) {
            restoreBtn.addEventListener('click', () => {
                const fileInput = document.getElementById('restore-file');
                if (fileInput) {
                    fileInput.click();
                }
            });
        }

        // File input for restore
        const restoreFile = document.getElementById('restore-file');
        if (restoreFile) {
            restoreFile.addEventListener('change', (e) => {
                const file = e.target.files[0];
                if (file) {
                    this.restoreBackup(file);
                }
            });
        }

        // Clear data button
        const clearBtn = document.getElementById('clear-data');
        if (clearBtn) {
            clearBtn.addEventListener('click', () => {
                this.clearAllData();
            });
        }
    }

    createBackup() {
        try {
            const data = this.storage.exportData();
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            
            const today = PersianDate.today();
            const filename = `daily-tasks-backup-${today.format().replace(/\//g, '-')}.json`;
            
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            a.click();
            
            URL.revokeObjectURL(url);
            
            this.taskManager.showNotification('فایل پشتیبان ایجاد شد', 'success');
        } catch (error) {
            console.error('Backup creation failed:', error);
            this.taskManager.showNotification('خطا در ایجاد پشتیبان', 'error');
        }
    }

    restoreBackup(file) {
        const reader = new FileReader();
        
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
                
                if (confirm('آیا از بازیابی داده‌ها اطمینان دارید؟ داده‌های فعلی حذف می‌شوند.')) {
                    const success = this.storage.importData(data);
                    
                    if (success) {
                        this.taskManager.showNotification('داده‌ها با موفقیت بازیابی شد', 'success');
                        
                        // Refresh current view
                        setTimeout(() => {
                            location.reload();
                        }, 1500);
                    } else {
                        this.taskManager.showNotification('خطا در بازیابی داده‌ها', 'error');
                    }
                }
            } catch (error) {
                console.error('Restore failed:', error);
                this.taskManager.showNotification('فایل پشتیبان معتبر نیست', 'error');
            }
        };
        
        reader.readAsText(file);
    }

    clearAllData() {
        if (confirm('آیا از حذف کامل همه داده‌ها اطمینان دارید؟ این عمل قابل بازگشت نیست.')) {
            if (confirm('این عمل همه کارها، مرورها و تنظیمات شما را حذف می‌کند. ادامه؟')) {
                const success = this.storage.clearAllData();
                
                if (success) {
                    this.taskManager.showNotification('همه داده‌ها حذف شد', 'success');
                    
                    // Refresh app
                    setTimeout(() => {
                        location.reload();
                    }, 1500);
                } else {
                    this.taskManager.showNotification('خطا در حذف داده‌ها', 'error');
                }
            }
        }
    }

    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Only handle shortcuts when not typing in inputs
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
                return;
            }
            
            // Ctrl/Cmd shortcuts
            if (e.ctrlKey || e.metaKey) {
                switch (e.key) {
                    case 'n': // New task
                        e.preventDefault();
                        window.tabManager.goToTab('today');
                        document.getElementById('task-title')?.focus();
                        break;
                    case 's': // Save/Settings
                        e.preventDefault();
                        window.tabManager.goToTab('settings');
                        break;
                    case 'b': // Backup
                        e.preventDefault();
                        window.tabManager.goToTab('backup');
                        break;
                }
            }
            
            // Number key shortcuts (1-9 for different tabs)
            if (e.key >= '1' && e.key <= '9') {
                const tabIndex = parseInt(e.key) - 1;
                const tabs = ['today', 'reviews', 'exams', 'archive', 'reports', 'settings', 'backup', 'help', 'contact'];
                if (tabs[tabIndex]) {
                    window.tabManager.goToTab(tabs[tabIndex]);
                }
            }
        });
    }

    enableNotifications() {
        // Request notification permission if supported
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission();
        }
    }

    // Method to show desktop notifications (for future use)
    showDesktopNotification(title, body, options = {}) {
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification(title, {
                body,
                icon: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 180 180"%3E%3Crect width="180" height="180" fill="%235D5CDE" rx="40"/%3E%3Cpath d="M45 90L75 120L135 60" stroke="white" stroke-width="8" stroke-linecap="round" stroke-linejoin="round" fill="none"/%3E%3C/svg%3E',
                ...options
            });
        }
    }

    // Get app statistics
    getAppStats() {
        const data = this.storage.getData();
        const reviewStats = this.reviewSystem.getReviewStats();
        
        return {
            totalTasks: data.tasks.length,
            completedTasks: data.tasks.filter(t => t.completed).length,
            studyTasks: data.tasks.filter(t => t.type === 'مطالعه').length,
            reviewStats,
            storageInfo: this.storage.getStorageInfo()
        };
    }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.app = new DailyTasksApp();
});

// Handle page load
window.addEventListener('load', () => {
    // Hide loading spinner if exists
    const loader = document.querySelector('.loading');
    if (loader) {
        loader.style.display = 'none';
    }
    
    // Show main content
    const main = document.querySelector('main');
    if (main) {
        main.style.opacity = '1';
    }
});

// Handle offline/online status
window.addEventListener('online', () => {
    if (window.taskManager) {
        window.taskManager.showNotification('اتصال اینترنت برقرار شد', 'success');
    }
});

window.addEventListener('offline', () => {
    if (window.taskManager) {
        window.taskManager.showNotification('در حالت آفلاین کار می‌کنید', 'success');
    }
});

// Export app class for testing or external access
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DailyTasksApp;
}
