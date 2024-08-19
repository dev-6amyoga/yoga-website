const {
	S3Client,
	PutObjectCommand,
	GetObjectCommand,
	ListObjectsCommand,
	ListObjectsV2Command,
	CreateMultipartUploadCommand,
	CompleteMultipartUploadCommand,
	AbortMultipartUploadCommand,
	UploadPartCommand,
	DeleteObjectsCommand,
} = require("@aws-sdk/client-s3");

const R2 = new S3Client({
	region: "auto",
	endpoint: `https://${process.env.CLOUDFLARE_R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
	credentials: {
		accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID,
		secretAccessKey: process.env.CLOUDFLARE_R2_ACCESS_KEY,
	},
});

module.exports = {
	cloudflareAddFile: async (filename, body) =>
		R2.send(
			new PutObjectCommand({
				Bucket: process.env.CLOUDFLARE_R2_BUCKET,
				Key: filename,
				Body: body,
			})
		),
	cloudflareAddFileToBucket: async (
		bucket,
		filename,
		body,
		contentType = undefined
	) =>
		R2.send(
			new PutObjectCommand({
				Bucket: bucket,
				Key: filename,
				Body: body,
				ContentType: contentType,
			})
		),
	// cloudflareGetFile: async (bucket, filename, contentType) => {
	//   const response = await R2.send(
	//     new GetObjectCommand({
	//       Bucket: bucket,
	//       Key: filename,
	//       ResponseContentType: contentType,
	//     })
	//   )
	//   return response.Body.transformToString('utf-8')
	// },
	cloudflareGetFile: async (bucket, filename, contentType) => {
		const response = await R2.send(
			new GetObjectCommand({
				Bucket: bucket,
				Key: filename,
				ResponseContentType: contentType,
			})
		);
		return response.Body.transformToByteArray();
	},
	cloudflareListDir: async (bucket, prefix) => {
		const response = await R2.send(
			new ListObjectsCommand({
				Bucket: bucket,
				Prefix: prefix,
			})
		);
		return response;
	},

	cloudflareListDirV2: async (bucket, prefix) => {
		const response = await R2.send(
			new ListObjectsV2Command({
				Bucket: bucket,
				Prefix: prefix,
			})
		);
		return response;
	},

	cloudflareStartMultipartUpload: async (bucket, filename, content_type) =>
		R2.send(
			new CreateMultipartUploadCommand({
				Bucket: bucket,
				Key: filename,
				ContentType: content_type,
			})
		),

	cloudflareUploadPart: async (
		bucket,
		filename,
		uploadId,
		partNumber,
		body
	) => {
		console.log(
			"[cloudflareUploadPart] uploading size:",
			body.byteLength,
			" part number:",
			partNumber
		);
		return R2.send(
			new UploadPartCommand({
				Bucket: bucket,
				Key: filename,
				UploadId: uploadId,
				PartNumber: partNumber,
				Body: body,
			})
		);
	},

	cloudflareCompleteMultipartUpload: async (
		bucket,
		filename,
		uploadId,
		parts
	) =>
		R2.send(
			new CompleteMultipartUploadCommand({
				Bucket: bucket,
				Key: filename,
				UploadId: uploadId,
				MultipartUpload: {
					Parts: parts,
				},
			})
		),

	cloudflareCancelMultipartUpload: async (bucket, filename, uploadId) =>
		R2.send(
			new AbortMultipartUploadCommand({
				Bucket: bucket,
				Key: filename,
				UploadId: uploadId,
			})
		),

	cloudflareDeleteFile: async (bucket, filename) => {
		return R2.send(
			new DeleteObjectsCommand({
				Bucket: bucket,
				Delete: {
					Objects: [
						{
							Key: filename,
						},
					],
				},
			})
		);
	},

	cloudflareDeleteFolder: async (bucket, folder) => {
		const response = await R2.send(
			new ListObjectsV2Command({
				Bucket: bucket,
				Prefix: folder,
			})
		);

		if (!response.Contents) {
			throw Error("contents doesn't exist");
		}

		if (response.Contents.length === 0) {
			return null;
		}

		const keys = response.Contents.map((content) => ({
			Key: content.Key,
		}));

		return R2.send(
			new DeleteObjectsCommand({
				Bucket: bucket,
				Delete: {
					Objects: keys,
				},
			})
		);
	},
};
