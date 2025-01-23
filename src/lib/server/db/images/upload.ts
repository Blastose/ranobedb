import { customAlphabet } from 'nanoid';
import sharp from 'sharp';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import {
	CF_ACCESS_KEY_ID,
	CF_ACCOUNT_ID,
	CF_BUCKET_NAME,
	CF_SECRET_ACCESS_KEY,
} from '$env/static/private';
import imageSize from 'image-size';

export function generateNanoid() {
	const alphabet = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
	const nanoid = customAlphabet(alphabet, 16);
	return nanoid();
}

export async function resizeImage(buff: Uint8Array): Promise<Buffer> {
	const { height, width } = imageSize(buff);
	if (!height || !width || height > 50000 || width > 50000) {
		throw new Error('Bad image');
	}
	return await sharp(buff).resize(240).jpeg({ mozjpeg: true }).toBuffer();
}

const s3 = new S3Client({
	region: 'auto',
	endpoint: `https://${CF_ACCOUNT_ID}.r2.cloudflarestorage.com`,
	credentials: {
		accessKeyId: CF_ACCESS_KEY_ID ?? '',
		secretAccessKey: CF_SECRET_ACCESS_KEY ?? '',
	},
});

export async function saveImageToR2(filename: string, body: Buffer) {
	await s3.send(
		new PutObjectCommand({
			Bucket: CF_BUCKET_NAME,
			Key: filename,
			Body: body,
			ContentType: 'image/jpeg',
			CacheControl: 'public, max-age=604800, immutable',
		}),
	);
}
