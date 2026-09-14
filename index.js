const express = require('express');
const cors = require('cors');
const db = require('./db');

const app = express();
app.use(cors());
app.use(express.json());

// ── RUTA DE PRUEBA ──
app.get('/', (req, res) => {
  res.json({ mensaje: '🐱 Servidor PomoPet funcionando' });
});

// ── USUARIOS ──

// Obtener usuario por id
app.get('/usuarios/:id', (req, res) => {
  const { id } = req.params;
  db.query('SELECT * FROM usuarios WHERE id = ?', [id], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!results.length) return res.status(404).json({ error: 'Usuario no encontrado' });
    res.json(results[0]);
  });
});

// Crear usuario nuevo
app.post('/usuarios', (req, res) => {
  const { nombre } = req.body;
  if (!nombre?.trim()) return res.status(400).json({ error: 'El nombre es obligatorio' });

  db.query(
    'INSERT INTO usuarios (nombre, mascota_seleccionada) VALUES (?, ?)',
    [nombre.trim(), 'Pomo'],
    (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({
        id: results.insertId,
        nombre: nombre.trim(),
        mascota_seleccionada: 'Pomo',
      });
    }
  );
});

// Actualizar mascota seleccionada
app.put('/usuarios/:id/mascota', (req, res) => {
  const { id } = req.params;
  const { mascota_seleccionada } = req.body;
  db.query(
    'UPDATE usuarios SET mascota_seleccionada = ? WHERE id = ?',
    [mascota_seleccionada, id],
    (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ mensaje: 'Mascota actualizada correctamente' });
    }
  );
});

// ── MATERIAS ──

// Obtener materias de un usuario
app.get('/usuarios/:id/materias', (req, res) => {
  const { id } = req.params;
  db.query('SELECT * FROM materias WHERE usuario_id = ?', [id], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// Crear materia
app.post('/materias', (req, res) => {
  const { nombre, color, usuario_id } = req.body;
  if (!nombre?.trim()) return res.status(400).json({ error: 'El nombre es obligatorio' });

  db.query(
    'INSERT INTO materias (nombre, color, usuario_id) VALUES (?, ?, ?)',
    [nombre.trim(), color, usuario_id],
    (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({
        id: results.insertId,
        nombre: nombre.trim(),
        color,
        usuario_id,
      });
    }
  );
});

// Eliminar materia
app.delete('/materias/:id', (req, res) => {
  const { id } = req.params;
  db.query('DELETE FROM materias WHERE id = ?', [id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ mensaje: 'Materia eliminada correctamente' });
  });
});

// ── TAREAS ──

// Obtener tareas de una materia
app.get('/materias/:id/tareas', (req, res) => {
  const { id } = req.params;
  db.query('SELECT * FROM tareas WHERE materia_id = ?', [id], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// Crear tarea
app.post('/tareas', (req, res) => {
  const { nombre, fecha, materia_id } = req.body;
  if (!nombre?.trim()) return res.status(400).json({ error: 'El nombre es obligatorio' });

  db.query(
    'INSERT INTO tareas (nombre, fecha, materia_id) VALUES (?, ?, ?)',
    [nombre.trim(), fecha, materia_id],
    (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({
        id: results.insertId,
        nombre: nombre.trim(),
        fecha,
        materia_id,
        completada: false,
      });
    }
  );
});

// Actualizar tarea (completar o editar)
app.put('/tareas/:id', (req, res) => {
  const { id } = req.params;
  const { nombre, fecha, completada } = req.body;
  db.query(
    'UPDATE tareas SET nombre = ?, fecha = ?, completada = ? WHERE id = ?',
    [nombre, fecha, completada, id],
    (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ mensaje: 'Tarea actualizada correctamente' });
    }
  );
});

// Eliminar tarea
app.delete('/tareas/:id', (req, res) => {
  const { id } = req.params;
  db.query('DELETE FROM tareas WHERE id = ?', [id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ mensaje: 'Tarea eliminada correctamente' });
  });
});

// ── POMODOROS ──

// Registrar pomodoro completado
app.post('/pomodoros', (req, res) => {
  const { usuario_id, tarea_id, interrumpido } = req.body;
  db.query(
    'INSERT INTO pomodoros (usuario_id, tarea_id, interrumpido) VALUES (?, ?, ?)',
    [usuario_id, tarea_id || null, interrumpido || false],
    (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id: results.insertId });
    }
  );
});

// Obtener total de pomodoros de un usuario
app.get('/usuarios/:id/pomodoros', (req, res) => {
  const { id } = req.params;
  db.query(
    'SELECT COUNT(*) as total FROM pomodoros WHERE usuario_id = ? AND interrumpido = false',
    [id],
    (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ total: results[0].total });
    }
  );
});

// ── INTERRUPCIONES ──

// Registrar interrupción
app.post('/interrupciones', (req, res) => {
  const { pomodoro_id, hora_salida, hora_regreso, duracion_segundos } = req.body;
  db.query(
    'INSERT INTO interrupciones (pomodoro_id, hora_salida, hora_regreso, duracion_segundos) VALUES (?, ?, ?, ?)',
    [pomodoro_id, hora_salida, hora_regreso, duracion_segundos],
    (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id: results.insertId });
    }
  );
});


// Pomodoros de hoy
app.get('/usuarios/:id/pomodoros/hoy', (req, res) => {
  const { id } = req.params;
  const hoy = new Date().toISOString().split('T')[0];
  db.query(
    'SELECT COUNT(*) as total FROM pomodoros WHERE usuario_id = ? AND DATE(fecha) = ? AND interrumpido = false',
    [id, hoy],
    (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ total: results[0].total });
    }
  );
});

// Progreso semanal
app.get('/usuarios/:id/pomodoros/semanal', (req, res) => {
  const { id } = req.params;
  db.query(
    `SELECT DAYOFWEEK(fecha) as dia, COUNT(*) as total 
     FROM pomodoros 
     WHERE usuario_id = ? 
     AND interrumpido = false
     AND fecha >= DATE_SUB(NOW(), INTERVAL 7 DAY)
     GROUP BY DAYOFWEEK(fecha)`,
    [id],
    (err, results) => {
      if (err) return res.status(500).json({ error: err.message });

      // Convertir a array de 7 días [Lun, Mar, Mié, Jue, Vie, Sáb, Dom]
      const semanal = [0, 0, 0, 0, 0, 0, 0];
      results.forEach(row => {
        // DAYOFWEEK: 1=Dom, 2=Lun... 7=Sáb
        const index = row.dia === 1 ? 6 : row.dia - 2;
        semanal[index] = row.total;
      });
      res.json(semanal);
    }
  );
});

// Stats de tareas
app.get('/usuarios/:id/tareas/stats', (req, res) => {
  const { id } = req.params;
  db.query(
    `SELECT 
      COUNT(*) as total,
      SUM(CASE WHEN t.completada = true THEN 1 ELSE 0 END) as completadas
     FROM tareas t
     INNER JOIN materias m ON t.materia_id = m.id
     WHERE m.usuario_id = ?`,
    [id],
    (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({
        total: results[0].total || 0,
        completadas: results[0].completadas || 0,
      });
    }
  );
});

// ── ARRANCAR SERVIDOR ──
app.listen(3001, () => {
  console.log('🚀 Servidor PomoPet corriendo en puerto 3001');
});