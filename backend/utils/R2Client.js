const {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  ListObjectsCommand,
} = require('@aws-sdk/client-s3')

const R2 = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.CLOUDFLARE_R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.CLOUDFLARE_R2_ACCESS_KEY,
  },
})

module.exports = {
  cloudflareAddFile: async (filename, body) =>
    R2.send(
      new PutObjectCommand({
        Bucket: process.env.CLOUDFLARE_R2_BUCKET,
        Key: filename,
        Body: body,
      })
    ),
  cloudflareAddFileToBucket: async (bucket, filename, body) =>
    R2.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: filename,
        Body: body,
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
    )
    return response.Body
  },
  cloudflareListDir: async (bucket, prefix) => {
    const response = await R2.send(
      new ListObjectsCommand({
        Bucket: bucket,
        Prefix: prefix,
        MaxKeys: 1000,
      })
    )
    return response
  },
}
