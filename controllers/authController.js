const User = require('../models/userModel');

const jwt = require('jsonwebtoken');
const { promisify } = require('util');

// Helpers
const signJWT = (id) => jwt.sign({ id }, process.env.JWT_SECRET_KEY);

const sendJWT = (userID, statusCode, res) => {
  const token = signJWT(userID);

  // send a cookie with token
  res.cookie('jwt', token, { httpOnly: true });

  res.status(statusCode).json({
    status: 'success',
    token,
  });
};

// Controller
exports.signup = async (req, res) => {
  try {
    const newUser = await User.create({
      email: req.body.email,
      password: req.body.password,
      subscription: req.body.subscription,
    });

    sendJWT(newUser._id, 201, res);
  } catch (err) {
    console.log(err);
    res.status(400).json({ status: 'fail', message: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email }).select(
      '+password'
    );

    if (
      !user ||
      !(await user.isCorrectPassword(req.body.password, user.password))
    )
      throw new Error('The email or password is incorrect!');

    sendJWT(user._id, 200, res);
  } catch (err) {
    console.log(err);
    res.status(401).json({ status: 'fail', message: err.message });
  }
};

exports.logout = (req, res) => {
  res.clearCookie('jwt');

  res.status(200).json({ status: 'success' });
};

exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) throw new Error('User not found!');

    res.status(200).json({ status: 'success', data: user });
  } catch (err) {
    console.log(err);
    res.status(401).json({ status: 'fail', message: err.message });
  }
};

exports.protect = async (req, res, next) => {
  try {
    console.log(req.cookies);
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

    if (!token) throw new Error('You are not logged in!');

    // 2) Check if token is valid
    const decodedToken = await promisify(jwt.verify)(
      token,
      process.env.JWT_SECRET_KEY
    );

    // 3) Check if user still exists (so if we delete a user, the token will be invalid)
    const user = await User.findById(decodedToken.id);
    if (!user) throw new Error('User not found!');

    console.log(user);

    // Grant acces to the route
    req.user = user;
    next();
  } catch (err) {
    console.log(err);
    res.status(401).json({ status: 'fail', message: err.message });
  }
};
