class ShakaOfflineStore {
  constructor(storage) {
    this.storage = storage;
    this.usePersistentLicense = true;
    this.downloadSizeThreshold = 1024 * 1024 * 1024; // 1GB

    this.storage.configure({
      progressCallback: this.progressCallback,
      downloadSizeCallback: this.downloadSizeCallback,
      trackSelectionCallback: this.trackSelectionCallback,
      usePersistentLicense: this.usePersistentLicense,
    });
  }

  destroy() {
    if (!this.storage) {
      console.error("[ShakaOfflineStore:destroy] Storage not initialized");
      return;
    }

    this.storage.destroy();
  }

  downloadSizeCallback(size) {
    console.log("[ShakaOfflineStore:downloadSizeCallback]", size);

    if (size > this.downloadSizeThreshold) {
      return false;
    }

    return true;
  }

  trackSelectionCallback(tracks) {
    console.log("[ShakaOfflineStore:trackSelectionCallback]", tracks);
    return tracks;
  }

  progressCallback(progress) {
    console.log("[ShakaOfflineStore:progressCallback]", progress);
  }

  async store(uri) {
    if (!this.storage) {
      console.error("[ShakaOfflineStore:download] Storage not initialized");
      return;
    }

    return this.storage.store(uri);
  }

  async remove(uri) {
    if (!this.storage) {
      console.error("[ShakaOfflineStore:remove] Storage not initialized");
      return;
    }

    return this.storage.remove(uri);
  }

  async list() {
    if (!this.storage) {
      console.error("[ShakaOfflineStore:list] Storage not initialized");
      return;
    }

    /*
    []StoredContent
    - offlineUri
    - originalManifestUri
    - duration
    - size
    - tracks[]
    - appMetadata
    - isIncomplete
    */
    contentList = this.storage.list();
  }
}
export default ShakaOfflineStore;
