const multer = require('multer');
const User = require('../models/userModel');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');
const resizePhoto = require('../utils/resizePhoto');

// multer config
const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) cb(null, true);
  else cb(new AppError('Invalid file type. You can import only images!', 400));
};

const upload = multer({ storage: multerStorage, fileFilter: multerFilter });

// Controller
exports.getMe = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user._id);

  if (!user) return next(new AppError('User not found', 404));

  res.status(200).json({ status: 'success', data: user });
});

exports.uploadPhoto = upload.single('avatar');

exports.resizePhoto = catchAsync(async (req, res, next) => {
  // change photo filename to specific user id and date
  req.file.fieldname = `avatar-${req.user.id}-${Date.now()}.jpg`;

  // save photo to the public folder
  await resizePhoto(req.file.buffer, `public/avatars/${req.file.fieldname}`);

  next();
});

exports.updatePhoto = catchAsync(async (req, res, next) => {
  const updatedUser = await User.findByIdAndUpdate(
    req.user.id,
    {
      avatarUrl: req.file.fieldname,
    },
    {
      new: true,
      runValidators: true,
    }
  );

  res.status(200).json({
    status: 'success',
    user: updatedUser,
  });
});
