import axios from 'axios';

const API_URL = 'http://localhost:8000';

export const api = axios.create({
    baseURL: API_URL,
});

export const registerUser = async (name, images) => {
    const formData = new FormData();
    formData.append('name', name);
    images.forEach((image, index) => {
        // images are base64 strings or blobs. better if blobs.
        // If base64, convert to blob.
        // Assuming the component passes Blobs or Files.
        formData.append('files', image, `image${index}.jpg`);
    });

    const response = await api.post('/register', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data;
};

export const loginUser = async (images) => {
    const formData = new FormData();
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

export const getUsers = async () => {
    const response = await api.get('/users');
    return response.data;
};

export const deleteUser = async (userId) => {
    const response = await api.delete(`/users/${userId}`);
    return response.data;
};

export const getAttendance = async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.user_id) params.append('user_id', filters.user_id);
    if (filters.start_date) params.append('start_date', filters.start_date);
    if (filters.end_date) params.append('end_date', filters.end_date);

    const response = await api.get(`/attendance?${params.toString()}`);
    return response.data;
};

export const exportAttendance = async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.user_id) params.append('user_id', filters.user_id);
    if (filters.start_date) params.append('start_date', filters.start_date);
    if (filters.end_date) params.append('end_date', filters.end_date);

    const response = await api.get(`/attendance/export?${params.toString()}`, {
        responseType: 'blob'
    });

    // Trigger download
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'attendance.csv');
    document.body.appendChild(link);
    link.click();
    link.remove();
};

export const registerAdmin = async (username, password) => {
    const response = await api.post('/admin/register', { username, password });
    return response.data;
};

export const loginAdmin = async (username, password) => {
    const response = await api.post('/admin/login', { username, password });
    if (response.data.status === 'success') {
        localStorage.setItem('admin', JSON.stringify(response.data));
    }
    return response.data;
};

export const logoutAdmin = () => {
    localStorage.removeItem('admin');
};

export const isAdminLoggedIn = () => {
    return localStorage.getItem('admin') !== null;
};

export const getStats = async () => {
    const response = await api.get('/stats');
    return response.data;
};
