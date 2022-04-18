import { logger } from './Logger';

export interface HttpFetchOptions extends GoogleAppsScript.URL_Fetch.URLFetchRequestOptions {
  params?: object;
}

export interface HttpResponse extends GoogleAppsScript.URL_Fetch.HTTPResponse { }

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
    return UrlFetchApp.fetch(url, options);
  }

  static async fetchWithRetry(i: {
    url: string;
    options: HttpFetchOptions;
    max_retry: number;
    handleRetry?: (res?: HttpResponse) => void;
  }): Promise<HttpResponse> {
    const { url, options, max_retry, handleRetry: handleRetry } = i;
    let retry = 0;
    while (true) {
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

      if (retry >= max_retry) {
        break;
      }

      retry++;

      if (handleRetry) {
        handleRetry(res);
      }

    }

    logger.info(`fetch error after ${max_retry} retry`);
    throw new Error();
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