import { DEFAULT_RETRY_SLEEP_SEC } from "./constants";
import { HttpClient, HttpResponse, HttpFetchOptions, HttpBlob } from "./HttpClient";
import { logger } from "./Logger";
import { ITelegramRecipient } from "./tg_recipients";
import { Utils } from "./Utils";

export const TG_MAX_CAPTION_LEN = 1024; // character limit for caption of photo, video or media group is 1024 characters;
export const TG_MAX_MESSAGE_LEN = 4096; // character limit for text message is 4096 characters;

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
  photo: string | HttpBlob;
}

interface TelegramBotSendAudioInput extends TelegramBotSendFileInput {
  audio: string | HttpBlob;
  duration?: number;
  performer?: string;
  title?: string;
  thumb?: string;
}

interface TelegramBotSendVideoInput extends TelegramBotSendFileInput {
  video: string | HttpBlob;
  duration?: number;
  width?: number;
  height?: number;
  thumb?: string;
  supports_streaming?: boolean;
}

export interface TelegramBotInputMedia {
  type: 'audio' | 'photo' | 'video';
  media: string | HttpBlob;
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

export interface TelegramResponseResult {
  message_id: number;
  phone?: { file_id: string }[];
  video?: { file_id: string };
  audio?: { file_id: string };
  media_group_id?: string;
  caption?: string;
  text?: string;
  date: number;
}

export class TelegramFileSizeExceedLimitError extends Error {
  super(message?: string) {
    this.name = "TelegramFileSizeExceedLimitError";
    this.message = message ?? "File size exceeds limit";
  }
}

export interface TelegramResponse {
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
    // set default parse_mode
    input.media[0] = { parse_mode: 'HTML', ...input.media[0]! };
    // tg api need to stringify media
    input.media = JSON.stringify(input.media) as any;
    input = {
      chat_id: recipient.chat_id, //set default chat_id
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

  private static handleRetry(res?: HttpResponse) {
    const status_code = res?.getResponseCode();

    let retry_after = DEFAULT_RETRY_SLEEP_SEC;

    if (status_code !== undefined) {
      const error = Utils.parseJson(res!.getContentText()) as TelegramResponse;
      if (status_code === 429) {
        retry_after = error.parameters?.retry_after!;
      } else if (status_code === 400 &&
        error.description === "Bad Request: failed to get HTTP URL content") {
        throw new TelegramFileSizeExceedLimitError();
      }
    }

    logger.info(`Sleep for ${retry_after} sec`);
    Utils.sleep(retry_after);
  }

  private async fetch(recipient: ITelegramRecipient, endpoint: string, options: HttpFetchOptions,) {
    const res = await HttpClient.fetchWithRetry({
      url: `${this.getApi(recipient.bot_token)}/${endpoint}`,
      options: options,
      retry: this.max_retry,
      handleRetry: TelegramBot.handleRetry,
    });

    return Utils.parseJson(res.getContentText()) as TelegramResponse;
  }
}
