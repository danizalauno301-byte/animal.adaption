CREATE DATABASE IF NOT EXISTS animal_care_db
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE animal_care_db;

CREATE TABLE IF NOT EXISTS staff_users (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(150) NOT NULL,
    username VARCHAR(80) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(40) NOT NULL DEFAULT 'Staff',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS adopters (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(150) NOT NULL,
    email VARCHAR(191) NOT NULL UNIQUE,
    phone VARCHAR(50) NOT NULL,
    username VARCHAR(80) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS animals (
    id BIGINT UNSIGNED NOT NULL PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    type VARCHAR(80) NOT NULL,
    age VARCHAR(80) NOT NULL,
    gender VARCHAR(40) NOT NULL,
    health VARCHAR(120) NOT NULL,
    vaccination VARCHAR(160) NOT NULL,
    care VARCHAR(160) NOT NULL,
    status VARCHAR(60) NOT NULL,
    description TEXT NOT NULL,
    image VARCHAR(255) NOT NULL DEFAULT ''
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS adoption_applications (
    id BIGINT UNSIGNED NOT NULL PRIMARY KEY,
    applicant_name VARCHAR(200) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(191) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    address TEXT NOT NULL,
    animal VARCHAR(150) NOT NULL,
    housing VARCHAR(120) NOT NULL,
    reason TEXT NOT NULL,
    experience TEXT NOT NULL,
    status VARCHAR(60) NOT NULL DEFAULT 'Pending',
    application_date VARCHAR(80) NOT NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS medical_records (
    id BIGINT UNSIGNED NOT NULL PRIMARY KEY,
    animal VARCHAR(150) NOT NULL,
    health VARCHAR(120) NOT NULL,
    vaccination VARCHAR(160) NOT NULL,
    record_date VARCHAR(80) NOT NULL,
    treatment TEXT NOT NULL,
    notes TEXT NOT NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS care_records (
    id BIGINT UNSIGNED NOT NULL PRIMARY KEY,
    animal VARCHAR(150) NOT NULL,
    activity_type VARCHAR(120) NOT NULL,
    record_date VARCHAR(80) NOT NULL,
    status VARCHAR(80) NOT NULL,
    notes TEXT NOT NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS appointments (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    adopter_id BIGINT UNSIGNED NULL,
    full_name VARCHAR(150) NOT NULL,
    email VARCHAR(191) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    animal VARCHAR(150) NOT NULL,
    appointment_date VARCHAR(20) NOT NULL,
    appointment_time VARCHAR(20) NOT NULL,
    notes TEXT NOT NULL,
    status VARCHAR(40) NOT NULL DEFAULT 'Pending',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;
