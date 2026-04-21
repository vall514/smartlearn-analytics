import axios from 'axios'

const API = axios.create({
    baseURL: 'http://127.0.0.1:8000/api',
})

const AUTH_FREE_PATHS = [
    '/auth/login/',
    '/auth/signup/',
    '/auth/token/refresh/',
]

const isAuthFreeRequest = (url = '') => AUTH_FREE_PATHS.some((path) => url.includes(path))

API.interceptors.request.use((config) => {
    const token = localStorage.getItem('token')
    if (token && !isAuthFreeRequest(config.url)) {
        config.headers.Authorization = `Bearer ${token}`
    }
    return config
})

API.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config
        const status = error.response?.status

        if (
            status === 401 &&
            originalRequest &&
            !originalRequest._retry &&
            !isAuthFreeRequest(originalRequest.url)
        ) {
            const refreshToken = localStorage.getItem('refresh')
            if (!refreshToken) {
                localStorage.removeItem('token')
                localStorage.removeItem('refresh')
                localStorage.removeItem('teacher')
                return Promise.reject(error)
            }

            originalRequest._retry = true

            try {
                const refreshResponse = await API.post('/auth/token/refresh/', {
                    refresh: refreshToken,
                })
                const newAccessToken = refreshResponse.data.access

                localStorage.setItem('token', newAccessToken)
                originalRequest.headers.Authorization = `Bearer ${newAccessToken}`
                return API(originalRequest)
            } catch (refreshError) {
                localStorage.removeItem('token')
                localStorage.removeItem('refresh')
                localStorage.removeItem('teacher')
                return Promise.reject(refreshError)
            }
        }

        return Promise.reject(error)
    }
)

export const loginTeacher = (data) => API.post('/auth/login/', data)
export const signupTeacher = (data) => API.post('/auth/signup/', data)
export const getStudents = () => API.get('/students/')
export const addStudent = (data) => API.post('/students/', data)
export const deleteStudent = (id) => API.delete(`/students/${id}/`)
export const getStudentInsights = (id) => API.get(`/students/${id}/insights/`)
export const getSubjects = () => API.get('/subjects/')
export const addExam = (data) => API.post('/exams/', data)
export const addAttendance = (data) => API.post('/attendances/', data)
export const addAssignment = (data) => API.post('/assignments/', data)
export const addTopicPerformance = (data) => API.post('/topic-performances/', data)
export const getAtRiskStudents = () => API.get('/predictions/at-risk-students/')

export default API