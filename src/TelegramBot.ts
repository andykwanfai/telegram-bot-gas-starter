import { HttpClient, HttpResponse, HttpFetchOptions } from "./HttpClient";
import { logger } from "./Logger";
import { Utils } from "./Utils";

interface TelegramBotSendInput {
  chat_id: number | string;

  parse_mode?: string;

  disable_notification?: boolean;
  protect_content?: boolean;
  reply_to_message_id?: number;
  allow_sending_without_reply?: boolean;
  reply_markup?: any;
}

interface TelegramBotSendFileInput extends TelegramBotSendInput {
  caption?: string;
  caption_entities?: any[];
}

interface TelegramBotSendMessageInput extends TelegramBotSendInput {
  text: string;
  entities?: any[];
  disable_web_page_preview?: boolean;
}

interface TelegramBotSendPhotoInput extends TelegramBotSendFileInput {
  photo: string;
}

interface TelegramBotSendAudioInput extends TelegramBotSendFileInput {
  audio: string;
  duration?: number;
  performer?: string;
  title?: string;
  thumb?: string;
}

interface TelegramBotSendVideoInput extends TelegramBotSendFileInput {
  video: string;
  duration?: number;
  width?: number;
  height?: number;
  thumb?: string;
  supports_streaming?: boolean;
}

interface TelegramBotInputMedia {
  type: 'audio' | 'photo' | 'video';
  media: string;
  caption?: string;
  parse_mode?: string;
}

interface TelegramBotSendMediaGroupInput extends TelegramBotSendInput {
  media: TelegramBotInputMedia[];
  duration?: number;
  width?: number;
  height?: number;
  thumb?: string;
  supports_streaming?: boolean;
}

interface TelegramResponseResult {
  phone?: { file_id: string }[];
  video?: { file_id: string };
  audio?: { file_id: string };
}

interface TelegramResponse {
  ok: boolean;
  description?: string;
  result?: TelegramResponseResult | TelegramResponseResult[];
  error_code?: number;
  parameters?: { migrate_to_chat_id?: number, retry_after?: number };
}

export class TelegramBot {
  private httpClient;
  private api;
  private max_retry;
  constructor(i: { token: string, max_retry?: number }) {
    this.httpClient = new HttpClient();
    this.api = TelegramBot.getApi(i.token);
    this.max_retry = i.max_retry ?? 0;
  }

  async sendMessage(input: TelegramBotSendMessageInput) {
    const options: HttpFetchOptions = {
      method: "post",
      payload: input,
    }
    const res = await this.fetch(`${this.api}/sendMessage`, options);
    return res;
  }

  async sendPhoto(input: TelegramBotSendPhotoInput) {
    const options: HttpFetchOptions = {
      method: "post",
      payload: input,
    }
    const res = await this.fetch(`${this.api}/sendPhoto`, options);
    return res;
  }

  async sendAudio(input: TelegramBotSendAudioInput) {
    const options: HttpFetchOptions = {
      method: "post",
      payload: input,
    }
    const res = await this.fetch(`${this.api}/sendAudio`, options);
    return res;
  }

  async sendVideo(input: TelegramBotSendVideoInput) {
    const options: HttpFetchOptions = {
      method: "post",
      payload: input,
    }
    const res = await this.fetch(`${this.api}/sendVideo`, options);
    return res;
  }

  async sendMediaGroup(input: TelegramBotSendMediaGroupInput) {
    const options: HttpFetchOptions = {
      method: "post",
      payload: input,
    }
    const res = await this.fetch(`${this.api}/sendMediaGroup`, options);
    return res;
  }

  private static getApi(token: string) {
    return `https://api.telegram.org/bot${token}`;
  }

  private static handleRetry(res: HttpResponse) {
    const status_code = res.getResponseCode();
    const error = Utils.parseJson(res.getContentText()) as TelegramResponse;

    let retry_after = 5;
    if (status_code === 429) {
      retry_after = error.parameters?.retry_after!;
    }

    logger.info(`Sleep for ${retry_after} sec`);
    Utils.sleep(retry_after);
  }

  private async fetch(url: string, options: HttpFetchOptions) {
    return await HttpClient.fetchWithRetry({
      url: url,
      options: options,
      max_retry: this.max_retry,
      handleRetry: TelegramBot.handleRetry,
    });
  }
}
