const Contact = require('../models/contactModel');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');

exports.listContacts = catchAsync(async (req, res, next) => {
  // Filtering by ['favorite'] fields only allowed
  const contacts = await Contact.find(req.query);

  res
    .status(200)
    .json({ status: 'success', results: contacts.length, data: contacts });
});

exports.getContactById = catchAsync(async (req, res, next) => {
  const contact = await Contact.findById(req.params.contactId);

  if (!contact) return next(new AppError('Contact not found', 404));

  res.status(200).json({ status: 'success', data: contact });
});

exports.removeContact = catchAsync(async (req, res, next) => {
  const contact = await Contact.findByIdAndDelete(req.params.contactId);

  if (!contact) return next(new AppError('Contact not found', 404));

  res.status(200).json({ status: 'success', message: 'Contact deleted' });
});

exports.addContact = catchAsync(async (req, res, next) => {
  const newContact = await Contact.create(req.body);

  res.status(201).json({ status: 'success', data: newContact });
});

exports.updateContact = catchAsync(async (req, res, next) => {
  const updatedContact = await Contact.findByIdAndUpdate(
    req.params.contactId,
    req.body,
    {
      new: true,
      runValidators: true,
    }
  );

  if (!updatedContact) return next(new AppError('Contact not found', 404));

  res.status(200).json({ status: 'success', data: updatedContact });
});

exports.updateStatusContact = catchAsync(async (req, res, next) => {
  if (!req.body.favorite)
    return next(new AppError('Missing (favourite) field', 400));

  const updatedContact = await Contact.findByIdAndUpdate(
    req.params.contactId,
    { favorite: req.body.favorite },
    {
      new: true,
      runValidators: true,
    }
  );

  if (!updatedContact) return next(new AppError('Contact not found', 404));

  res.status(200).json({ status: 'success', data: updatedContact });
});
