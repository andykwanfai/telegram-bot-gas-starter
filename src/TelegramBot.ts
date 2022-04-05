import { HttpClient, RequestOptions } from "./HttpClient";
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

function getTelegramBotApi(token: string) {
  return `https://api.telegram.org/bot${token}`;
}

export class TelegramBot {
  private httpClient;
  private api;
  private max_retry;
  constructor(i: { token: string, max_retry?: number }) {
    this.httpClient = new HttpClient();
    this.api = getTelegramBotApi(i.token);
    this.max_retry = i.max_retry ?? 0;
  }

  async sendMessage(input: TelegramBotSendMessageInput) {
    const options: RequestOptions = {
      method: "post",
      payload: input,
    }
    const res = await this.fetch(`${this.api}/sendMessage`, options);
    return res;
  }

  async sendPhoto(input: TelegramBotSendPhotoInput) {
    const options: RequestOptions = {
      method: "post",
      payload: input,
    }
    const res = await this.fetch(`${this.api}/sendPhoto`, options);
    return res;
  }

  async sendAudio(input: TelegramBotSendAudioInput) {
    const options: RequestOptions = {
      method: "post",
      payload: input,
    }
    const res = await this.fetch(`${this.api}/sendAudio`, options);
    return res;
  }

  async sendVideo(input: TelegramBotSendVideoInput) {
    const options: RequestOptions = {
      method: "post",
      payload: input,
    }
    const res = await this.fetch(`${this.api}/sendVideo`, options);
    return res;
  }

  async sendMediaGroup(input: TelegramBotSendMediaGroupInput) {
    const options: RequestOptions = {
      method: "post",
      payload: input,
    }
    const res = await this.fetch(`${this.api}/sendMediaGroup`, options);
    return res;
  }

  private async fetch(url: string, params: RequestOptions) {
    let retry = 0;
    do {
      const res = await this.httpClient.fetch(url, { ...params, muteHttpExceptions: true });
      const status_code = res.getResponseCode();

      if (status_code < 400) {
        return res;
      }

      logger.info(`fetch error: ${res.getContentText()}`);
      const error = Utils.parseJson(res.getContentText()) as TelegramResponse;

      if (status_code === 429) {
        Utils.sleep(error.parameters?.retry_after!);
      } else {
        Utils.sleep(1);
      }

      retry++;
    } while (retry <= this.max_retry);

    logger.info(`fetch error after ${this.max_retry} retry`);
    throw new Error();
  }
}
