import { Database } from "./Database";
import { HttpClient, HttpResponse, HttpFetchOptions, } from '../gas-telegram-bot-api/src/HttpClient';
import { Utils } from "../gas-telegram-bot-api/src/Utils";
import { Message } from "./Message";
import { Logger } from "../gas-telegram-bot-api/src/Logger";
import { FetchSetting } from "./fetch_settings";

export interface IPublishRecord {
  last_published_at: string | number,
  last_published_id: string | number,
}

const DEFAULT_PUBLISH_RECORD: IPublishRecord = {
  last_published_at: 0,
  last_published_id: 0,
}

export interface IApp {
  database: Database;
  logger: Logger;
  id: number | string;
  app_name: string;
  httpClient: HttpClient;
  max_retry?: number;
  default_fetch_blob?: boolean;
  send_raw_media?: boolean;
  metadata: { [key: string]: any };
  fetch_setting: FetchSetting
}
export interface App extends IApp { }
export abstract class App {
  constructor(i: IApp) {
    Object.assign(this, i);
  }

  protected abstract fetchMessageData(): Promise<any>;
  protected abstract constructhMessages(res: any): Message[];

  protected filterMessages(messages: Message[]): Message[] {
    const filterMessages = messages.filter((e) => !this.isMessagePublished(e));
    return filterMessages;
  };

  protected sortMessages(messages: Message[]): Message[] {
    messages.sort((a, b) => {
      if (a.date < b.date) return -1;
      if (a.date > b.date) return 1;
      return 0;
    });
    return messages;
  };

  public async getMessages(): Promise<Message[]> {
    const res = await this.fetchMessageData();
    let messages = this.constructhMessages(res);
    messages = this.filterMessages(messages);
    return this.sortMessages(messages);
  }

  public getPublishRecord() {
    const record = this.database.getProperty(this.id.toString()) as IPublishRecord ?? DEFAULT_PUBLISH_RECORD;
    return record;
  };
  public abstract setPublishRecord(...arg: any): any;
  public abstract isMessagePublished(message: Message): boolean;

  protected handleRetry(res?: HttpResponse) {
    // const status_code = res.getResponseCode();
    // const error = Utils.parseJson(res.getContentText()) as TwitterErrorResponse;

    let retry_after = this.httpClient.getRetrySecond();

    this.logger.info(`Sleep for ${retry_after} sec`);
    Utils.sleep(retry_after);
  }

  protected async fetch(url: string, options: HttpFetchOptions, max_retry?: number) {
    return await this.httpClient.fetchWithRetry({
      url: url,
      options: options,
      retry: max_retry ?? 0,
      handleRetry: () => this.handleRetry,
    });
  }
}
