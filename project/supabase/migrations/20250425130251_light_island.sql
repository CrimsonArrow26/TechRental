/*
  # Authentication Schema Setup

  1. New Tables
    - `students`
      - `id` (uuid, primary key)
      - `registration_number` (text, unique)
      - `name` (text)
      - `email` (text)
      - `password_hash` (text)
      - `created_at` (timestamp)
      - `last_login` (timestamp)
    
    - `staff`
      - `id` (uuid, primary key)
      - `email` (text, unique)
      - `name` (text)
      - `role` (text)
      - `created_at` (timestamp)
      - `last_login` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated access
*/

-- Create students table
CREATE TABLE IF NOT EXISTS students (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  registration_number text UNIQUE NOT NULL,
  name text NOT NULL,
  email text UNIQUE NOT NULL,
  password_hash text NOT NULL,
  created_at timestamptz DEFAULT now(),
  last_login timestamptz
);

-- Create staff table
CREATE TABLE IF NOT EXISTS staff (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  name text NOT NULL,
  role text NOT NULL CHECK (role IN ('staff', 'admin')),
  created_at timestamptz DEFAULT now(),
  last_login timestamptz
);

-- Enable RLS
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff ENABLE ROW LEVEL SECURITY;

-- Policies for students table
CREATE POLICY "Students can read own data"
  ON students
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Staff can read all student data"
  ON students
  FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM staff WHERE id = auth.uid()
  ));

-- Policies for staff table
CREATE POLICY "Staff can read own data"
  ON staff
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Admins can read all staff data"
  ON staff
  FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM staff WHERE id = auth.uid() AND role = 'admin'
  ));