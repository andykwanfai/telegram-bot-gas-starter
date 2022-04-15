import { BOT_TOKENS } from "./bot_tokens";

export interface ITelegramRecipient {
  bot_token: string;
  chat_id: string;
}

// add recipients here to send by bot and chat other than default 
export const TG_RECIPIENTS: {
  DEFAULT: ITelegramRecipient[],
  [key: string]: ITelegramRecipient[] | undefined,
} = {

  DEFAULT: [
    {
      bot_token: BOT_TOKENS.DEFAULT,
      chat_id: "",
    }
  ],

}