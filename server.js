const { default: mongoose } = require('mongoose');
const app = require('./app');

// Database connection
mongoose
  .connect(
    `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@cluster0.hlwuwiw.mongodb.net/db-contacts`
  )
  .then(() => console.log('Database connection successful!'))
  .catch(() => process.exit(1));

const port = process.env.PORT | 3000;
app.listen(port, () => {
  console.log(`Server running. Use our API on port: ${port}`);
});
