const User = require('../models/userModel');

const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');
const { nanoid } = require('nanoid');
const Email = require('../utils/email');

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
    verificationToken: nanoid(),
  });

  await new Email(
    newUser,
    `${req.protocol}://${req.get('host')}/users/verify/${
      newUser.verificationToken
    }`
  ).sendWelcome();

  res.status(201).json({
    status: 'success',
    message: 'Verification token has been sent to your email!',
    user: {
      email: newUser.email,
      subscription: newUser.subscription,
    },
  });
});

exports.login = catchAsync(async (req, res, next) => {
  // 1. Find a user
  const user = await User.findOne({ email: req.body.email }).select(
    'password email subscription verify'
  );

  // 2. Check if user provided a correct password
  if (
    !user ||
    !(await user.isCorrectPassword(req.body.password, user.password))
  )
    return next(new AppError('The email or password is incorrect', 401));

  // 3. Check if user is verified
  if (!user.verify)
    return next(
      new AppError('User is not verified! Check your email inbox.', 401)
    );

  // 4. Create a token and send a cookie
  const token = signJWT(user._id);

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

exports.verify = catchAsync(async (req, res, next) => {
  const { verificationToken } = req.params;

  // 1. Check if verification token is provided
  if (!verificationToken)
    return next(new AppError('Verification token is not provided!', 401));
  // 2. Check if user exists
  const user = await User.findOne({ verificationToken });

  if (!user) return next(new AppError('User not found', 404));
  // 3. Verify user

  user.verify = true;
  user.verificationToken = null;

  await user.save();

  res.status(200).json({
    status: 'success',
    message: 'Verification successfull! You can now log in.',
  });
});

// TODO
exports.requestVerify = catchAsync(async (req, res, next) => {});
