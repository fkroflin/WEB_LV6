const express = require('express');
const router = express.Router();
const passport = require('passport');
const User = require('../models/User');

router.get('/register', (req, res) => {
  res.render('auth/register');
});

router.post('/register', async (req, res) => {
  try {
    const { username, password } = req.body;

    const existing = await User.findOne({ username });
    if (existing) {
      req.flash('error_msg', 'Username already exists');
      return res.redirect('/auth/register');
    }

    const user = new User({ username, password });
    await user.save();

    req.flash('success_msg', 'Registration successful. You can now log in.');
    res.redirect('/auth/login');
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Registration failed');
    res.redirect('/auth/register');
  }
});

router.get('/login', (req, res) => {
  res.render('auth/login');
});

router.post('/login',
  passport.authenticate('local', {
    successRedirect: '/projects',
    failureRedirect: '/auth/login',
    failureFlash: true
  })
);

router.get('/logout', (req, res, next) => {
  req.logout(function(err) {
    if (err) { return next(err); }
    res.redirect('/auth/login');
  });
});

module.exports = router;
