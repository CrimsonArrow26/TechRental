/*
  # Add Sample Data for Rental Management System

  1. Sample Items
    - Arduino boards
    - Motors
    - Sensors
    - Drone components
  
  2. Serial Numbers
    - Multiple units for each item
  
  3. Sample Rentals
    - Active rentals
    - Overdue rentals
    - Mix of different items
*/

-- Insert sample items
DO $$
DECLARE
  arduino_cat_id uuid;
  motors_cat_id uuid;
  sensors_cat_id uuid;
  drone_cat_id uuid;
  
  -- Item IDs
  arduino_uno_id uuid;
  arduino_mega_id uuid;
  dc_motor_id uuid;
  servo_motor_id uuid;
  temp_sensor_id uuid;
  flight_controller_id uuid;
BEGIN
  -- Get category IDs
  SELECT id INTO arduino_cat_id FROM categories WHERE slug = 'arduino-boards';
  SELECT id INTO motors_cat_id FROM categories WHERE slug = 'dc-motors';
  SELECT id INTO sensors_cat_id FROM categories WHERE slug = 'temperature-sensors';
  SELECT id INTO drone_cat_id FROM categories WHERE slug = 'flight-controllers';

  -- Insert Arduino items
  INSERT INTO items (name, description, category_id, model_number, total_quantity, available_quantity)
  VALUES 
    ('Arduino Uno R3', 'Standard Arduino board with ATmega328P microcontroller', arduino_cat_id, 'A000066', 10, 7)
  RETURNING id INTO arduino_uno_id;

  INSERT INTO items (name, description, category_id, model_number, total_quantity, available_quantity)
  VALUES 
    ('Arduino Mega 2560', 'Advanced Arduino board with more I/O pins', arduino_cat_id, 'A000067', 5, 3)
  RETURNING id INTO arduino_mega_id;

  -- Insert Motor items
  INSERT INTO items (name, description, category_id, model_number, total_quantity, available_quantity)
  VALUES 
    ('12V DC Motor', 'High-torque DC motor with encoder', motors_cat_id, 'DCM-100', 15, 12)
  RETURNING id INTO dc_motor_id;

  INSERT INTO items (name, description, category_id, model_number, total_quantity, available_quantity)
  VALUES 
    ('Servo Motor SG90', '9g micro servo motor', motors_cat_id, 'SG90', 20, 15)
  RETURNING id INTO servo_motor_id;

  -- Insert Sensor items
  INSERT INTO items (name, description, category_id, model_number, total_quantity, available_quantity)
  VALUES 
    ('DHT22 Temperature Sensor', 'Digital temperature and humidity sensor', sensors_cat_id, 'DHT22', 25, 20)
  RETURNING id INTO temp_sensor_id;

  -- Insert Drone components
  INSERT INTO items (name, description, category_id, model_number, total_quantity, available_quantity)
  VALUES 
    ('F4 Flight Controller', 'Advanced flight controller for drones', drone_cat_id, 'FC-F4', 8, 5)
  RETURNING id INTO flight_controller_id;

  -- Insert serial numbers for Arduino Uno
  INSERT INTO serial_numbers (item_id, serial_number, status)
  SELECT 
    arduino_uno_id,
    'UNO-' || LPAD(CAST(generate_series AS text), 3, '0'),
    CASE WHEN generate_series <= 3 THEN 'rented' ELSE 'available' END
  FROM generate_series(1, 10);

  -- Insert serial numbers for Arduino Mega
  INSERT INTO serial_numbers (item_id, serial_number, status)
  SELECT 
    arduino_mega_id,
    'MEGA-' || LPAD(CAST(generate_series AS text), 3, '0'),
    CASE WHEN generate_series <= 2 THEN 'rented' ELSE 'available' END
  FROM generate_series(1, 5);

  -- Insert serial numbers for DC Motor
  INSERT INTO serial_numbers (item_id, serial_number, status)
  SELECT 
    dc_motor_id,
    'DCM-' || LPAD(CAST(generate_series AS text), 3, '0'),
    CASE WHEN generate_series <= 3 THEN 'rented' ELSE 'available' END
  FROM generate_series(1, 15);

  -- Insert serial numbers for Servo Motor
  INSERT INTO serial_numbers (item_id, serial_number, status)
  SELECT 
    servo_motor_id,
    'SRV-' || LPAD(CAST(generate_series AS text), 3, '0'),
    CASE WHEN generate_series <= 5 THEN 'rented' ELSE 'available' END
  FROM generate_series(1, 20);

  -- Insert serial numbers for Temperature Sensor
  INSERT INTO serial_numbers (item_id, serial_number, status)
  SELECT 
    temp_sensor_id,
    'DHT-' || LPAD(CAST(generate_series AS text), 3, '0'),
    CASE WHEN generate_series <= 5 THEN 'rented' ELSE 'available' END
  FROM generate_series(1, 25);

  -- Insert serial numbers for Flight Controller
  INSERT INTO serial_numbers (item_id, serial_number, status)
  SELECT 
    flight_controller_id,
    'FC-' || LPAD(CAST(generate_series AS text), 3, '0'),
    CASE WHEN generate_series <= 3 THEN 'rented' ELSE 'available' END
  FROM generate_series(1, 8);

  -- Insert sample rentals
  -- For Arduino Uno
  INSERT INTO rentals (student_id, item_id, serial_number_id, issued_date, due_date, status)
  SELECT 
    (SELECT id FROM students ORDER BY RANDOM() LIMIT 1),
    arduino_uno_id,
    id,
    NOW() - INTERVAL '5 days',
    CASE 
      WHEN RANDOM() < 0.3 THEN NOW() - INTERVAL '1 day'  -- Overdue
      ELSE NOW() + INTERVAL '7 days'  -- Active
    END,
    CASE 
      WHEN RANDOM() < 0.3 THEN 'overdue'
      ELSE 'active'
    END
  FROM serial_numbers
  WHERE item_id = arduino_uno_id AND status = 'rented';

  -- For Arduino Mega
  INSERT INTO rentals (student_id, item_id, serial_number_id, issued_date, due_date, status)
  SELECT 
    (SELECT id FROM students ORDER BY RANDOM() LIMIT 1),
    arduino_mega_id,
    id,
    NOW() - INTERVAL '3 days',
    NOW() + INTERVAL '11 days',
    'active'
  FROM serial_numbers
  WHERE item_id = arduino_mega_id AND status = 'rented';

  -- For DC Motor
  INSERT INTO rentals (student_id, item_id, serial_number_id, issued_date, due_date, status)
  SELECT 
    (SELECT id FROM students ORDER BY RANDOM() LIMIT 1),
    dc_motor_id,
    id,
    NOW() - INTERVAL '7 days',
    NOW() + INTERVAL '14 days',
    'active'
  FROM serial_numbers
  WHERE item_id = dc_motor_id AND status = 'rented';

  -- For Flight Controller
  INSERT INTO rentals (student_id, item_id, serial_number_id, issued_date, due_date, status)
  SELECT 
    (SELECT id FROM students ORDER BY RANDOM() LIMIT 1),
    flight_controller_id,
    id,
    NOW() - INTERVAL '10 days',
    NOW() - INTERVAL '2 days',
    'overdue'
  FROM serial_numbers
  WHERE item_id = flight_controller_id AND status = 'rented'
  LIMIT 1;
END $$;