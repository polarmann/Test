// Local Storage Management
class StorageManager {
    constructor() {
        this.STORAGE_KEY = 'daily-tasks-app';
        this.SETTINGS_KEY = 'daily-tasks-settings';
        this.initializeStorage();
    }

    // Initialize storage with default structure
    initializeStorage() {
        if (!localStorage.getItem(this.STORAGE_KEY)) {
            this.saveData({
                tasks: [],
                version: '1.0.0',
                lastUpdate: new Date().toISOString()
            });
        }

        if (!localStorage.getItem(this.SETTINGS_KEY)) {
            this.saveSettings({
                reviewIntervals: {
                    review1: 1,
                    review2: 3,
                    review3: 7,
                    exam: 14
                },
                darkMode: false,
                notifications: true,
                autoBackup: false
            });
        }
    }

    // Get all data
    getData() {
        try {
            const data = localStorage.getItem(this.STORAGE_KEY);
            return data ? JSON.parse(data) : { tasks: [] };
        } catch (error) {
            console.error('Error loading data from storage:', error);
            return { tasks: [] };
        }
    }

    // Save all data
    saveData(data) {
        try {
            data.lastUpdate = new Date().toISOString();
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
            return true;
        } catch (error) {
            console.error('Error saving data to storage:', error);
            return false;
        }
    }

    // Get settings
    getSettings() {
        try {
            const settings = localStorage.getItem(this.SETTINGS_KEY);
            return settings ? JSON.parse(settings) : {
                reviewIntervals: {
                    review1: 1,
                    review2: 3,
                    review3: 7,
                    exam: 14
                },
                darkMode: false,
                notifications: true,
                autoBackup: false
            };
        } catch (error) {
            console.error('Error loading settings from storage:', error);
            return {
                reviewIntervals: {
                    review1: 1,
                    review2: 3,
                    review3: 7,
                    exam: 14
                },
                darkMode: false,
                notifications: true,
                autoBackup: false
            };
        }
    }

    // Save settings
    saveSettings(settings) {
        try {
            localStorage.setItem(this.SETTINGS_KEY, JSON.stringify(settings));
            return true;
        } catch (error) {
            console.error('Error saving settings to storage:', error);
            return false;
        }
    }

    // Add new task
    addTask(task) {
        const data = this.getData();
        task.id = this.generateId();
        task.created = new Date().toISOString();
        task.completed = false;
        
        data.tasks.push(task);
        return this.saveData(data) ? task : null;
    }

    // Update task
    updateTask(taskId, updates) {
        const data = this.getData();
        const taskIndex = data.tasks.findIndex(task => task.id === taskId);
        
        if (taskIndex === -1) return false;
        
        data.tasks[taskIndex] = { ...data.tasks[taskIndex], ...updates };
        return this.saveData(data);
    }

    // Delete task
    deleteTask(taskId) {
        const data = this.getData();
        const initialLength = data.tasks.length;
        data.tasks = data.tasks.filter(task => task.id !== taskId);
        
        if (data.tasks.length < initialLength) {
            return this.saveData(data);
        }
        return false;
    }

    // Get tasks by date
    getTasksByDate(date) {
        const data = this.getData();
        return data.tasks.filter(task => {
            return task.date === date || 
                   (task.reviews && task.reviews.some(review => review.date === date));
        });
    }

    // Get reviews by date
    getReviewsByDate(date) {
        const data = this.getData();
        const reviews = [];
        
        data.tasks.forEach(task => {
            if (task.reviews) {
                task.reviews.forEach(review => {
                    if (review.date === date) {
                        reviews.push({
                            ...review,
                            parentTask: task,
                            taskId: task.id
                        });
                    }
                });
            }
        });
        
        return reviews;
    }

    // Mark review as completed
    completeReview(taskId, reviewType, reviewDate) {
        const data = this.getData();
        const task = data.tasks.find(t => t.id === taskId);
        
        if (!task || !task.reviews) return false;
        
        const review = task.reviews.find(r => r.type === reviewType && r.date === reviewDate);
        if (review) {
            review.completed = true;
            review.completedAt = new Date().toISOString();
            return this.saveData(data);
        }
        
        return false;
    }

    // Export data for backup
    exportData() {
        const data = this.getData();
        const settings = this.getSettings();
        
        return {
            ...data,
            settings,
            exportDate: new Date().toISOString(),
            version: '1.0.0'
        };
    }

    // Import data from backup
    importData(importedData) {
        try {
            // Validate imported data structure
            if (!importedData.tasks || !Array.isArray(importedData.tasks)) {
                throw new Error('Invalid data format');
            }

            // Save imported tasks
            const dataToSave = {
                tasks: importedData.tasks,
                version: importedData.version || '1.0.0',
                lastUpdate: new Date().toISOString()
            };
            
            this.saveData(dataToSave);

            // Save imported settings if available
            if (importedData.settings) {
                this.saveSettings(importedData.settings);
            }

            return true;
        } catch (error) {
            console.error('Error importing data:', error);
            return false;
        }
    }

    // Clear all data
    clearAllData() {
        try {
            localStorage.removeItem(this.STORAGE_KEY);
            localStorage.removeItem(this.SETTINGS_KEY);
            this.initializeStorage();
            return true;
        } catch (error) {
            console.error('Error clearing data:', error);
            return false;
        }
    }

    // Generate unique ID
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    // Get storage usage info
    getStorageInfo() {
        try {
            const data = JSON.stringify(this.getData());
            const settings = JSON.stringify(this.getSettings());
            
            return {
                dataSize: new Blob([data]).size,
                settingsSize: new Blob([settings]).size,
                totalTasks: this.getData().tasks.length,
                lastUpdate: this.getData().lastUpdate
            };
        } catch (error) {
            console.error('Error getting storage info:', error);
            return {
                dataSize: 0,
                settingsSize: 0,
                totalTasks: 0,
                lastUpdate: null
            };
        }
    }
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = StorageManager;
}
