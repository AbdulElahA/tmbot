const { Client, Message, TextChannel } = require("discord.js");
const { db, Guild, Channel, User } = require("../db");
const cooldown = require("../cooldown");

module.exports = {
  name: "messageCreate",
  /**
   * @param {Client} client
   * @param {Message} message
   */
  async execute(_client, message) {
    const admin = message.member.permissions.has("MANAGE_GUILD");

    /**
     * @type {{ guild: Guild, channel: Channel, user: User }}
     */
    const data = {
      guild: (await db.has("guilds", message.guild.id))
        ? await db.get("guilds", message.guild.id)
        : new Guild(message.guild.id),
      channel: (await db.has("channels", message.channel.id))
        ? await db.get("channels", message.channel.id)
        : new Channel(message.channel.id),
      user: (await db.has("users", message.author.id))
        ? await db.get("users", message.author.id)
        : new User(message.author.id),
    };

    if (!admin && !message.author.bot && data.channel.filter) {
      const { max, exclude, extensions } = data.channel.filter;

      if (max && message.attachments.size > max) return message.delete();

      const fileExtensions = message.attachments.map((attachment) =>
        attachment.name.split(".").pop()
      );
      const match = extensions.some((extension) =>
        fileExtensions.includes(extension)
      );

      if ((exclude && match) || (!exclude && !match)) return message.delete();
    }
  },
};