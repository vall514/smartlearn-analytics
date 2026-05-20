import { useEffect, useMemo, useState } from 'react'
import AppNav from '../components/AppNav'
import { downloadFile, exportAllStudentsData, exportStudentDetails, getStudents } from '../utils/api'

function getTeacherName() {
  const teacher = JSON.parse(localStorage.getItem('teacher') || '{}')
  return `${teacher.first_name || 'Teacher'} ${teacher.last_name || ''}`.trim()
}

export default function Report() {
  const teacherName = useMemo(() => getTeacherName(), [])
  const [students, setStudents] = useState([])
  const [studentsLoading, setStudentsLoading] = useState(true)
  const [loading, setLoading] = useState(false)
  const [studentLoadingId, setStudentLoadingId] = useState(null)
  const [status, setStatus] = useState('')

  useEffect(() => {
    const loadStudents = async () => {
      try {
        setStudentsLoading(true)
        const response = await getStudents()
        setStudents(response.data || [])
      } catch (error) {
        console.error('Failed to load students for report page', error)
        setStatus(error.response?.data?.detail || 'Failed to load students.')
      } finally {
        setStudentsLoading(false)
      }
    }

    loadStudents()
  }, [])

  const handleDownloadReport = async () => {
    try {
      setLoading(true)
      setStatus('Preparing Excel report...')
      const response = await exportAllStudentsData()
      const fileName = `students_report_${new Date().toISOString().slice(0, 10)}.xlsx`
      downloadFile(response.data, fileName)
      setStatus('Report downloaded successfully.')
    } catch (error) {
      console.error('Report download failed', error)
      setStatus(error.response?.data?.detail || error.message || 'Failed to download report.')
    } finally {
      setLoading(false)
    }
  }

  const handleShareReport = async () => {
    const shareText = `Student report for ${teacherName} is ready. Download the Excel report from the SmartLearn Analytics Report page.`

    try {
      if (navigator.share) {
        await navigator.share({
          title: 'SmartLearn Analytics Report',
          text: shareText,
          url: window.location.origin + '/report',
        })
        setStatus('Report shared successfully!')
      } else {
        await navigator.clipboard.writeText(shareText)
        setStatus('Report summary copied to clipboard (share not supported on this device).')
      }
    } catch (error) {
      if (error.name === 'AbortError') {
        // User cancelled the share dialog - this is not an error
        setStatus('Share cancelled.')
      } else {
        console.error('Share failed', error)
        setStatus('Unable to share at this moment. You can copy the report summary manually.')
      }
    }
  }

  const handleDownloadStudentReport = async (student) => {
    try {
      setStudentLoadingId(student.id)
      setStatus(`Preparing report for ${student.name}...`)
      const response = await exportStudentDetails(student.id)
      const fileName = `${student.name.replace(/\s+/g, '_')}_report_${new Date().toISOString().slice(0, 10)}.xlsx`
      downloadFile(response.data, fileName)
      setStatus(`Downloaded report for ${student.name}.`)
    } catch (error) {
      console.error('Student report download failed', error)
      setStatus(error.response?.data?.detail || `Failed to download report for ${student.name}.`)
    } finally {
      setStudentLoadingId(null)
    }
  }

  const handleShareStudentReport = async (student) => {
    const shareText = `Student report for ${student.name} is ready from SmartLearn Analytics.`

    try {
      if (navigator.share) {
        await navigator.share({
          title: `${student.name} Report`,
          text: shareText,
          url: window.location.origin + '/report',
        })
        setStatus(`Report for ${student.name} shared successfully!`)
      } else {
        await navigator.clipboard.writeText(shareText)
        setStatus(`Report summary for ${student.name} copied to clipboard (share not supported on this device).`)
      }
    } catch (error) {
      if (error.name === 'AbortError') {
        // User cancelled the share dialog - this is not an error
        setStatus('Share cancelled.')
      } else {
        console.error('Student share failed', error)
        setStatus(`Unable to share report for ${student.name}. You can copy the report summary manually.`)
      }
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-cyan-50 to-indigo-100 p-6 md:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <AppNav />

        <div className="rounded-3xl border border-cyan-100 bg-white/95 p-8 shadow-lg">
          <p className="text-sm font-semibold uppercase tracking-wide text-cyan-600">Reports</p>
          <h1 className="mt-1 text-3xl font-bold text-gray-900">Student Report Center</h1>
          <p className="mt-3 max-w-2xl text-gray-600">
            Download the full Excel workbook or fetch a separate Excel report for any student and share it with parents or administrators.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              onClick={handleDownloadReport}
              disabled={loading}
              className="rounded-xl bg-teal-600 px-5 py-3 font-medium text-white transition hover:bg-teal-700 disabled:opacity-50"
            >
              {loading ? 'Preparing...' : 'Download Excel Report'}
            </button>
            <button
              onClick={handleShareReport}
              className="rounded-xl border border-cyan-200 bg-white px-5 py-3 font-medium text-cyan-700 transition hover:bg-cyan-50"
            >
              Share Full Report
            </button>
          </div>

          {status && (
            <div className="mt-5 rounded-2xl border border-cyan-100 bg-cyan-50 px-4 py-3 text-sm text-cyan-800">
              {status}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          <div className="rounded-2xl border border-white/70 bg-white/90 p-6 shadow-sm">
            <p className="text-sm font-semibold text-teal-600">Excel only</p>
            <h2 className="mt-1 text-lg font-bold text-gray-900">One workbook</h2>
            <p className="mt-2 text-sm text-gray-600">The report downloads as a single `.xlsx` file ready for sharing.</p>
          </div>
          <div className="rounded-2xl border border-white/70 bg-white/90 p-6 shadow-sm">
            <p className="text-sm font-semibold text-blue-600">Share</p>
            <h2 className="mt-1 text-lg font-bold text-gray-900">Copy or send</h2>
            <p className="mt-2 text-sm text-gray-600">Use the share button to send a short report message or copy it to the clipboard.</p>
          </div>
          <div className="rounded-2xl border border-white/70 bg-white/90 p-6 shadow-sm">
            <p className="text-sm font-semibold text-cyan-600">Teacher workflow</p>
            <h2 className="mt-1 text-lg font-bold text-gray-900">Download then share</h2>
            <p className="mt-2 text-sm text-gray-600">Generate the workbook and send it through email, chat, or a school portal.</p>
          </div>
        </div>

        <div className="rounded-3xl border border-white/70 bg-white/95 p-6 shadow-sm">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <p className="text-sm font-semibold text-cyan-600 uppercase tracking-wide">Per-student reports</p>
              <h2 className="mt-1 text-2xl font-bold text-gray-900">Download each student separately</h2>
            </div>
            <p className="text-sm text-gray-500">{students.length} students available</p>
          </div>

          {studentsLoading ? (
            <div className="mt-6 rounded-2xl border border-dashed border-gray-200 bg-gray-50 p-6 text-gray-600">
              Loading students...
            </div>
          ) : students.length === 0 ? (
            <div className="mt-6 rounded-2xl border border-dashed border-gray-200 bg-gray-50 p-6 text-gray-600">
              No students available yet.
            </div>
          ) : (
            <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
              {students.map((student) => (
                <div key={student.id} className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{student.name}</h3>
                      <p className="text-sm text-gray-500">{student.admission_number} · {student.student_class} {student.stream ? `· ${student.stream}` : ''}</p>
                    </div>
                    <span className="rounded-full bg-cyan-50 px-3 py-1 text-xs font-semibold text-cyan-700">Excel</span>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-3">
                    <button
                      onClick={() => handleDownloadStudentReport(student)}
                      disabled={studentLoadingId === student.id}
                      className="rounded-xl bg-teal-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-teal-700 disabled:opacity-50"
                    >
                      {studentLoadingId === student.id ? 'Preparing...' : 'Download Report'}
                    </button>
                    <button
                      onClick={() => handleShareStudentReport(student)}
                      className="rounded-xl border border-cyan-200 bg-white px-4 py-2.5 text-sm font-medium text-cyan-700 transition hover:bg-cyan-50"
                    >
                      Share
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
