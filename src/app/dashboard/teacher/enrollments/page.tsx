"use client";
import React, { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Box,
  Typography,
  Button,
  Breadcrumbs,
  Link,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Alert,
  Skeleton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  ListItemText,
  OutlinedInput,
  SelectChangeEvent,
} from "@mui/material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import GroupAddIcon from "@mui/icons-material/GroupAdd";
import {
  fetchEnrollmentsApi,
  createEnrollmentApi,
  deleteEnrollmentApi,
} from "../../../../services/enrollment.service";
import { fetchCoursesApi } from "../../../../services/course.service";
import { EnrollmentWithDetails } from "../../../../models/Enrollment";
import { fetchStudentsAction, AuthUser } from "./actions";

export default function EnrollmentsPage() {
  const queryClient = useQueryClient();
  const [enrollDialogOpen, setEnrollDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [enrollmentToDelete, setEnrollmentToDelete] = useState<number | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<string>("");
  const [selectedCourses, setSelectedCourses] = useState<number[]>([]);
  const [courseFilter, setCourseFilter] = useState<number[]>([]);

  // Fetch enrollments
  const { data: enrollments = [], isLoading, error } = useQuery({
    queryKey: ["enrollments"],
    queryFn: fetchEnrollmentsApi,
  });

  // Fetch students
  const { data: students = [] } = useQuery<AuthUser[]>({
    queryKey: ["students"],
    queryFn: () => fetchStudentsAction(),
  });

  // Fetch courses
  const { data: courses = [] } = useQuery({
    queryKey: ["courses"],
    queryFn: fetchCoursesApi,
  });

  // Merge enrollments with student data from Auth
  const enrollmentsWithUsers = useMemo(() => {
    return enrollments.map((enrollment) => {
      const student = students.find((s) => s.id === enrollment.user_id);
      return {
        ...enrollment,
        user: student
          ? {
              id: student.id,
              username: student.user_metadata.username || student.email || "Unknown",
              full_name: student.user_metadata.full_name,
            }
          : undefined,
      };
    });
  }, [enrollments, students]);

  // Create enrollment mutation
  const createMutation = useMutation({
    mutationFn: createEnrollmentApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["enrollments"] });
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: deleteEnrollmentApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["enrollments"] });
      setDeleteDialogOpen(false);
      setEnrollmentToDelete(null);
    },
  });

  // Group enrollments by student
  const studentEnrollments = useMemo(() => {
    const grouped = new Map<string, {
      student: {
        id: string;
        username: string;
        full_name?: string;
      };
      enrollments: EnrollmentWithDetails[];
    }>();

    enrollmentsWithUsers.forEach((enrollment) => {
      if (enrollment.user) {
        const userId = enrollment.user.id;
        if (!grouped.has(userId)) {
          grouped.set(userId, {
            student: enrollment.user,
            enrollments: [],
          });
        }
        grouped.get(userId)?.enrollments.push(enrollment);
      }
    });

    return Array.from(grouped.values());
  }, [enrollmentsWithUsers]);

  // Filter by course
  const filteredStudentEnrollments = useMemo(() => {
    if (courseFilter.length === 0) {
      return studentEnrollments;
    }

    return studentEnrollments.filter((item) =>
      item.enrollments.some((e) => 
        courseFilter.includes(e.course_id)
      )
    );
  }, [studentEnrollments, courseFilter]);

  const handleEnrollClick = () => {
    setSelectedStudent("");
    setSelectedCourses([]);
    setEnrollDialogOpen(true);
  };

  const handleEnrollSubmit = async () => {
    if (!selectedStudent || selectedCourses.length === 0) return;

    try {
      // Create enrollments for each selected course
      const promises = selectedCourses.map((courseId) =>
        createMutation.mutateAsync({
          user_id: selectedStudent,
          course_id: courseId,
        })
      );
      await Promise.all(promises);
      setEnrollDialogOpen(false);
      setSelectedStudent("");
      setSelectedCourses([]);
    } catch (error) {
      console.error("Error enrolling student:", error);
    }
  };

  const handleDeleteClick = (id: number) => {
    setEnrollmentToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (enrollmentToDelete !== null) {
      deleteMutation.mutate(enrollmentToDelete);
    }
  };

  const handleCourseFilterChange = (event: SelectChangeEvent<number[]>) => {
    const value = event.target.value;
    setCourseFilter(typeof value === 'string' ? [] : value);
  };

  const columns: GridColDef[] = [
    {
      field: "username",
      headerName: "Username",
      width: 150,
      valueGetter: (value, row) => row.student.username,
    },
    {
      field: "full_name",
      headerName: "Full Name",
      flex: 1,
      minWidth: 180,
      valueGetter: (value, row) => row.student.full_name || "-",
    },
    {
      field: "email",
      headerName: "Email",
      flex: 1,
      minWidth: 200,
      valueGetter: (value, row) => row.student.username + "@zmath.com",
    },
    {
      field: "courses",
      headerName: "Enrolled Courses",
      flex: 2,
      minWidth: 300,
      renderCell: (params) => (
        <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap", py: 1 }}>
          {params.row.enrollments.map((enrollment: EnrollmentWithDetails) => (
            <Chip
              key={enrollment.id}
              label={enrollment.course?.title || "Unknown"}
              size="small"
              onDelete={() => handleDeleteClick(enrollment.id)}
              deleteIcon={<DeleteIcon />}
              sx={{ mb: 0.5 }}
            />
          ))}
        </Box>
      ),
    },
    {
      field: "enrollment_count",
      headerName: "Total Courses",
      width: 130,
      headerAlign: "center",
      align: "center",
      valueGetter: (value, row) => row.enrollments.length,
    },
  ];

  if (error) {
    return (
      <Box sx={{ maxWidth: 1400, mx: "auto", p: 3 }}>
        <Alert severity="error">Error loading enrollments: {error.message}</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 1400, mx: "auto", p: 3 }}>
      {/* Breadcrumbs */}
      <Breadcrumbs
        separator={<NavigateNextIcon fontSize="small" />}
        sx={{ mb: 3 }}
      >
        <Link
          underline="hover"
          color="inherit"
          href="/dashboard/teacher"
          sx={{ cursor: "pointer" }}
        >
          Dashboard
        </Link>
        <Typography color="text.primary">Student Enrollments</Typography>
      </Breadcrumbs>

      {/* Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <GroupAddIcon sx={{ fontSize: 32, color: "primary.main" }} />
          <Typography variant="h4" component="h1" fontWeight={600}>
            Student Enrollments
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleEnrollClick}
        >
          Enroll Student
        </Button>
      </Box>

      {/* Course Filter */}
      <Box sx={{ mb: 3 }}>
        <FormControl sx={{ minWidth: 300 }}>
          <InputLabel>Filter by Course</InputLabel>
          <Select
            multiple
            value={courseFilter}
            onChange={handleCourseFilterChange}
            input={<OutlinedInput label="Filter by Course" />}
            renderValue={(selected) =>
              selected
                .map((id) => courses.find((c) => c.id === id)?.title)
                .join(", ")
            }
          >
            {courses.map((course) => (
              <MenuItem key={course.id} value={course.id}>
                <Checkbox checked={courseFilter.indexOf(course.id) > -1} />
                <ListItemText primary={course.title} />
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {/* DataGrid */}
      {isLoading ? (
        <Box>
          <Skeleton variant="rectangular" height={400} />
        </Box>
      ) : (
        <DataGrid
          rows={filteredStudentEnrollments}
          columns={columns}
          getRowId={(row) => row.student.id}
          pageSizeOptions={[10, 25, 50]}
          initialState={{
            pagination: { paginationModel: { pageSize: 10 } },
          }}
          autoHeight
          disableRowSelectionOnClick
          getRowHeight={() => "auto"}
          sx={{
            "& .MuiDataGrid-cell": {
              py: 1,
            },
          }}
        />
      )}

      {/* Enroll Dialog */}
      <Dialog
        open={enrollDialogOpen}
        onClose={() => setEnrollDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Enroll Student in Courses</DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 2 }}>
            <FormControl fullWidth>
              <InputLabel>Select Student</InputLabel>
              <Select
                value={selectedStudent}
                onChange={(e) => setSelectedStudent(e.target.value)}
                label="Select Student"
              >
                {students.map((student) => (
                  <MenuItem key={student.id} value={student.id}>
                    {student.user_metadata.full_name || student.user_metadata.username || student.email} ({student.email})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>Select Courses</InputLabel>
              <Select
                multiple
                value={selectedCourses}
                onChange={(e) => {
                  const value = e.target.value;
                  setSelectedCourses(typeof value === 'string' ? [] : value);
                }}
                input={<OutlinedInput label="Select Courses" />}
                renderValue={(selected) =>
                  selected
                    .map((id) => courses.find((c) => c.id === id)?.title)
                    .join(", ")
                }
              >
                {courses.map((course) => (
                  <MenuItem key={course.id} value={course.id}>
                    <Checkbox checked={selectedCourses.indexOf(course.id) > -1} />
                    <ListItemText primary={course.title} />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEnrollDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleEnrollSubmit}
            variant="contained"
            disabled={
              !selectedStudent ||
              selectedCourses.length === 0 ||
              createMutation.isPending
            }
          >
            {createMutation.isPending ? "Enrolling..." : "Enroll"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Confirm Unenroll</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to remove this enrollment? The student will
            lose access to this course.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleDeleteConfirm}
            color="error"
            variant="contained"
            disabled={deleteMutation.isPending}
          >
            {deleteMutation.isPending ? "Removing..." : "Remove"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
