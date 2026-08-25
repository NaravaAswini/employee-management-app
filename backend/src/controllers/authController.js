import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { getPool, isFallbackMode, mockData } from '../config/db.js';

// Validation helper for email according to exact requirements
export function validateEmail(email) {
  if (!email || typeof email !== 'string') {
    return { valid: false, message: 'Email address is required.' };
  }

  // No Spaces rule
  if (/\s/.test(email)) {
    return { valid: false, message: 'Email cannot contain whitespace characters.' };
  }

  // Length limit rule: max 320 characters
  if (email.length > 320) {
    return { valid: false, message: 'Email length cannot exceed 320 characters.' };
  }

  // Exactly one @ symbol rule
  const atParts = email.split('@');
  if (atParts.length !== 2) {
    return { valid: false, message: 'Email must contain exactly one "@" symbol separating the local name and domain.' };
  }

  const [localPart, domainPart] = atParts;
  if (!localPart || localPart.length === 0) {
    return { valid: false, message: 'Email local part before "@" cannot be empty.' };
  }

  if (!domainPart || domainPart.length === 0 || !domainPart.includes('.')) {
    return { valid: false, message: 'Email domain part after "@" must contain a valid domain (e.g., domain.com).' };
  }

  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
  if (!emailRegex.test(email)) {
    return { valid: false, message: 'Please provide a valid email format.' };
  }

  return { valid: true };
}

// Validation helper for password according to exact requirements
export function validatePassword(password) {
  if (!password || typeof password !== 'string') {
    return { valid: false, message: 'Password is required.' };
  }

  const errors = [];

  // Minimum length: 8 characters
  if (password.length < 8) {
    errors.push('Must be at least 8 characters long.');
  }

  // Uppercase letter: at least one capital letter from A to Z
  if (!/[A-Z]/.test(password)) {
    errors.push('Must include at least one uppercase letter (A-Z).');
  }

  // Lowercase letter: at least one lowercase letter from a to z
  if (!/[a-z]/.test(password)) {
    errors.push('Must include at least one lowercase letter (a-z).');
  }

  // Numbers: at least one numeric digit from 0 to 9
  if (!/[0-9]/.test(password)) {
    errors.push('Must include at least one numeric digit (0-9).');
  }

  // Special characters: at least one symbol like @, $, !, or %
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push('Must include at least one special character (e.g., @, $, !, %, &, *).');
  }

  if (errors.length > 0) {
    return { valid: false, message: errors.join(' ') };
  }

  return { valid: true };
}

function generateToken(user) {
  const secret = process.env.JWT_SECRET || 'employee_management_jwt_secret_key_2026_secure';
  const expiresIn = process.env.JWT_EXPIRES_IN || '7d';
  return jwt.sign(
    { id: user.id, email: user.email, name: user.name },
    secret,
    { expiresIn }
  );
}

export async function register(req, res, next) {
  try {
    const { name, email, password } = req.body;

    if (!name || name.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Name is required and must be at least 2 characters.'
      });
    }

    const emailCheck = validateEmail(email);
    if (!emailCheck.valid) {
      return res.status(400).json({ success: false, message: emailCheck.message });
    }

    const passwordCheck = validatePassword(password);
    if (!passwordCheck.valid) {
      return res.status(400).json({ success: false, message: passwordCheck.message });
    }

    const cleanEmail = email.trim().toLowerCase();
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    if (isFallbackMode()) {
      const existing = mockData.users.find(u => u.email.toLowerCase() === cleanEmail);
      if (existing) {
        return res.status(409).json({
          success: false,
          message: 'An account with this email already exists. Please sign in instead.'
        });
      }

      const newUser = {
        id: mockData.nextUserId++,
        name: name.trim(),
        email: cleanEmail,
        password_hash: passwordHash,
        created_at: new Date()
      };
      mockData.users.push(newUser);

      const token = generateToken(newUser);
      return res.status(201).json({
        success: true,
        message: 'Registration successful! Welcome aboard.',
        token,
        user: { id: newUser.id, name: newUser.name, email: newUser.email }
      });
    }

    const pool = getPool();
    const [existingUsers] = await pool.query('SELECT id FROM users WHERE email = ?', [cleanEmail]);
    if (existingUsers.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email already exists. Please sign in instead.'
      });
    }

    const [result] = await pool.query(
      'INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)',
      [name.trim(), cleanEmail, passwordHash]
    );

    const user = { id: result.insertId, name: name.trim(), email: cleanEmail };
    const token = generateToken(user);

    res.status(201).json({
      success: true,
      message: 'Registration successful! Welcome aboard.',
      token,
      user
    });
  } catch (error) {
    next(error);
  }
}

export async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    const emailCheck = validateEmail(email);
    if (!emailCheck.valid) {
      return res.status(400).json({ success: false, message: emailCheck.message });
    }

    if (!password) {
      return res.status(400).json({ success: false, message: 'Password is required.' });
    }

    const cleanEmail = email.trim().toLowerCase();

    if (isFallbackMode()) {
      const user = mockData.users.find(u => u.email.toLowerCase() === cleanEmail);
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password. If you are a new user, please register first.'
        });
      }

      const isMatch = await bcrypt.compare(password, user.password_hash);
      if (!isMatch) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password. Please try again.'
        });
      }

      const token = generateToken(user);
      return res.json({
        success: true,
        message: 'Signed in successfully!',
        token,
        user: { id: user.id, name: user.name, email: user.email }
      });
    }

    const pool = getPool();
    const [users] = await pool.query('SELECT * FROM users WHERE email = ?', [cleanEmail]);
    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password. If you are a new user, please register first.'
      });
    }

    const user = users[0];
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password. Please try again.'
      });
    }

    const token = generateToken(user);
    res.json({
      success: true,
      message: 'Signed in successfully!',
      token,
      user: { id: user.id, name: user.name, email: user.email }
    });
  } catch (error) {
    next(error);
  }
}

export async function getMe(req, res, next) {
  try {
    const userId = req.user.id;

    if (isFallbackMode()) {
      const user = mockData.users.find(u => u.id === userId);
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found.' });
      }
      return res.json({
        success: true,
        user: { id: user.id, name: user.name, email: user.email, created_at: user.created_at }
      });
    }

    const pool = getPool();
    const [users] = await pool.query('SELECT id, name, email, created_at FROM users WHERE id = ?', [userId]);
    if (users.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    res.json({
      success: true,
      user: users[0]
    });
  } catch (error) {
    next(error);
  }
}
