const API_BASE_URL = '/api';

class ApiService {
  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    const response = await fetch(url, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || `HTTP error! status: ${response.status}`);
    }

    return data;
  }

  // Scholarships API
  async getScholarships() {
    return this.request('/scholarships');
  }

  async getScholarship(id) {
    return this.request(`/scholarships/${id}`);
  }

  async createScholarship(scholarshipData) {
    return this.request('/scholarships', {
      method: 'POST',
      body: JSON.stringify(scholarshipData),
    });
  }

  async updateScholarship(id, scholarshipData) {
    return this.request(`/scholarships/${id}`, {
      method: 'PUT',
      body: JSON.stringify(scholarshipData),
    });
  }

  async deleteScholarship(id) {
    return this.request(`/scholarships/${id}`, {
      method: 'DELETE',
    });
  }

  // Applications API
  async getApplications() {
    return this.request('/applications');
  }

  async getStudentApplications(studentId) {
    return this.request(`/applications/student/${studentId}`);
  }

  async getApplication(id) {
    return this.request(`/applications/${id}`);
  }

  async createApplication(applicationData) {
    return this.request('/applications', {
      method: 'POST',
      body: JSON.stringify(applicationData),
    });
  }

  async updateApplication(id, applicationData) {
    return this.request(`/applications/${id}`, {
      method: 'PUT',
      body: JSON.stringify(applicationData),
    });
  }

  async deleteApplication(id) {
    return this.request(`/applications/${id}`, {
      method: 'DELETE',
    });
  }

  async getApplicationStats() {
    return this.request('/applications/stats/summary');
  }

  // Notifications API
  async getUserNotifications(userId) {
    return this.request(`/notifications/user/${userId}`);
  }

  async getUnreadNotificationsCount(userId) {
    return this.request(`/notifications/user/${userId}/unread-count`);
  }

  async createNotification(notificationData) {
    return this.request('/notifications', {
      method: 'POST',
      body: JSON.stringify(notificationData),
    });
  }

  async markNotificationAsRead(notificationId) {
    return this.request(`/notifications/${notificationId}/read`, {
      method: 'PUT',
    });
  }

  async markAllNotificationsAsRead(userId) {
    return this.request(`/notifications/user/${userId}/read-all`, {
      method: 'PUT',
    });
  }

  async deleteNotification(id) {
    return this.request(`/notifications/${id}`, {
      method: 'DELETE',
    });
  }

  // Documents API
  async getApplicationDocuments(applicationId) {
    return this.request(`/documents/application/${applicationId}`);
  }

  async getDocument(id) {
    return this.request(`/documents/${id}`);
  }

  async uploadDocument(documentData) {
    return this.request('/documents', {
      method: 'POST',
      body: JSON.stringify(documentData),
    });
  }

  async updateDocument(id, documentData) {
    return this.request(`/documents/${id}`, {
      method: 'PUT',
      body: JSON.stringify(documentData),
    });
  }

  async deleteDocument(id) {
    return this.request(`/documents/${id}`, {
      method: 'DELETE',
    });
  }

  // Students API
  async getStudents() {
    return this.request('/students');
  }

  async getStudent(id) {
    return this.request(`/students/${id}`);
  }

  async getStudentApplicationsFromAPI(studentId) {
    return this.request(`/students/${studentId}/applications`);
  }

  async getStudentProfileByUserId(userId) {
    return this.request(`/students/user/${userId}`);
  }

  async createStudentProfile(userId, profileData) {
    return this.request(`/students/user/${userId}`, {
      method: 'POST',
      body: JSON.stringify(profileData),
    });
  }

  async updateStudentProfile(userId, profileData) {
    return this.request(`/students/user/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  }

  async uploadStudentDocument(studentId, documentData) {
    return this.request(`/students/${studentId}/documents`, {
      method: 'POST',
      body: JSON.stringify(documentData),
    });
  }

  async getStudentDocuments(studentId) {
    return this.request(`/students/${studentId}/documents`);
  }

  // Users API - Authentication
  async registerUser(userData) {
    return this.request('/users/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async loginUser(credentials) {
    return this.request('/users/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async loginUserWithRole(email, password, role) {
    return this.request('/users/login', {
      method: 'POST',
      body: JSON.stringify({ email, password, role }),
    });
  }

  async getUser(id) {
    return this.request(`/users/${id}`);
  }

  // Reports API - Generate PDF reports
  async generateReport(reportType, dateRange) {
    const response = await fetch(`${API_BASE_URL}/reports/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ type: reportType, dateRange: dateRange }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Failed to generate report' }));
      throw new Error(errorData.error || 'Failed to generate report');
    }

    // Return blob for PDF download
    return response.blob();
  }

  // Scholarship Certificate API - Generate certificate for approved scholarship
  async generateScholarshipCertificate(applicationId) {
    const response = await fetch(`${API_BASE_URL}/reports/certificate/${applicationId}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/pdf',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Failed to generate certificate' }));
      throw new Error(errorData.error || 'Failed to generate certificate');
    }

    // Return blob for PDF download
    return response.blob();
  }

  // Scholarship List Report API - Generate scholarship list report with stats
  async generateScholarshipListReport() {
    const response = await fetch(`${API_BASE_URL}/reports/scholarship-list`, {
      method: 'GET',
      headers: {
        'Accept': 'application/pdf',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Failed to generate scholarship list report' }));
      throw new Error(errorData.error || 'Failed to generate scholarship list report');
    }

    // Return blob for PDF download
    return response.blob();
  }
}

export const apiService = new ApiService();
