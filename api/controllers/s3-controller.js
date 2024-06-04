import dotenv from "dotenv";
import multer from 'multer';
import AWS from 'aws-sdk';
import fs from 'fs';

dotenv.config();

const s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION,
});
export const postProfileImageS3 = async (req, res,next) => {
//    const userId = req.params.userId;
console.log(req.files,'files');
const files = req.files;
const uploadPromises = [];

Object.keys(files).forEach((key) => {
    const file = files[key][0];
    const params = {
        Bucket: process.env.S3_BUCKET_NAME,
        Key: `${file.originalname}`, // File name you want to save as in S3
        Body: file.buffer,
        ContentType: file.mimetype,
    };
    uploadPromises.push(s3.upload(params).promise());
});

try {
    const uploadResults = await Promise.all(uploadPromises);
    const fileLocations = uploadResults.map(result => result.Location);
    res.status(200).json({ message: 'Files uploaded successfully', data: fileLocations });
} catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error uploading files' });
}
  };

  export const postAudioS3 = async (req, res) => {
    const file = req.file;
    const params = {
        Bucket: process.env.S3_BUCKET_NAME,
        Key: `${file.originalname}`, // File name you want to save as in S3
        Body: file.buffer,
        ContentType: file.mimetype,
    };
    try {
        const uploadResult = await s3.upload(params).promise();
        res.status(200).json({ message: 'File uploaded successfully', data: uploadResult.Location });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error uploading file' });
    }
  }