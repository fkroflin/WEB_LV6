const express = require('express');
const router = express.Router();
const Project = require('../models/Project');

function isAuthenticated(req, res, next) {
  if (req.isAuthenticated && req.isAuthenticated()) return next();
  res.redirect('/auth/login');
}

router.get('/mine', isAuthenticated, async (req, res) => {
  try {
    const today = new Date();
    const projects = await Project.find({
      leader: req.user._id,
      $or: [{ endDate: null }, { endDate: { $gte: today } }] // only active projects
    }).populate('members');

    res.render('projects/leader_index', { projects, user: req.user });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

module.exports = router;
