import mongoose from 'mongoose';

const StorageConfigSchema = new mongoose.Schema({
  type: { type: String, default: 's3' },
  bucket: { type: String, required: true },
  region: { type: String, required: true },
}, { _id: false });

const AppConfigSchema = new mongoose.Schema({
  storage: { type: StorageConfigSchema, required: true },
}, { timestamps: true });

export default mongoose.model('AppConfig', AppConfigSchema);
