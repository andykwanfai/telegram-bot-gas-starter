import { DEFAULT_MAX_RETRY } from "./constants";
import { logger } from "./Logger";
import { TweetMessage } from "./TweetMessage";
import { Twitter } from "./Twitter"
import { TWITTER_USER_IDS } from "./twitter_user_ids";

(<any>global).main = async () => {
  const guest_token = await Twitter.getGuestToken();

  // construct all twitter object
  const twitter_map: { [user_id: string]: Twitter | undefined } = {};
  TWITTER_USER_IDS.forEach((id) => {
    twitter_map[id] = new Twitter({ user_id: id, guest_token: guest_token, max_retry: DEFAULT_MAX_RETRY });
  });

  // get tweets of twitters
  const msgs: TweetMessage[] = [];
  for (const [key, twitter] of Object.entries(twitter_map)) {
    const msg = await twitter!.getTweetMessages();
    msgs.push(...msg);
  }
  logger.info(msgs.length);

  // sort the message in asc by created_at
  TweetMessage.sort(msgs);

  // send the message
  for (const msg of msgs) {
    const success = await msg.sendToRecipients();
    if (success) {
      twitter_map[msg.twitter_user_id]!.setLastPublishedAt(msg.created_at);
    }
  }

}
