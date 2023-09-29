const sendgrid = require('@sendgrid/mail');
const { convert } = require('html-to-text');

sendgrid.setApiKey(process.env.SENDGRID_API_KEY);

class Email {
  constructor(user, url = '') {
    this.user = user;
    this.url = url;
    this.from = process.env.SENGRID_SENDER;
  }

  async send(subject, html) {
    const message = {
      to: this.user.email,
      from: this.from,
      subject,
      html,
      text: convert(html),
    };

    await sendgrid.send(message);
  }

  async sendWelcome() {
    const html = `
      <h1>Verify your account!</h1>
      <p>Click <a href='${this.url}' target='_blank'>this</a> link to verify 😎</p>`;

    await this.send('Welcome to our Family!', html);
  }
}

module.exports = Email;
