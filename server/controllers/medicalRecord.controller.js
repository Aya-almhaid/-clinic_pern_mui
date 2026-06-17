import {
  createRecord, getRecordById, getRecordsForPatient, getNotesForRecord, addNoteToRecord
} from '../models/medicalRecord.model.js';
import { getDoctorByUserId } from '../models/doctors.Model.js';

export async function newRecord(req, res) {
  try {
    const doc = await getDoctorByUserId(req.user.id);
    if (!doc) return res.status(403).json({ message: 'Doctor profile not found' });
    const { appointment_id, patient_id, diagnosis, notes } = req.body;
    res.status(201).json(await createRecord({ appointment_id, patient_id, doctor_id: doc.id, diagnosis, notes }));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export async function myRecords(req, res) {
  try {
    res.json(await getRecordsForPatient(req.user.id));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export async function patientRecords(req, res) {
  try {
    res.json(await getRecordsForPatient(req.params.patientId));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export async function getRecord(req, res) {
  try {
    const record = await getRecordById(req.params.id);
    if (!record) return res.status(404).json({ message: 'Not found' });
    const { role, id: userId } = req.user;
    if (role === 'patient' && record.patient_id !== userId) return res.status(403).json({ message: 'Forbidden' });
    if (role === 'doctor') {
      const doc = await getDoctorByUserId(userId);
      if (!doc || doc.id !== record.doctor_id) return res.status(403).json({ message: 'Forbidden' });
    }
    res.json(record);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export async function getNotes(req, res) {
  try {
    const record = await getRecordById(req.params.id);
    if (!record) return res.status(404).json({ message: 'Not found' });

    const { role, id: userId } = req.user;
    if (role === 'patient' && record.patient_id !== userId)
      return res.status(403).json({ message: 'Forbidden' });
    if (role === 'doctor') {
      const doc = await getDoctorByUserId(userId);
      if (!doc || doc.id !== record.doctor_id) return res.status(403).json({ message: 'Forbidden' });
    }

    res.json(await getNotesForRecord(req.params.id));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export async function addNote(req, res) {
  try {
    const record = await getRecordById(req.params.id);
    if (!record) return res.status(404).json({ message: 'Not found' });

    const { role, id: userId } = req.user;
    if (role === 'patient') return res.status(403).json({ message: 'Patients cannot add notes' });
    if (role === 'doctor') {
      const doc = await getDoctorByUserId(userId);
      if (!doc || doc.id !== record.doctor_id) return res.status(403).json({ message: 'Forbidden' });
    }

    res.status(201).json(
      await addNoteToRecord({ record_id: req.params.id, author_id: userId, note: req.body.note })
    );
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}
