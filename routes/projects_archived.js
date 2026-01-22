const express = require('express');
const router = express.Router();
const Project = require('../models/Project');

function isAuthenticated(req, res, next) {
  if (req.isAuthenticated && req.isAuthenticated()) return next();
  res.redirect('/auth/login');
}

// Archived projects for leaders
router.get('/mine', isAuthenticated, async (req, res) => {
  try {
    const today = new Date();
    const projects = await Project.find({
      leader: req.user._id,
      endDate: { $lt: today } // projects whose endDate is before today
    }).populate('members');

    res.render('projects/archived_index', { projects, user: req.user });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

module.exports = router;
