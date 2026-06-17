import { createPrescription, getPrescriptionsByRecordId, getPrescriptionsForPatient } from '../models/prescription.model.js';
import { getRecordById } from '../models/medicalRecord.model.js';
import { getDoctorByUserId } from '../models/doctors.Model.js';

export async function addPrescription(req, res) {
  try {
    const record = await getRecordById(req.body.record_id);
    if (!record) return res.status(404).json({ message: 'Record not found' });
    const doc = await getDoctorByUserId(req.user.id);
    if (!doc || doc.id !== record.doctor_id) return res.status(403).json({ message: 'Forbidden' });
    res.status(201).json(await createPrescription(req.body));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export async function myPrescriptions(req, res) {
  try {
    res.json(await getPrescriptionsForPatient(req.user.id));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export async function recordPrescriptions(req, res) {
  try {
    const record = await getRecordById(req.params.recordId);
    if (!record) return res.status(404).json({ message: 'Record not found' });
    const { role, id: userId } = req.user;
    if (role === 'patient' && record.patient_id !== userId) return res.status(403).json({ message: 'Forbidden' });
    if (role === 'doctor') {
      const doc = await getDoctorByUserId(userId);
      if (!doc || doc.id !== record.doctor_id) return res.status(403).json({ message: 'Forbidden' });
    }
    res.json(await getPrescriptionsByRecordId(req.params.recordId));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}
