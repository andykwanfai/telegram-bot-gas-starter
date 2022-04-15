import { HttpClient, HttpResponse, HttpFetchOptions } from "./HttpClient";
import { logger } from "./Logger";
import { ITelegramRecipient } from "./tg_recipients";
import { Utils } from "./Utils";

interface TelegramBotSendInput {
  chat_id?: number | string;

  parse_mode?: string;

  disable_notification?: boolean;
  protect_content?: boolean;
  reply_to_message_id?: number;
  allow_sending_without_reply?: boolean;
  reply_markup?: any;
}

export interface TelegramBotSendFileInput extends TelegramBotSendInput {
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

export interface TelegramBotInputMedia {
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
  private max_retry;
  constructor(i: { max_retry?: number }) {
    this.max_retry = i.max_retry ?? 0;
  }

  async sendMessage(recipient: ITelegramRecipient, input: TelegramBotSendMessageInput) {
    input = {
      parse_mode: 'HTML',
      chat_id: recipient.chat_id,
      ...input
    };
    const options: HttpFetchOptions = {
      method: "post",
      payload: input,
    }
    const res = await this.fetch(recipient, `sendMessage`, options);
    return res;
  }

  async sendPhoto(recipient: ITelegramRecipient, input: TelegramBotSendPhotoInput) {
    input = {
      parse_mode: 'HTML',
      chat_id: recipient.chat_id,
      ...input
    };
    const options: HttpFetchOptions = {
      method: "post",
      payload: input,
    }
    const res = await this.fetch(recipient, `sendPhoto`, options);
    return res;
  }

  async sendAudio(recipient: ITelegramRecipient, input: TelegramBotSendAudioInput) {
    input = {
      parse_mode: 'HTML',
      chat_id: recipient.chat_id,
      ...input
    };
    const options: HttpFetchOptions = {
      method: "post",
      payload: input,
    }
    const res = await this.fetch(recipient, `sendAudio`, options);
    return res;
  }

  async sendVideo(recipient: ITelegramRecipient, input: TelegramBotSendVideoInput) {
    input = {
      parse_mode: 'HTML',
      chat_id: recipient.chat_id,
      ...input
    };
    const options: HttpFetchOptions = {
      method: "post",
      payload: input,
    }
    const res = await this.fetch(recipient, `sendVideo`, options);
    return res;
  }

  async sendMediaGroup(recipient: ITelegramRecipient, input: TelegramBotSendMediaGroupInput) {
    input = {
      parse_mode: 'HTML',
      chat_id: recipient.chat_id,
      ...input
    };
    const options: HttpFetchOptions = {
      method: "post",
      payload: input,
    }
    const res = await this.fetch(recipient, `sendMediaGroup`, options);
    return res;
  }

  private getApi(token: string) {
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

  private async fetch(recipient: ITelegramRecipient, endpoint: string, options: HttpFetchOptions,) {
    const res = await HttpClient.fetchWithRetry({
      url: `${this.getApi(recipient.bot_token)}/${endpoint}`,
      options: options,
      max_retry: this.max_retry,
      handleRetry: TelegramBot.handleRetry,
    });

    return Utils.parseJson(res.getContentText()) as TelegramResponse;
  }
}
