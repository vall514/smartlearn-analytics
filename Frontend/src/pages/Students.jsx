import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getStudents, addStudent, deleteStudent } from '../utils/api'
import AppNav from '../components/AppNav'

export default function Students() {
  const navigate = useNavigate()
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    admission_number: '',
    student_class: '',
    stream: '',
  })
  const [formError, setFormError] = useState('')
  const [formLoading, setFormLoading] = useState(false)

  const fetchStudents = async () => {
    try {
      setLoading(true)
      const response = await getStudents()
      setStudents(response.data)
      setError(null)
    } catch (err) {
      if (err.response?.status === 401) {
        localStorage.removeItem('token')
        localStorage.removeItem('refresh')
        localStorage.removeItem('teacher')
        navigate('/login')
      } else {
        setError('Failed to load students')
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStudents()
  }, [])

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setFormLoading(true)
    setFormError('')
    try {
      await addStudent(formData)
      setFormData({ name: '', admission_number: '', student_class: '', stream: '' })
      setShowForm(false)
      fetchStudents()
    } catch (err) {
      if (err.response?.status === 401) {
        localStorage.removeItem('token')
        localStorage.removeItem('refresh')
        localStorage.removeItem('teacher')
        navigate('/login')
        return
      }

      const data = err.response?.data
      if (typeof data === 'object' && data !== null) {
        const firstFieldError = Object.values(data).find((value) => Array.isArray(value) && value.length > 0)
        if (firstFieldError) {
          setFormError(firstFieldError[0])
        } else {
          setFormError(data.error || data.detail || 'Failed to add student.')
        }
      } else {
        setFormError('Failed to add student.')
      }
    } finally {
      setFormLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this student?')) {
      try {
        await deleteStudent(id)
        fetchStudents()
      } catch (err) {
        alert('Failed to delete student')
      }
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <AppNav
        rightActions={(
          <button
            onClick={() => setShowForm(true)}
            className="bg-teal-600 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-teal-700 transition"
          >
            + Add Student
          </button>
        )}
      />

      {/* Header */}
      <div className="flex justify-between items-center my-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Students</h2>
          <p className="text-gray-500 text-sm">Manage your students ({students.length} total)</p>
        </div>
      </div>

      {/* Add Student Form Popup */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md mx-4">
            <h3 className="text-lg font-bold text-gray-900 mb-6">Add New Student</h3>

            {formError && (
              <div className="bg-amber-50 text-amber-700 px-4 py-3 rounded-lg mb-4 text-sm border border-amber-200">
                {formError}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g. John Doe"
                  required
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Admission Number
                </label>
                <input
                  type="text"
                  name="admission_number"
                  value={formData.admission_number}
                  onChange={handleChange}
                  placeholder="e.g. ADM001"
                  required
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Class
                </label>
                <select
                  name="student_class"
                  value={formData.student_class}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option value="">Select class</option>
                  <option value="Form 1">Form 1</option>
                  <option value="Form 2">Form 2</option>
                  <option value="Form 3">Form 3</option>
                  <option value="Form 4">Form 4</option>
                </select>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Stream
                </label>
                <input
                  type="text"
                  name="stream"
                  value={formData.stream}
                  onChange={handleChange}
                  placeholder="e.g. East, West, North"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 bg-gray-100 text-gray-700 py-2.5 rounded-lg font-medium hover:bg-gray-200 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="flex-1 bg-teal-600 text-white py-2.5 rounded-lg font-medium hover:bg-teal-700 transition disabled:opacity-50"
                >
                  {formLoading ? 'Adding...' : 'Add Student'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-amber-800 mb-6">
          {error}
        </div>
      )}

      {/* Students Table */}
      <div className="bg-white rounded-2xl shadow overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
          </div>
        ) : students.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-500 text-lg">No students added yet</p>
            <p className="text-gray-400 text-sm mt-2">Click "Add Student" to get started</p>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Name</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Admission No.</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Class</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Stream</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {students.map((student) => (
                <tr key={student.id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-teal-100 rounded-full flex items-center justify-center text-teal-700 font-semibold text-sm">
                        {student.name.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-medium text-gray-900">{student.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-600">{student.admission_number}</td>
                  <td className="px-6 py-4 text-gray-600">{student.student_class}</td>
                  <td className="px-6 py-4 text-gray-600">{student.stream || '—'}</td>
                  <td className="px-6 py-4">
                    <div className="flex gap-3">
                      <button
                        onClick={() => navigate(`/students/${student.id}/insights`)}
                        className="text-teal-600 hover:text-teal-700 text-sm font-medium transition"
                      >
                        Insights
                      </button>
                      <button
                        onClick={() => handleDelete(student.id)}
                        className="text-amber-700 hover:text-amber-800 text-sm font-medium transition"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}