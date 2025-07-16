const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const prisma = require('../utils/prisma');
const authenticateToken = require('../middleware/authenticateToken');
const router = express.Router();

// REGISTER
router.post('/register', async (req, res) => {
  console.log("REGISTER endpoint hit");

  const { name, email, password } = req.body;
  console.log("Received:", { name, email, password });

  try {
    const existing = await prisma.user.findUnique({ where: { email } });
    console.log("Existing user check complete");

    if (existing) {
      console.log("User already exists");
      return res.status(400).json({ error: 'User already exists' });
    }

    const hashed = await bcrypt.hash(password, 10);
    console.log("Password hashed");

    const user = await prisma.user.create({
      data: { name, email, password: hashed },
    });
    console.log("User created:", user);

    const jwtSecret = process.env.JWT_SECRET;
    console.log("JWT_SECRET is:", jwtSecret);

    if (!jwtSecret) {
      console.error("JWT_SECRET is missing");
      return res.status(500).json({ error: "JWT_SECRET is missing" });
    }

    const token = jwt.sign({ id: user.id }, jwtSecret, { expiresIn: '1h' });
    console.log("Token generated:", token);

    res.status(201).json({ token });
    console.log("Response sent successfully");
  } catch (err) {
    console.error("🔥 Registration failed:", err);
    res.status(500).json({ error: 'Registration failed' });
  }
});


// LOGIN
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  console.log("Login attempt:", email);

  try {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      console.log("User not found");
      return res.status(404).json({ error: 'User not found' });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      console.log("Invalid password");
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    console.log("Login successful, token issued");

    res.json({ token });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: 'Login failed' });
  }
});


router.get('/some-protected-route', authenticateToken, (req, res) => {
  res.send(`You are user ${req.user.id}`);
});

module.exports = router;
