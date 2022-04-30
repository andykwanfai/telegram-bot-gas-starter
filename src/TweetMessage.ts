import { DEFAULT_MAX_RETRY } from "./constants";
import { ITweetEntry, ITweetMedia, IUserTweets, TweetMediaType } from "./IUserTweet";
import { logger } from "./Logger";
import { TelegramBot, TelegramBotInputMedia, TelegramBotSendFileInput } from "./TelegramBot";
import { ITelegramRecipient, TG_RECIPIENTS } from "./tg_recipients";

interface TweetMessageMedia {
  type: TweetMediaType;
  media: string;
  caption?: string;
  parse_mode?: string;
}

export interface ITweetMessage {
  twitter_user_id: string;
  twitter_name: string;
  tweet_id: string;
  full_text: string;
  hashtags?: string[];
  media?: TweetMessageMedia[];
  tg_recipients: ITelegramRecipient[];
  created_at: Date;
}

export interface TweetMessage extends ITweetMessage { }
export class TweetMessage {
  private recipients: ITelegramRecipient[] = [];
  constructor(i: ITweetMessage) {
    Object.assign(this, i);
  }

  public static fromUserTweets(twitter_user_id: string, tweet: IUserTweets, last_published_at: Date): TweetMessage[] {
    const funcName = 'fromUserTweets';
    const entries: ITweetEntry[] = [];

    //normal tweets
    const timeline_entries = tweet.data.user.result.timeline_v2.timeline.instructions[1]?.entries;
    if (timeline_entries) {
      entries.push(...timeline_entries);
    }

    //pin tweet
    if (tweet.data.user.result.timeline_v2.timeline.instructions.length > 2) {
      const pin_tweet = tweet.data.user.result.timeline_v2.timeline.instructions[2]?.entry!;
      entries.push(pin_tweet);
    }

    //construct messages
    const messages: TweetMessage[] = [];
    for (const entry of entries) {
      // skip non tweet entry e.g. TopicsModule
      if (entry.entryId.includes("tweet-") === false) {
        continue;
      }
      // skip created_at <= last_published_at
      const created_at = new Date(entry.content.itemContent.tweet_results.result.legacy.created_at);
      if (created_at <= last_published_at) {
        continue;
      }

      const hashtags = entry.content.itemContent.tweet_results.result.legacy.entities.hashtags.map((e) => e.text);
      logger.debug(`[${funcName}] hashtags: ${JSON.stringify(hashtags)}`);

      // get recipients by hashtags
      const tg_recipients: ITelegramRecipient[] = [];
      hashtags.forEach((hashtag) => {
        const recipient = TG_RECIPIENTS[hashtag];
        if (recipient) {
          tg_recipients.push(...recipient);
        }
      });

      const input: ITweetMessage = {
        twitter_user_id: twitter_user_id,
        twitter_name: entry.content.itemContent.tweet_results.result.core.user_results.result.legacy.screen_name,
        tweet_id: entry.content.itemContent.tweet_results.result.rest_id,
        full_text: entry.content.itemContent.tweet_results.result.legacy.full_text,
        hashtags: hashtags,
        media: TweetMessage.getMedia(entry.content.itemContent.tweet_results.result.legacy.extended_entities?.media),
        tg_recipients: tg_recipients,
        created_at: created_at,
      }

      const message = new TweetMessage(input);
      messages.push(message);
    }

    return messages;
  }

  public async sendToRecipients() {
    const funcName = 'sendToRecipients';

    const tg = new TelegramBot({ max_retry: DEFAULT_MAX_RETRY });

    const outbound_text = this.getOutboundText();

    // remove duplicate recipients by chat id since one tweet may have multi hashtags with same recipients
    const recipients = [...new Map(this.tg_recipients.map(v => [v.chat_id, v])).values()];

    logger.info(`[${funcName}] ${this.twitter_name} send ${this.tweet_id} to ${recipients.length} recipients`);

    let success = true;
    for (const recipient of recipients) {
      const res = await this.sendToTelegram(tg, recipient, outbound_text);

      logger.debug(res);
      // mark success as false if one failed
      if (res.ok === false) {
        success = false;
      }

      logger.info(`${funcName} success: ${success}`);
    }

    return success;
  }

  private async sendToTelegram(tg: TelegramBot, recipient: ITelegramRecipient, outbound_text: string) {
    const funcName = 'sendToTelegram';
    logger.info(`${funcName}: tweet_id ${this.tweet_id}`);

    // text only
    if (this.media === undefined) {
      return await tg.sendMessage(recipient, {
        text: outbound_text,
      });
    }

    //media group
    if (this.media.length > 1) {
      // change gif to video type
      const media: TelegramBotInputMedia[] = this.media.map((e) => {
        return {
          ...e,
          type: e.type === TweetMediaType.GIF ? TweetMediaType.VIDEO : e.type,
        };
      });

      media[0].caption = outbound_text;
      return await tg.sendMediaGroup(recipient, {
        media: media,
      });
    }

    //single media
    const medium = this.media[0];
    const input: TelegramBotSendFileInput = {
      caption: outbound_text,
    };

    switch (medium.type) {
      case TweetMediaType.PHOTO:
        return await tg.sendPhoto(recipient, {
          photo: medium.media,
          ...input,
        });
        break;

      case TweetMediaType.VIDEO:
      case TweetMediaType.GIF:
        return await tg.sendVideo(recipient, {
          video: medium.media,
          ...input,
        });
        break;
    }
  }

  public static sort(messages: TweetMessage[]) {
    messages.sort((a, b) => {
      if (a.created_at < b.created_at) return -1;
      if (a.created_at > b.created_at) return 1;
      return 0;
    });
  }

  private getOutboundText() {
    return `${this.formatCreatedAt()}
https://twitter.com/${this.twitter_name}/status/${this.tweet_id}
        
${this.full_text}

#nogitwitter`;
  }

  private formatCreatedAt() {
    return Utilities.formatDate(this.created_at, 'Asia/Tokyo', "yyyy-MM-dd HH:mm:ss z");
  }

  private static getMedia(media?: ITweetMedia[]) {
    return media?.map((e) => {
      const media: TweetMessageMedia = { type: e.type, media: "" };
      switch (e.type) {
        case TweetMediaType.PHOTO: {
          media.media = e.media_url_https.replace('.jpg', '?format=jpg&name=4096x4096'); //use the largest photo

          break;
        }

        case TweetMediaType.GIF:
        case TweetMediaType.VIDEO: {
          let max = -1;
          let result = "";
          // find the largest bitrate
          for (let v of e.video_info?.variants!) {
            if (v.bitrate !== undefined && v.bitrate > max) {
              result = v.url;
              max = v.bitrate;
            }
          }
          media.media = result;

          break;
        }
      }

      return media;
    });
  }
}