import { HttpBlob, } from '../gas-telegram-bot-api/src/HttpClient';
import { TelegramBot, TelegramFileTooLargeError, TelegramSendMediaByUrlError, TG_MAX_CAPTION_LEN, TG_MAX_MESSAGE_LEN } from "../gas-telegram-bot-api/src/TelegramBot";
import { ITelegramRecipient, RecipientMap } from "./ITelegramRecipient";
import { App } from "./App";
import { TelegramBotInputMedia, TelegramBotSendMediaGroupInput, TelegramResponse, TelegramResponseResult } from "../gas-telegram-bot-api/src/interface/ITelegramBot";
import { MB } from "./constants";
import { VideoInfo } from "./VideoInfo";
import { Utils } from '../gas-telegram-bot-api/src/Utils';
import lodash from 'lodash';

export enum MessageMediaType {
  PHOTO = 'photo',
  VIDEO = 'video',
  AUDIO = 'audio',
  DOCUMENT = 'document',
}

export interface MessageMedia {
  type: MessageMediaType;
  media_url: string;
  media_blob?: HttpBlob;
  size?: number;
  file_id?: string;
  height?: number;
  width?: number;
  thumb_url?: string;
  thumb_blob?: HttpBlob;
  duration?: number;
  is_video_silent?: boolean;
  caption?: string;
}

export interface IMessage {
  id: number | string;
  date: Date;
  text?: string;
  media?: MessageMedia[];
  app: App;
  tg: TelegramBot;
  metadata: { [key: string]: any };
}
export interface Message extends IMessage { };
export class Message {
  protected main_text?: string;
  protected translate_text?: string;
  protected footer_hashtag_line?: string;
  constructor(i: IMessage) {
    Object.assign(this, i);
  }

  public async sendToAllRecipients(recipient_map: RecipientMap) {
    const recipients = this.getAllRecipients(recipient_map);
    for (const recipient of recipients) {
      await this.sendToTelegram(recipient);
    }
  };

  protected getAllRecipients(recipient_map: RecipientMap) {
    const recipients: ITelegramRecipient[] = [
      ...recipient_map.DEFAULT,
      ...this.app.fetch_setting?.default_recipients ?? [],
    ];

    return recipients;
  }

  private should_fetch_blob() {
    if (!this.media) {
      return false;
    }
    return this.app.default_fetch_blob ? this.app.default_fetch_blob : this.media.some(e => e.type === MessageMediaType.VIDEO && e.media_url.includes(".mov"));
  }

  private async sendToTelegram(recipient: ITelegramRecipient, fetch_blob = false): Promise<void> {
    const funcName = 'sendToTelegram';
    const logger = this.app.logger;
    const tg = this.tg;

    const has_media = this.media && this.media.length > 0;
    const max_text_len = !has_media ? TG_MAX_MESSAGE_LEN : TG_MAX_CAPTION_LEN;
    const outbound_text = this.getOutboundText(recipient.translate ?? false, max_text_len);
    logger.debug(`[${funcName}] outbound_text: ${JSON.stringify(outbound_text)}`);
    const main_text = outbound_text[0]!;

    // text only
    if (!has_media) {
      if (recipient.pin_all_message) {
        const res = await tg.sendMessage(recipient, { text: main_text });
        const message_id = (<TelegramResponseResult>res.result).message_id;
        await tg.pinChatMessage(recipient, { message_id: message_id });
        return await this.sendAllTextToTelegram({
          tg,
          recipient,
          all_text: outbound_text.splice(1),
          msg_id: message_id,
        });
      }

      return await this.sendAllTextToTelegram({ tg, recipient, all_text: outbound_text });
    }

    const oversize_error_message = `${outbound_text[0]}\n${JSON.stringify(this.media)}`;
    if (this.should_fetch_blob() || fetch_blob) {
      const is_oversize = await this.fetchMediaBlob();
      if (is_oversize) {
        throw new TelegramFileTooLargeError(oversize_error_message);
      }
    }

    //media group
    const media_chunks = lodash.chunk(this.media, 10);
    let res;
    try {
      res = await this.sendMediaGroup({ recipient, outbound_text: outbound_text[0]!, media: media_chunks[0]! });
      const result = res.result as TelegramResponseResult[];
      if (recipient.bot.is_default) {
        result.forEach((e, idx) => {
          if (!this.media![idx]!.file_id) {
            const file_id = TelegramBot.getFileId(e);
            this.media![idx]!.file_id = file_id;
          }
        });
      }
    } catch (error) {
      // if TelegramSendMediaByUrlError, send by blob
      if (error instanceof TelegramSendMediaByUrlError) {
        this.clearFileId();
        return await this.sendToTelegram(recipient, true);
      } else if (error instanceof TelegramFileTooLargeError) {
        error.message += oversize_error_message;
      }

      // throw other error
      throw error;
    }

    const msg_id = Array.isArray(res.result) ? res.result[0]!.message_id : res.result!.message_id;

    if (recipient.pin_all_message) {
      await tg.pinChatMessage(recipient, { message_id: msg_id });
    }

    await this.sendAllTextToTelegram({
      tg,
      recipient,
      all_text: outbound_text.splice(1),
      msg_id: msg_id,
    });

    await this.sendAllMediaToTelegram({
      recipient,
      all_media: media_chunks.splice(1),
      msg_id,
    });

    if (this.app.send_raw_media) {
      const raw_media = this.media!.map(e => {
        return {
          ...e,
          type: MessageMediaType.DOCUMENT,
          file_id: undefined,
        };
      })
      await this.sendMediaGroup({ recipient, media: raw_media, msg_id: msg_id });
    }
  }

  private async sendAllTextToTelegram(i: {
    tg: TelegramBot,
    recipient: ITelegramRecipient,
    all_text: string[],
    msg_id?: number,
  }) {
    const funcName = "sendAllTextToTelegram";
    const logger = this.app.logger;
    const { tg, recipient, all_text, } = i;
    let msg_id = i.msg_id;

    for (const text of all_text) {
      logger.debug(`${funcName} text: ${text} `);
      const res: TelegramResponse = await tg.sendMessage(recipient, {
        text: text,
        reply_to_message_id: msg_id,
      });
      if (res.ok) {
        msg_id = (<TelegramResponseResult>res.result).message_id;
      } else {
        throw new Error(`[${funcName}] ${res.description}`);
      }
    }
  }

  private async sendAllMediaToTelegram(i: {
    recipient: ITelegramRecipient,
    all_media: MessageMedia[][],
    msg_id?: number,
  }) {
    const funcName = "sendAllMediaToTelegram";
    const logger = this.app.logger;
    const { recipient, all_media: all_media, } = i;
    let msg_id = i.msg_id;

    for (const media of all_media) {
      logger.debug(`${funcName} text: ${media} `);
      const res = await this.sendMediaGroup({ recipient, media: media, msg_id });
      if (res.ok) {
        const result = res.result as TelegramResponseResult[];
        msg_id = result[0]!.message_id;
      } else {
        throw new Error(`[${funcName}] ${res.description}`);
      }
    }
  }

  private async sendMediaGroup(i: {
    recipient: ITelegramRecipient,
    outbound_text?: string,
    msg_id?: number,
    media: MessageMedia[],
  }) {
    const funcName = 'sendMediaGroup';
    const { recipient, outbound_text, media, msg_id } = i;

    const blob: any = {};
    const send_media: TelegramBotInputMedia[] = media.map((e, idx) => {
      let media;
      if (recipient.bot.is_default && e.file_id) {
        media = e.file_id;
      } else if (e.media_blob) {
        media = `attach://${idx}`;
        blob[idx] = e.media_blob;
      } else {
        media = e.media_url;
      }

      let supports_streaming;
      if (e.type === MessageMediaType.VIDEO) {
        supports_streaming = true;
      }
      let thumb;
      if (e.thumb_blob) {
        thumb = "attach://thumb_blob";
        blob['thumb_blob'] = e.thumb_blob;
      }

      return {
        ...e,
        media: media,
        thumb,
        type: e.type,
        supports_streaming,
      };
    });

    const input: TelegramBotSendMediaGroupInput = { media: send_media, ...blob, reply_to_message_id: msg_id };

    input.media[0]!.caption = outbound_text;
    return await this.tg.sendMediaGroup(recipient, input);
  }

  /**
   * @returns {boolean}
   * @description return true if oversize
   */
  private async fetchMediaBlob(): Promise<boolean> {
    if (!this.media) {
      return false;
    }

    const httpClient = this.app.httpClient;
    for (const medium of this.media) {
      if (medium.media_blob) {
        continue;
      }

      const max_retry = this.app.max_retry ?? 0;
      const res = await httpClient.fetchWithRetry({
        url: medium.media_url,
        options: { method: 'get' },
        retry: max_retry,
      });
      medium.media_blob = res.getBlob();

      const blob_size = medium.size ?? res.getContentLength();
      medium.size = blob_size;

      if (this.isFileOverSize(medium)) {
        return true;
      }

      // fix video for sending to telegram
      if (medium.type !== MessageMediaType.VIDEO) {
        continue;
      }

      // Video will have wrong aspect ratio and no thumbnail
      // 1. send by blob > 10MB
      // 2. .mov
      if (blob_size && blob_size < 10 * MB && !(medium.media_url.includes(".mov") || medium.media_blob.getName()?.includes(".mov"))) {
        continue;
      }

      if (medium.thumb_url) {
        const thumb_res = await httpClient.fetchWithRetry({
          url: medium.thumb_url,
          options: { method: 'get' },
          retry: max_retry,
        });
        medium.thumb_blob = thumb_res.getBlob();
      }

      const info = VideoInfo.getVideoInfo(res.getBlob().getBytes());
      medium.height = info?.height;
      medium.width = info?.width;
      medium.duration = info?.duration;
    }
    return false;
  }

  private isFileOverSize(media: MessageMedia) {
    let is_oversize = false;
    switch (media.type) {
      case MessageMediaType.PHOTO:
        is_oversize = media.size! >= 10 * MB;
        break;
      case MessageMediaType.VIDEO:
        is_oversize = media.size! >= 50 * MB;
        break;
      case MessageMediaType.AUDIO:
        is_oversize = media.size! >= 50 * MB;
        break;
    }
    return is_oversize;
  }

  private clearFileId() {
    this.media?.forEach((e) => e.file_id = undefined);
  }

  protected getFooterHashtags() {
    return [this.app.app_name];
  }

  protected getOutboundText(translate: boolean, max_len: number) {
    const funcName = "getOutboundText";
    const logger = this.app.logger;

    // set main text
    if (!this.main_text) {
      const format_date = Utils.getJSTDateString(this.date);
      this.main_text = format_date;
      if (this.text) {
        this.main_text += '\n\n' + this.replacePlaceholderName(this.text) + '\n';
      }
    }
    logger.debug(`[${funcName}]main_text: ${this.main_text} `);

    // set translate text
    if (translate && !this.translate_text && this.text) {
      const text = Message.encodeHtmlEntities(this.text);
      this.translate_text = LanguageApp.translate(text, 'ja', 'zh-TW');
      this.translate_text = this.replacePlaceholderName(this.translate_text);
      this.translate_text = Message.decodeHtmlEntities(this.translate_text);
      this.translate_text = "\n____________________\n\n" + this.translate_text + "\n";
    }
    logger.debug(`[${funcName}]translate_text: ${this.translate_text} `);

    // set footer hashtags line
    const hashtags = this.getFooterHashtags();
    logger.debug(`[${funcName}]hashtags: ${JSON.stringify(hashtags)}`);
    if (!this.footer_hashtag_line) {
      this.footer_hashtag_line = '\n' + hashtags.map((e) => `#${e.replace(/\s/g, "")}`).join(" ");
    }
    logger.debug(`[${funcName}]hashtags_line: ${this.footer_hashtag_line} `);

    const all_text = this.main_text + (translate && this.translate_text ? this.translate_text : "") + this.footer_hashtag_line;
    logger.debug(`[${funcName}]all_text: ${all_text} `);
    logger.debug(`[${funcName}]all_text: ${all_text.length} `);

    // short text
    if (Message.getLineCount(all_text) < 30 && all_text.length < max_len) {
      return [all_text];
    }

    // long multi line text
    if (all_text.length < max_len) {
      const return_text = [this.main_text + this.footer_hashtag_line];
      if (translate && this.translate_text) {
        return_text.push(this.translate_text);
      }
      return return_text;
    }

    // long text > max length
    const return_text = Message.splitLongString(this.main_text, max_len - this.footer_hashtag_line.length)!;
    return_text[return_text.length - 1] += this.footer_hashtag_line; //append to last element
    if (translate && this.translate_text) {
      return_text.push(...Message.splitLongString(this.translate_text, max_len)!);
    }
    return return_text;
  }

  protected replacePlaceholderName(text: string): string {
    return text;
  };

  // Google Translate fails to catch "<", ">", "&" and "=" which are not accepted by telegram
  private static encodeHtmlEntities(str: string) {
    str = str.replace(/\&/g, "&amp;");
    str = str.replace(/\</g, "&lt;");
    str = str.replace(/\>/g, "&gt;");
    str = str.replace(/\"/g, "&quot;");
    return str;
  }
  private static decodeHtmlEntities(str: string) {
    str = str.replace(/&amp;/g, "&");
    str = str.replace(/&lt;/g, "<");
    str = str.replace(/&gt;/g, ">");
    str = str.replace(/&quot;/g, "\"");
    return str;
  }
  private static getLineCount(str: string) {
    return str.split(/\r\n|\r|\n/).length;
  }
  private static splitLongString(body: string, max_len: number) {
    // match the first 1024/4096 characters minus footnoote (i.e. max_len), including new lines
    const re = new RegExp(`[\\s\\S]{1,${max_len}}`, 'g');
    const arr = body.match(re);
    return arr;
  }
}