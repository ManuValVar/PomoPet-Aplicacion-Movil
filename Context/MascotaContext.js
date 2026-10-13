import { createContext, useContext, useState, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../config';

export const temas = {
  Osito: {
    principal: '#C8956C',
    suave: '#FFE8D6',
    medio: '#FFCFA0',
    texto: '#5C3D2E',
    textoSuave: '#A07850',
  },
  Ranita: {
    principal: '#6BAF7A',
    suave: '#D6F0DC',
    medio: '#A8D9B0',
    texto: '#2E5C38',
    textoSuave: '#507850',
  },
  Zorrito: {
    principal: '#eb914c',   // mostaza oscuro — cálido y diferente al naranja
    suave: '#f8ddc2',       // amarillo muy clarito de fondo
    medio: '#f2e3d4',       // mostaza clarito para círculos y bordes
    texto: '#3D2E00',       // café muy oscuro para textos
    textoSuave: '#874a0e',  // mostaza oscuro para subtítulos
    
  },
  Conejito: {
    principal: '#C48BB8',
    suave: '#F0D6EC',
    medio: '#E0B8D8',
    texto: '#5C2E58',
    textoSuave: '#A07898',
  },
  Perrito: {
    principal: '#6B9FD4',
    suave: '#D6E8F8',
    medio: '#A8C8E8',
    texto: '#2E3E5C',
    textoSuave: '#506080',
  },
  Pomo: {
    principal: '#FF8C69',
    suave: '#fff4e8',
    medio: '#FFE8CC',
    texto: '#5C3D2E',
    textoSuave: '#A07850',
  },
  Pez: {
    principal: '#FF6B9D',
    suave: '#f1d0db',
    medio: '#FFD6E8',
    texto: '#5C2040',
    textoSuave: '#A05070',
  },
  Pandita: {
    principal: '#4A5568',   // gris oscuro elegante — como las manchas del panda
    suave: '#F7F8FC',       // blanco con toque azulado muy suave de fondo
    medio: '#CBD5E0',       // gris clarito para círculos y bordes
    texto: '#1A202C',       // casi negro suave para textos
    textoSuave: '#718096',  // gris medio azulado para subtítulos
    
  },

  Monito: {
    principal: '#D4A017',   // dorado oscuro vibrante
    suave: '#FFFBEA',       // amarillo muy clarito de fondo
    medio: '#FFE680',       // amarillo medio para círculos y bordes
    texto: '#4A3000',       // café muy oscuro para textos
    textoSuave: '#8B6914',  // dorado oscuro para subtítulos
  }, 

  Mapache: {
    principal: '#6B7B8D',   // gris azulado — color del pelaje del mapache
    suave: '#F5F0EB',       // gris muy clarito cálido de fondo
    medio: '#C9B8A8',       // gris café medio para círculos y bordes
    texto: '#2C3E50',       // gris muy oscuro para textos
    textoSuave: '#7F8C8D',  // gris medio para subtítulos
    
  }, 
};

export const mascotasData = {
  Pomo: {
    nombre: 'Pomo',
    nivelRequerido: 1,
    imagenes: {
      home: require('../assets/mascotas/Gato_Home.png'),
      study: require('../assets/mascotas/Gato_Study.png'),
      break: require('../assets/mascotas/Gato_Break.png'),
    },
  },
  Osito: {
    nombre: 'Osito',
    nivelRequerido: 2,
    imagenes: {
      home: require('../assets/mascotas/Osito_Home.png'),
      study: require('../assets/mascotas/Osito_Study.png'),
      break: require('../assets/mascotas/Osito_Break.png'),
    },
  },
  Ranita: {
    nombre: 'Ranita',
    nivelRequerido: 3,
    imagenes: {
      home: require('../assets/mascotas/Ranita_Home.png'),
      study: require('../assets/mascotas/Ranita_Study.png'),
      break: require('../assets/mascotas/Ranita_Break.png'),
    },
  },
  Zorrito: {
    nombre: 'Zorrito',
    nivelRequerido: 4,
    imagenes: {
      home: require('../assets/mascotas/Zorrito_Home.png'),
      study: require('../assets/mascotas/Zorrito_Study.png'),
      break: require('../assets/mascotas/Zorrito_Break.png'),
    },
  },
  Monito:{
    nombre: 'Monito',
    nivelRequerido: 5,
    imagenes: {
      home: require('../assets/mascotas/Monito_Home.png'),
      study: require('../assets/mascotas/Monito_Study.png'),
      break: require('../assets/mascotas/Monito_Break.png'),
    },
  },
  Mapache: {
    nombre: 'Mapache',
    nivelRequerido: 6,
    imagenes: {
      home: require('../assets/mascotas/Mapache_Home.png'),
      study: require('../assets/mascotas/Mapache_Study.png'),
      break: require('../assets/mascotas/Mapache_Break.png'),
    },
  },
  Conejito: {
    nombre: 'Conejito',
    nivelRequerido: 7,
    imagenes: {
      home: require('../assets/mascotas/Conejito_Home.png'),
      study: require('../assets/mascotas/Conejito_Study.png'),
      break: require('../assets/mascotas/Conejito_Break.png'),
    },
  },
  Perrito: {
    nombre: 'Perrito',
    nivelRequerido: 8,
    imagenes: {
      home: require('../assets/mascotas/Perrito_Home.png'),
      study: require('../assets/mascotas/Perrito_Study.png'),
      break: require('../assets/mascotas/Perrito_Break.png'),
    },
  },

  Pandita: {
    nombre: 'Pandita',
    nivelRequerido: 9,
    imagenes: {
      home: require('../assets/mascotas/Panda_Home.png'),
      study: require('../assets/mascotas/Panda_Study.png'),
      break: require('../assets/mascotas/Panda_Break.png'),
    },
  },

  Pez: {
    nombre: 'Pez',
    nivelRequerido: 10,
    imagenes: {
      home: require('../assets/mascotas/Pez_Home.png'),
      study: require('../assets/mascotas/Pez_Study.png'),
      break: require('../assets/mascotas/Pez_Break.png'),
    },
  },
  
};

const MascotaContext = createContext();

export function MascotaProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [mascotaActual, setMascotaActual] = useState('Pomo');
  const [nivelUsuario, setNivelUsuario] = useState(1);
  const [pomodorosCompletados, setPomodorosCompletados] = useState(0);
  const [mascotasDesbloqueadas, setMascotasDesbloqueadas] = useState(['Pomo']);
  const [sesionActiva, setSesionActiva] = useState(false);
  const pomodorosRef = useRef(0);
  const nivelRef = useRef(1);
  const [alertNuevaMascota, setAlertNuevaMascota] = useState({ visible: false, nivel: 0, nombre: '' });
  

  const tema = temas[mascotaActual];
  const mascota = mascotasData[mascotaActual];

  // Inicializar usuario cuando entra a la app
  const iniciarSesion = async (datosUsuario) => {
    setUsuario(datosUsuario);
    setMascotaActual(datosUsuario.mascota_seleccionada || 'Pomo');
    setNivelUsuario(1);
    setPomodorosCompletados(0);
    setMascotasDesbloqueadas(['Pomo']);
    setSesionActiva(true);

    try {
      const res = await fetch(`${API_URL}/usuarios/${datosUsuario.id}/datos`);
      const datos = await res.json();
      pomodorosRef.current = datos.pomodoros;
      nivelRef.current = datos.nivel;

      setPomodorosCompletados(datos.pomodoros);
      setNivelUsuario(datos.nivel);

      if (datos.mascotas.length > 0) {
        setMascotasDesbloqueadas(datos.mascotas);
      } else {
        // Si no hay mascotas guardadas, calcular por nivel
        const mascotasDeNivel = Object.values(mascotasData)
          .filter(m => m.nivelRequerido <= datos.nivel)
          .map(m => m.nombre);
        setMascotasDesbloqueadas(mascotasDeNivel);
      }
    } catch (error) {
      console.log('Error al cargar datos del usuario:', error);
    }
};

  const seleccionarMascota = async (nombreMascota) => {
    const desbloqueada = mascotasDesbloqueadas.includes(nombreMascota);
    if (desbloqueada) {
      setMascotaActual(nombreMascota);
      if (usuario) {
        try {
          await fetch(`${API_URL}/usuarios/${usuario.id}/mascota`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ mascota_seleccionada: nombreMascota }),
          });
        } catch (error) {
          console.log('Error al guardar mascota:', error);
        }
      }
    }
  };

  const cerrarSesion = () => {
    // Limpiar sesión directamente sin Alert por ahora
    setUsuario(null);
    setMascotaActual('Pomo');
    setNivelUsuario(1);
    setPomodorosCompletados(0);
    setMascotasDesbloqueadas(['Pomo']);
    setSesionActiva(false);
    pomodorosRef.current = 0;
    nivelRef.current = 1;
};

  const completarPomodoro = async () => {
    pomodorosRef.current = pomodorosRef.current + 1;
    const nuevosPomodoros = pomodorosRef.current;
    const nuevoNivel = Math.floor(nuevosPomodoros / 5) + 1;


    setPomodorosCompletados(nuevosPomodoros);

    if (nuevoNivel > nivelRef.current) {
      nivelRef.current = nuevoNivel;
      setNivelUsuario(nuevoNivel);

      const mascotaNueva = Object.values(mascotasData).find(
        m => m.nivelRequerido === nuevoNivel
      );

      if (mascotaNueva && usuario) {
        try {
          await fetch(`${API_URL}/mascotas_usuario`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              usuario_id: usuario.id,
              nombre_mascota: mascotaNueva.nombre,
            }),
          });

          setMascotasDesbloqueadas(prev => [...prev, mascotaNueva.nombre]);

          setAlertNuevaMascota({ visible: true, nivel: nuevoNivel, nombre: mascotaNueva.nombre });
        } catch (error) {
          console.log('Error al desbloquear mascota:', error);
        }
      }
    }

    if (usuario) {
      try {
        await fetch(`${API_URL}/pomodoros`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            usuario_id: usuario.id,
            interrumpido: false,
          }),
        });
      } catch (error) {
        console.log('Error al guardar pomodoro:', error);
      }
    }
  };
      
  

  return (
    <MascotaContext.Provider value={{
      usuario,
      mascotaActual,
      mascota,
      tema,
      nivelUsuario,
      pomodorosCompletados,
      mascotasDesbloqueadas,
      sesionActiva,
      iniciarSesion,
      seleccionarMascota,
      completarPomodoro,
      mascotasData,
      cerrarSesion,
      setPomodorosCompletados, // ← nuevo
      setNivelUsuario,
      alertNuevaMascota,
      setAlertNuevaMascota,
    }}>
      {children}
    </MascotaContext.Provider>
  );
}

export function useMascota() {
  return useContext(MascotaContext);
}