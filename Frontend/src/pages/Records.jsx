import { useEffect, useMemo, useState } from 'react'
import AppNav from '../components/AppNav'
import {
  getStudents,
  getSubjects,
  addExam,
  addAttendance,
  addAssignment,
  addTopicPerformance,
} from '../utils/api'

const initialExam = {
  student: '',
  subject: '',
  score: '',
  term: 'FIRST_TERM',
  exam_type: 'Exam',
  date: '',
}

const initialAttendance = {
  student: '',
  subject: '',
  status: 'present',
  date: '',
}

const initialAssignment = {
  student: '',
  subject: '',
  title: '',
  due_date: '',
  submission_date: '',
  score: '',
  max_score: 100,
}

const initialTopic = {
  student: '',
  subject: '',
  topic: '',
  score: '',
  max_score: 100,
  assessment_date: '',
}

function FieldError({ message }) {
  if (!message) return null
  return <p className="mt-2 text-sm text-amber-700">{message}</p>
}

export default function Records() {
  const [students, setStudents] = useState([])
  const [subjects, setSubjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('exam')
  const [statusMessage, setStatusMessage] = useState('')

  const [examForm, setExamForm] = useState(initialExam)
  const [attendanceForm, setAttendanceForm] = useState(initialAttendance)
  const [assignmentForm, setAssignmentForm] = useState(initialAssignment)
  const [topicForm, setTopicForm] = useState(initialTopic)

  const [formErrors, setFormErrors] = useState({})
  const teacher = JSON.parse(localStorage.getItem('teacher') || '{}')

  const isAdmin = Boolean(teacher.is_staff || teacher.is_superuser)

  const studentOptions = useMemo(() => students, [students])
  const subjectOptions = useMemo(() => subjects, [subjects])

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const [studentsResponse, subjectsResponse] = await Promise.all([getStudents(), getSubjects()])
        setStudents(studentsResponse.data || [])
        setSubjects(subjectsResponse.data || [])
      } catch (error) {
        setStatusMessage(error.response?.data?.detail || 'Failed to load record form data.')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const extractError = (error, fallback) => {
    const data = error.response?.data
    if (typeof data === 'object' && data !== null) {
      const firstFieldError = Object.values(data).find((value) => Array.isArray(value) && value.length > 0)
      if (firstFieldError) {
        return firstFieldError[0]
      }
      return data.detail || data.error || fallback
    }
    return fallback
  }

  const handleSuccess = (message, resetForm) => {
    setStatusMessage(message)
    setFormErrors({})
    resetForm()
    setTimeout(() => setStatusMessage(''), 3000)
  }

  const submitExam = async (event) => {
    event.preventDefault()
    try {
      await addExam({
        ...examForm,
        score: Number(examForm.score),
      })
      handleSuccess('Exam record saved successfully.', () => setExamForm(initialExam))
    } catch (error) {
      setFormErrors((prev) => ({ ...prev, exam: extractError(error, 'Failed to save exam record.') }))
    }
  }

  const submitAttendance = async (event) => {
    event.preventDefault()
    try {
      await addAttendance(attendanceForm)
      handleSuccess('Attendance saved successfully.', () => setAttendanceForm(initialAttendance))
    } catch (error) {
      setFormErrors((prev) => ({ ...prev, attendance: extractError(error, 'Failed to save attendance.') }))
    }
  }

  const submitAssignment = async (event) => {
    event.preventDefault()
    try {
      await addAssignment({
        ...assignmentForm,
        score: assignmentForm.score === '' ? null : Number(assignmentForm.score),
        max_score: Number(assignmentForm.max_score),
        submission_date: assignmentForm.submission_date || null,
      })
      handleSuccess('Assignment saved successfully.', () => setAssignmentForm(initialAssignment))
    } catch (error) {
      setFormErrors((prev) => ({ ...prev, assignment: extractError(error, 'Failed to save assignment.') }))
    }
  }

  const submitTopic = async (event) => {
    event.preventDefault()
    try {
      await addTopicPerformance({
        ...topicForm,
        score: Number(topicForm.score),
        max_score: Number(topicForm.max_score),
      })
      handleSuccess('Topic performance saved successfully.', () => setTopicForm(initialTopic))
    } catch (error) {
      setFormErrors((prev) => ({ ...prev, topic: extractError(error, 'Failed to save topic performance.') }))
    }
  }

  const cardBase = 'bg-white/95 rounded-2xl border border-gray-100 shadow-sm p-6'

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-cyan-50 to-indigo-100 p-6 md:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <AppNav />

        <div className="bg-white/95 rounded-3xl border border-cyan-100 p-8 shadow-lg">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm font-semibold text-cyan-600 uppercase tracking-wide">Frontend data entry</p>
              <h1 className="text-3xl font-bold text-gray-900 mt-1">Records</h1>
              <p className="text-gray-600 mt-2 max-w-2xl">
                Teachers can add student-linked academic data here. Admins can use the same page to manage the whole school.
              </p>
            </div>
            <div className="rounded-2xl bg-cyan-50 border border-cyan-100 px-4 py-3 text-sm text-cyan-800">
              {isAdmin ? 'Admin access enabled' : 'Teacher access enabled'}
            </div>
          </div>
        </div>

        {statusMessage && (
          <div className="rounded-2xl border border-cyan-100 bg-white px-4 py-3 text-sm text-cyan-800 shadow-sm">
            {statusMessage}
          </div>
        )}

        {loading ? (
          <div className={cardBase}>
            <p className="text-gray-600">Loading students and subjects...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className={cardBase}>
              <div className="flex items-center justify-between mb-5">
                <div>
                  <p className="text-sm font-semibold text-teal-600">Exams</p>
                  <h2 className="text-xl font-bold text-gray-900">Add exam score</h2>
                </div>
                <button onClick={() => setActiveTab('exam')} className="text-sm text-gray-500">Form</button>
              </div>
              <form onSubmit={submitExam} className="space-y-4">
                <select className="w-full rounded-xl border border-gray-300 px-4 py-2.5" value={examForm.student} onChange={(e) => setExamForm({ ...examForm, student: e.target.value })} required>
                  <option value="">Select student</option>
                  {studentOptions.map((student) => <option key={student.id} value={student.id}>{student.name} ({student.admission_number})</option>)}
                </select>
                <select className="w-full rounded-xl border border-gray-300 px-4 py-2.5" value={examForm.subject} onChange={(e) => setExamForm({ ...examForm, subject: e.target.value })} required>
                  <option value="">Select subject</option>
                  {subjectOptions.map((subject) => <option key={subject.id} value={subject.id}>{subject.name} ({subject.code})</option>)}
                </select>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input className="w-full rounded-xl border border-gray-300 px-4 py-2.5" type="number" step="0.01" placeholder="Score" value={examForm.score} onChange={(e) => setExamForm({ ...examForm, score: e.target.value })} required />
                  <select className="w-full rounded-xl border border-gray-300 px-4 py-2.5" value={examForm.term} onChange={(e) => setExamForm({ ...examForm, term: e.target.value })} required>
                    <option value="FIRST_TERM">First Term</option>
                    <option value="SECOND_TERM">Second Term</option>
                    <option value="THIRD_TERM">Third Term</option>
                  </select>
                </div>
                <input className="w-full rounded-xl border border-gray-300 px-4 py-2.5" type="text" placeholder="Exam type e.g. Midterm" value={examForm.exam_type} onChange={(e) => setExamForm({ ...examForm, exam_type: e.target.value })} required />
                <input className="w-full rounded-xl border border-gray-300 px-4 py-2.5" type="date" value={examForm.date} onChange={(e) => setExamForm({ ...examForm, date: e.target.value })} required />
                <button className="w-full rounded-xl bg-teal-600 px-4 py-3 font-medium text-white hover:bg-teal-700 transition" type="submit">Save Exam</button>
                <FieldError message={formErrors.exam} />
              </form>
            </div>

            <div className={cardBase}>
              <div className="mb-5">
                <p className="text-sm font-semibold text-blue-600">Attendance</p>
                <h2 className="text-xl font-bold text-gray-900">Add attendance record</h2>
              </div>
              <form onSubmit={submitAttendance} className="space-y-4">
                <select className="w-full rounded-xl border border-gray-300 px-4 py-2.5" value={attendanceForm.student} onChange={(e) => setAttendanceForm({ ...attendanceForm, student: e.target.value })} required>
                  <option value="">Select student</option>
                  {studentOptions.map((student) => <option key={student.id} value={student.id}>{student.name} ({student.admission_number})</option>)}
                </select>
                <select className="w-full rounded-xl border border-gray-300 px-4 py-2.5" value={attendanceForm.subject} onChange={(e) => setAttendanceForm({ ...attendanceForm, subject: e.target.value })}>
                  <option value="">Select subject (optional)</option>
                  {subjectOptions.map((subject) => <option key={subject.id} value={subject.id}>{subject.name} ({subject.code})</option>)}
                </select>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <select className="w-full rounded-xl border border-gray-300 px-4 py-2.5" value={attendanceForm.status} onChange={(e) => setAttendanceForm({ ...attendanceForm, status: e.target.value })} required>
                    <option value="present">Present</option>
                    <option value="absent">Absent</option>
                    <option value="late">Late</option>
                  </select>
                  <input className="w-full rounded-xl border border-gray-300 px-4 py-2.5" type="date" value={attendanceForm.date} onChange={(e) => setAttendanceForm({ ...attendanceForm, date: e.target.value })} required />
                </div>
                <button className="w-full rounded-xl bg-blue-600 px-4 py-3 font-medium text-white hover:bg-blue-700 transition" type="submit">Save Attendance</button>
                <FieldError message={formErrors.attendance} />
              </form>
            </div>

            <div className={cardBase}>
              <div className="mb-5">
                <p className="text-sm font-semibold text-cyan-600">Assignments</p>
                <h2 className="text-xl font-bold text-gray-900">Add assignment record</h2>
              </div>
              <form onSubmit={submitAssignment} className="space-y-4">
                <select className="w-full rounded-xl border border-gray-300 px-4 py-2.5" value={assignmentForm.student} onChange={(e) => setAssignmentForm({ ...assignmentForm, student: e.target.value })} required>
                  <option value="">Select student</option>
                  {studentOptions.map((student) => <option key={student.id} value={student.id}>{student.name} ({student.admission_number})</option>)}
                </select>
                <select className="w-full rounded-xl border border-gray-300 px-4 py-2.5" value={assignmentForm.subject} onChange={(e) => setAssignmentForm({ ...assignmentForm, subject: e.target.value })} required>
                  <option value="">Select subject</option>
                  {subjectOptions.map((subject) => <option key={subject.id} value={subject.id}>{subject.name} ({subject.code})</option>)}
                </select>
                <input className="w-full rounded-xl border border-gray-300 px-4 py-2.5" type="text" placeholder="Assignment title" value={assignmentForm.title} onChange={(e) => setAssignmentForm({ ...assignmentForm, title: e.target.value })} required />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Due date (deadline)</label>
                    <input className="w-full rounded-xl border border-gray-300 px-4 py-2.5" type="date" value={assignmentForm.due_date} onChange={(e) => setAssignmentForm({ ...assignmentForm, due_date: e.target.value })} required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Submission date (actual date student submitted)</label>
                    <input className="w-full rounded-xl border border-gray-300 px-4 py-2.5" type="date" value={assignmentForm.submission_date} onChange={(e) => setAssignmentForm({ ...assignmentForm, submission_date: e.target.value })} />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input className="w-full rounded-xl border border-gray-300 px-4 py-2.5" type="number" step="0.01" placeholder="Score" value={assignmentForm.score} onChange={(e) => setAssignmentForm({ ...assignmentForm, score: e.target.value })} />
                  <input className="w-full rounded-xl border border-gray-300 px-4 py-2.5" type="number" step="0.01" placeholder="Max score" value={assignmentForm.max_score} onChange={(e) => setAssignmentForm({ ...assignmentForm, max_score: e.target.value })} required />
                </div>
                <button className="w-full rounded-xl bg-cyan-600 px-4 py-3 font-medium text-white hover:bg-cyan-700 transition" type="submit">Save Assignment</button>
                <FieldError message={formErrors.assignment} />
              </form>
            </div>

            <div className={cardBase}>
              <div className="mb-5">
                <p className="text-sm font-semibold text-indigo-600">Topic Performance</p>
                <h2 className="text-xl font-bold text-gray-900">Add topic record</h2>
              </div>
              <form onSubmit={submitTopic} className="space-y-4">
                <select className="w-full rounded-xl border border-gray-300 px-4 py-2.5" value={topicForm.student} onChange={(e) => setTopicForm({ ...topicForm, student: e.target.value })} required>
                  <option value="">Select student</option>
                  {studentOptions.map((student) => <option key={student.id} value={student.id}>{student.name} ({student.admission_number})</option>)}
                </select>
                <select className="w-full rounded-xl border border-gray-300 px-4 py-2.5" value={topicForm.subject} onChange={(e) => setTopicForm({ ...topicForm, subject: e.target.value })} required>
                  <option value="">Select subject</option>
                  {subjectOptions.map((subject) => <option key={subject.id} value={subject.id}>{subject.name} ({subject.code})</option>)}
                </select>
                <input className="w-full rounded-xl border border-gray-300 px-4 py-2.5" type="text" placeholder="Topic name" value={topicForm.topic} onChange={(e) => setTopicForm({ ...topicForm, topic: e.target.value })} required />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input className="w-full rounded-xl border border-gray-300 px-4 py-2.5" type="number" step="0.01" placeholder="Score" value={topicForm.score} onChange={(e) => setTopicForm({ ...topicForm, score: e.target.value })} required />
                  <input className="w-full rounded-xl border border-gray-300 px-4 py-2.5" type="number" step="0.01" placeholder="Max score" value={topicForm.max_score} onChange={(e) => setTopicForm({ ...topicForm, max_score: e.target.value })} required />
                </div>
                <input className="w-full rounded-xl border border-gray-300 px-4 py-2.5" type="date" value={topicForm.assessment_date} onChange={(e) => setTopicForm({ ...topicForm, assessment_date: e.target.value })} required />
                <button className="w-full rounded-xl bg-indigo-600 px-4 py-3 font-medium text-white hover:bg-indigo-700 transition" type="submit">Save Topic Result</button>
                <FieldError message={formErrors.topic} />
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}