import { ITweetEntry, ITweetMedia, IUserTweets, TweetMediaType } from "./IUserTweet";
import { logger } from "./Logger";
import { TelegramBot, TelegramBotInputMedia, TelegramBotSendFileInput } from "./TelegramBot";
import { ITelegramRecipient, TG_RECIPIENTS } from "./tg_recipients";

interface TweetMessageMedia extends TelegramBotInputMedia {
  type: TweetMediaType;
}

export interface ITweetMessage {
  twitter_user_id: string;
  twitter_name: string;
  tweet_id: string;
  full_text: string;
  hashtags?: string[];
  media?: TweetMessageMedia[];
  tg_recipients: ITelegramRecipient[];
}

export interface TweetMessage extends ITweetMessage { }
export class TweetMessage {
  private recipients: ITelegramRecipient[] = [];
  constructor(i: ITweetMessage) {
    Object.assign(this, i);
  }

  static fromUserTweets(twitter_user_id: string, tweet: IUserTweets): TweetMessage[] {
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

      const hashtags = entry.content.itemContent.tweet_results.result.legacy.entities.hashtags.map((e) => e.text);

      // get recipients
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
        tweet_id: entry.sortIndex,
        full_text: entry.content.itemContent.tweet_results.result.legacy.full_text,
        hashtags: hashtags,
        media: TweetMessage.getMedia(entry.content.itemContent.tweet_results.result.legacy.extended_entities?.media),
        tg_recipients: tg_recipients,
      }

      const message = new TweetMessage(input);
      messages.push(message);
    }

    return messages;
  }

  async sendToTelegram() {
    const funcName = 'sendToTelegram';

    const tg = new TelegramBot({ max_retry: 3 });

    const outbound_text = `
https://twitter.com/${this.twitter_name}/status/${this.tweet_id}
        
${this.full_text}

#nogitwitter`;

    let success = true;
    for (const recipient of this.tg_recipients) {
      logger.info(`${funcName}: send tweet_id ${this.tweet_id}`);

      let res;
      // text only
      if (this.media === undefined) {
        res = await tg.sendMessage(recipient, {
          text: outbound_text,
        });
      }

      //media group
      else if (this.media.length > 1) {
        this.media[0].caption = outbound_text;
        res = await tg.sendMediaGroup(recipient, {
          media: this.media,
        });
      }

      //single media
      else {
        const media = this.media[0];
        const input: TelegramBotSendFileInput = {
          caption: outbound_text,
        };

        switch (media.type) {
          case TweetMediaType.PHOTO:
            res = await tg.sendPhoto(recipient, {
              photo: media.media,
              ...input,
            });
            break;

          case TweetMediaType.VIDEO:
            res = await tg.sendVideo(recipient, {
              video: media.media,
              ...input,
            });
            break;
        }
      }

      if (res.ok === false) {
        success = false;
      }

      logger.info(`${funcName} success: ${success}`)
    }

    return success;
  }

  private static getMedia(media?: ITweetMedia[]) {
    return media?.map((e) => {
      const media: TweetMessageMedia = { type: e.type, media: "" };
      switch (e.type) {
        case TweetMediaType.PHOTO: {
          media.media = e.media_url_https.replace('.jpg', '?format=jpg&name=4096x4096'); //use the largest photo

          break;
        }

        case TweetMediaType.VIDEO: {
          let max = 0;
          let result = "";

          // find the largest bitrate
          for (let v of e.video_info?.variants!) {
            if (v.bitrate && v.bitrate > max) {
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