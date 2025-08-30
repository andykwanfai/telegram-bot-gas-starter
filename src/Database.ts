import { Utils } from "../gas-telegram-bot-api/src/Utils";

export class Database {
  private database;
  constructor(type: "user" | "script" | "document") {
    switch (type) {
      case "user":
        this.database = PropertiesService.getUserProperties();
        break;
      case "script":
        this.database = PropertiesService.getScriptProperties();
        break;
      case "document":
        this.database = PropertiesService.getDocumentProperties();
        break;
    }
  }

  getProperty(key: string) {
    const value = this.database.getProperty(key);

    if (value === null) {
      return value;
    }

    const json = Utils.parseJson(value);

    return json ?? value;
  };

  setProperty(key: string, value: string) {
    this.database.setProperty(key, value);
  }

}
