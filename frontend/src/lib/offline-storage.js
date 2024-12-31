class ShakaOfflineStore {
  constructor(storage, progressHook) {
    console.log("[ShakaOfflineStore] Initializing ShakaOfflineStore");
    this.storage = storage;
    this.usePersistentLicense = true;
    this.downloadSizeThreshold = 1024 * 1024 * 1024; // 1GB
    this.contentList = [];
    // TODO : support for progress across parallel downloads
    this.progress = 0;

    this.progressHook = progressHook;
    console.log("[ShakaOfflineStore] Configuring storage");
    const storageConfig = {
      offline: {
        progressCallback: (c, p) => this.progressCallback(this, c, p),
        downloadSizeCallback: this.downloadSizeCallback,
        trackSelectionCallback: this.trackSelectionCallback,
        usePersistentLicense: this.usePersistentLicense,
      },
    };
    this.storage.configure(storageConfig);
    console.log("[ShakaOfflineStore] Storage configured");
  }

  destroy() {
    try {
      if (this.storage === null || this.storage === undefined) {
        console.error("[ShakaOfflineStore:destroy] Storage not initialized");
        return;
      }

      console.log("[ShakaOfflineStore:destroy] Destroying storage");
      this.storage.destroy();
    } catch (e) {
      console.error("[ShakaOfflineStore:destroy] Error:", e);
    }
  }

  downloadSizeCallback(size) {
    try {
      console.log("[ShakaOfflineStore:downloadSizeCallback]", size);

      if (size > this.downloadSizeThreshold) {
        console.warn(
          "[ShakaOfflineStore:downloadSizeCallback] Download size exceeds threshold"
        );
        return false;
      }

      return true;
    } catch (e) {
      console.error("[ShakaOfflineStore:downloadSizeCallback] Error:", e);
      return false;
    }
  }

  trackSelectionCallback(tracks) {
    console.log("[ShakaOfflineStore:trackSelectionCallback]", tracks);
    return tracks;
  }

  progressCallback(th, content, progress) {
    try {
      console.log("[ShakaOfflineStore:progressCallback] progress : ", progress);

      th.progress = progress;
      if (th.progressHook) {
        th.progressHook(content, progress);
      }
    } catch (e) {
      console.error("[ShakaOfflineStore:progressCallback] Error:", e);
    }
  }

  async store(uri, title, drmConfig) {
    console.log("[ShakaOfflineStore] DRM Config obtained:", drmConfig);
    try {
      if (this.storage === null || this.storage === undefined) {
        console.error("[ShakaOfflineStore:store] Storage not initialized");
        return null;
      }
      console.log(drmConfig, "WAS OBTAINED!");
      if (drmConfig) {
        console.log("[ShakaOfflineStore] Applying DRM config...");
        this.storage.configure({
          drm: {
            servers: {
              "com.microsoft.widevine": drmConfig.licenseAcquisitionUrl,
            },
          },
        });
        console.log(
          "[ShakaOfflineStore] DRM configuration applied:",
          drmConfig
        );
        console.log("Storage Configuration:", this.storage);
      } else {
        console.log("[ShakaOfflineStore] No DRM config provided.");
      }

      const metadata = {
        title: title,
        downloaded: new Date().toISOString(),
      };

      console.log("[ShakaOfflineStore:store] Starting download for:", uri);

      const fac = await this.storage.store(
        uri,
        metadata,
        "application/dash+xml"
      ).promise;

      await this.list();

      // [useShakaOfflineStore:setDownloadProgress] progress set :  0.0002121704732605919

      const storedContent = this.contentList.find(
        (content) => content.originalManifestUri === uri
      );

      if (storedContent) {
        console.log(
          "[ShakaOfflineStore:store] Video successfully stored:",
          storedContent
        );
        return storedContent;
      } else {
        console.warn("[ShakaOfflineStore:store] Video not found after storing");
        return null;
      }
    } catch (e) {
      console.error("[ShakaOfflineStore:store] Error:", e);
      return null;
    }
  }

  async remove(uri) {
    try {
      if (this.storage === null || this.storage === undefined) {
        console.error("[ShakaOfflineStore:remove] Storage not initialized");
        return;
      }

      console.error("[ShakaOfflineStore:remove] remove download for:", uri);
      return await this.storage.remove(uri);
    } catch (e) {
      console.error("[ShakaOfflineStore:remove] Error:", e);
    }
  }

  async list() {
    try {
      if (this.storage === null || this.storage === undefined) {
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
      this.contentList = await this.storage.list();

      console.debug("[ShakaOfflineStore:list] contentList:", this.contentList);

      return this.contentList;
    } catch (e) {
      console.error("[ShakaOfflineStore:list] Error:", e);
      return null;
    }
  }

  async get(originalURI) {
    try {
      if (
        this.storage === null ||
        this.storage === undefined ||
        this.contentList === null ||
        this.contentList === undefined
      ) {
        console.error("[ShakaOfflineStore:get] Storage not initialized");
        return;
      }

      if (this.contentList.length === 0) {
        await this.list();
      }

      const content = this.contentList.find(
        (c) => c.originalManifestUri === originalURI
      );

      console.debug("[ShakaOfflineStore:get] content:", content);

      return content ?? null;
    } catch (e) {
      console.error("[ShakaOfflineStore:get] Error:", e);
      return null;
    }
  }
}
export default ShakaOfflineStore;
