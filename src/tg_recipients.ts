import { BOT_TOKENS } from "./bot_tokens";

export interface ITelegramRecipient {
  bot_token: string;
  chat_id: string;
  pin_all_message?: boolean;
  is_default?: boolean;
}

export interface RecipientMap {
  DEFAULT: ITelegramRecipient[],
  ERROR: ITelegramRecipient[],
  [key: string]: ITelegramRecipient[],
}

// add recipients here to send by bot and chat other than default 
export const TG_RECIPIENTS: RecipientMap = {

  DEFAULT: [
    {
      bot_token: BOT_TOKENS.DEFAULT,
      chat_id: "",
      is_default: true,
    }
  ],

  ERROR: [
    {
      bot_token: BOT_TOKENS.DEFAULT,
      chat_id: "",
    }
  ],

}