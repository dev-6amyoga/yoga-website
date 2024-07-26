import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";

const R2 = new S3Client({
	region: "auto",
	endpoint: `https://${import.meta.env.VITE_CLOUDFLARE_R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
	// endpoint: `${import.meta.env.VITE_CLOUDFLARE_R2_RECORDINGS_ENDPOINT}`,
	credentials: {
		accessKeyId: import.meta.env.VITE_CLOUDFLARE_R2_ACCESS_KEY_ID,
		secretAccessKey: import.meta.env.VITE_CLOUDFLARE_R2_ACCESS_KEY,
	},
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
