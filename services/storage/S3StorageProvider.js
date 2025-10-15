import { S3Client, PutObjectCommand, DeleteObjectCommand, ListObjectsV2Command, CopyObjectCommand, DeleteObjectsCommand } from '@aws-sdk/client-s3';
import dotenv from 'dotenv';
import StorageProvider from './StorageProvider.js';

dotenv.config();

export default class S3StorageProvider extends StorageProvider {
  constructor({ region, bucket, credentials }) {
    super();
    this.region = region || process.env.AWS_REGION;
    this.bucket = bucket || process.env.AWS_BUCKET_NAME;
    this.s3 = new S3Client({
      region: this.region,
      credentials: credentials || {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
    });
  }

  get bucketName() {
    return this.bucket;
  }

  getPublicUrl(key) {
    return `https://${this.bucket}.s3.${this.region}.amazonaws.com/${key}`;
  }

  parseKeyFromUrl(url) {
    if (!url) return '';
    try {
      const u = new URL(url);
      // URL format: https://<bucket>.s3.<region>.amazonaws.com/<key>
      return decodeURIComponent(u.pathname.replace(/^\//, ''));
    } catch {
      // Fallback: last segment
      return url.split('/').slice(3).join('/');
    }
  }

  async upload(file) {
    const key = `${Date.now()}-${file.originalname}`;
    await this.s3.send(new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
    }));
    return { key, url: this.getPublicUrl(key) };
  }

  async deleteByUrl(url) {
    if (!url) return;
    const key = this.parseKeyFromUrl(url);
    if (!key) return;
    await this.s3.send(new DeleteObjectCommand({ Bucket: this.bucket, Key: key }));
  }

  async list({ bucket, prefix = '', continuationToken } = {}) {
    const res = await this.s3.send(new ListObjectsV2Command({
      Bucket: bucket || this.bucket,
      Prefix: prefix,
      ContinuationToken: continuationToken,
      MaxKeys: 1000,
    }));
    return {
      keys: (res.Contents || []).map(o => o.Key),
      nextToken: res.IsTruncated ? res.NextContinuationToken : null,
    };
  }

  async copyObject({ srcBucket, srcKey, destBucket, destKey }) {
    await this.s3.send(new CopyObjectCommand({
      Bucket: destBucket,
      Key: destKey,
      CopySource: `${srcBucket}/${encodeURIComponent(srcKey)}`,
      MetadataDirective: 'COPY',
    }));
  }

  async deleteMany({ bucket, keys }) {
    if (!keys || keys.length === 0) return;
    const chunks = [];
    for (let i = 0; i < keys.length; i += 1000) chunks.push(keys.slice(i, i + 1000));
    for (const chunk of chunks) {
      await this.s3.send(new DeleteObjectsCommand({
        Bucket: bucket || this.bucket,
        Delete: { Objects: chunk.map(k => ({ Key: k })) },
      }));
    }
  }
}
