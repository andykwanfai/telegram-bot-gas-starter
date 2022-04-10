import { logger } from './Logger';

export interface RequestOptions extends GoogleAppsScript.URL_Fetch.URLFetchRequestOptions {
  params?: object;
}

export interface HTTPResponse extends GoogleAppsScript.URL_Fetch.HTTPResponse { }

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
  async fetch(url: string, options: RequestOptions) {
    if (options.params) {
      url = appendQuerystring(url, options.params);
    }
    logger.debug(url);
    return UrlFetchApp.fetch(url, options);
  }

  async fetchWithRetry(i: {
    url: string;
    options: RequestOptions;
    max_retry: number;
    handleError?: (res: HTTPResponse) => void;
  }) {
    const { url, options, max_retry, handleError } = i;
    let retry = 0;
    while (true) {
      const res = await this.fetch(url, { ...options, muteHttpExceptions: true });
      const status_code = res.getResponseCode();

      if (status_code < 400) {
        return res;
      }

      logger.info(`fetch error: ${res.getContentText()}`);

      if (retry >= max_retry) {
        break;
      }

      retry++;

      if (handleError) {
        handleError(res);
      }

    }

    logger.info(`fetch error after ${max_retry} retry`);
    throw new Error();
  }

  async get(url: string, params?: object, options?: RequestOptions) {
    return await this.fetch(url, { ...options, params: params, method: 'get' });
  }

  async post(url: string, body?: object, options?: RequestOptions) {
    return await this.fetch(url, { ...options, payload: body, method: 'post' });
  }

  async put(url: string, body?: object, options?: RequestOptions) {
    return await this.fetch(url, { ...options, payload: body, method: 'put' });
  }

  async patch(url: string, body?: object, options?: RequestOptions) {
    return await this.fetch(url, { ...options, payload: body, method: 'patch' });
  }

  async delete(url: string, options?: RequestOptions) {
    return await this.fetch(url, { ...options, method: 'delete' });
  }
}