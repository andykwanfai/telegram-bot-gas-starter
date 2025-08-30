# gas-telegram-bot-starter
A start kit with some wrappers of TelegramBot Apis and Google Apps Script in Typescript.

**1.** Install dependencies

```
pnpm install
```

**2.** Login to Google
```
pnpm clasp login
```

**3.** Add your script id to .clasp.json

**4.** Deploy
```
pnpm deploy
```

**5.** Use the App Class

Implement a class that extend the App Class.

Call app.getMessages() to get all messages.

Call message.sendToAllRecipients() to send the message.