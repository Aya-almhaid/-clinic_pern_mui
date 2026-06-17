import {
  submitFeedback, getApprovedFeedback, getMyFeedback, getAllFeedback, moderateFeedback
} from '../models/feedback.model.js';

export async function postFeedback(req, res) {
  try {
    res.status(201).json(await submitFeedback({ user_id: req.user.id, ...req.body }));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export async function approvedFeedback(req, res) {
  try {
    res.json({ feedback: await getApprovedFeedback() });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export async function myFeedback(req, res) {
  try {
    res.json(await getMyFeedback(req.user.id));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export async function allFeedback(req, res) {
  try {
    res.json(await getAllFeedback());
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export async function updateFeedbackStatus(req, res) {
  try {
    res.json(await moderateFeedback(req.params.id, req.body.status, req.user.id));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}
