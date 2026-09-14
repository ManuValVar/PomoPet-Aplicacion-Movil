const mysql = require('mysql2');

const conexion = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '', // en XAMPP la contraseña es vacía por defecto
  database: 'pomopet'
});

conexion.connect((err) => {
  if (err) {
    console.error('Error al conectar a la base de datos:', err);
    return;
  }
  console.log('✅ Conectado a la base de datos pomopet');
});

module.exports = conexion;