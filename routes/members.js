const express = require('express');
const router = express.Router();   

const Member = require('../models/Member');   

router.get('/new', (req, res) => res.render('members/new'));

router.post('/', async (req, res) => {
  try {
    const member = new Member(req.body.member);
    await member.save();

    const returnTo = req.query.returnTo || '/projects/new';
    res.redirect(returnTo);
  } catch (err) {
    console.error(err);
    res.status(400).send('Error creating member');
  }
});

router.get('/', async (req, res) => {
  const members = await Member.find();
  res.render('members/index', { members });
});

module.exports = router;