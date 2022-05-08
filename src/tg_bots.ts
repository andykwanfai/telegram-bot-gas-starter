import { BOT_TOKENS } from "./bot_tokens";

export interface ITelegramBot {
  name: string;
  token: string;
  is_default?: boolean;
}

export interface BotMap {
  DEFAULT: ITelegramBot,
  [key: string]: ITelegramBot,
}

export const TG_BOTS: BotMap = {
  DEFAULT: {
    name: "",
    token: BOT_TOKENS.DEFAULT,
    is_default: true,
  },

}