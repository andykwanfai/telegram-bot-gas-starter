import { DEFAULT_RETRY_SLEEP_SEC } from './constants';
import { logger } from './Logger';
import { Utils } from './Utils';

export interface HttpFetchOptions extends GoogleAppsScript.URL_Fetch.URLFetchRequestOptions {
  params?: object;
}

export interface HttpBlob extends GoogleAppsScript.Base.Blob { }

export interface IHttpResponse extends GoogleAppsScript.URL_Fetch.HTTPResponse { }
export interface HttpResponse extends IHttpResponse { }
export class HttpResponse {
  constructor(res: IHttpResponse) {
    Object.assign(this, res);
  }

  getSetCookieHeader() {
    const headers: any = this.getAllHeaders();
    const set_cookie = headers['Set-Cookie'] ?? headers['set-cookie'];
    return set_cookie as string[] | undefined;
  }
}

function querystring(obj: object) {
  return Object.entries(obj).map(([key, value]) => {
    return `${key}=${value}`;
  }).join('&');
}

function appendQuerystring(url: string, obj: object) {
  const question_mark_index = url.indexOf('?');
  const qs = querystring(obj);
  if (question_mark_index > 0) {
    return `${url}&${qs}`;
  }
  return `${url}?${qs}`;
}

export class HttpClient {
  static async fetch(url: string, options: HttpFetchOptions) {
    if (options.params) {
      url = appendQuerystring(url, options.params);
    }
    logger.debug(url);
    logger.debug(options);
    const res = UrlFetchApp.fetch(url, options);
    return new HttpResponse(res);
  }

  static async fetchWithRetry(i: {
    url: string;
    options: HttpFetchOptions;
    retry: number;
    handleRetry?: (res?: HttpResponse) => void;
  }): Promise<HttpResponse> {
    const { url, options, handleRetry: handleRetry } = i;
    let { retry } = i;

    let res;
    let error_message;
    try {
      res = await this.fetch(url, { ...options, muteHttpExceptions: true });
    } catch (error: any) {
      // catch Address unavailable error
      error_message = error.message as string;
    }

    const status_code = res?.getResponseCode() ?? 9999;

    if (status_code < 400) {
      return res as HttpResponse;
    }

    logger.info(`fetch error: ${res?.getContentText() ?? error_message}`);

    if (retry <= 0) {
      const msg = `fetch error after retry`;
      logger.info(msg);
      throw new Error(`[fetchWithRetry] ${msg}`);
    }

    retry--;

    if (handleRetry) {
      handleRetry(res);
    } else {
      this.defaultHandleRetry();
    }

    return await this.fetchWithRetry({ url, options, retry });
  }

  private static defaultHandleRetry() {
    const retry_after = DEFAULT_RETRY_SLEEP_SEC;

    logger.info(`Sleep for ${retry_after} sec`);
    Utils.sleep(retry_after);
  }

  static async get(url: string, params?: object, options?: HttpFetchOptions) {
    return await this.fetch(url, { ...options, params: params, method: 'get' });
  }

  static async post(url: string, body?: object, options?: HttpFetchOptions) {
    return await this.fetch(url, { ...options, payload: body, method: 'post' });
  }

  static async put(url: string, body?: object, options?: HttpFetchOptions) {
    return await this.fetch(url, { ...options, payload: body, method: 'put' });
  }

  static async patch(url: string, body?: object, options?: HttpFetchOptions) {
    return await this.fetch(url, { ...options, payload: body, method: 'patch' });
  }

  static async delete(url: string, options?: HttpFetchOptions) {
    return await this.fetch(url, { ...options, method: 'delete' });
  }
}