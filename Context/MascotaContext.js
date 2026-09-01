import { createContext, useContext, useState } from 'react';

// Temas de colores por mascota
export const temas = {

  Pomo: {
    principal: '#D4A66B',
    suave: '#F8E8D6',
    medio: '#E8C8A8',
    texto: '#5C4A2E',
    textoSuave: '#807050',
  },
  Mochi: {
    principal: '#C8956C',
    suave: '#FFE8D6',
    medio: '#FFCFA0',
    texto: '#5C3D2E',
    textoSuave: '#A07850',
  },
  Pompón: {
    principal: '#6BAF7A',
    suave: '#D6F0DC',
    medio: '#A8D9B0',
    texto: '#2E5C38',
    textoSuave: '#507850',
  },
  Foxy: {
    principal: '#E07B39',
    suave: '#FFE4CC',
    medio: '#FFCFA0',
    texto: '#5C3020',
    textoSuave: '#A06030',
  },
  Nube: {
    principal: '#C48BB8',
    suave: '#F0D6EC',
    medio: '#E0B8D8',
    texto: '#5C2E58',
    textoSuave: '#A07898',
  },
  Bobby: {
    principal: '#6B9FD4',
    suave: '#D6E8F8',
    medio: '#A8C8E8',
    texto: '#2E3E5C',
    textoSuave: '#506080',
  },
  Milo: {
    principal: '#D4A66B',
    suave: '#F8E8D6',
    medio: '#E8C8A8',
    texto: '#5C4A2E',
    textoSuave: '#807050',
  },
  Pandi: {
    principal: '#A6D4B0',
    suave: '#E8F8F0',   
    medio: '#C8E8D8',
    texto: '#2E5C4A',
    textoSuave: '#507860',
},
  Lumi: {
    principal: '#e091ac',   // rosa coral fuerte
    suave: '#FFF0F5',       // rosa muy clarito de fondo
    medio: '#FFD6E8',       // rosa medio para círculos y bordes
    texto: '#5C2040',       // morado oscuro para textos
    textoSuave: '#A05070',  // rosado oscuro para subtítulos
},

  Roki: {
    principal: '#6B7280',   // gris medio
    suave: '#F3F4F6',       // gris muy clarito de fondo
    medio: '#D1D5DB',       // gris medio para círculos y bordes
    texto: '#1F2937',       // casi negro para textos
    textoSuave: '#6B7280',  // gris para subtítulos
  }

};

// Datos de las mascotas
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
  Mochi: {
    nombre: 'Mochi',
    nivelRequerido: 1,
    imagenes: {
      home: require('../assets/mascotas/Osito_Home.png'),
      study: require('../assets/mascotas/Osito_Study.png'),
      break: require('../assets/mascotas/Osito_Break.png'),
    },
  },
  Pompón: {
    nombre: 'Pompón',
    nivelRequerido: 1,
    imagenes: {
      home: require('../assets/mascotas/Ranita_Home.png'),
      study: require('../assets/mascotas/Ranita_Study.png'),
      break: require('../assets/mascotas/Ranita_Break.png'),
    },
  },
  Foxy: {
    nombre: 'Foxy',
    nivelRequerido: 1,
    imagenes: {
      home: require('../assets/mascotas/Zorrito_Home.png'),
      study: require('../assets/mascotas/Zorrito_Study.png'),
      break: require('../assets/mascotas/Zorrito_Break.png'),
    },
  },
  Nube: {
    nombre: 'Nube',
    nivelRequerido: 1,
    imagenes: {
      home: require('../assets/mascotas/Conejito_Home.png'),
      study: require('../assets/mascotas/Conejito_Study.png'),
      break: require('../assets/mascotas/Conejito_Break.png'),
    },
  },
  Bobby: {
    nombre: 'Bobby',
    nivelRequerido: 1,
    imagenes: {
      home: require('../assets/mascotas/Perrito_Home.png'),
      study: require('../assets/mascotas/Perrito_Study.png'),
      break: require('../assets/mascotas/Perrito_Break.png'),
    },
  },
  Milo: {
    nombre: 'Milo',
    nivelRequerido: 1,
    imagenes: {
        home: require('../assets/mascotas/Monito_Home.png'),
        study: require('../assets/mascotas/Monito_Study.png'),
        break: require('../assets/mascotas/Monito_Break.png'),
    },
},
  Pandi: {
    nombre: 'Pandi',
    nivelRequerido: 1,
    imagenes: {
        home: require('../assets/mascotas/Panda_Home.png'),
        study: require('../assets/mascotas/Panda_Study.png'),
        break: require('../assets/mascotas/Panda_Break.png'),
    },
},
  Lumi: {
    nombre: 'Lumi',
    nivelRequerido: 1,
    imagenes: {
        home: require('../assets/mascotas/Pez_Home.png'),
        study: require('../assets/mascotas/Pez_Study.png'),
        break: require('../assets/mascotas/Pez_Break.png'),
    },
},
  Roki: {
    nombre: 'Roki',
    nivelRequerido: 1,
    imagenes: {
        home: require('../assets/mascotas/Mapache_Home.png'),
        study: require('../assets/mascotas/Mapache_Study.png'),
        break: require('../assets/mascotas/Mapache_Break.png'),
    },
},

};

// Crear el contexto
const MascotaContext = createContext();

// Proveedor del contexto
export function MascotaProvider({ children }) {
  const [mascotaActual, setMascotaActual] = useState('Pomo');
  const [nivelUsuario, setNivelUsuario] = useState(1); // por ahora fijo, luego vendrá de MySQL
  const [pomodorosCompletados, setPomodorosCompletados] = useState(0);

  const tema = temas[mascotaActual];
  const mascota = mascotasData[mascotaActual];

  const seleccionarMascota = (nombreMascota) => {
    const mascotaElegida = mascotasData[nombreMascota];
    if (mascotaElegida.nivelRequerido <= nivelUsuario) {
      setMascotaActual(nombreMascota);
    }
  };

  const completarPomodoro = () => {
    const nuevosPomodoros = pomodorosCompletados + 1;
    setPomodorosCompletados(nuevosPomodoros);

    // Subir de nivel cada 5 pomodoros
    const nuevoNivel = Math.floor(nuevosPomodoros / 5) + 1;
    if (nuevoNivel > nivelUsuario) {
      setNivelUsuario(nuevoNivel);
    }
  };

  return (
    <MascotaContext.Provider value={{
      mascotaActual,
      mascota,
      tema,
      nivelUsuario,
      pomodorosCompletados,
      seleccionarMascota,
      completarPomodoro,
      mascotasData,
    }}>
      {children}
    </MascotaContext.Provider>
  );
}

// Hook para usar el contexto fácilmente
export function useMascota() {
  return useContext(MascotaContext);
}