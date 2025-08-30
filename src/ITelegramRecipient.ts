
export interface ITelegramRecipient {
  bot: ITelegramBot;
  chat_id: string;
  pin_all_message?: boolean;
  translate?: boolean;
  is_default?: boolean;
  topic?: {
    OVERSIZE: string;
    [key: string]: string;
  };
}

export interface RecipientMap {
  DEFAULT: ITelegramRecipient[],
  ERROR: ITelegramRecipient[],
  [key: string]: ITelegramRecipient[],
}

export interface ITelegramBot {
  name: string;
  token: string;
  is_default?: boolean;
}

export interface BotMap {
  DEFAULT: ITelegramBot,
  [key: string]: ITelegramBot,
}
