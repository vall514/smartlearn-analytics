# Student Data Export & Download Feature

## Overview
Teachers can now download their students' data in CSV or JSON formats. This allows for:
- Sharing student performance data with parents or administrators
- Creating backups of student records
- Analyzing data in spreadsheet applications
- Importing data into other systems

## Features

### 1. Export All Students Data
- **Location**: Students page, top-right corner
- **Formats**: CSV or JSON
- **What's Included**:
  - Student name, admission number, class, stream
  - Average exam score
  - Attendance rate (percentage)
  - Average assignment score
  - Total counts for exams, attendance, assignments
  - Creation date

### 2. Export Individual Student Details
- **Location**: Each student row action menu (⬇ button)
- **Formats**: CSV or JSON
- **What's Included**:
  - Student personal info
  - All exam records (subject, score, term, date)
  - All attendance records (date, status, subject)
  - All assignments (subject, title, score, due date, submission date)
  - All topic performance assessments

## How to Use

### Exporting All Students (CSV)
1. Go to the **Students** page
2. Click the **⬇ CSV** button in the top-right corner
3. File will download automatically as `students_data_YYYY-MM-DD.csv`
4. Open in Excel, Google Sheets, or any spreadsheet application

### Exporting All Students (JSON)
1. Go to the **Students** page
2. Click the **⬇ JSON** button in the top-right corner
3. File will download automatically as `students_data_YYYY-MM-DD.json`
4. Use for data analysis or importing into other systems

### Exporting Individual Student (CSV)
1. Go to the **Students** page
2. Find the student you want to export
3. Hover over the **⬇** icon in the Action column
4. Click **⬇ CSV** from the dropdown menu
5. File will download automatically as `StudentName_YYYY-MM-DD.csv`
6. Contains detailed records organized in sections

### Exporting Individual Student (JSON)
1. Go to the **Students** page
2. Find the student you want to export
3. Hover over the **⬇** icon in the Action column
4. Click **⬇ JSON** from the dropdown menu
5. File will download automatically as `StudentName_YYYY-MM-DD.json`
6. Contains all student data in structured JSON format

## API Endpoints

### Export All Students
```
GET /api/students/export/?format=csv
GET /api/students/export/?format=json
```

**Response** (CSV):
- File attachment: `students_data_TIMESTAMP.csv`

**Response** (JSON):
```json
{
  "exported_at": "2026-05-03T10:30:45.123456Z",
  "teacher": "John Doe",
  "total_students": 25,
  "students": [
    {
      "name": "Alice Johnson",
      "admission_number": "ADM001",
      "student_class": "Form 1",
      "stream": "East",
      "avg_exam_score": 75.5,
      "attendance_rate": 0.95,
      "avg_assignment_score": 80.0,
      "total_exams": 12,
      "total_attendance_records": 60,
      "total_assignments": 8
    }
  ]
}
```

### Export Student Details
```
GET /api/students/{student_id}/export/?format=csv
GET /api/students/{student_id}/export/?format=json
```

**Response** (CSV):
- File attachment: `student_ADMNO_TIMESTAMP.csv`
- Multiple sections: Student Info, Exam Scores, Attendance, Assignments, Topic Performance

**Response** (JSON):
```json
{
  "student": {
    "name": "Alice Johnson",
    "admission_number": "ADM001",
    "student_class": "Form 1",
    "stream": "East"
  },
  "exams": [
    {
      "subject": "Mathematics",
      "score": 85,
      "term": "First Term",
      "exam_type": "Mid-term",
      "date": "2026-03-15"
    }
  ],
  "attendance": [...],
  "assignments": [...],
  "topic_performance": [...],
  "exported_at": "2026-05-03T10:30:45.123456Z"
}
```

## Use Cases

### For Teachers
- **Report Cards**: Export CSV to print or share with parents
- **Data Backup**: Regular exports serve as student records backup
- **Analysis**: Export JSON for deeper performance analysis
- **Sharing**: Send CSV to school administration

### For Administrators
- **School Reports**: Download all students' data for school-wide analysis
- **Compliance**: Export records for institutional requirements
- **Analytics**: Import JSON data into analysis tools

### For Parents
- Teachers can download and share their child's detailed performance report

## Data Privacy & Security
- ✅ Teachers only see their own students' data
- ✅ Admins can download all students' data
- ✅ Authentication required for all exports
- ✅ Downloads are temporary (browser-based)
- ✅ No sensitive information is exposed

## File Formats

### CSV Format
- Suitable for Excel, Google Sheets, LibreOffice
- Easy to share via email
- Good for presentations and reports
- Individual sheets separated by blank lines

### JSON Format
- Suitable for programming/analysis
- Can be imported into data analysis tools
- Structured data format
- Good for automated processing

## Troubleshooting

**Q: Download button is disabled**
- A: Another download is in progress. Wait a moment and try again.

**Q: CSV file opens in wrong format**
- A: Right-click the CSV file → Open with → Choose "Text Editor" or Excel
- In Excel: Data → Get & Transform Data → From Text/CSV

**Q: Can't download individual student**
- A: Make sure the student is listed under your class
- Refresh the page and try again

**Q: File name is strange**
- A: Browser may rename files. Rename to format: `students_data.csv` or `student_name.csv`

## Technical Details

### CSV Structure (All Students)
```
Name | Admission Number | Class | Stream | Avg Exam Score | Attendance Rate | Avg Assignment Score | Total Exams | Total Attendance Records | Total Assignments | Created At
```

### CSV Structure (Individual Student)
Multiple sections separated by blank lines:
- Student Details (key-value pairs)
- Exam Scores (table)
- Attendance Records (table)
- Assignments (table)
- Topic Performance (table)

## Future Enhancements
- Excel (.xlsx) export with formatted sheets
- PDF export with styled reports
- Bulk operations (export multiple selected students)
- Schedule automatic exports
- Email exports directly to parents
- Integration with parent portal
