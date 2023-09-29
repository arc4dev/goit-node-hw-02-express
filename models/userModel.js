const { default: mongoose, Schema } = require('mongoose');

const bcrypt = require('bcrypt');
const gravatar = require('gravatar');

const userSchema = mongoose.Schema({
  password: {
    type: String,
    required: [true, 'Password is required'],
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
  },
  verificationToken: String,
  subscription: {
    type: String,
    enum: ['starter', 'pro', 'business'],
    default: 'starter',
  },
  verify: {
    type: Boolean,
    default: false,
  },
  owner: {
    type: Schema.Types.ObjectId,
    ref: 'user',
  },
  avatarUrl: String,
});

// Hash password before save
userSchema.pre('save', async function (next) {
  if (this.isModified('password'))
    this.password = await bcrypt.hash(this.password, 12);

  next();
});

// Create avatarUrl image based on email
userSchema.pre('save', async function (next) {
  if (this.isModified('avatarUrl')) this.avatarUrl = gravatar.url(this.email);

  next();
});

// Exclude fields pre find
userSchema.pre(/^find/, function (next) {
  this.select('-__v -password');

  next();
});

userSchema.methods.isCorrectPassword = async function (
  inputedPassword,
  userPassword
) {
  return await bcrypt.compare(inputedPassword, userPassword);
};

const User = mongoose.model('User', userSchema);

module.exports = User;
