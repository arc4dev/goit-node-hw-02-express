require('dotenv').config();

const express = require('express');
const logger = require('morgan');
const cors = require('cors');

const contactsRouter = require('./routes/contactRouter');
const userRouter = require('./routes/userRouter');
const cookieParser = require('cookie-parser');
const AppError = require('./utils/AppError');
const errorHandler = require('./controllers/errorController');

const app = express();

const formatsLogger = app.get('env') === 'development' ? 'dev' : 'short';

// Middlewares
app.use(express.static('public'));
app.use(logger(formatsLogger));
app.use(cors());
app.use(cookieParser());
app.use(express.json());

// Routes
app.use('/api/contacts', contactsRouter);
app.use('/users', userRouter);

app.all('*', (req, res, next) => {
  next(new AppError('Page not found', 404));
});

// Error handler
app.use(errorHandler);

module.exports = app;
