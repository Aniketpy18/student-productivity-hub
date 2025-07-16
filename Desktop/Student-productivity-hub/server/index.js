const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const authRoutes = require('./routes/auth');
const assignmentRoutes = require('./routes/assignments');
dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.use('/auth', authRoutes); 

app.get('/', (req, res) => {
  res.send('Student Productivity Hub API is live!');
});

app.listen(process.env.PORT || 5000, () => {
  console.log(`Server running on http://localhost:${process.env.PORT}`);
});

app.use('/assignments', assignmentRoutes);
