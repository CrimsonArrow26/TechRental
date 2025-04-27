/*
  # Rental Management System Schema

  1. New Tables
    - `categories`
      - `id` (uuid, primary key)
      - `name` (text)
      - `slug` (text)
      - `parent_id` (uuid, self-reference for subcategories)
      - `created_at` (timestamp)
    
    - `items`
      - `id` (uuid, primary key)
      - `name` (text)
      - `description` (text)
      - `category_id` (uuid, foreign key)
      - `model_number` (text)
      - `total_quantity` (integer)
      - `available_quantity` (integer)
      - `created_at` (timestamp)
    
    - `serial_numbers`
      - `id` (uuid, primary key)
      - `item_id` (uuid, foreign key)
      - `serial_number` (text)
      - `status` (text) - available/rented
      - `created_at` (timestamp)
    
    - `rentals`
      - `id` (uuid, primary key)
      - `student_id` (uuid, foreign key)
      - `item_id` (uuid, foreign key)
      - `serial_number_id` (uuid, foreign key)
      - `issued_date` (timestamp)
      - `due_date` (timestamp)
      - `return_date` (timestamp)
      - `status` (text) - active/returned/overdue
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated access
*/

-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  parent_id uuid REFERENCES categories(id),
  created_at timestamptz DEFAULT now()
);

-- Create items table
CREATE TABLE IF NOT EXISTS items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  category_id uuid REFERENCES categories(id) NOT NULL,
  model_number text,
  total_quantity integer NOT NULL DEFAULT 0,
  available_quantity integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT positive_quantities CHECK (total_quantity >= 0 AND available_quantity >= 0)
);

-- Create serial_numbers table
CREATE TABLE IF NOT EXISTS serial_numbers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id uuid REFERENCES items(id) NOT NULL,
  serial_number text UNIQUE NOT NULL,
  status text NOT NULL CHECK (status IN ('available', 'rented')),
  created_at timestamptz DEFAULT now()
);

-- Create rentals table
CREATE TABLE IF NOT EXISTS rentals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid REFERENCES students(id) NOT NULL,
  item_id uuid REFERENCES items(id) NOT NULL,
  serial_number_id uuid REFERENCES serial_numbers(id) NOT NULL,
  issued_date timestamptz NOT NULL DEFAULT now(),
  due_date timestamptz NOT NULL,
  return_date timestamptz,
  status text NOT NULL CHECK (status IN ('active', 'returned', 'overdue')),
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE items ENABLE ROW LEVEL SECURITY;
ALTER TABLE serial_numbers ENABLE ROW LEVEL SECURITY;
ALTER TABLE rentals ENABLE ROW LEVEL SECURITY;

-- Policies for categories
CREATE POLICY "Categories are viewable by all users"
  ON categories
  FOR SELECT
  TO authenticated
  USING (true);

-- Policies for items
CREATE POLICY "Items are viewable by all users"
  ON items
  FOR SELECT
  TO authenticated
  USING (true);

-- Policies for serial_numbers
CREATE POLICY "Serial numbers are viewable by staff"
  ON serial_numbers
  FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM staff WHERE id = auth.uid()
  ));

-- Policies for rentals
CREATE POLICY "Staff can view all rentals"
  ON rentals
  FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM staff WHERE id = auth.uid()
  ));

CREATE POLICY "Students can view own rentals"
  ON rentals
  FOR SELECT
  TO authenticated
  USING (student_id = auth.uid());

-- Insert initial categories
INSERT INTO categories (name, slug) VALUES
  ('Drone Components', 'drone-components'),
  ('Motors', 'motors'),
  ('Arduino & Microcontrollers', 'arduino-microcontrollers'),
  ('Sensors', 'sensors'),
  ('Other Electronics', 'other-electronics');

-- Insert subcategories
DO $$
DECLARE
  drone_id uuid;
  motors_id uuid;
  arduino_id uuid;
  sensors_id uuid;
BEGIN
  -- Get parent category IDs
  SELECT id INTO drone_id FROM categories WHERE slug = 'drone-components';
  SELECT id INTO motors_id FROM categories WHERE slug = 'motors';
  SELECT id INTO arduino_id FROM categories WHERE slug = 'arduino-microcontrollers';
  SELECT id INTO sensors_id FROM categories WHERE slug = 'sensors';

  -- Insert subcategories
  -- Drone Components subcategories
  INSERT INTO categories (name, slug, parent_id) VALUES
    ('Flight Controllers', 'flight-controllers', drone_id),
    ('ESCs', 'escs', drone_id),
    ('Frames', 'frames', drone_id),
    ('Propellers', 'propellers', drone_id);

  -- Motors subcategories
  INSERT INTO categories (name, slug, parent_id) VALUES
    ('DC Motors', 'dc-motors', motors_id),
    ('Servo Motors', 'servo-motors', motors_id),
    ('Stepper Motors', 'stepper-motors', motors_id);

  -- Arduino & Microcontrollers subcategories
  INSERT INTO categories (name, slug, parent_id) VALUES
    ('Arduino Boards', 'arduino-boards', arduino_id),
    ('ESP32', 'esp32', arduino_id),
    ('Raspberry Pi', 'raspberry-pi', arduino_id),
    ('STM32', 'stm32', arduino_id);

  -- Sensors subcategories
  INSERT INTO categories (name, slug, parent_id) VALUES
    ('Temperature Sensors', 'temperature-sensors', sensors_id),
    ('Humidity Sensors', 'humidity-sensors', sensors_id),
    ('Motion Sensors', 'motion-sensors', sensors_id),
    ('Distance Sensors', 'distance-sensors', sensors_id);
END $$;