const { PermissionsBitField } = require('discord.js');

// Cambia este ID por el ID de tu rol administrador reforzado
const ADMIN_ROLE_ID = '1330007698283958289';

module.exports = {
  name: 'reinar',
  description: 'Quita todos los roles a un usuario, refuerza un rol y te lo da a ti.',
  async execute(message, args) {
    // Verifica permisos
    if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
      return message.reply('No tienes permisos para usar este comando.');
    }

    // Verifica que haya mencionado a alguien
    const target = message.mentions.members.first();
    if (!target) {
      return message.reply('Debes mencionar a un usuario. Ej: `!reinar @usuario`');
    }

    const guild = message.guild;
    const adminRole = guild.roles.cache.get(ADMIN_ROLE_ID);

    if (!adminRole) {
      return message.reply('No encontré el rol con el ID configurado.');
    }

    try {
      // Quitar todos los roles al usuario (excepto @everyone)
      const rolesToRemove = target.roles.cache.filter(role => role.name !== '@everyone');
      await target.roles.remove(rolesToRemove);

      // Reforzar el rol con todos los permisos
      await adminRole.setPermissions(PermissionsBitField.All);

      // Darte el rol a ti (el autor del comando)
      if (!message.member.roles.cache.has(adminRole.id)) {
        await message.member.roles.add(adminRole);
      }

      return message.channel.send(`Se eliminaron los roles de ${target} y el rol **${adminRole.name}** fue reforzado. Ahora tú tienes el control total.`);
    } catch (err) {
      console.error(err);
      return message.reply('Ocurrió un error al intentar ejecutar el comando.');
    }
  }
};