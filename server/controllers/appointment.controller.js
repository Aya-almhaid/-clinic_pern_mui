import {
  createAppointment, getAppointmentsForUser, getAppointmentById,
  updateAppointmentStatus, rescheduleAppointment
} from '../models/appointment.model.js';
import { getDoctorByUserId } from '../models/doctors.Model.js';

export async function bookAppointment(req, res) {
  try {
    const { doctor_id, scheduled_at, reason } = req.body;
    res.status(201).json(await createAppointment({ patient_id: req.user.id, doctor_id, scheduled_at, reason }));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export async function myAppointments(req, res) {
  try {
    res.json(await getAppointmentsForUser(req.user.id, req.user.role));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export async function changeStatus(req, res) {
  try {
    const appt = await getAppointmentById(req.params.id);
    if (!appt) return res.status(404).json({ message: 'Not found' });

    const { role, id: userId } = req.user;

    if (role === 'patient') {
      if (appt.patient_id !== userId) return res.status(403).json({ message: 'Forbidden' });
      if (req.body.status !== 'cancelled') return res.status(403).json({ message: 'Patients may only cancel' });
    } else if (role === 'doctor') {
      const doc = await getDoctorByUserId(userId);
      if (!doc || doc.id !== appt.doctor_id) return res.status(403).json({ message: 'Forbidden' });
    }

    res.json(await updateAppointmentStatus(appt.id, req.body.status));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export async function reschedule(req, res) {
  try {
    res.json(await rescheduleAppointment(req.params.id, req.body.scheduled_at));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}
