const express = require('express');
const prisma = require('../utils/prisma');
const authenticateToken = require('../middleware/authenticateToken');
//eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MiwiaWF0IjoxNzQ5NTA4MTMxLCJleHAiOjE3NDk1MTE3MzF9.X-DH6UD5nULC28pM-KOndX0hO03UwS5VAsyWqpKkK14  bearer token
const router = express.Router();

// POST /assignments — create a new assignment
router.post('/', authenticateToken, async (req, res) => {
  const { title, description, dueDate } = req.body;

  if (!title || !dueDate) {
    return res.status(400).json({ error: 'Title and due date are required' });
  }

  try {
    const assignment = await prisma.assignment.create({
      data: {
        title,
        description,
        dueDate: new Date(dueDate),
        userId: req.user.id,
      },
    });

    res.status(201).json(assignment);
  } catch (err) {
    console.error('Failed to create assignment:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});
// GET /assignments — fetch all assignments for the logged-in user
router.get('/', authenticateToken, async (req, res) => {
  try {
    const assignments = await prisma.assignment.findMany({
      where: { userId: req.user.id },
      orderBy: { dueDate: 'asc' },
    });

    res.json(assignments);
  } catch (err) {
    console.error('Failed to fetch assignments:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});
// PUT /assignments/:id — update an assignment
router.put('/:id', authenticateToken, async (req, res) => {
  const assignmentId = parseInt(req.params.id);
  const { title, description, dueDate, completed } = req.body;

  if (isNaN(assignmentId)) {
    return res.status(400).json({ error: 'Invalid assignment ID' });
  }

  try {
    // Optional: verify user owns this assignment
    const existing = await prisma.assignment.findUnique({
      where: { id: assignmentId },
    });

    if (!existing || existing.userId !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized to update this assignment' });
    }

    const updated = await prisma.assignment.update({
      where: { id: assignmentId },
      data: {
        title,
        description,
        dueDate: dueDate ? new Date(dueDate) : undefined,
        completed,
      },
    });

    res.json(updated);
  } catch (err) {
    console.error('Failed to update assignment:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});
// DELETE /assignments/:id — delete an assignment
router.delete('/:id', authenticateToken, async (req, res) => {
  const assignmentId = parseInt(req.params.id);

  if (isNaN(assignmentId)) {
    return res.status(400).json({ error: 'Invalid assignment ID' });
  }

  try {
    const existing = await prisma.assignment.findUnique({
      where: { id: assignmentId },
    });

    if (!existing || existing.userId !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized to delete this assignment' });
    }

    await prisma.assignment.delete({
      where: { id: assignmentId },
    });

    res.json({ message: 'Assignment deleted successfully' });
  } catch (err) {
    console.error('Failed to delete assignment:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
