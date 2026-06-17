export function validateRegister(req, res, next) {
  const { name, email, password } = req.body;
  if (!name || !email || !password)
    return res.status(400).json({ message: 'Name, email and password are required.' });
  if (password.length < 6)
    return res.status(400).json({ message: 'Password must be at least 6 characters.' });
  if (!email.includes('@'))
    return res.status(400).json({ message: 'Invalid email address.' });
  next();
}

export function validateLogin(req, res, next) {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ message: 'Email and password are required.' });
  next();
}

export function validateFeedback(req, res, next) {
  const { rating, comment } = req.body;
  if (!rating || !comment)
    return res.status(400).json({ message: 'Rating and comment are required.' });
  if (rating < 1 || rating > 5)
    return res.status(400).json({ message: 'Rating must be between 1 and 5.' });
  next();
}

export function validateAppointment(req, res, next) {
  const { doctor_id, scheduled_at } = req.body;
  if (!doctor_id || !scheduled_at)
    return res.status(400).json({ message: 'Doctor and date/time are required.' });
  next();
}
