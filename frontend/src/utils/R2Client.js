import {
	GetObjectCommand,
	PutObjectCommand,
	S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { XhrHttpHandler } from "@aws-sdk/xhr-http-handler";

const R2 = new S3Client({
	region: "auto",
	endpoint: `https://${import.meta.env.VITE_CLOUDFLARE_R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
	// endpoint: `${import.meta.env.VITE_CLOUDFLARE_R2_RECORDINGS_ENDPOINT}`,
	credentials: {
		accessKeyId: import.meta.env.VITE_CLOUDFLARE_R2_ACCESS_KEY_ID,
		secretAccessKey: import.meta.env.VITE_CLOUDFLARE_R2_ACCESS_KEY,
	},

	requestHandler: new XhrHttpHandler({}),
});

export const cloudflareAddFile = async (bucket, filename, body) => {
	if (!bucket || !filename || !body) {
		throw new Error("Invalid parameters");
	}

	return R2.send(
		new PutObjectCommand({
			Bucket: bucket,
			Key: filename,
			Body: body,
		}),
		{}
	);
};

export const cloudflareGetFile = async (
	bucket,
	filename,
	content_type = "application/octet-stream"
) => {
	if (!bucket || !filename) {
		throw new Error("Invalid parameters");
	}

	return R2.send(
		new GetObjectCommand({
			Bucket: bucket,
			Key: encodeURIComponent(filename),
			ResponseContentType: content_type,
		}),
		{}
	);
};

export const cloudflareGetFileUrl = (
	bucket,
	filename,
	content_type = "application/octet-stream"
) => {
	if (!bucket || !filename) {
		throw new Error("Invalid parameters");
	}

	return getSignedUrl(
		R2,
		new GetObjectCommand({
			Bucket: bucket,
			Key: filename,
			ResponseContentType: content_type,
		}),
		{ expiresIn: 600 }
	);
};
