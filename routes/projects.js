const express = require('express');
const router = express.Router();
const Project = require('../models/Project');
const Member = require('../models/Member');

router.get('/', async (req, res) => {
  const projects = await Project.find().populate('members');
  res.render('projects/index', { projects });
});

router.get('/new', async (req, res) => {
  const members = await Member.find().sort({ name: 1 });
  res.render('projects/new', { members });
});

router.post('/', async (req, res) => {
  try {
    const project = new Project(req.body.project);
    if (req.body.members) {
      project.members = Array.isArray(req.body.members) 
        ? req.body.members 
        : [req.body.members];
    }
    await project.save();
    res.redirect('/projects');
  } catch (err) {
    console.error(err);
    res.status(400).send('Error creating project');
  }
});

router.get('/:id', async (req, res) => {
  const project = await Project.findById(req.params.id).populate('members');
  if (!project) return res.status(404).send('Project not found');
  res.render('projects/show', { project });
});

router.get('/:id/edit', async (req, res) => {
  try {
    const project = await Project.findById(req.params.id).populate('members');
    if (!project) {
      return res.status(404).send('Project not found');
    }
    
    const members = await Member.find().sort({ name: 1 });
    res.render('projects/edit', { project, members });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

router.put('/:id', async (req, res) => {
  try {
    const project = await Project.findByIdAndUpdate(req.params.id, req.body.project, { new: true });
    if (req.body.members) {
      project.members = Array.isArray(req.body.members) ? req.body.members : [req.body.members];
    } else {
      project.members = [];
    }
    await project.save();
    res.redirect(`/projects/${req.params.id}`);
  } catch (err) {
    res.status(400).send(err);
  }
});

router.delete('/:id', async (req, res) => {
  await Project.findByIdAndDelete(req.params.id);
  res.redirect('/projects');
});

module.exports = router;