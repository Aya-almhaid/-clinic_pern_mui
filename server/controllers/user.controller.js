import bcrypt from 'bcryptjs';
import { getAllUsers, getUserById, updateUserById, deleteUserById, updateUserPassword, getUserWithHash } from '../models/user.Model.js';

export async function getMe(req, res) {
  try {
    res.json(await getUserById(req.user.id));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export async function updateMe(req, res) {
  try {
    const { name, phone, email, currentPassword, newPassword } = req.body;

    if (newPassword) {
      const full = await getUserWithHash(req.user.id);
      const match = await bcrypt.compare(currentPassword || '', full.password_hash);
      if (!match) return res.status(400).json({ message: 'Current password is incorrect.' });
      await updateUserPassword(req.user.id, await bcrypt.hash(newPassword, 10));
    }

    const updated = await updateUserById(req.user.id, { name, phone, email });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export async function listUsers(req, res) {
  try {
    res.json(await getAllUsers());
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export async function getUser(req, res) {
  try {
    const user = await getUserById(req.params.id);
    if (!user) return res.status(404).json({ message: 'Not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export async function deleteUser(req, res) {
  try {
    await deleteUserById(req.params.id);
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}
