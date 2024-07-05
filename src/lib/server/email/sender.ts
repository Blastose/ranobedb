import Mailgun from 'mailgun.js';
import { MAILGUN_API_KEY, MAILGUN_DOMAIN } from '$env/static/private';

export type Email = {
	from: string;
	to: string;
	subject: string;
	body: string;
};

export class EmailBuilder {
	from: string;
	to: string;

	constructor(params: { to: string }) {
		this.from = 'RanobeDB <no-reply@ranobedb.org>';
		this.to = params.to;
	}

	createVerificationTokenEmail(name: string, link: string): Email {
		const body = `<p>Hello ${name},</p>
<p>We have received a request to update your email address.</p>
<p>Please click the link below to verify this email address.</p>
<p><a href=${link} target="_blank">${link}</a></p>
<p>This link will expire in 2 hours.</p>
<p>If this request was not made by you, please ignore this email.</p>
<p>From <a href="https://ranobedb.org" target="_blank">RanobeDB</a></p>
  `;
		const subject = 'Verify your RanobeDB email address';
		return {
			subject,
			body: body,
			from: this.from,
			to: this.to,
		};
	}

	createVerificationCodeEmail(name: string, code: string): Email {
		const body = `<p>Hello ${name},</p>
<p>To complete the email verification process, please enter the following code into the verification code field.</p>
<p>${code}</p>
<p>The code will expire in 15 minutes.</p>
<p>If this request was not made by you, please ignore this email.</p>
<p>From <a href="https://ranobedb.org" target="_blank">RanobeDB</a></p>
  `;
		const subject = 'Verify your RanobeDB email address';
		return {
			subject,
			body: body,
			from: this.from,
			to: this.to,
		};
	}

	createPasswordResetEmail(name: string, link: string): Email {
		const body = `<p>Hello ${name},</p>
<p>We have received a request to reset your password. Please click the link below to begin the password reset process.</p>
<p><a href=${link} target="_blank">${link}</a></p>
<p>This link will expire in 2 hours.</p>
<p>If this request was not made by you, please ignore this email.</p>
<p>From <a href="https://ranobedb.org" target="_blank">RanobeDB</a></p>
  `;
		const subject = 'Reset your RanobeDB password';
		return {
			subject,
			body: body,
			from: this.from,
			to: this.to,
		};
	}
}

const mailgun = new Mailgun(FormData);
const mg = mailgun.client({
	username: 'api',
	key: MAILGUN_API_KEY,
});

export class EmailSender {
	async sendEmail(email: Email) {
		// Mailgun
		try {
			await mg.messages.create(MAILGUN_DOMAIN, {
				from: email.from,
				to: [email.to],
				subject: email.subject,
				html: email.body,
			});
		} catch (e) {
			console.log(e);
		}
	}
}
