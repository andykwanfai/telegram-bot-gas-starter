import { BOT_TOKENS } from "./bot_tokens";
import { gen_5th_group } from "./constants";
import { NogiMember } from "./members";

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
      chat_id: "42814681",
    }
  ],

  [NogiMember.Suzuki_Ayane]: [
    {
      bot_token: BOT_TOKENS[NogiMember.Suzuki_Ayane]!,
      chat_id: "-1001229973488",//ayane group
    }
  ],

  [NogiMember.Mukai_Hazuki]: [
    {
      bot_token: BOT_TOKENS[NogiMember.Mukai_Hazuki]!,
      chat_id: "-1001291605823",//hazuki group
    }
  ],

  // [NogiMember.Kubo_Shiori]: [
  //   {
  //     chat_id: '-1001469421140', //9bo group
  //     bot_token: BOT_TOKENS.DEFAULT,
  //   },
  // ],

  // [NogiMember.Sakaguchi_Tamami]: [
  //   {
  //     chat_id: '-1001258643516', //tamami group
  //     bot_token: BOT_TOKENS.DEFAULT,
  //   },
  // ],

  // [NogiMember.Nakamura_Reno]: [
  //   {
  //     chat_id: '-1001296881776', // reno group
  //     bot_token: BOT_TOKENS.DEFAULT,
  //   },
  // ],

  [NogiMember.Hayakawa_Seira]: [
    {
      bot_token: BOT_TOKENS.DEFAULT,
      chat_id: "-1001340565662",//seira twitter channel
    }
  ],

  // [NogiMember.Endo_Sakura]: [
  //   {
  //     chat_id: '-1001309617119', //saku group
  //     bot_token: BOT_TOKENS.DEFAULT,
  //   },
  // ],

  // [NogiMember.Shibata_Yuna]: [
  //   {
  //     chat_id: '-1001401773655', //yuna channel
  //     bot_token: BOT_TOKENS[NogiMember.Shibata_Yuna]!,
  //   },
  // ],

  // [NogiMember.Hayashi_Runa]: [
  //   {
  //     chat_id: '-1001526894610', //hayashi group
  //     bot_token: BOT_TOKENS.DEFAULT,
  //   },
  // ],

  // [NogiMember.Tsutsui_Ayame]: [
  //   {
  //     chat_id: '-1001367939835', //ayame group
  //     bot_token: BOT_TOKENS.DEFAULT,
  //   },
  // ],

  // [NogiMember.Yakubo_Mio]: [
  //   {
  //     chat_id: '-1001204631236', //yakubo group
  //     bot_token: BOT_TOKENS.DEFAULT,
  //   },
  // ],

  // [NogiMember.Tamura_Mayu]: [
  //   {
  //     chat_id: '-1001309976230', //mayu group
  //     bot_token: BOT_TOKENS.DEFAULT,
  //   },
  // ],


  [NogiMember.Ioki_Mao]: [
    {
      chat_id: gen_5th_group, //5th gen group
      bot_token: BOT_TOKENS.DEFAULT,
    },
  ],

  [NogiMember.Ikeda_Teresa]: [
    {
      chat_id: gen_5th_group, //5th gen group
      bot_token: BOT_TOKENS.DEFAULT,
    },
  ],

  [NogiMember.Ichinose_Miku]: [
    {
      chat_id: gen_5th_group, //5th gen group
      bot_token: BOT_TOKENS.DEFAULT,
    },
  ],

  [NogiMember.Inoue_Nagi]: [
    {
      chat_id: gen_5th_group, //5th gen group
      bot_token: BOT_TOKENS.DEFAULT,
    },
  ],

  [NogiMember.Ogawa_Aya]: [
    {
      chat_id: gen_5th_group, //5th gen group
      bot_token: BOT_TOKENS.DEFAULT,
    },
  ],

  [NogiMember.Okuda_Iroha]: [
    {
      chat_id: gen_5th_group, //5th gen group
      bot_token: BOT_TOKENS.DEFAULT,
    },
  ],

  [NogiMember.Kawasaki_Sakura]: [
    {
      chat_id: gen_5th_group, //5th gen group
      bot_token: BOT_TOKENS.DEFAULT,
    },
  ],

  [NogiMember.Sugawara_Satsuki]: [
    {
      chat_id: gen_5th_group, //5th gen group
      bot_token: BOT_TOKENS.DEFAULT,
    },
  ],

  [NogiMember.Tomisato_Nao]: [
    {
      chat_id: gen_5th_group, //5th gen group
      bot_token: BOT_TOKENS.DEFAULT,
    },
  ],

}