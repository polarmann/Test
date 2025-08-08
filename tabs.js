// Tab Management Component
class TabManager {
    constructor() {
        this.currentTab = 'today';
        this.initializeTabs();
    }

    initializeTabs() {
        // Add click event listeners to all tab buttons
        const tabButtons = document.querySelectorAll('.tab-button');
        tabButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const tabId = e.target.getAttribute('data-tab');
                this.switchTab(tabId);
            });
        });

        // Show default tab
        this.switchTab(this.currentTab);
    }

    switchTab(tabId) {
        // Hide all tab contents
        const tabContents = document.querySelectorAll('.tab-content');
        tabContents.forEach(content => {
            content.classList.add('hidden');
            content.classList.remove('fade-in');
        });

        // Remove active class from all tab buttons
        const tabButtons = document.querySelectorAll('.tab-button');
        tabButtons.forEach(button => {
            button.classList.remove('active');
        });

        // Show selected tab content
        const selectedContent = document.getElementById(`tab-${tabId}`);
        if (selectedContent) {
            selectedContent.classList.remove('hidden');
            selectedContent.classList.add('fade-in');
        }

        // Add active class to selected tab button
        const selectedButton = document.querySelector(`[data-tab="${tabId}"]`);
        if (selectedButton) {
            selectedButton.classList.add('active');
        }

        // Update current tab
        this.currentTab = tabId;

        // Trigger tab-specific initialization
        this.handleTabSwitch(tabId);
    }

    handleTabSwitch(tabId) {
        switch (tabId) {
            case 'today':
                if (window.taskManager) {
                    window.taskManager.loadTodayTasks();
                }
                break;
            case 'reviews':
                if (window.reviewSystem) {
                    window.reviewSystem.loadTodayReviews();
                }
                break;
            case 'settings':
                this.loadSettings();
                break;
            case 'backup':
                this.updateBackupInfo();
                break;
            default:
                // Handle other tabs that might be implemented later
                break;
        }
    }

    loadSettings() {
        if (!window.storage) return;
        
        const settings = window.storage.getSettings();
        
        // Load review interval settings
        const review1Input = document.getElementById('review1-days');
        const review2Input = document.getElementById('review2-days');
        const review3Input = document.getElementById('review3-days');
        const examInput = document.getElementById('exam-days');
        
        if (review1Input) review1Input.value = settings.reviewIntervals.review1;
        if (review2Input) review2Input.value = settings.reviewIntervals.review2;
        if (review3Input) review3Input.value = settings.reviewIntervals.review3;
        if (examInput) examInput.value = settings.reviewIntervals.exam;
        
        // Load dark mode setting
        const darkModeToggle = document.getElementById('dark-mode-toggle');
        if (darkModeToggle) {
            darkModeToggle.checked = settings.darkMode;
        }
    }

    updateBackupInfo() {
        if (!window.storage) return;
        
        const info = window.storage.getStorageInfo();
        
        // Update backup section with storage info (if elements exist)
        const storageInfo = document.getElementById('storage-info');
        if (storageInfo) {
            storageInfo.innerHTML = `
                <div class="text-sm text-gray-600 dark:text-gray-400 space-y-2">
                    <p>تعداد کل کارها: ${info.totalTasks}</p>
                    <p>حجم داده‌ها: ${Math.round(info.dataSize / 1024)} کیلوبایت</p>
                    <p>آخرین به‌روزرسانی: ${info.lastUpdate ? new Date(info.lastUpdate).toLocaleDateString('fa-IR') : 'نامشخص'}</p>
                </div>
            `;
        }
    }

    getCurrentTab() {
        return this.currentTab;
    }

    // Method to programmatically switch to a tab
    goToTab(tabId) {
        this.switchTab(tabId);
    }
}

// Initialize tab manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    if (!window.tabManager) {
        window.tabManager = new TabManager();
    }
});

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TabManager;
}
