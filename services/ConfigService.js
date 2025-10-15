import AppConfig from '../models/AppConfig.js';

class ConfigService {
  async getConfig() {
    let cfg = await AppConfig.findOne();
    if (!cfg) {
      cfg = await AppConfig.create({
        storage: {
          type: 's3',
          bucket: process.env.AWS_BUCKET_NAME || '',
          region: process.env.AWS_REGION || 'us-east-1',
        },
      });
    }
    return cfg.toObject();
  }

  async updateStorage({ bucket, region, type = 's3' }) {
    const update = { storage: { type, bucket, region } };
    const cfg = await AppConfig.findOneAndUpdate({}, update, { upsert: true, new: true });
    return cfg.toObject();
  }
}

export default new ConfigService();
