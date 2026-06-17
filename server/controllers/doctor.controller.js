import { getAllDoctors, getDoctorById, createDoctor, updateDoctor } from '../models/doctors.Model.js';
import { updateUserRole } from '../models/user.Model.js';

export async function listDoctors(req, res) {
  try {
    res.json(await getAllDoctors(req.query.specialty));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export async function getDoctor(req, res) {
  try {
    const doc = await getDoctorById(req.params.id);
    if (!doc) return res.status(404).json({ message: 'Not found' });
    res.json(doc);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export async function addDoctor(req, res) {
  try {
    const { user_id, specialty, license_number, bio } = req.body;
    const doc = await createDoctor({ user_id, specialty, license_number, bio });
    await updateUserRole(user_id, 'doctor');
    res.status(201).json(doc);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export async function editDoctor(req, res) {
  try {
    res.json(await updateDoctor(req.params.id, req.body));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}
