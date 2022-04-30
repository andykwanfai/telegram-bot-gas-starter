export class Cache {
  private cache;
  constructor(type: "user" | "script" | "document") {
    switch (type) {
      case "user":
        this.cache = CacheService.getUserCache();
        break;
      case "script":
        this.cache = CacheService.getScriptCache();
        break;
      case "document":
        this.cache = CacheService.getDocumentCache();
        break;
    }
  }

  put(key: string, value: string, expirationInSeconds: number) {
    this.cache?.put(key, value, expirationInSeconds);
  }

  get(key: string) {
    return this.cache?.get(key) ?? null;
  }
}
