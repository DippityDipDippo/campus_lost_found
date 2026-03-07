-- QIU Campus Lost & Found System - MySQL Schema

CREATE DATABASE IF NOT EXISTS lostandfound_db;
USE lostandfound_db;

CREATE TABLE IF NOT EXISTS items (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  title         VARCHAR(150) NOT NULL,
  description   TEXT NOT NULL,
  category      ENUM('Lost', 'Found') NOT NULL,
  location      VARCHAR(200) NOT NULL,
  date_occurred DATE NOT NULL,
  contact_name  VARCHAR(100) NOT NULL,
  contact_email VARCHAR(150) NOT NULL,
  contact_phone VARCHAR(20),
  status        ENUM('Active', 'Claimed', 'Resolved') NOT NULL DEFAULT 'Active',
  image_url     VARCHAR(500),
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Sample data
INSERT INTO items (title, description, category, location, date_occurred, contact_name, contact_email, contact_phone, status) VALUES
('Black Laptop Bag',     'Black Targus laptop bag with MacBook Pro 13" inside, name tag attached', 'Lost',  'Library, Level 2',       '2026-02-28', 'Ahmad Razif',   'ahmad@student.qiu.edu.my',  '012-3456789', 'Active'),
('Student ID Card',      'QIU Student ID Card found near the cafeteria',                          'Found', 'Cafeteria Entrance',      '2026-03-01', 'Security Office','security@qiu.edu.my',       '05-1234567',  'Active'),
('Blue Water Bottle',    'Hydro Flask blue water bottle with stickers',                           'Lost',  'Computer Lab A, Block C', '2026-03-02', 'Priya Nair',    'priya@student.qiu.edu.my',  '016-9876543', 'Active'),
('Samsung Galaxy Watch', 'Black Samsung Galaxy Watch 5, found in parking lot P1',                 'Found', 'Parking Lot P1',          '2026-03-03', 'Lee Wei Ming',  'wm.lee@student.qiu.edu.my', '011-2345678', 'Claimed');
