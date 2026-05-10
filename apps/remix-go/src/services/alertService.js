// Alert service for showing notifications and messages in remix-go
// This replaces the original alert service from the main app

class AlertService {
  constructor() {
    this.alerts = [];
  }

  showInfo(message, title = 'Info', duration = 3000) {
    this.showAlert('info', title, message, duration);
  }

  showError(message, title = 'Error', duration = 5000) {
    this.showAlert('error', title, message, duration);
    console.error(`${title}: ${message}`);
  }

  showSuccess(message, title = 'Success', duration = 3000) {
    this.showAlert('success', title, message, duration);
  }

  showWarning(message, title = 'Warning', duration = 4000) {
    this.showAlert('warning', title, message, duration);
  }

  showAlert(type, title, message, duration = 3000) {
    const alert = {
      id: Date.now(),
      type,
      title,
      message,
      timestamp: new Date(),
    };

    this.alerts.push(alert);

    // In a real implementation, this would trigger UI notifications
    // For now, we'll just log to console
    console.log(`[${type.toUpperCase()}] ${title}: ${message}`);

    // Auto-remove after duration
    if (duration > 0) {
      setTimeout(() => {
        this.removeAlert(alert.id);
      }, duration);
    }

    return alert.id;
  }

  removeAlert(id) {
    this.alerts = this.alerts.filter(alert => alert.id !== id);
  }

  getAlerts() {
    return this.alerts;
  }

  clearAll() {
    this.alerts = [];
  }
}

const alertService = new AlertService();

// Export functions for backward compatibility
export const showInfo = alertService.showInfo.bind(alertService);
export const showError = alertService.showError.bind(alertService);
export const showSuccess = alertService.showSuccess.bind(alertService);
export const showWarning = alertService.showWarning.bind(alertService);

export default alertService;