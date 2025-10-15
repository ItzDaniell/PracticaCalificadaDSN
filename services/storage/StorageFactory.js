import ConfigService from '../ConfigService.js';
import S3StorageProvider from './S3StorageProvider.js';

let cached = null;
let cachedSignature = '';

function signatureFrom(cfg) {
  const s = cfg?.storage || {};
  return `${s.type || 's3'}|${s.region || ''}|${s.bucket || ''}`;
}

export default {
  async get() {
    const cfg = await ConfigService.getConfig();
    const sig = signatureFrom(cfg);
    if (!cached || sig !== cachedSignature) {
      const type = cfg?.storage?.type || 's3';
      if (type !== 's3') throw new Error(`Unsupported storage type: ${type}`);
      cached = new S3StorageProvider({
        region: cfg?.storage?.region,
        bucket: cfg?.storage?.bucket,
      });
      cachedSignature = sig;
    }
    return cached;
  },
  invalidate() {
    cached = null;
    cachedSignature = '';
  }
};
