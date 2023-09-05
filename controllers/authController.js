const User = require('../models/userModel');

const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

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
const signup = async (req, res) => {
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

const login = async (req, res) => {
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

const logout = (req, res) => {
  res.clearCookie('jwt');

  res.status(200).json({ status: 'success' });
};

// MAKE PROTECT ROUTE and error handler

module.exports = {
  signup,
  logout,
  login,
};
