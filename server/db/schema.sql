-- Users: shared account/profile data for every role (patient, doctor, admin)
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'patient' CHECK (role IN ('patient', 'doctor', 'admin')),
    phone VARCHAR(20),
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Doctors: professional/specialty info, one row per doctor user
CREATE TABLE IF NOT EXISTS doctors (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    specialty VARCHAR(100) NOT NULL,
    license_number VARCHAR(50) UNIQUE NOT NULL,
    bio TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Appointments: a patient booking a time slot with a doctor
CREATE TABLE IF NOT EXISTS appointments (
    id SERIAL PRIMARY KEY,
    patient_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    doctor_id INTEGER NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
    scheduled_at TIMESTAMP NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),
    reason TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Medical records: a diagnosis/notes entry written by a doctor for a patient,
-- optionally tied to the appointment it was written during
CREATE TABLE IF NOT EXISTS medical_records (
    id SERIAL PRIMARY KEY,
    appointment_id INTEGER REFERENCES appointments(id) ON DELETE SET NULL,
    patient_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    doctor_id INTEGER NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
    diagnosis TEXT NOT NULL,
    notes TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Prescriptions: medication issued as part of a medical record
CREATE TABLE IF NOT EXISTS prescriptions (
    id SERIAL PRIMARY KEY,
    record_id INTEGER NOT NULL REFERENCES medical_records(id) ON DELETE CASCADE,
    medication VARCHAR(150) NOT NULL,
    dosage VARCHAR(100),
    instructions TEXT,
    duration VARCHAR(100),
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Record notes: timestamped follow-up notes added to a medical record after
-- it was created (progress notes), each attributed to the author who wrote it
CREATE TABLE IF NOT EXISTS record_notes (
    id SERIAL PRIMARY KEY,
    record_id INTEGER NOT NULL REFERENCES medical_records(id) ON DELETE CASCADE,
    author_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    note TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Feedback: a rating + comment submitted by any user, pending moderation by
-- a doctor or admin before it appears publicly
CREATE TABLE IF NOT EXISTS feedback (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment TEXT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    moderated_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);