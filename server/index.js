import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './Config/connectPool.js';
import { errorHandler } from './middleware/error.middleware.js';
import authRoutes from './routes/auth.routes.js';
import userRoutes from './routes/user.routes.js';
import doctorRoutes from './routes/doctor.routes.js';
import appointmentRoutes from './routes/appointment.routes.js';
import recordRoutes from './routes/medicalRecord.routes.js';
import prescriptionRoutes from './routes/prescription.routes.js';
import feedbackRoutes from './routes/feedback.routes.js';
import patientRoutes from './routes/patient.routes.js';

dotenv.config();


const allowedOriginPatterns = [
  /^https:\/\/clinic-pern-mui(-[a-z0-9]+)*\.vercel\.app$/,
  /^https:\/\/clinic-pern-mui-static\.onrender\.com$/,
  /^http:\/\/localhost:\d+$/,
];

const app = express();
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOriginPatterns.some((pattern) => pattern.test(origin))) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials:true,
  methods:["GET","POST","PUT","PATCH","DELETE"]
}));
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/records', recordRoutes);
app.use('/api/prescriptions', prescriptionRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/patients', patientRoutes);

app.use(errorHandler);

const PORT = process.env.PORT || 5000;

connectDB().then(() => app.listen(PORT, () => console.log(`Server running on port ${PORT}`)));
