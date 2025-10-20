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

export const uploadAudioBufferToS3 = async (audioBuffer, s3Key, fileName) => {
    try {
      const params = {
        Bucket: process.env.S3_BUCKET_NAME,
        Key: `${s3Key}/${fileName}`,
        Body: audioBuffer,
        ContentType: 'audio/mpeg',
      };
      
      console.log('Uploading audio buffer to S3:', params.Key);
      
      const uploadResult = await new Upload({
        client: s3,
        params,
      }).done();
      
      console.log(`Audio buffer uploaded successfully: ${uploadResult.Location}`);
      return uploadResult;
    } catch (err) {
      console.error('Error uploading audio buffer to S3:', err);
      throw err;
    }
  }