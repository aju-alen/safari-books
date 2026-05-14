import AWS from 'aws-sdk';
import dotenv from "dotenv";
dotenv.config();

const s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION,
  });

export const getPdfFromAws = async (pdfKey) => {
    const bucketName = process.env.S3_BUCKET_NAME;
    const data = await s3.getObject({
        Bucket: bucketName,
        Key: pdfKey,
    }).promise();
    const byteLength = Buffer.isBuffer(data?.Body) ? data.Body.length : (data?.Body?.byteLength ?? 'unknown');
    console.log('[getPdfFromAws] download_complete', {
        bucket: bucketName,
        keyTail: String(pdfKey).split('/').slice(-2).join('/'),
        byteLength
    });
    return data.Body;
}