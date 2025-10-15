import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import dotenv from 'dotenv';

dotenv.config();

class S3Service {
    constructor() {
        this.s3Client = new S3Client({
            region: process.env.AWS_REGION,
            credentials: {
                accessKeyId: process.env.AWS_ACCESS_KEY_ID,
                secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
            }
        });
        this.bucketName = process.env.AWS_BUCKET_NAME;
    }

    async uploadFile(file) {
        const key = `${Date.now()}-${file.originalname}`;
        const command = new PutObjectCommand({
            Bucket: this.bucketName,
            Key: key,
            Body: file.buffer,
            ContentType: file.mimetype
        });

        await this.s3Client.send(command);
        return `https://${this.bucketName}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
    }

    async deleteFile(imageUrl) {
        if (!imageUrl) return;
        const key = imageUrl.split('/').pop();
        const command = new DeleteObjectCommand({
            Bucket: this.bucketName,
            Key: key
        });
        await this.s3Client.send(command);
    }
}

export default new S3Service();