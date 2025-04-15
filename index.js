import {
  Client,
  GatewayIntentBits,
  EmbedBuilder,
  ActivityType,
} from "discord.js";
import fetch from "node-fetch";
import "dotenv/config";
import fs from "fs/promises";
import path from "path";

// ایجاد یک نمونه جدید از کلاینت
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

// پیکربندی ربات - از طریق دستور تنظیم خواهد شد
let config = {
  servers: {}, // Store multiple server configurations
};

// مرجع پیام وضعیت
const statusMessages = new Map(); // Store status messages for each server

// مسیر فایل پیکربندی
const CONFIG_PATH = path.join(process.cwd(), "config.json");

// تابع ذخیره پیکربندی
async function saveConfig() {
  try {
    await fs.writeFile(CONFIG_PATH, JSON.stringify(config, null, 2));
    console.log("Configuration saved to disk");
  } catch (error) {
    console.error("Error saving configuration:", error);
  }
}

// تابع بارگذاری پیکربندی
async function loadConfig() {
  try {
    const data = await fs.readFile(CONFIG_PATH, "utf8");
    config = JSON.parse(data);
    console.log("Configuration loaded from disk");
    return true;
  } catch (error) {
    if (error.code === "ENOENT") {
      console.log("No configuration file found, creating a new one");
      await saveConfig();
    } else {
      console.error("Error loading configuration:", error);
    }
    return false;
  }
}

// رویداد آماده‌سازی ربات
client.once("ready", async () => {
  console.log(`Logged in as ${client.user.tag}!`);
  client.user.setActivity("Starting up...", { type: ActivityType.Playing });

  // بارگذاری پیکربندی
  await loadConfig();

  // شروع چرخش وضعیت برای همه سرورهای پیکربندی شده
  if (Object.keys(config.servers).length > 0) {
    console.log(
      `Starting status rotation for ${Object.keys(config.servers).length} servers`,
    );
    startStatusRotation();
  } else {
    console.log("No servers configured. Use !mcsetup to configure a server.");
  }
});

// پردازشگر رویداد پیام
client.on("messageCreate", async (message) => {
  // نادیده گرفتن پیام‌های ربات‌ها
  if (message.author.bot) return;

  // پردازشگر دستور
  if (message.content.startsWith("!mcsetup")) {
    const args = message.content.split(" ").slice(1);

    if (args.length < 4) {
      return message.reply(
        "Usage: !mcsetup <minecraft_ip> <website_url> <status_channel_id> <server_name>",
      );
    }

    const guildId = message.guild?.id;
    if (!guildId) {
      return message.reply("This command can only be used in a server.");
    }

    // تنظیم پیکربندی
    config.servers[guildId] = {
      minecraftIp: args[0],
      websiteUrl: args[1],
      statusChannelId: args[2],
      serverName: args[3],
    };

    // ذخیره پیکربندی
    await saveConfig();

    message.reply(
      `Configuration saved! Monitoring Minecraft server: ${config.servers[guildId].serverName} (${config.servers[guildId].minecraftIp})`,
    );

    // شروع چرخش وضعیت اگر هنوز شروع نشده است
    if (!statusRotationStarted) {
      startStatusRotation();
    }

    // ارسال پیام وضعیت اولیه
    updateServerStatus(guildId);
  }
});

// متغیر برای پیگیری وضعیت چرخش
let statusRotationStarted = false;

// تابع شروع چرخش وضعیت
function startStatusRotation() {
  if (statusRotationStarted) return;
  statusRotationStarted = true;

  // به‌روزرسانی وضعیت هر ۴ ثانیه، چرخش بین آی‌پی، تعداد بازیکنان و تعداد اعضا
  let statusMode = 0; // 0 = آی‌پی، 1 = تعداد بازیکنان، 2 = تعداد اعضا
  let currentServerIndex = 0;

  setInterval(async () => {
    try {
      const serverIds = Object.keys(config.servers);
      if (serverIds.length === 0) return;

      // چرخش بین سرورهای مختلف
      currentServerIndex = (currentServerIndex + 1) % serverIds.length;
      const guildId = serverIds[currentServerIndex];
      const serverConfig = config.servers[guildId];

      const serverInfo = await getMinecraftServerInfo(serverConfig.minecraftIp);
      const guild = client.guilds.cache.get(guildId);
      const memberCount = guild ? guild.memberCount : 0;

      switch (statusMode) {
        case 0: // نمایش آی‌پی ماینکرفت
          client.user.setActivity(`IP: ${serverConfig.minecraftIp}`, {
            type: ActivityType.Playing,
          });
          break;
        case 1: // نمایش تعداد بازیکنان
          client.user.setActivity(
            `${serverInfo.online ? serverInfo.players.online : 0}/${serverInfo.online ? serverInfo.players.max : 0} players`,
            {
              type: ActivityType.Watching,
            },
          );
          break;
        case 2: // نمایش تعداد اعضای دیسکورد
          client.user.setActivity(`${memberCount} Discord members`, {
            type: ActivityType.Watching,
          });
          break;
      }

      // چرخش بین حالت‌های وضعیت
      statusMode = (statusMode + 1) % 3;
    } catch (error) {
      console.error("Error updating status:", error);
      client.user.setActivity("Error checking server", {
        type: ActivityType.Playing,
      });
    }
  }, 4000);

  // به‌روزرسانی پیام وضعیت سرور هر دقیقه
  setInterval(() => {
    const serverIds = Object.keys(config.servers);
    for (const guildId of serverIds) {
      updateServerStatus(guildId);
    }
  }, 60000);
}

// تابع دریافت اطلاعات سرور ماینکرفت
async function getMinecraftServerInfo(ip) {
  try {
    const response = await fetch(`https://api.mcsrvstat.us/2/${ip}`);
    return await response.json();
  } catch (error) {
    console.error("Error fetching Minecraft server info:", error);
    return { online: false };
  }
}

// تابع تشخیص حالت بازی
function detectGameMode(serverInfo) {
  // اگر سرور حالت بازی را به صورت مستقیم گزارش می‌کند
  if (serverInfo.gamemode) {
    return serverInfo.gamemode;
  }

  // تشخیص حالت بازی از روی اطلاعات دیگر
  const motd =
    serverInfo.motd && serverInfo.motd.clean
      ? serverInfo.motd.clean.join(" ").toLowerCase()
      : "";
  const plugins = serverInfo.plugins || [];
  const mods = serverInfo.mods || [];

  // تشخیص حالت‌های بازی محبوب
  if (
    motd.includes("bedwars") ||
    plugins.some((p) => p.toLowerCase().includes("bedwars"))
  ) {
    return "Bedwars";
  } else if (
    motd.includes("skywars") ||
    plugins.some((p) => p.toLowerCase().includes("skywars"))
  ) {
    return "Skywars";
  } else if (
    motd.includes("survival games") ||
    motd.includes("sg") ||
    plugins.some((p) => p.toLowerCase().includes("survivalgames"))
  ) {
    return "Survival Games";
  } else if (
    motd.includes("prison") ||
    plugins.some((p) => p.toLowerCase().includes("prison"))
  ) {
    return "Prison";
  } else if (
    motd.includes("skyblock") ||
    plugins.some((p) => p.toLowerCase().includes("skyblock"))
  ) {
    return "Skyblock";
  } else if (
    motd.includes("factions") ||
    plugins.some((p) => p.toLowerCase().includes("factions"))
  ) {
    return "Factions";
  } else if (motd.includes("creative") || serverInfo.gamemode === "creative") {
    return "Creative";
  } else if (
    motd.includes("hunger games") ||
    plugins.some((p) => p.toLowerCase().includes("hungergames"))
  ) {
    return "Hunger Games";
  } else if (
    motd.includes("kitpvp") ||
    plugins.some((p) => p.toLowerCase().includes("kitpvp"))
  ) {
    return "KitPVP";
  } else if (
    motd.includes("pixelmon") ||
    mods.some((m) => m.toLowerCase().includes("pixelmon"))
  ) {
    return "Pixelmon";
  } else if (
    motd.includes("towny") ||
    plugins.some((p) => p.toLowerCase().includes("towny"))
  ) {
    return "Towny";
  } else if (
    motd.includes("minigames") ||
    plugins.some((p) => p.toLowerCase().includes("minigame"))
  ) {
    return "Minigames";
  }

  // اگر نتوانستیم تشخیص دهیم، مقدار پیش‌فرض را برمی‌گردانیم
  return serverInfo.gamemode || "Survival";
}

// تابع به‌روزرسانی پیام وضعیت سرور
async function updateServerStatus(guildId) {
  const serverConfig = config.servers[guildId];
  if (!serverConfig) {
    console.log(`No server configuration found for guild ${guildId}`);
    return;
  }

  try {
    console.log(
      `Updating status for server ${serverConfig.serverName} (${serverConfig.minecraftIp})`,
    );

    // کانال را واکشی کنید
    let channel;
    try {
      channel = await client.channels.fetch(serverConfig.statusChannelId);
      if (!channel) {
        console.error(`Channel not found: ${serverConfig.statusChannelId}`);
        return;
      }
      if (!channel.isTextBased()) {
        console.error(
          `Channel is not text-based: ${serverConfig.statusChannelId}`,
        );
        return;
      }
    } catch (channelError) {
      console.error(
        `Error fetching channel ${serverConfig.statusChannelId}:`,
        channelError,
      );
      return;
    }

    // دریافت اطلاعات سرور
    let serverInfo;
    try {
      serverInfo = await getMinecraftServerInfo(serverConfig.minecraftIp);
      console.log(
        `Server info fetched for ${serverConfig.minecraftIp}:`,
        serverInfo.online ? "Online" : "Offline",
      );
    } catch (serverInfoError) {
      console.error(
        `Error fetching server info for ${serverConfig.minecraftIp}:`,
        serverInfoError,
      );
      serverInfo = { online: false };
    }

    const gameMode = detectGameMode(serverInfo);

    // ابتدا یک امبد بدون تصویر کوچک ایجاد کنید
    const embed = new EmbedBuilder()
      .setTitle(`${serverConfig.serverName} - Server Status`)
      .setColor(serverInfo.online ? "#00FF00" : "#FF0000")
      .addFields(
        {
          name: "📡 Status",
          value: serverInfo.online ? "✅ Online" : "❌ Offline",
          inline: true,
        },
        {
          name: "🌐 IP Address",
          value: `\`${serverConfig.minecraftIp}\``,
          inline: true,
        },
        { name: "🔗 Website", value: serverConfig.websiteUrl, inline: true },
      )
      .setTimestamp()
      .setFooter({ text: "Last updated" });

    // با استفاده ایمن تر، تصویر کوچک را اضافه کنید
    try {
      if (serverInfo.online && serverInfo.icon) {
        // به طور مستقیم از نماد استفاده نکنید، به جای آن از یک تصویر پیش فرض برای جلوگیری از مشکلات احتمالی استفاده کنید
        embed.setThumbnail(
          "https://media.minecraftforum.net/attachments/300/619/636977108000120237.png",
        );
      } else {
        embed.setThumbnail(
          "https://media.minecraftforum.net/attachments/300/619/636977108000120237.png",
        );
      }
    } catch (thumbnailError) {
      console.error("Error setting thumbnail:", thumbnailError);
      // بدون تصویر کوچک ادامه دهید
    }

    if (serverInfo.online) {
      embed.addFields(
        {
          name: "👥 Players",
          value: `${serverInfo.players.online}/${serverInfo.players.max}`,
          inline: true,
        },
        {
          name: "🎮 Version",
          value: serverInfo.version || "Unknown",
          inline: true,
        },
        { name: "🎲 Game Mode", value: gameMode, inline: true },
      );

      // در صورت وجود، MOTD را اضافه کنید
      if (serverInfo.motd && serverInfo.motd.clean) {
        const motd = serverInfo.motd.clean.join("\n");
        embed.setDescription(`**Message of the Day:**\n${motd}`);
      }
    }

    // پیام وضعیت را ارسال یا به‌روزرسانی کنید
    const statusMessage = statusMessages.get(guildId);
    if (statusMessage) {
      try {
        console.log(`Attempting to update existing message ${statusMessage}`);
        const message = await channel.messages.fetch(statusMessage);
        if (message) {
          await message.edit({ embeds: [embed] });
          console.log("Status message updated successfully");
          return;
        }
      } catch (messageError) {
        console.error(`Error updating status message:`, messageError);
        console.log("Will send a new message instead");
        // به ارسال پیام جدید ادامه دهید
      }
    }

    // Send new message
    try {
      console.log("Sending new status message");
      const message = await channel.send({ embeds: [embed] });
      statusMessages.set(guildId, message.id);
      console.log(`New status message sent with ID: ${message.id}`);
    } catch (sendError) {
      console.error("Error sending status message:", sendError);
    }
  } catch (error) {
    console.error(`Error updating server status for guild ${guildId}:`, error);
  }
}

// اطمینان از استفاده صحیح از متغیر محیطی
const token = process.env.DISCORD_TOKEN;
console.log("Token available:", !!token);
if (!token) {
  console.error(
    "ERROR: DISCORD_TOKEN environment variable is not set or is empty",
  );
  console.error("Please make sure the environment variable is correctly set");
  process.exit(1);
} else {
  client.login(token);
}
