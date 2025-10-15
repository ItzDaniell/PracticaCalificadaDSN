export default class StorageProvider {
  async upload(file) {
    throw new Error('Not implemented');
  }
  async deleteByUrl(url) {
    throw new Error('Not implemented');
  }
  async list(params = {}) {
    throw new Error('Not implemented');
  }
  async copyObject(source, destination) {
    throw new Error('Not implemented');
  }
  getPublicUrl(key) {
    throw new Error('Not implemented');
  }
  parseKeyFromUrl(url) {
    throw new Error('Not implemented');
  }
}
