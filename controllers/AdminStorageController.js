import ConfigService from '../services/ConfigService.js';
import StorageFactory from '../services/storage/StorageFactory.js';
import S3StorageProvider from '../services/storage/S3StorageProvider.js';

class AdminStorageController {
  async renderPage(req, res) {
    const cfg = await ConfigService.getConfig();
    res.render('admin-storage', { title: 'Administración de Storage', storage: cfg.storage });
  }
  async getStorage(req, res) {
    const cfg = await ConfigService.getConfig();
    res.json({ storage: cfg.storage });
  }

  async updateStorage(req, res) {
    const { bucket, region, type } = req.body;
    if (!bucket || !region) return res.status(400).json({ error: 'bucket y region son requeridos' });
    const cfg = await ConfigService.updateStorage({ bucket, region, type: type || 's3' });
    StorageFactory.invalidate();
    res.json({ storage: cfg.storage });
  }

  async backup(req, res) {
    const { backupBucket, sourceBucket, sourceRegion, backupRegion } = req.body;
    if (!backupBucket) return res.status(400).json({ error: 'backupBucket es requerido' });

    const active = await ConfigService.getConfig();
    const srcBucket = sourceBucket || active.storage.bucket;
    const srcRegion = sourceRegion || active.storage.region;

    const src = new S3StorageProvider({ region: srcRegion, bucket: srcBucket });
    const dst = new S3StorageProvider({ region: backupRegion || srcRegion, bucket: backupBucket });

    let copied = 0; let errors = 0; let token = undefined; const keysAll = [];
    do {
      const { keys, nextToken } = await src.list({ bucket: srcBucket, continuationToken: token });
      token = nextToken;
      for (const key of keys) {
        try {
          await dst.copyObject({ srcBucket, srcKey: key, destBucket: backupBucket, destKey: key });
          copied++;
          keysAll.push(key);
        } catch (e) {
          errors++;
        }
      }
    } while (token);

    res.json({ status: 'ok', summary: { srcBucket, backupBucket, copied, errors } });
  }

  async cleanup(req, res) {
    const { bucket } = req.body;
    const active = await ConfigService.getConfig();
    const srcBucket = bucket || active.storage.bucket;
    const src = new S3StorageProvider({ region: active.storage.region, bucket: srcBucket });

    let token = undefined; let total = 0; let batches = 0;
    do {
      const { keys, nextToken } = await src.list({ bucket: srcBucket, continuationToken: token });
      token = nextToken;
      if (keys.length > 0) {
        await src.deleteMany({ bucket: srcBucket, keys });
        total += keys.length;
        batches++;
      }
    } while (token);

    res.json({ status: 'ok', summary: { bucket: srcBucket, deleted: total, batches } });
  }

  async restore(req, res) {
    const { backupBucket, targetBucket, backupRegion, targetRegion, updateConfig } = req.body;
    if (!backupBucket || !targetBucket) return res.status(400).json({ error: 'backupBucket y targetBucket son requeridos' });

    const active = await ConfigService.getConfig();
    const bRegion = backupRegion || active.storage.region;
    const tRegion = targetRegion || active.storage.region;

    const src = new S3StorageProvider({ region: bRegion, bucket: backupBucket });
    const dst = new S3StorageProvider({ region: tRegion, bucket: targetBucket });

    let copied = 0; let errors = 0; let token = undefined;
    do {
      const { keys, nextToken } = await src.list({ bucket: backupBucket, continuationToken: token });
      token = nextToken;
      for (const key of keys) {
        try {
          await dst.copyObject({ srcBucket: backupBucket, srcKey: key, destBucket: targetBucket, destKey: key });
          copied++;
        } catch (e) {
          errors++;
        }
      }
    } while (token);

    // Actualizar URLs en BD
    const oldPrefix = `https://${active.storage.bucket}.s3.${active.storage.region}.amazonaws.com/`;
    const newPrefix = `https://${targetBucket}.s3.${tRegion}.amazonaws.com/`;

    const { default: Producto } = await import('../models/Producto.js');
    const productos = await Producto.find({ imagen: { $regex: `^${oldPrefix}` } }, { _id: 1, imagen: 1 });
    const ops = productos.map(p => ({
      updateOne: {
        filter: { _id: p._id },
        update: { $set: { imagen: p.imagen.replace(oldPrefix, newPrefix) } },
      }
    }));
    if (ops.length > 0) await Producto.bulkWrite(ops);

    if (updateConfig) {
      await ConfigService.updateStorage({ bucket: targetBucket, region: tRegion, type: 's3' });
      StorageFactory.invalidate();
    }

    res.json({ status: 'ok', summary: { backupBucket, targetBucket, copied, errors, urlsUpdated: ops.length } });
  }
}

export default new AdminStorageController();
