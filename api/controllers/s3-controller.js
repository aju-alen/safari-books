import dotenv from "dotenv";
import { Upload } from '@aws-sdk/lib-storage';
import { S3 } from '@aws-sdk/client-s3';

dotenv.config();

const s3 = new S3({
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        region: process.env.AWS_REGION,
    },

});
export const postProfileImageS3 = async (req, res,next) => {
//    const userId = req.params.userId;
console.log(req.files,'files');
console.log(req.body,'body');
const {id,userId,publishingType} = req.body;
const files = req.files;
const uploadPromises = [];

Object.keys(files).forEach((key) => {
    const file = files[key][0];
    const params = {
        Bucket: process.env.S3_BUCKET_NAME,
        Key: `${userId}/${id}/verificationfiles/${file.originalname}`, // File name you want to save as in S3
        Body: file.buffer,
        ContentType: file.mimetype,
    };
    uploadPromises.push(new Upload({
        client: s3,
        params,
    }).done());
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
  const {id,userId,publishingType} = req.body;
  console.log(id,userId,'id,userId');
  const file = req.file;
  const params = {
      Bucket: process.env.S3_BUCKET_NAME,
      Key: `${userId}/${id}/verificationfiles/${file.originalname}`, // File name you want to save as in S3
      Body: file.buffer,
      ContentType: file.mimetype,
  };
  console.log(params,'paramssssssssssssssss');
  try {
      const uploadResult = await new Upload({
          client: s3,
          params,
      }).done();
      res.status(200).json({ message: 'File uploaded successfully', data: uploadResult.Location });
  } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Error uploading file' });
  }
}