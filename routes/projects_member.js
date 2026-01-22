const express = require('express');
const router = express.Router();
const Project = require('../models/Project');

function isAuthenticated(req, res, next) {
  if (req.isAuthenticated && req.isAuthenticated()) return next();
  res.redirect('/auth/login');
}

router.get('/mine', isAuthenticated, async (req, res) => {
  try {
    const projects = await Project.find({ members: req.user._id }).populate('leader');
    res.render('projects/member_index', { projects, user: req.user });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

module.exports = router;
