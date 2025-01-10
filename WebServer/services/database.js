const mysql = require('mysql2/promise');

const pool = mysql.createPool({
    host: 'wd.etsisi.upm.es',
    port: 3306,
    user: 'class',
    password: 'Class24_25',
    database: 'marsbd'
});

async function getUserPreferences(username) {
    try {
        const [rows] = await pool.execute(
            'SELECT ufos, time FROM prefView WHERE user = ?',
            [username]
        );
        return rows[0] || null;
    } catch (error) {
        console.error('Error fetching preferences:', error);
        throw error;
    }
}

async function updateUserPreferences(username, ufos, time) {
    try {
        const [result] = await pool.execute(
            'UPDATE prefView SET ufos = ?, time = ? WHERE user = ?',
            [ufos, time, username]
        );
        return result.affectedRows > 0;
    } catch (error) {
        console.error('Error updating preferences:', error);
        throw error;
    }
}

module.exports = {
    getUserPreferences,
    updateUserPreferences
};