var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

const mongoose = require('mongoose');

mongoose.connect('mongodb://127.0.0.1:27017/projectsDB')
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log('MongoDB connection error:', err));

const methodOverride = require('method-override');

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));

const session = require('express-session');
app.use(session({
  secret: 'fran-lab-secret-change-this-123456789',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 1000 * 60 * 60 * 24 }
}));

const passport = require('passport');
app.use(passport.initialize());
app.use(passport.session());

const flash = require('connect-flash');
app.use(flash());

app.use((req, res, next) => {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg   = req.flash('error_msg');
  res.locals.error       = req.flash('error');
  res.locals.user        = req.user || null;
  next();
});

require('./config/passport')(passport);

const authRouter = require('./routes/auth');
app.use('/auth', authRouter);


app.use('/', indexRouter);
app.use('/users', usersRouter);

const projectRouter = require('./routes/projects');
app.use('/projects', projectRouter);

const projectsLeaderRouter = require('./routes/projects_leader');
app.use('/projects/leader', projectsLeaderRouter);

const projectsMemberRouter = require('./routes/projects_member');
app.use('/projects/member', projectsMemberRouter);

const projectsArchivedRouter = require('./routes/projects_archived');
app.use('/projects/archived', projectsArchivedRouter);


app.get('/', (req, res) => {
  if (req.isAuthenticated()) {
    res.redirect('/projects');
  } else {
    res.redirect('/auth/login');
  }
});

app.use(function(req, res, next) {
  next(createError(404));
});

app.use(function(err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
