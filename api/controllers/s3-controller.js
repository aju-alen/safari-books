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
    const file = req.file;
    // const filePath = path.join(__dirname, file.path);
    console.log('backend hit',file);

  
    try {
        const fileContent = file.buffer;  
      // Set up S3 upload parameters
      const params = {
        Bucket: process.env.S3_BUCKET_NAME,
        Key: `${file.originalname}`, // File name you want to save as in S3
        Body: fileContent,
        ContentType: file.mimetype,
      };
  
      // Uploading files to the bucket
      const data = await s3.upload(params).promise();
  
      // Delete file from server after upload
  
      console.log(`File uploaded successfully. ${data.Location}`);
      res.status(200).json({ message: 'File uploaded successfully', data });
    } catch (err) {
      console.error(err);
      // Delete file from server if there's an error
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      res.status(500).json({ error: 'Error uploading file' });
    }
  };