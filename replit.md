# Overview

A Persian-language daily task management web application specifically designed for scientific learning and systematic review scheduling. The application uses the Persian (Jalali) calendar system and implements automatic review generation based on spaced repetition principles for study tasks. Built as a Progressive Web App (PWA) with offline capabilities and a responsive design optimized for personal productivity workflows.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
The application follows a component-based vanilla JavaScript architecture with modular class organization:

- **Main Application Controller**: `DailyTasksApp` class serves as the entry point and coordinates all components
- **Component-Based Structure**: Separate classes for TaskManager, ReviewSystem, TabManager, and StorageManager
- **Persian Date System**: Custom `PersianDate` class for complete Jalali calendar support without external dependencies
- **Responsive Design**: TailwindCSS for styling with dark/light theme support
- **Progressive Web App**: PWA capabilities with offline functionality and mobile app-like experience

## Data Storage Architecture
- **Local Storage**: Browser localStorage for data persistence without server dependencies
- **JSON-Based Schema**: Simple JSON structure for tasks, settings, and user preferences
- **Version Management**: Built-in data versioning for future migrations
- **Backup System**: Optional auto-backup functionality for data preservation

## Review System Architecture
The core scientific learning feature implements spaced repetition methodology:

- **Automatic Review Generation**: Creates review schedules (1, 3, 7, 14 days) for study tasks
- **Persian Calendar Integration**: All dates stored and processed in Jalali format
- **Configurable Intervals**: User-customizable review timing through settings
- **Progress Tracking**: Review completion status and analytics

## Navigation and Routing
- **Tab-Based Interface**: Client-side tab management for different application sections
- **Extensible Structure**: Prepared for future page additions with modular tab system
- **State Management**: Current tab persistence and navigation state handling

## Theme and Accessibility
- **Dual Theme Support**: Light and dark mode with system preference detection
- **RTL Layout**: Right-to-left text direction for Persian language support
- **Persian Typography**: Vazirmatn font family for optimal Persian text rendering
- **Responsive Grid**: Mobile-first design with flexible layouts

# External Dependencies

## Frontend Libraries
- **TailwindCSS**: Utility-first CSS framework loaded via CDN for rapid styling
- **Chart.js**: Data visualization library for task analytics and progress charts
- **Google Fonts**: Vazirmatn Persian font family for typography

## Browser APIs
- **localStorage**: Primary data persistence mechanism
- **Service Worker**: PWA offline functionality and caching
- **Web App Manifest**: Mobile app installation capabilities

## Development Tools
- **No Build Process**: Direct browser execution without compilation steps
- **CDN Dependencies**: External libraries loaded from CDNs for simplicity
- **Progressive Enhancement**: Core functionality works without JavaScript dependencies

The application is designed as a self-contained web application that can run entirely in the browser without server infrastructure, making it ideal for personal use and easy deployment.