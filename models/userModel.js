const { default: mongoose, Schema } = require('mongoose');

const bcrypt = require('bcrypt');

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
  subscription: {
    type: String,
    enum: ['starter', 'pro', 'business'],
    default: 'starter',
  },
  // token: {
  //   type: String,
  //   default: null,
  // },
  owner: {
    type: Schema.Types.ObjectId,
    ref: 'user',
  },
});

// Hash password before save
userSchema.pre('save', async function (next) {
  this.password = await bcrypt.hash(this.password, 12);

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
