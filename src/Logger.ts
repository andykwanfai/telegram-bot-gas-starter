import { IS_LOGGER_DEBUG_MODE } from "./constants";

export class Log {
  constructor(i?: { debug: boolean }) {
    if (i?.debug) {
      this.debug = this.info;
    }
  }

  debug(data: any) {
  }

  info(data: any) {
    Logger.log(data);
  }
}


export const logger = new Log({ debug: IS_LOGGER_DEBUG_MODE });