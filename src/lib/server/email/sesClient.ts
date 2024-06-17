import { SESClient } from '@aws-sdk/client-ses';
import { SendEmailCommand } from '@aws-sdk/client-ses';
import type { Email } from './sender';
import { AWS_SES_ACCESS_KEY, AWS_SES_SECRET_ACCESS_KEY } from '$env/static/private';

const REGION = 'us-east-1';
export const sesClient = new SESClient({
	region: REGION,
	credentials: {
		accessKeyId: AWS_SES_ACCESS_KEY,
		secretAccessKey: AWS_SES_SECRET_ACCESS_KEY,
	},
});

export function createSendEmailCommand(email: Email) {
	return new SendEmailCommand({
		Destination: {
			CcAddresses: [],
			ToAddresses: [email.to],
		},
		Message: {
			Body: {
				Html: {
					Charset: 'UTF-8',
					Data: email.body,
				},
			},
			Subject: {
				Charset: 'UTF-8',
				Data: email.subject,
			},
		},
		Source: email.from,
	});
}
