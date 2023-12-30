const express = require('express');
const authRoutes = require('./routes/authRoutes');
const cookieParser = require('cookie-parser');
const { requireAuth, checkUser } = require('./middleware/authMiddleware');
const session = require('express-session');
const app = express();
const passport = require('passport');

const authRouter = require('./controllers/google-auth');
const protectedRouter = require('./controllers/protected-route');


// middleware
app.use(express.static('public'));
app.use(express.json());
app.use(cookieParser());

// view engine
app.set('view engine', 'ejs');


app.get('*', checkUser);

app.use(
  session({
    resave: false,
    saveUninitialized: true,
    secret: process.env.SESSION_SECRET,
  })
);



app.use(authRoutes);

// routes


app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser(function (user, cb) {
  cb(null, user);
});
passport.deserializeUser(function (obj, cb) {
  cb(null, obj);
});

app.use('/auth/google', authRouter);
app.use('/protected', protectedRouter);



app.get('/', (req, res) => res.render('home'));
app.get('/smoothies', requireAuth, (req, res) => res.render('smoothies'));

const PORT = process.env.PORT || 3003
app.listen(PORT,() => {
  console.log('Listening on port ' ,PORT);
});