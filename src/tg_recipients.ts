import { ITelegramBot, TG_BOTS } from "./tg_bots";

export interface ITelegramRecipient {
  bot: ITelegramBot;
  chat_id: string;
  pin_all_message?: boolean;
  // is_default?: boolean;
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
      bot: TG_BOTS.DEFAULT,
      chat_id: "",
    }
  ],

  ERROR: [
    {
      bot: TG_BOTS.DEFAULT,
      chat_id: "",
    }
  ],

}