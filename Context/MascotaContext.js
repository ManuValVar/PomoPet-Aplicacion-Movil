import { createContext, useContext, useState } from 'react';

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
    principal: '#E07B39',
    suave: '#FFE4CC',
    medio: '#FFCFA0',
    texto: '#5C3020',
    textoSuave: '#A06030',
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
    suave: '#FFF8F0',
    medio: '#FFE8CC',
    texto: '#5C3D2E',
    textoSuave: '#A07850',
  },
  Pez: {
    principal: '#FF6B9D',
    suave: '#FFF0F5',
    medio: '#FFD6E8',
    texto: '#5C2040',
    textoSuave: '#A05070',
  },
  Pandita: {
    principal: '#6B7280',
    suave: '#F3F4F6',
    medio: '#D1D5DB',
    texto: '#1F2937',
    textoSuave: '#6B7280',
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
    nivelRequerido: 1,
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
  Conejito: {
    nombre: 'Conejito',
    nivelRequerido: 5,
    imagenes: {
      home: require('../assets/mascotas/Conejito_Home.png'),
      study: require('../assets/mascotas/Conejito_Study.png'),
      break: require('../assets/mascotas/Conejito_Break.png'),
    },
  },
  Perrito: {
    nombre: 'Perrito',
    nivelRequerido: 6,
    imagenes: {
      home: require('../assets/mascotas/Perrito_Home.png'),
      study: require('../assets/mascotas/Perrito_Study.png'),
      break: require('../assets/mascotas/Perrito_Break.png'),
    },
  },
  Pez: {
    nombre: 'Pez',
    nivelRequerido: 7,
    imagenes: {
      home: require('../assets/mascotas/Pez_Home.png'),
      study: require('../assets/mascotas/Pez_Study.png'),
      break: require('../assets/mascotas/Pez_Break.png'),
    },
  },
  Pandita: {
    nombre: 'Pandita',
    nivelRequerido: 8,
    imagenes: {
      home: require('../assets/mascotas/Panda_Home.png'),
      study: require('../assets/mascotas/Panda_Study.png'),
      break: require('../assets/mascotas/Panda_Break.png'),
    },
  },
};

const MascotaContext = createContext();

export function MascotaProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [mascotaActual, setMascotaActual] = useState('Pomo');
  const [nivelUsuario, setNivelUsuario] = useState(1);
  const [pomodorosCompletados, setPomodorosCompletados] = useState(0);

  const tema = temas[mascotaActual];
  const mascota = mascotasData[mascotaActual];

  // Inicializar usuario cuando entra a la app
  const iniciarSesion = (datosUsuario) => {
    setUsuario(datosUsuario);
    setMascotaActual(datosUsuario.mascota_seleccionada || 'Pomo');
  };

  const seleccionarMascota = async (nombreMascota) => {
    const mascotaElegida = mascotasData[nombreMascota];
    if (mascotaElegida.nivelRequerido <= nivelUsuario) {
      setMascotaActual(nombreMascota);

      // Guardar en la base de datos
      if (usuario) {
        try {
          await fetch(`http://192.168.1.4:3001/usuarios/${usuario.id}/mascota`, {
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

  const completarPomodoro = async () => {
    const nuevosPomodoros = pomodorosCompletados + 1;
    setPomodorosCompletados(nuevosPomodoros);

    // Subir de nivel cada 5 pomodoros
    const nuevoNivel = Math.floor(nuevosPomodoros / 5) + 1;
    if (nuevoNivel > nivelUsuario) {
      setNivelUsuario(nuevoNivel);
    }

    // Guardar en la base de datos
    if (usuario) {
      try {
        await fetch('http://192.168.1.4:3001/pomodoros', {
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
      iniciarSesion,
      seleccionarMascota,
      completarPomodoro,
      mascotasData,
    }}>
      {children}
    </MascotaContext.Provider>
  );
}

export function useMascota() {
  return useContext(MascotaContext);
}