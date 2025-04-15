const mysql = require('mysql2/promise');
require('dotenv').config();

module.exports.GetPlayerSkin = async (userId) => {
    if (!userId) {
        return 'https://cdn.discordapp.com/attachments/1316753645810745508/1332017058765996123/4cabef9c59631fe2ea78c1a69312290c.webp';
    }

    const pool = mysql.createPool({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
    });

    let connection;
    try {
        connection = await pool.getConnection();
        const [results] = await connection.query('SELECT skin FROM player WHERE id_discord = ?', [userId]);

        if (results.length > 0) {
            const { skin } = results[0];

            if (skin) {
                return `https://assets.open.mp/assets/images/skins/${skin}.png`;
            }
        }
    } finally {
        if (connection) {
            connection.release();
        }
    }

    return 'https://cdn.discordapp.com/attachments/1316753645810745508/1332017058765996123/4cabef9c59631fe2ea78c1a69312290c.webp';
};
