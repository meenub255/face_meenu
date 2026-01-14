import axios from 'axios';

const API_URL = 'http://localhost:8000';

export const api = axios.create({
    baseURL: API_URL,
});

// ----------------------------------------------------------------------
// Student Registration & Attendance
// ----------------------------------------------------------------------
export const registerStudent = async (studentData, images) => {
    const formData = new FormData();
    formData.append('name', studentData.name);
    formData.append('enrollment_number', studentData.enrollment_number);
    formData.append('enrollment_type', studentData.enrollment_type || 'FT');
    if (studentData.email) formData.append('email', studentData.email);
    if (studentData.phone) formData.append('phone', studentData.phone);

    images.forEach((image, index) => {
        formData.append('files', image, `image${index}.jpg`);
    });

    const response = await api.post('/register', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data;
};

export const recognizeStudent = async (images, sessionId = null) => {
    const formData = new FormData();
    if (sessionId) formData.append('session_id', sessionId);

    images.forEach((image, index) => {
        formData.append('files', image, `login_${index}.jpg`);
    });

    const response = await api.post('/recognize', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data;
};

export const detectBlink = async (imageBlob) => {
    const formData = new FormData();
    formData.append("file", imageBlob, "blink_check.jpg");
    const response = await api.post("/detect-blink", formData, {
        headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
};

export const getStudents = async () => {
    const response = await api.get('/students');
    return response.data;
};

export const deleteStudent = async (studentId) => {
    const response = await api.delete(`/students/${studentId}`);
    return response.data;
};

export const getAttendance = async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.student_id) params.append('student_id', filters.student_id);
    if (filters.start_date) params.append('start_date', filters.start_date);
    if (filters.end_date) params.append('end_date', filters.end_date);

    const response = await api.get(`/attendance?${params.toString()}`);
    return response.data;
};

export const exportAttendance = async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.student_id) params.append('student_id', filters.student_id);
    if (filters.start_date) params.append('start_date', filters.start_date);
    if (filters.end_date) params.append('end_date', filters.end_date);

    const response = await api.get(`/attendance/export?${params.toString()}`, {
        responseType: 'blob'
    });

    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'attendance.xlsx');
    document.body.appendChild(link);
    link.click();
    link.remove();
};

export const getStats = async () => {
    const response = await api.get('/stats');
    return response.data;
};

// ----------------------------------------------------------------------
// Admin CRUD Operations
// ----------------------------------------------------------------------

// Departments
export const getDepartments = async () => (await api.get('/admin/departments')).data;
export const createDepartment = async (data) => (await api.post('/admin/departments', data)).data;
export const deleteDepartment = async (id) => (await api.delete(`/admin/departments/${id}`)).data;

// Programs
export const getPrograms = async () => (await api.get('/admin/programs')).data;
export const createProgram = async (data) => (await api.post('/admin/programs', data)).data;
export const deleteProgram = async (id) => (await api.delete(`/admin/programs/${id}`)).data;

// Subjects
export const getSubjects = async () => (await api.get('/admin/subjects')).data;
export const createSubject = async (data) => (await api.post('/admin/subjects', data)).data;
export const deleteSubject = async (id) => (await api.delete(`/admin/subjects/${id}`)).data;

// Locations
export const getLocations = async () => (await api.get('/admin/locations')).data;
export const createLocation = async (data) => (await api.post('/admin/locations', data)).data;
export const deleteLocation = async (id) => (await api.delete(`/admin/locations/${id}`)).data;

// Faculty
export const getFaculty = async () => (await api.get('/admin/faculty')).data;
export const createFaculty = async (data) => (await api.post('/admin/faculty', data)).data;
export const deleteFaculty = async (id) => (await api.delete(`/admin/faculty/${id}`)).data;

// Course Offerings
export const getOfferings = async () => (await api.get('/admin/offerings')).data;
export const createOffering = async (data) => (await api.post('/admin/offerings', data)).data;
export const deleteOffering = async (id) => (await api.delete(`/admin/offerings/${id}`)).data;


// Admin Auth Stub
export const loginAdmin = async (username, password) => {
    if (username === 'admin' && password === 'admin') {
        const fakeUser = { status: 'success', username: 'admin' };
        localStorage.setItem('admin', JSON.stringify(fakeUser));
        return fakeUser;
    }
    return { status: 'error', detail: 'Invalid credentials (use admin/admin)' };
};

export const logoutAdmin = () => {
    localStorage.removeItem('admin');
};

export const isAdminLoggedIn = () => {
    return localStorage.getItem('admin') !== null;
};
