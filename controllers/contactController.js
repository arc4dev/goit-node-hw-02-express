const Contact = require('../models/contactModel');

exports.listContacts = async (req, res) => {
  try {
    const contacts = await Contact.find();

    res
      .status(200)
      .json({ status: 'success', results: contacts.length, data: contacts });
  } catch (err) {
    console.log(err.message);
  }
};

exports.getContactById = async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.contactId);

    if (!contact) throw new Error('Contact not found!');

    res.status(200).json({ status: 'success', data: contact });
  } catch (err) {
    console.log(err.message);
    res.status(400).json({ status: 'fail', message: err.message });
  }
};

exports.removeContact = async (req, res) => {
  try {
    const contact = await Contact.findByIdAndDelete(req.params.contactId);

    if (!contact) throw new Error('Contact not found!');

    res.status(200).json({ status: 'success', message: 'Contact deleted' });
  } catch (err) {
    console.log(err.message);
    res.status(400).json({ status: 'fail', message: err.message });
  }
};

exports.addContact = async (req, res) => {
  try {
    const newContact = await Contact.create(req.body);

    res.status(201).json({ status: 'success', data: newContact });
  } catch (err) {
    console.log(err.message);
    res.status(400).json({ status: 'fail', message: err.message });
  }
};

exports.updateContact = async (req, res) => {
  try {
    const updatedContact = await Contact.findByIdAndUpdate(
      req.params.contactId,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!updatedContact) throw new Error('Contact not found!');

    res.status(200).json({ status: 'success', data: updatedContact });
  } catch (err) {
    console.error(err.message);
    res.status(400).json({ status: 'fail', message: err.message });
  }
};

exports.updateStatusContact = async (req, res) => {
  try {
    if (!req.body.favorite) throw new Error('Missing (favorite) field!');

    const updatedContact = await Contact.findByIdAndUpdate(
      req.params.contactId,
      { favorite: req.body.favorite },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!updatedContact) throw new Error('Contact not found!');

    res.status(200).json({ status: 'success', data: updatedContact });
  } catch (err) {
    console.error(err.message);
    res.status(400).json({ status: 'fail', message: err.message });
  }
};
