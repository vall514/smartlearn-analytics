import axios from 'axios'

const API = axios.create({
    baseURL: 'http://127.0.0.1:8000/api',
})

// Automatically attach token to every request
API.interceptors.request.use((config) => {
    const token = localStorage.getItem('token')
    if (token) {
        config.headers.Authorization = `Bearer ${token}`
    }
    return config
})

export const loginTeacher = (data) => API.post('/auth/login/', data)
export const signupTeacher = (data) => API.post('/auth/signup/', data)
export const getStudents = () => API.get('/students/')
export const getAtRiskStudents = () => API.get('/predictions/at-risk-students/')

export default API