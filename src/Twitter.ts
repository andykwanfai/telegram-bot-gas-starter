import { Cache } from './Cache';
import { DEFAULT_RETRY_SLEEP_SEC } from './constants';
import { HttpClient, HttpResponse, HttpFetchOptions } from './HttpClient';
import { IUserTweets } from './IUserTweet';
import { logger } from './Logger';
import { TweetMessage } from './TweetMessage';
import { Utils } from './Utils';

const GUEST_TOKEN_KEY = 'guest_token';
const GUEST_TOKEN_CACHE_SEC = 21300; //5hr 55min
const PATH_TOKEN = 'tjfcKCXTbbiLmzwXteRe3Q';
const QUERY_VAR = '%22count%22%3A20%2C%22includePromotedContent%22%3Atrue%2C%22withQuickPromoteEligibilityTweetFields%22%3Atrue%2C%22withSuperFollowsUserFields%22%3Atrue%2C%22withDownvotePerspective%22%3Afalse%2C%22withReactionsMetadata%22%3Afalse%2C%22withReactionsPerspective%22%3Afalse%2C%22withSuperFollowsTweetFields%22%3Atrue%2C%22withVoice%22%3Atrue%2C%22withV2Timeline%22%3Atrue%2C%22__fs_dont_mention_me_view_api_enabled%22%3Afalse%2C%22__fs_interactive_text_enabled%22%3Afalse%2C%22__fs_responsive_web_uc_gql_enabled%22%3Afalse%7D';
const AUTH_HEADER = { authorization: 'Bearer AAAAAAAAAAAAAAAAAAAAANRILgAAAAAAnNwIzUejRCOuH5E6I8xnZz4puTs%3D1Zv7ttfk8LF81IUq16cHjhLTvJu4FA33AGWWjCpTnA' };

interface TwitterErrorResponse {
  errors: Array<{
    message: string,
    code: number
  }>;
}

export class Twitter {
  private user_id;
  private guest_token;
  private max_retry;
  constructor(i: {
    user_id: string, guest_token: string, max_retry?: number
  }) {
    const { user_id, guest_token, max_retry } = i;
    this.user_id = user_id;
    this.max_retry = max_retry;
    this.guest_token = guest_token;
  }

  public static async getGuestToken() {
    const cache = new Cache('script');

    let guest_token = cache.get(GUEST_TOKEN_KEY);

    if (guest_token === null) {
      guest_token = await this.fetchGuestToken();
      cache.put(GUEST_TOKEN_KEY, guest_token, GUEST_TOKEN_CACHE_SEC);
    }

    logger.info(guest_token);
    return guest_token as string;
  }

  public async getTweetMessages() {
    const res = await this.fetchUserTweets();
    return TweetMessage.fromUserTweets(this.user_id, res);
  }

  private static handleRetry(res: HttpResponse) {
    // const status_code = res.getResponseCode();
    // const error = Utils.parseJson(res.getContentText()) as TwitterErrorResponse;

    let retry_after = DEFAULT_RETRY_SLEEP_SEC;

    logger.info(`Sleep for ${retry_after} sec`);
    Utils.sleep(retry_after);
  }

  private static async fetch(url: string, options: HttpFetchOptions, max_retry?: number) {
    return await HttpClient.fetchWithRetry({
      url: url,
      options: options,
      max_retry: max_retry ?? 0,
      handleRetry: Twitter.handleRetry,
    });
  }

  private static async fetchGuestToken(max_retry?: number) {
    // get cookie
    let res = await this.fetch("https://twitter.com", { method: 'get', }, max_retry);
    const cookie = (<any>res.getHeaders())['Set-Cookie'];

    // use cookie to get guest token
    res = await this.fetch("https://api.twitter.com/1.1/guest/activate.json", {
      method: 'post',
      headers: {
        'Cookie': cookie,
        ...AUTH_HEADER,
      }
    });

    const body = Utils.parseJson(res.getContentText()) as any;
    const guest_token: string = body['guest_token'];
    return guest_token;
  }

  private async fetchUserTweets() {
    const res = await Twitter.fetch(this.getUserTweetsApi(),
      {
        method: 'get',
        headers: {
          'x-guest-token': this.guest_token,
          ...AUTH_HEADER,
        },
      },
      this.max_retry);

    return Utils.parseJson(res.getContentText()) as IUserTweets;
  }

  private getUserTweetsApi() {
    return `https://twitter.com/i/api/graphql/${PATH_TOKEN}/UserTweets?variables=%7B%22userId%22%3A%22${this.user_id}%22%2C${QUERY_VAR}`;
  }

}
