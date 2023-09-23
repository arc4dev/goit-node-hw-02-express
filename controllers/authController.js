const User = require('../models/userModel');

const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');

// Helpers
const signJWT = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET_KEY, {
    expiresIn: process.env.JWT_EXPIRATION,
  });

// Controller
exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    email: req.body.email,
    password: req.body.password,
    subscription: req.body.subscription,
  });

  res.status(201).json({
    status: 'success',
    user: {
      email: newUser.email,
      subscription: newUser.subscription,
    },
  });
});

exports.login = catchAsync(async (req, res, next) => {
  // 1. Find user
  const user = await User.findOne({ email: req.body.email }).select(
    'password email subscription'
  );

  if (
    !user ||
    !(await user.isCorrectPassword(req.body.password, user.password))
  )
    return next(new AppError('The email or password is incorrect', 401));

  // 2. Create a token
  const token = signJWT(user._id);

  // 3. Send a cookie with token
  res.cookie('jwt', token, { httpOnly: true });

  res.status(200).json({
    status: 'success',
    token,
    user: {
      email: user.email,
      subscription: user.subscription,
    },
  });
});

exports.logout = (req, res) => {
  res.clearCookie('jwt');

  res.status(200).json({ status: 'success', message: 'User logged out' });
};

exports.protect = catchAsync(async (req, res, next) => {
  let token;
  // 1) Check if token is provided
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  if (!token) return next(new AppError('You are not logged in', 401));

  // 2) Check if token is valid
  const decodedToken = await promisify(jwt.verify)(
    token,
    process.env.JWT_SECRET_KEY
  );

  // 3) Check if user still exists (so if we delete a user, the token will be invalid)
  const user = await User.findById(decodedToken.id);
  if (!user) return next(new AppError('User not found', 404));

  // Grant acces to the route
  req.user = user;
  next();
});
