import { RecipientMap } from "./ITelegramRecipient";
import { TG_BOTS } from "./tg_bots";

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