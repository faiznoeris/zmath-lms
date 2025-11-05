# Database Setup Guide

This folder contains SQL scripts for setting up and seeding the LMS database.

## Files

- `schema.sql` - Database schema with tables, policies, functions, and triggers
- `seed.sql` - Sample data for testing and development

## Setup Instructions

### 1. Run Schema

First, execute the schema file to create all tables and policies:

```sql
-- In Supabase SQL Editor or psql
\i schema.sql
```

Or copy and paste the contents of `schema.sql` into your SQL editor.

### 2. Get Your User ID

Before running the seed file, you need to get an actual user UUID from your auth system:

```sql
SELECT id, email FROM auth.users LIMIT 5;
```

Copy one of the UUIDs (it will look like: `f1df9d42-4316-4460-b5aa-c718813a101a`)

### 3. Update Seed File

Open `seed.sql` and replace `YOUR_USER_ID` with your actual user UUID:

```sql
-- Find all occurrences of:
'YOUR_USER_ID'

-- Replace with your actual UUID:
'f1df9d42-4316-4460-b5aa-c718813a101a'
```

### 4. Run Seed File

Execute the seed file to populate the database with test data:

```sql
\i seed.sql
```

Or copy and paste the contents into your SQL editor.

### 5. Verify Data

Run the verification queries at the end of `seed.sql` to confirm data was inserted:

```sql
SELECT 'Courses:', COUNT(*) FROM courses;
SELECT 'Lessons:', COUNT(*) FROM lessons;
SELECT 'Materials:', COUNT(*) FROM materials;
SELECT 'Quizzes:', COUNT(*) FROM quizzes;
SELECT 'Questions:', COUNT(*) FROM questions;
```

## What's Included in Seed Data

### 3 Courses:
1. **Aljabar Dasar** - Basic algebra concepts
2. **Dasar-Dasar Geometri** - Geometry fundamentals
3. **Pengantar Kalkulus** - Introduction to calculus

### 11 Lessons:
- 4 lessons for Algebra
- 4 lessons for Geometry
- 3 lessons for Calculus

### 12 Materials:
- Mix of video and document materials
- Distributed across all lessons
- YouTube links and PDF documents

### 3 Quizzes:
- One quiz per course
- Each with multiple choice questions

### 9 Questions:
- 3 questions per quiz
- All multiple choice format
- With correct answers marked

## UUID Structure

All IDs use UUID v4 format with meaningful patterns for easy identification:

- **Courses**: `a1b2c3d4-...`, `b2c3d4e5-...`, `c3d4e5f6-...`
- **Lessons**: Start with `d4e5f6a7-...` through `b4c5d6e7-...`
- **Materials**: Simple patterns like `11111111-1111-...`, `22222222-2222-...`
- **Quizzes**: `11aa11aa-...`, `22bb22bb-...`, `33cc33cc-...`
- **Questions**: `q1111111-...`, `q2222222-...`, etc.

## Notes

- All materials use only 'video' or 'document' type (matching schema constraints)
- 'interactive' and 'image' types have been removed from the schema
- YouTube URLs are placeholders - replace with real educational videos
- Document URLs are examples - replace with actual PDF links
- No enrollments or results are seeded - these should be created through the app

## Resetting Data

To clear all data and start fresh:

```sql
-- Warning: This deletes all data!
TRUNCATE TABLE submissions, results, questions, quizzes, materials, lessons, enrollments, courses RESTART IDENTITY CASCADE;
```

Then re-run the seed file.

## Troubleshooting

**Error: "user_id violates foreign key constraint"**
- Make sure you replaced 'YOUR_USER_ID' with a valid UUID from auth.users

**Error: "duplicate key value violates unique constraint"**
- Data already exists. Either clear the tables first or skip existing records

**Error: "relation does not exist"**
- Run schema.sql first to create all tables

**Error: "new row violates check constraint"**
- Make sure material types are only 'video' or 'document'
- Check that course_id and lesson_id references are valid UUIDs
