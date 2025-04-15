# ================================================================
#         

  ___        ____                   _____                    
 |_ _|_ __  |  _ \  _____   _____  |_   _|__  __ _ _ __ ___  
  | || '__| | | | |/ _ \ \ / / __|   | |/ _ \/ _` | '_ ` _ \ 
  | || |    | |_| |  __/\ V /\__ \   | |  __/ (_| | | | | | |
 |___|_|    |____/ \___| \_/ |___/   |_|\___|\__,_|_| |_| |_|



                                                             
# =============================================================== ║         
║  🛠️ Product Name : Server Status Bot
║  👨‍💻 Author       : ItzYasin                
║  📜 Description  :  
║   ➤ Please don't touch the codes        
║       if you don't know how to program.      
║   ➤ لطفا اگر برنامه نویسی بلد نیستید  
║       دست به کدها نزنید
================================================================

# Minecraft Server Discord Bot | ربات دیسکورد سرور ماینکرفت

## فارسی

یک ربات دیسکورد که سرور ماینکرفت شما را نظارت می‌کند و اطلاعات وضعیت را در سرور دیسکورد شما نمایش می‌دهد. این ربات به صورت متناوب بین نمایش آی‌پی سرور، تعداد بازیکنان و تعداد اعضای دیسکورد در وضعیت خود تغییر می‌کند.

### ویژگی‌ها

- نمایش تعداد اعضای سرور در وضعیت خود
- تغییر بین نمایش آی‌پی سرور ماینکرفت و تعداد بازیکنان هر ۴ ثانیه
- ایجاد پیام‌های جاسازی شده با اطلاعات سرور
- نظارت بر وضعیت سرور و به‌روزرسانی در زمان واقعی
- تشخیص حالت‌های بازی محبوب مانند Bedwars، Skywars، Factions و غیره
- راه‌اندازی آسان با یک دستور

### راه‌اندازی

۱. یک ربات دیسکورد در [پورتال توسعه‌دهندگان دیسکورد](https://discord.com/developers/applications) ایجاد کنید
۲. این مخزن را کلون کنید
۳. وابستگی‌ها را با `npm install` نصب کنید
۴. یک فایل `.env` با توکن ربات دیسکورد خود ایجاد کنید:
   \`\`\`
   DISCORD_TOKEN=توکن_شما_اینجا
   \`\`\`
۵. ربات را با `node index.js` اجرا کنید
۶. ربات را به سرور خود دعوت کنید
۷. از دستور راه‌اندازی برای پیکربندی ربات استفاده کنید:
   \`\`\`
   !mcsetup <minecraft_ip> <website_url> <status_channel_id> <server_name>
   \`\`\`

### مثال

\`\`\`
!mcsetup mc.hypixel.net https://hypixel.net 123456789012345678 Hypixel
\`\`\`

### نیازمندی‌ها

- Node.js نسخه ۱۶.۹.۰ یا بالاتر
- Discord.js نسخه ۱۴
- یک توکن ربات دیسکورد
- یک سرور ماینکرفت برای نظارت

### وابستگی‌ها

- discord.js
- node-fetch
- dotenv

## نحوه دریافت شناسه کانال

برای دریافت شناسه کانال:
۱. تنظیمات دیسکورد را باز کنید
۲. به بخش "پیشرفته" بروید و "حالت توسعه‌دهنده" را فعال کنید
۳. روی کانال مورد نظر خود راست-کلیک کنید
۴. گزینه "کپی شناسه" را انتخاب کنید

## عیب‌یابی

- اگر ربات به دستورات پاسخ نمی‌دهد، بررسی کنید که مجوزهای مناسب را در کانال داشته باشد
- اگر وضعیت سرور آفلاین نشان داده می‌شود در حالی که نباید، درستی آی‌پی سرور ماینکرفت را بررسی کنید
- مطمئن شوید که توکن ربات دیسکورد شما به درستی در فایل .env تنظیم شده است
- بررسی کنید که ربات شما "Message Content Intent" را در پورتال توسعه‌دهندگان دیسکورد فعال کرده باشد

-------------------------------------------------------

# Minecraft Server Discord Bot | ربات دیسکورد سرور ماینکرفت

## English

A Discord bot that monitors your Minecraft server and displays status information in your Discord server. The bot alternates between showing the server IP, player count, and Discord member count in its status.

### Features

- Displays server member count in its status
- Alternates between showing Minecraft server IP and player count every 4 seconds
- Creates embedded messages with server information
- Monitors server status and updates in real-time
- Detects popular game modes like Bedwars, Skywars, Factions, etc.
- Easy setup with a single command

### Setup

1. Create a Discord bot on the [Discord Developer Portal](https://discord.com/developers/applications)
2. Clone this repository
3. Install dependencies with `npm install`
4. Create a `.env` file with your Discord bot token:
   \`\`\`
   DISCORD_TOKEN=your_token_here
   \`\`\`
5. Start the bot with `node index.js`
6. Invite the bot to your server
7. Use the setup command to configure the bot:
   \`\`\`
   !mcsetup <minecraft_ip> <website_url> <status_channel_id> <server_name>
   \`\`\`

### Example

\`\`\`
!mcsetup mc.hypixel.net https://hypixel.net 123456789012345678 Hypixel
\`\`\`

### Requirements

- Node.js v16.9.0 or higher
- Discord.js v14
- A Discord bot token
- A Minecraft server to monitor

### Dependencies

- discord.js
- node-fetch
- dotenv


## How to Get Channel ID

To get a channel ID:
1. Open Discord settings
2. Go to "Advanced" and enable "Developer Mode"
3. Right-click on the channel you want to use
4. Select "Copy ID"

## Troubleshooting

- If the bot doesn't respond to commands, check that it has proper permissions in the channel
- If the server status shows as offline when it shouldn't, verify that the Minecraft server IP is correct
- Make sure your Discord bot token is correctly set in the .env file
- Check that your bot has the "Message Content Intent" enabled in the Discord Developer Portal
