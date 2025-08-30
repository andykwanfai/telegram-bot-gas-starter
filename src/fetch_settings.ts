import { ITelegramRecipient } from "../gas-telegram-bot-api/src/TelegramBot";

export interface FetchSetting {
  username: string,
  id: string,
  name?: string,
  schedules: string[],
  hashtag_filter?: boolean,
  keywords_filter?: {
    member?: boolean,
    includes?: string[],
    excludes?: string[],
  },
  default_recipients?: ITelegramRecipient[],
}

const SCHEDULE_5MIN = "*/5 0-16,23 * * * *";
const SCHEDULE_10MIN = "*/10 0-16,23 * * * *";
const SCHEDULE_15MIN = "*/15 0-16,23 * * * *";
const SCHEDULE_30MIN = "13,43 0-16,23 * * * *";
const SCHEDULE_60MIN = "7 0-16,23 * * * *";
const SCHEDULE_2HOUR = "27 0-16,23/2 * * * *";
const SCHEDULE_3HOUR = "37 0-16,23/3 * * * *";
const SCHEDULE_4HOUR = "17 0-16,23/4 * * * *";
const SCHEDULE_DAILY = "47 13 * * * *";
export const SCHEDULE_LATE_NIGHT_1 = "7 20 * * * *";
export const SCHEDULE_LATE_NIGHT_2 = "37 20 * * * *";
const SCHEDULE_MON_15MIN = "*/15 0-16,23 ? * MON *";
const SCHEDULE_FRI_15MIN = "*/15 0-16,23 ? * FRI *";
const SCHEDULE_SAT_15MIN = "*/15 0-16,23 ? * SAT *";
const SCHEDULE_SUN_15MIN = "*/15 0-16,23 ? * SUN *";
const SCHEDULE_ANN = "*/10 15-17 ? * WED *";
const SCHEDULE_NOGICHU = "*/15 15-16 ? * SUN *";
const SCHEDULE_NOGI = "13 2 * * * *";
const SCHEDULE_HAMASUKA = "13 2 ? * MON *";


export const FETCH_SETTINGS: { [id: string]: FetchSetting } = {
  "": {
    id: "",
    name: "",
    username: "",
    schedules: [],
    default_recipients: [],
  },
}