import { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Animated, Alert, BackHandler, AppState
} from 'react-native';
import { useFonts, Quicksand_400Regular, Quicksand_600SemiBold, Quicksand_700Bold } from '@expo-google-fonts/quicksand';
import { useAudioPlayer } from 'expo-audio';
import { activateKeepAwakeAsync, deactivateKeepAwake } from 'expo-keep-awake';
import { useFocusEffect } from '@react-navigation/native';
import { useMascota } from '../Context/MascotaContext';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import AlertPersonalizado from '../components/AlertPersonalizado';
import { API_URL } from '../config';


const TIEMPO_POMODORO = 25 * 60;
const TIEMPO_BREAK = 5 * 60;

// Si el usuario sale de la app menos de este tiempo (ej. bloqueo de pantalla),
// NO se considera interrupción. Ajusta este valor a tu gusto.
const UMBRAL_INTERRUPCION_SEG = 20;

const esExpoGoAndroid = Constants.executionEnvironment === 'storeClient' && Platform.OS === 'android';

let Notifications = null;
if (!esExpoGoAndroid) {
  Notifications = require('expo-notifications');
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
}

const CANAL_ID = 'pomodoro';

// Android 8+ exige un canal; Android 13+ ni siquiera muestra el permiso sin uno.
const crearCanalAndroid = async () => {
  if (!Notifications || Platform.OS !== 'android') return;
  try {
    await Notifications.setNotificationChannelAsync(CANAL_ID, {
      name: 'Pomodoro',
      importance: Notifications.AndroidImportance.MAX,
      sound: 'default',
      vibrationPattern: [0, 250, 250, 250],
      lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
    });
  } catch (error) {
    console.log('Error al crear canal de notificaciones', error);
  }
};

// Programa una notificación para la hora exacta en que termina la fase.
// Suena aunque la pantalla esté apagada o la app suspendida.
const programarNotificacionFin = async (fin, fase) => {
  if (!Notifications) return;
  try {
    const esPomodoro = fase === 'pomodoro';
    await Notifications.scheduleNotificationAsync({
      content: {
        title: esPomodoro ? '🎉 ¡Pomodoro completado!' : '☕ ¡Break terminado!',
        body: esPomodoro
          ? '¡Excelente trabajo! Tómate un descanso de 5 minutos.'
          : '¡Hora de concentrarse! Empieza tu siguiente Pomodoro.',
        sound: true,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes?.DATE ?? 'date',
        date: new Date(fin),
        channelId: CANAL_ID,
      },
    });
  } catch (error) {
    console.log('Error al programar notificación', error);
  }
};

const cancelarNotificaciones = async () => {
  if (!Notifications) return;
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
  } catch (error) {
    console.log('Error al cancelar notificaciones', error);
  }
};

export default function TimerScreen() {
  const [enBreak, setEnBreak] = useState(false);
  const [segundos, setSegundos] = useState(TIEMPO_POMODORO);
  const [corriendo, setCorriendo] = useState(false);
  const { mascota, tema, completarPomodoro, usuario } = useMascota();
  const [alertReiniciar, setAlertReiniciar] = useState(false);
  const [alertInterrupcion, setAlertInterrupcion] = useState({ visible: false, tiempoFuera: '' });

  const mascotaAnim = useRef(new Animated.Value(1)).current;
  const intervaloRef = useRef(null);
  const enBreakRef = useRef(false);
  const corriendoRef = useRef(false);
  const segundosRef = useRef(TIEMPO_POMODORO);   // segundos restantes (para usar fuera del render)
  const finRef = useRef(0);                      // timestamp (ms) en que termina la fase actual
  const salidaRef = useRef(null);                // { hora, restante, eraBreak } al salir de la app
  const appStateRef = useRef(AppState.currentState);
  const usuarioRef = useRef(null);
  const completarRef = useRef(completarPomodoro);
  const tickRef = useRef(() => {});
  const sonidoPlayer = useAudioPlayer(require('../assets/done.mp3'));

  const [fontsLoaded] = useFonts({
    Quicksand_400Regular,
    Quicksand_600SemiBold,
    Quicksand_700Bold,
  });

  // Mantener refs sincronizadas
  useEffect(() => {
    usuarioRef.current = usuario;
  }, [usuario]);
  completarRef.current = completarPomodoro;

  const actualizarSegundos = (valor) => {
    segundosRef.current = valor;
    setSegundos(valor);
  };

  // Pedir permisos de notificaciones
  useEffect(() => {
    if (!Notifications) return;
    const pedirPermisos = async () => {
      await crearCanalAndroid(); // antes de pedir permiso (necesario en Android 13+)
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') {
        console.log('Permisos de notificaciones denegados');
      }
    };
    pedirPermisos();
  }, []);

  // Animación mascota
  useEffect(() => {
    if (corriendo) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(mascotaAnim, { toValue: 1.05, duration: 1000, useNativeDriver: true }),
          Animated.timing(mascotaAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
        ])
      ).start();
    } else {
      mascotaAnim.stopAnimation();
      mascotaAnim.setValue(1);
    }
  }, [corriendo]);

  // Termina la fase actual (pomodoro o break) y arranca la siguiente
  const terminarFase = (retrasoSeg) => {
    const eraBreak = enBreakRef.current;
    const ahoraEsBreak = !eraBreak;

    enBreakRef.current = ahoraEsBreak;
    setEnBreak(ahoraEsBreak);

    const duracion = ahoraEsBreak ? TIEMPO_BREAK : TIEMPO_POMODORO;
    finRef.current = Date.now() + duracion * 1000;
    actualizarSegundos(duracion);

    // La notificación de la fase que acaba de terminar ya estaba programada.
    // Programamos la de la fase que empieza.
    programarNotificacionFin(finRef.current, ahoraEsBreak ? 'break' : 'pomodoro');

    if (retrasoSeg < 5) reproducirSonido();
    if (!eraBreak) completarRef.current();
  };

  // Cada tick calcula el tiempo restante con la hora real (no depende de contar segundos)
  tickRef.current = () => {
    if (!corriendoRef.current) return;
    if (appStateRef.current !== 'active') return; // en segundo plano lo cubre la notificación

    const restante = Math.ceil((finRef.current - Date.now()) / 1000);
    if (restante > 0) {
      if (restante !== segundosRef.current) actualizarSegundos(restante);
    } else {
      terminarFase(-restante);
    }
  };

  // Timer: arrancar / pausar
  useEffect(() => {
    corriendoRef.current = corriendo;

    if (corriendo) {
      activateKeepAwakeAsync('pomodoro').catch(() => {});
      finRef.current = Date.now() + segundosRef.current * 1000;
      (async () => {
        await cancelarNotificaciones();
        await programarNotificacionFin(finRef.current, enBreakRef.current ? 'break' : 'pomodoro');
      })();
      intervaloRef.current = setInterval(() => tickRef.current(), 500);
    } else {
      try { deactivateKeepAwake('pomodoro'); } catch (e) {}
      clearInterval(intervaloRef.current);
      cancelarNotificaciones();
    }

    return () => clearInterval(intervaloRef.current);
  }, [corriendo]);

  // Liberar la pantalla al salir de esta pantalla
  useEffect(() => {
    return () => {
      try { deactivateKeepAwake('pomodoro'); } catch (e) {}
    };
  }, []);

  // AppState — detectar salida y regreso
  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextAppState => {
      const anterior = appStateRef.current;
      appStateRef.current = nextAppState;

      // Sale de la app (o se apaga la pantalla): el timer NO se pausa,
      // solo anotamos la hora de salida.
      if (anterior === 'active' && nextAppState !== 'active') {
        if (corriendoRef.current && salidaRef.current === null) {
          const restante = Math.max(1, Math.ceil((finRef.current - Date.now()) / 1000));
          salidaRef.current = {
            hora: Date.now(),
            restante,
            eraBreak: enBreakRef.current,
          };
        }
        return;
      }

      // Regresa a la app
      if (anterior !== 'active' && nextAppState === 'active') {
        const salida = salidaRef.current;
        salidaRef.current = null;
        if (!salida || !corriendoRef.current) return;

        const horaRegreso = Date.now();
        const segundosFuera = Math.floor((horaRegreso - salida.hora) / 1000);

        // Solo cuenta como interrupción si estuvo fuera más del umbral
        // y estaba en un Pomodoro (el break puede usarse libremente).
        if (!salida.eraBreak && segundosFuera >= UMBRAL_INTERRUPCION_SEG) {
          const minutosFuera = Math.floor(segundosFuera / 60);
          const segundosExtra = segundosFuera % 60;
          const tiempoFueraTexto = minutosFuera > 0
            ? `${minutosFuera} min ${segundosExtra} seg`
            : `${segundosExtra} seg`;

          // Pausar y dejar el tiempo como estaba al salir
          setCorriendo(false);
          actualizarSegundos(salida.restante);

          if (usuarioRef.current) {
            guardarInterrupcion(
              new Date(salida.hora).toISOString(),
              new Date(horaRegreso).toISOString(),
              segundosFuera
            );
          }

          setAlertInterrupcion({ visible: true, tiempoFuera: tiempoFueraTexto });
        } else {
          // Salida corta (bloqueo de pantalla): sincronizar el tiempo y seguir
          tickRef.current();
        }
      }
    });

    return () => subscription.remove();
  }, []);

  // Alerta botón atrás Android
  useFocusEffect(() => {
    const onBackPress = () => {
      if (corriendoRef.current) {
        Alert.alert(
          '¿Salir de la sesión?',
          'Si sales, tu Pomodoro se pausará.',
          [
            { text: 'Quedarse', style: 'cancel' },
            { text: 'Salir', style: 'destructive', onPress: () => reiniciar() },
          ]
        );
        return true;
      }
      return false;
    };

    const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => subscription.remove();
  });

  const reproducirSonido = () => {
    try {
      sonidoPlayer.seekTo(0);
      sonidoPlayer.play();
    } catch (error) {
      console.log('Error al reproducir sonido', error);
    }
  };

  const guardarInterrupcion = async (horaSalida, horaRegreso, duracionSegundos) => {
    try {
      const resPomodoro = await fetch(`${API_URL}/pomodoros`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          usuario_id: usuarioRef.current.id,
          interrumpido: true,
        }),
      });
      const dataPomodoro = await resPomodoro.json();

      await fetch(`${API_URL}/interrupciones`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pomodoro_id: dataPomodoro.id,
          hora_salida: horaSalida,
          hora_regreso: horaRegreso,
          duracion_segundos: duracionSegundos,
        }),
      });

      console.log('✅ Interrupción guardada');
    } catch (error) {
      console.log('Error al guardar interrupción:', error);
    }
  };

  const formatearTiempo = (seg) => {
    const minutos = Math.floor(seg / 60);
    const segundosRestantes = seg % 60;
    return `${String(minutos).padStart(2, '0')}:${String(segundosRestantes).padStart(2, '0')}`;
  };

  const progreso = enBreak
    ? 1 - segundos / TIEMPO_BREAK
    : 1 - segundos / TIEMPO_POMODORO;

  const reiniciar = () => {
    clearInterval(intervaloRef.current);
    setCorriendo(false);
    enBreakRef.current = false;
    setEnBreak(false);
    actualizarSegundos(TIEMPO_POMODORO);
    salidaRef.current = null;
    cancelarNotificaciones();
  };

  if (!fontsLoaded) return null;

  return (
    <View style={[
      styles.container,
      { backgroundColor: enBreak ? tema.medio : tema.suave }
    ]}>

      {/* Título */}
      <Text style={[styles.titulo, { color: tema.texto }]}>
        Pomodoro Timer
      </Text>
      <Text style={[styles.subtitulo, { color: tema.textoSuave }]}>
        {enBreak ? '¡Tómate un descanso!' : 'Concentración en progreso'}
      </Text>

      {/* Círculo del timer */}
      <View style={styles.circuloContainer}>
        <View style={[
          styles.circuloFondo,
          {
            backgroundColor: enBreak ? tema.suave : tema.medio,
            borderColor: tema.principal,
          }
        ]} />

        <Animated.Image
          source={enBreak ? mascota.imagenes.break : mascota.imagenes.study}
          style={[
            styles.mascotaImagen,
            { transform: [{ scale: mascotaAnim }] }
          ]}
        />

        <Text style={[styles.tiempo, { color: tema.texto }]}>
          {formatearTiempo(segundos)}
        </Text>

        <View style={[
          styles.progresoBarra,
          {
            borderColor: tema.principal,
            opacity: 0.3 + progreso * 0.7,
          }
        ]} />
      </View>

      {/* Estado */}
      <Text style={[styles.estadoTexto, { color: tema.textoSuave }]}>
        {enBreak ? '☕ Break en progreso' : corriendo ? '🎯 Concentración en progreso' : '¡Lista para comenzar!'}
      </Text>

      {/* Botones */}
      <View style={styles.botonesRow}>
        <TouchableOpacity
          style={[
            styles.btnPrincipal,
            { backgroundColor: tema.principal, shadowColor: tema.principal }
          ]}
          onPress={() => setCorriendo(!corriendo)}
        >
          <Text style={styles.btnPrincipalTexto}>
            {corriendo ? 'Pausar' : segundos === (enBreak ? TIEMPO_BREAK : TIEMPO_POMODORO) ? 'Iniciar' : 'Reanudar'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.btnReiniciar, { backgroundColor: tema.medio, borderColor: tema.principal }]}
          onPress={() => {
            if (corriendo) {
              setAlertReiniciar(true);
            } else {
              reiniciar();
            }
          }}
          
        >
          <Text style={[styles.btnReiniciarTexto, { color: tema.textoSuave }]}>↺</Text>
        </TouchableOpacity>
      </View>

      {/* Indicador de ciclo */}
      <View style={styles.cicloIndicador}>
        <View style={[
          styles.cicloPunto,
          { backgroundColor: tema.medio, borderColor: tema.principal },
          !enBreak && { backgroundColor: tema.principal }
        ]} />
        <Text style={[styles.cicloTexto, { color: tema.textoSuave }]}>
          {enBreak ? 'Break 5 min' : 'Pomodoro 25 min'}
        </Text>
        <View style={[
          styles.cicloPunto,
          { backgroundColor: tema.medio, borderColor: tema.principal },
          enBreak && { backgroundColor: tema.principal }
        ]} />
      </View>

      <AlertPersonalizado
        visible={alertReiniciar}
        titulo="¿Reiniciar sesión?"
        mensaje="Perderás tu progreso actual del Pomodoro."
        textoCancelar="Cancelar"
        textoConfirmar="Reiniciar"
        tipo="peligro"
        mostrarMascota={true}
        onCancelar={() => setAlertReiniciar(false)}
        onConfirmar={() => {
          setAlertReiniciar(false);
          reiniciar();
        }}
      />

      <AlertPersonalizado
        visible={alertInterrupcion.visible}
        titulo="⚠️ Sesión interrumpida"
        mensaje={`Saliste de PomoPet durante tu Pomodoro.\nEstuviste fuera ${alertInterrupcion.tiempoFuera}.`}
        textoCancelar="▶️ Continuar"
        textoConfirmar="🔄 Reiniciar"
        tipo="peligro"
        mostrarMascota={true}
        onCancelar={() => {
          setAlertInterrupcion({ visible: false, tiempoFuera: '' });
          setCorriendo(true);
        }}
        onConfirmar={() => {
          setAlertInterrupcion({ visible: false, tiempoFuera: '' });
          reiniciar();
        }}
      />

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  titulo: {
    fontFamily: 'Quicksand_700Bold',
    fontSize: 26,
    marginBottom: 6,
  },
  subtitulo: {
    fontFamily: 'Quicksand_400Regular',
    fontSize: 14,
    marginBottom: 40,
  },
  circuloContainer: {
    width: 240,
    height: 240,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 30,
  },
  circuloFondo: {
    position: 'absolute',
    width: 240,
    height: 240,
    borderRadius: 120,
    borderWidth: 6,
  },
  
  mascotaImagen: {
    width: 140,
    height: 140,
    resizeMode: 'contain',
    position: 'absolute',
    top: 10,
},
  tiempo: {
    fontFamily: 'Quicksand_700Bold',
    fontSize: 40,
    position: 'absolute',
    bottom: 14,
},

  progresoBarra: {
    position: 'absolute',
    width: 240,
    height: 240,
    borderRadius: 120,
    borderWidth: 6,
  },
  estadoTexto: {
    fontFamily: 'Quicksand_600SemiBold',
    fontSize: 15,
    marginBottom: 8,
  },
  botonesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginTop: 30,
  },
  btnPrincipal: {
    paddingHorizontal: 48,
    paddingVertical: 16,
    borderRadius: 30,
    shadowOpacity: 0.4,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  btnPrincipalTexto: {
    fontFamily: 'Quicksand_700Bold',
    fontSize: 18,
    color: '#fff',
  },
  btnReiniciar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  btnReiniciarTexto: {
    fontSize: 24,
  },
  cicloIndicador: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 24,
  },
  cicloPunto: {
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 1,
  },
  cicloTexto: {
    fontFamily: 'Quicksand_600SemiBold',
    fontSize: 13,
  },
});