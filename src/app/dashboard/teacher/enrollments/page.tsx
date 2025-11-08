"use client";
import React, { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Box,
  Typography,
  Button,
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
import { Breadcrumbs } from "@/src/components";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import GroupAddIcon from "@mui/icons-material/GroupAdd";
import {
  fetchEnrollmentsWithDetails,
  createEnrollment,
  deleteEnrollment,
} from "../../../../services/enrollment.service";
import { fetchStudentsAction, AuthUser } from "./actions";
import { fetchCourses } from "../../../../services/course.service";
import { EnrollmentWithDetails } from "../../../../models/Enrollment";
import { CreateEnrollmentInput } from "@/src/models/Enrollment";

export default function EnrollmentsPage() {
  const queryClient = useQueryClient();
  const [enrollDialogOpen, setEnrollDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [enrollmentToDelete, setEnrollmentToDelete] = useState<string | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<string>("");
  const [selectedCourses, setSelectedCourses] = useState<string[]>([]);
  const [courseFilter, setCourseFilter] = useState<string[]>([]);

  // Fetch enrollments with student details
  const { data: enrollments = [], isLoading, error } = useQuery<EnrollmentWithDetails[]>({
    queryKey: ["enrollments-with-details"],
    queryFn: async () => {
      const result = await fetchEnrollmentsWithDetails();
      if (!result.success) {
        throw new Error(result.error || "Failed to fetch enrollments");
      }
      return result.data || [];
    },
  });

  // Fetch students (via server action)
  const { data: students = [] } = useQuery<AuthUser[]>({
    queryKey: ["students"],
    queryFn: async () => {
      const result = await fetchStudentsAction();
      if (!result.success) {
        throw new Error(result.error || "Failed to fetch students");
      }
      return result.data || [];
    },
  });

  // Fetch courses
  const { data: courses = [] } = useQuery({
    queryKey: ["courses"],
    queryFn: async () => {
      const result = await fetchCourses();
      if (!result.success) {
        throw new Error(result.error || "Failed to fetch courses");
      }
      return result.data || [];
    },
  });

  // Merge enrollments with student data
  const enrollmentsWithUsers = useMemo(() => {
    return enrollments.map((enrollment) => {
      const student = students.find((s) => s.id === enrollment.user_id);
      return {
        ...enrollment,
        user: student
          ? {
              id: student.id,
              email: student.email || "Unknown",
              full_name: student.user_metadata?.display_name || "Unknown",
            }
          : undefined,
      };
    });
  }, [enrollments, students]);

  // Create enrollment mutation
  const createMutation = useMutation({
    mutationFn: async (input: CreateEnrollmentInput) => {
      const result = await createEnrollment(input);
      if (!result.success) {
        throw new Error(result.error || "Failed to create enrollment");
      }
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["enrollments-with-details"] });
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const result = await deleteEnrollment(id);
      if (!result.success) {
        throw new Error(result.error || "Failed to delete enrollment");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["enrollments-with-details"] });
      setDeleteDialogOpen(false);
      setEnrollmentToDelete(null);
    },
  });

  // Group enrollments by student
  const studentEnrollments = useMemo(() => {
    const grouped = new Map<string, {
      student: {
        id: string;
        email: string;
        full_name: string;
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

  const handleDeleteClick = (id: string) => {
    setEnrollmentToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (enrollmentToDelete !== null) {
      deleteMutation.mutate(enrollmentToDelete);
    }
  };

  const handleCourseFilterChange = (event: SelectChangeEvent<string[]>) => {
    const value = event.target.value;
    setCourseFilter(typeof value === 'string' ? value.split(',') : value);
  };

  const columns: GridColDef[] = [
    {
      field: "full_name",
      headerName: "Nama Lengkap",
      flex: 1.5,
      minWidth: 200,
      valueGetter: (value, row) => row.student.full_name,
    },
    {
      field: "email",
      headerName: "Email",
      flex: 1.5,
      minWidth: 220,
      valueGetter: (value, row) => row.student.email,
    },
    {
      field: "courses",
      headerName: "Kursus Terdaftar",
      flex: 2,
      minWidth: 300,
      renderCell: (params) => (
        <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap", py: 1 }}>
          {params.row.enrollments.map((enrollment: EnrollmentWithDetails) => (
            <Chip
              key={enrollment.id}
              label={enrollment.course?.title || "Tidak Diketahui"}
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
      headerName: "Total Kursus",
      width: 130,
      headerAlign: "center",
      align: "center",
      valueGetter: (value, row) => row.enrollments.length,
    },
  ];

  if (error) {
    return (
      <Box sx={{ maxWidth: 1400, mx: "auto", p: 3 }}>
        <Alert severity="error">Kesalahan memuat pendaftaran: {error.message}</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 1400, mx: "auto", p: 3 }}>
      {/* Breadcrumbs */}
      <Breadcrumbs
        items={[
          
          { label: "Pendaftaran Siswa" },
        ]}
      />

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
            Pendaftaran Siswa
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleEnrollClick}
        >
          Daftarkan Siswa
        </Button>
      </Box>

      {/* Course Filter */}
      <Box sx={{ mb: 3 }}>
        <FormControl sx={{ minWidth: 300 }}>
          <InputLabel>Filter berdasarkan Kursus</InputLabel>
          <Select
            multiple
            value={courseFilter}
            onChange={handleCourseFilterChange}
            input={<OutlinedInput label="Filter berdasarkan Kursus" />}
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
        <DialogTitle>Daftarkan Siswa ke Kursus</DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 2 }}>
            <FormControl fullWidth>
              <InputLabel>Pilih Siswa</InputLabel>
              <Select
                value={selectedStudent}
                onChange={(e) => setSelectedStudent(e.target.value)}
                label="Pilih Siswa"
              >
                {students.map((student) => (
                  <MenuItem key={student.id} value={student.id}>
                    {student.user_metadata.display_name || student.email} ({student.email})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>Pilih Kursus</InputLabel>
              <Select
                multiple
                value={selectedCourses}
                onChange={(e) => {
                  const value = e.target.value;
                  setSelectedCourses(typeof value === 'string' ? [] : value);
                }}
                input={<OutlinedInput label="Pilih Kursus" />}
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
          <Button onClick={() => setEnrollDialogOpen(false)}>Batal</Button>
          <Button
            onClick={handleEnrollSubmit}
            variant="contained"
            disabled={
              !selectedStudent ||
              selectedCourses.length === 0 ||
              createMutation.isPending
            }
          >
            {createMutation.isPending ? "Mendaftarkan..." : "Daftarkan"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Konfirmasi Batal Daftar</DialogTitle>
        <DialogContent>
          <Typography>
            Apakah Anda yakin ingin menghapus pendaftaran ini? Siswa akan kehilangan akses ke kursus ini.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Batal</Button>
          <Button
            onClick={handleDeleteConfirm}
            color="error"
            variant="contained"
            disabled={deleteMutation.isPending}
          >
            {deleteMutation.isPending ? "Menghapus..." : "Hapus"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
