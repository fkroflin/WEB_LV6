const express = require('express');
const router = express.Router();
const Project = require('../models/Project');
const User = require('../models/User');

function isAuthenticated(req, res, next) {
  if (req.isAuthenticated && req.isAuthenticated()) return next();
  res.redirect('/auth/login');
}

function isLeader(req, project) {
  return project.leader && project.leader.equals(req.user._id);
}

function isMember(req, project) {
  return project.members.some(m => m.equals(req.user._id));
}

router.get('/', isAuthenticated, async (req, res) => {
  const projects = await Project.find().populate('leader').populate('members');
  res.render('projects/index', { projects });
});

router.get('/new', isAuthenticated, async (req, res) => {
  const members = await User.find();
  res.render('projects/new', { members });
});

router.post('/', isAuthenticated, async (req, res) => {
  try {
    const project = new Project(req.body.project);
    project.leader = req.user._id; 

    if (req.body.members) {
      project.members = Array.isArray(req.body.members)
        ? req.body.members
        : [req.body.members];
      project.members = project.members.filter(m => m.toString() !== req.user._id.toString());
    }

    await project.save();
    res.redirect('/projects');
  } catch (err) {
    console.error(err);
    res.status(400).send(err);
  }
});

router.get('/:id', isAuthenticated, async (req, res) => {
  const project = await Project.findById(req.params.id).populate('leader').populate('members');
  res.render('projects/show', { project });
});

router.get('/:id/edit', isAuthenticated, async (req, res) => {
  const project = await Project.findById(req.params.id).populate('members').populate('leader');
  const members = await User.find();
  const today = new Date();

  if (project.endDate && project.endDate < today) {
    req.flash('error_msg', 'Archived projects cannot be edited.');
    return res.redirect('/projects');
  }

  if (!isLeader(req, project) && !isMember(req, project)) {
    req.flash('error_msg', 'You are not authorized to edit this project');
    return res.redirect('/projects');
  }

  res.render('projects/edit', { 
    project, 
    members, 
    isLeader: isLeader(req, project), 
    isMember: isMember(req, project) 
  });
});


router.put('/:id', isAuthenticated, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!isLeader(req, project) && !isMember(req, project)) {
      req.flash('error_msg', 'You are not authorized to edit this project');
      return res.redirect('/projects');
    }

    if (isMember(req, project) && !isLeader(req, project)) {
      project.completedJobs = req.body.project.completedJobs || project.completedJobs;
    }

    if (isLeader(req, project)) {
      project.name = req.body.project.name;
      project.description = req.body.project.description;
      project.price = req.body.project.price;
      project.completedJobs = req.body.project.completedJobs;
      project.startDate = req.body.project.startDate;
      project.endDate = req.body.project.endDate;

      project.members = req.body.members
        ? Array.isArray(req.body.members)
          ? req.body.members
          : [req.body.members]
        : [];
      project.members = project.members.filter(m => m.toString() !== req.user._id.toString());
    }

    if (project.endDate && project.endDate < new Date()) {
      req.flash('error_msg', 'Archived projects cannot be edited.');
      return res.redirect('/projects');
    }

    await project.save();
    res.redirect(`/projects/${req.params.id}`);
  } catch (err) {
    console.error(err);
    res.status(400).send(err);
  }
});

router.delete('/:id', isAuthenticated, async (req, res) => {
  const project = await Project.findById(req.params.id);

  if (!isLeader(req, project)) {
    req.flash('error_msg', 'Only the project leader can delete this project');
    return res.redirect('/projects');
  }

  await Project.findByIdAndDelete(req.params.id);
  res.redirect('/projects');
});

module.exports = router;
