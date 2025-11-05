# ZMath LMS - User Guide

## Table of Contents
1. [Overview](#overview)
2. [User Roles](#user-roles)
3. [Getting Started](#getting-started)
4. [Student Flow](#student-flow)
5. [Teacher Flow](#teacher-flow)
6. [Admin Flow](#admin-flow)
7. [Features by Role](#features-by-role)

---

## Overview

ZMath LMS is a Learning Management System designed for mathematics education. It supports three types of users: **Students**, **Teachers**, and **Admins**, each with specific capabilities and workflows.

---

## User Roles

### 1. **Student**
- Can enroll in courses
- Access course materials (videos, PDFs, documents)
- Take quizzes and view their attempt history
- Track learning progress through lessons

### 2. **Teacher**
- Create and manage courses
- Create lessons within courses
- Upload learning materials (YouTube videos, PDFs, documents, images)
- Create quizzes with multiple-choice questions
- Manage student enrollments
- **Requires admin approval** to access the system

### 3. **Admin**
- All teacher capabilities
- Approve or reject teacher registrations
- View and manage all users in the system
- Access user settings and system management

---

## Getting Started

### Registration

1. **Navigate to Registration Page**
   - Go to `/register`
   - Fill in: Full Name, Email, Password, Confirm Password
   - Select your role: Student or Teacher

2. **For Students:**
   - ✅ Account is created and approved immediately
   - ✅ Automatically logged in
   - ✅ Redirected to student dashboard (`/dashboard/student`)

3. **For Teachers:**
   - ⏳ Account is created but **pending approval**
   - ℹ️ Message displayed: "Your teacher account is pending approval"
   - ❌ Cannot log in until approved by admin
   - 📧 Wait for admin to approve your registration

### Login

1. **Navigate to Login Page**
   - Go to `/login`
   - Enter your email and password

2. **After Login:**
   - Students → Redirected to `/dashboard/student`
   - Teachers (approved) → Redirected to `/dashboard/teacher`
   - Admins → Redirected to `/dashboard/admin`

3. **Login Restrictions:**
   - ❌ Unapproved teachers will see: "Your teacher account is pending approval"
   - ❌ Invalid credentials will show an error message

---

## Student Flow

### Dashboard Overview
**Location:** `/dashboard/student`

The student dashboard displays all courses you're enrolled in as cards with course titles and descriptions.

### Learning Journey

```
Student Dashboard → Course Detail → Lesson Detail → Material Viewer
                                  ↘ Quiz Detail → Quiz Attempt
```

#### 1. **View Enrolled Courses**
- Navigate to `/dashboard/student`
- See all courses you're enrolled in
- Click on any course card to view details

#### 2. **Course Detail Page**
**Location:** `/dashboard/student/courses/[courseId]`

Displays two sections:
- **Lessons:** List of all lessons in the course
- **Quizzes:** List of all quizzes for the course

#### 3. **Lesson Detail Page**
**Location:** `/dashboard/student/courses/[courseId]/lessons/[lessonId]`

- View lesson title and description
- See all materials available for the lesson
- Click on any material to view it

#### 4. **Material Viewer**
**Location:** `/dashboard/student/courses/[courseId]/lessons/[lessonId]/materials/[materialId]`

Supports multiple material types:
- **📹 YouTube Videos:** Embedded player
- **📄 PDF Files:** In-browser PDF viewer
- **📁 Documents:** Download button for Word, Excel, PPT files
- **🖼️ Images:** Direct image display

#### 5. **Quiz Flow**

##### View Quiz Details
**Location:** `/dashboard/student/quizzes/detail/[quizId]`

- View quiz title and description
- See your attempt history (score, completion date)
- Click "Start Attempt" (first time) or "Re-attempt Quiz"

##### Take Quiz
**Location:** `/dashboard/student/quizzes/attempt/[quizId]`

- Answer multiple-choice questions
- Submit your answers
- View your score
- Results are saved in your attempt history

---

## Teacher Flow

### Prerequisites
- ✅ Teacher account must be approved by admin
- ❌ Unapproved teachers cannot log in

### Dashboard Overview
**Location:** `/dashboard/teacher`

Quick links to manage:
- 🎓 Courses
- 📖 Lessons
- 📝 Quizzes
- 📚 Materials
- 👨‍🎓 Student Enrollments

### Content Management Workflow

```
Create Course → Create Lessons → Upload Materials
                              ↘ Create Quizzes
                              
Enroll Students → Students Access Content
```

#### 1. **Manage Courses**
**Location:** `/dashboard/teacher/courses`

**Create a Course:**
- Click "Add New Course"
- Fill in: Title, Description, Subject (e.g., Algebra, Geometry)
- Click "Submit"

**Edit/Delete Courses:**
- View all courses in a data grid
- Click Edit icon to modify course details
- Click Delete icon to remove a course

#### 2. **Manage Lessons**
**Location:** `/dashboard/teacher/lessons`

**Create a Lesson:**
- Click "Add New Lesson"
- Fill in: Title, Description, Order
- Select the course this lesson belongs to
- Click "Submit"

**Edit/Delete Lessons:**
- View all lessons with their associated courses
- Click Edit icon to modify lesson details
- Click Delete icon to remove a lesson

#### 3. **Manage Materials**
**Location:** `/dashboard/teacher/materials`

**Upload Material:**
- Click "Add New Material"
- Fill in: Title, Description, Order
- Select the lesson this material belongs to
- Choose material type:
  - **YouTube:** Enter video URL
  - **PDF:** Upload PDF file
  - **Document:** Upload Word/Excel/PPT file
  - **Image:** Upload image file
- Click "Submit"

**Edit/Delete Materials:**
- View all materials with type badges
- Click Edit icon to modify material details
- Click Delete icon to remove a material

#### 4. **Manage Quizzes**
**Location:** `/dashboard/teacher/quizzes`

**Create a Quiz:**
- Click "Add New Quiz"
- Fill in: Title, Description, Duration (minutes), Pass Score
- Select the course this quiz belongs to
- Add questions:
  - Enter question text
  - Add 4 answer options (A, B, C, D)
  - Select the correct answer
  - Add multiple questions
- Click "Submit"

**Edit/Delete Quizzes:**
- View all quizzes with their courses
- Click Edit icon to modify quiz and questions
- Click Delete icon to remove a quiz

#### 5. **Manage Enrollments**
**Location:** `/dashboard/teacher/enrollments`

**Enroll Students:**
- Click "Enroll Students"
- Select a student from the dropdown
- Select a course to enroll them in
- Click "Enroll"

**View Enrollments:**
- See all student-course enrollments
- View student names, courses, and enrollment dates
- Click Delete icon to remove an enrollment

---

## Admin Flow

### Dashboard Overview
**Location:** `/dashboard/admin`

Two main sections:

#### **1. Admin Actions**
- 👥 User Settings
- ✅ Teacher Registration Approvals

#### **2. Content Management**
- All teacher features (Courses, Lessons, Quizzes, Materials, Enrollments)

### Admin-Specific Features

#### 1. **User Settings**
**Location:** `/dashboard/admin/users`

**View All Users:**
- See complete user list in data grid
- Columns: Username, Full Name, Email, Role, Approval Status, Registration Date
- Filter by role: All, Students, Teachers, Admins

**User Information:**
- Role badges with colors:
  - 🟡 Admin (Orange)
  - 🔵 Teacher (Blue)
  - 🟢 Student (Green)
- Approval status for teachers:
  - ✅ Approved
  - ⏳ Pending

#### 2. **Teacher Registration Approvals**
**Location:** `/dashboard/admin/teacher-approvals`

**Approve Teacher Workflow:**

1. **View Pending Teachers:**
   - See list of teachers awaiting approval
   - Shows: Username, Full Name, Email, Registration Date
   - Counter shows number of pending approvals

2. **Approve a Teacher:**
   - Click the ✅ checkmark icon
   - Teacher's `is_approved` status set to `true`
   - Teacher can now log in and access the system
   - Success message displayed
   - Teacher removed from pending list

3. **Reject a Teacher:**
   - Click the ❌ close icon
   - Teacher account is deleted from the system
   - Success message displayed
   - Teacher removed from pending list

**Empty State:**
- If no pending teachers: "No pending teacher registrations"

---

## Features by Role

| Feature | Student | Teacher | Admin |
|---------|---------|---------|-------|
| View enrolled courses | ✅ | ❌ | ❌ |
| Access materials | ✅ | ❌ | ❌ |
| Take quizzes | ✅ | ❌ | ❌ |
| View quiz history | ✅ | ❌ | ❌ |
| Create courses | ❌ | ✅ | ✅ |
| Create lessons | ❌ | ✅ | ✅ |
| Upload materials | ❌ | ✅ | ✅ |
| Create quizzes | ❌ | ✅ | ✅ |
| Manage enrollments | ❌ | ✅ | ✅ |
| View all users | ❌ | ❌ | ✅ |
| Approve teachers | ❌ | ❌ | ✅ |
| Reject teachers | ❌ | ❌ | ✅ |

---

## Content Hierarchy

Understanding the relationship between content types:

```
Course
├── Lessons
│   └── Materials (YouTube, PDF, Documents, Images)
└── Quizzes
    └── Questions (Multiple Choice)

Enrollment (Student → Course)
```

### Relationships:
- **Course** contains multiple **Lessons** and **Quizzes**
- **Lesson** contains multiple **Materials**
- **Quiz** contains multiple **Questions**
- **Student** enrolls in **Courses** (not individual lessons)

---

## Best Practices

### For Teachers:
1. **Create content in order:** Course → Lessons → Materials/Quizzes
2. **Use meaningful titles** for easy student navigation
3. **Set lesson order** to structure the learning path
4. **Test quizzes** before students access them
5. **Enroll students** after content is ready

### For Students:
1. **Follow lesson order** for better understanding
2. **Complete materials** before attempting quizzes
3. **Review quiz history** to track progress
4. **Re-attempt quizzes** to improve scores

### For Admins:
1. **Review teacher profiles** before approval
2. **Monitor user activity** through user settings
3. **Regularly check** pending teacher approvals
4. **Use teacher features** to understand the system

---

## Navigation Summary

### Public Routes
- `/` - Home page
- `/login` - Login page
- `/register` - Registration page

### Student Routes
- `/dashboard/student` - Student dashboard
- `/dashboard/student/courses/[id]` - Course detail
- `/dashboard/student/courses/[id]/lessons/[lessonId]` - Lesson detail
- `/dashboard/student/courses/[id]/lessons/[lessonId]/materials/[materialId]` - Material viewer
- `/dashboard/student/quizzes/detail/[id]` - Quiz detail
- `/dashboard/student/quizzes/attempt/[id]` - Take quiz

### Teacher Routes
- `/dashboard/teacher` - Teacher dashboard
- `/dashboard/teacher/courses` - Manage courses
- `/dashboard/teacher/lessons` - Manage lessons
- `/dashboard/teacher/materials` - Manage materials
- `/dashboard/teacher/quizzes` - Manage quizzes
- `/dashboard/teacher/enrollments` - Manage enrollments

### Admin Routes
- `/dashboard/admin` - Admin dashboard
- `/dashboard/admin/users` - User settings
- `/dashboard/admin/teacher-approvals` - Teacher approvals
- All teacher routes (admin has full access)

---

## Troubleshooting

### Cannot Log In as Teacher
- **Issue:** "Your teacher account is pending approval"
- **Solution:** Wait for admin to approve your registration

### Cannot See Any Courses (Student)
- **Issue:** No courses displayed on dashboard
- **Solution:** Contact your teacher to enroll you in courses

### Cannot Create Content (Teacher)
- **Issue:** Features not accessible
- **Solution:** Ensure your account is approved by admin

### Missing Materials or Quizzes
- **Issue:** Content not showing in lessons/courses
- **Solution:** Verify relationships (Course → Lesson → Material)

---

## Security Features

- ✅ **Role-based access control** - Users only see authorized content
- ✅ **Middleware protection** - Routes protected at server level
- ✅ **Teacher approval system** - Manual verification before access
- ✅ **Secure authentication** - Powered by Supabase Auth
- ✅ **Server-side actions** - Admin operations use elevated privileges

---

## Support

For additional help or questions about using ZMath LMS, please contact your system administrator.

---

**Last Updated:** November 4, 2025
