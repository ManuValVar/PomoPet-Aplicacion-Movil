import { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Animated, Alert, BackHandler, AppState
} from 'react-native';
import { useFonts, Quicksand_400Regular, Quicksand_600SemiBold, Quicksand_700Bold } from '@expo-google-fonts/quicksand';
import { useAudioPlayer } from 'expo-audio';
import { useFocusEffect } from '@react-navigation/native';
import { useMascota } from '../Context/MascotaContext';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import AlertPersonalizado from '../components/AlertPersonalizado';
import { API_URL } from '../config';


const TIEMPO_POMODORO = 25 * 60;
const TIEMPO_BREAK = 5 * 60;



const esExpoGoAndroid = Constants.executionEnvironment === 'storeClient' && Platform.OS === 'android';

let Notifications = null;
if (!esExpoGoAndroid) {
  Notifications = require('expo-notifications');
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
}

export default function TimerScreen() {
  const [enBreak, setEnBreak] = useState(false);
  const [segundos, setSegundos] = useState(TIEMPO_POMODORO);
  const [corriendo, setCorriendo] = useState(false);
  const { mascota, tema, completarPomodoro, usuario } = useMascota();
  const [alertReiniciar, setAlertReiniciar] = useState(false);

  const mascotaAnim = useRef(new Animated.Value(1)).current;
  const intervaloRef = useRef(null);
  const enBreakRef = useRef(false);
  const terminoCicloRef = useRef(false);
  const inicioTimestampRef = useRef(null);
  const segundosAlSalirRef = useRef(null);
  const appStateRef = useRef(AppState.currentState);
  const corriendoRef = useRef(false);
  const usuarioRef = useRef(null);
  const eraBreakRef = useRef(false);
  const sonidoPlayer = useAudioPlayer(require('../assets/done.mp3'));
  const [alertInterrupcion, setAlertInterrupcion] = useState({ visible: false, tiempoFuera: '' });
  

  const [fontsLoaded] = useFonts({
    Quicksand_400Regular,
    Quicksand_600SemiBold,
    Quicksand_700Bold,
  });

  // Sincronizar usuarioRef
  useEffect(() => {
    usuarioRef.current = usuario;
  }, [usuario]);

  // Pedir permisos de notificaciones
  useEffect(() => {
    if (!Notifications) return;
    const pedirPermisos = async () => {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') {
        console.log('Permisos de notificaciones denegados');
      }
    };
    pedirPermisos();
  }, []);


  // Sincronizar corriendoRef
  useEffect(() => {
    corriendoRef.current = corriendo;
    if (corriendo) {
      inicioTimestampRef.current = Date.now();
    }
  }, [corriendo]);

  // Animación mascota
  useEffect(() => {
    if (corriendo) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(mascotaAnim, {
            toValue: 1.05,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(mascotaAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      mascotaAnim.stopAnimation();
      mascotaAnim.setValue(1);
    }
  }, [corriendo]);

  // Lógica del timer

  useEffect(() => {
  if (corriendo) {
    intervaloRef.current = setInterval(() => {
      setSegundos(prev => {
        if (prev <= 1) {
          terminoCicloRef.current = true;
          eraBreakRef.current = enBreakRef.current; // guarda ANTES del cambio
          if (!enBreakRef.current) {
            enBreakRef.current = true;
            setEnBreak(true);
            inicioTimestampRef.current = Date.now();
            return TIEMPO_BREAK;
          } else {
            enBreakRef.current = false;
            setEnBreak(false);
            inicioTimestampRef.current = Date.now();
            return TIEMPO_POMODORO;
          }
        }
        return prev - 1;
      });

      if (terminoCicloRef.current) {
        terminoCicloRef.current = false;
        reproducirSonido();

        if (!eraBreakRef.current) {
          // ← usa eraBreakRef, no enBreakRef
          // Terminó el Pomodoro de 25 min
          completarPomodoro();
          enviarNotificacion(
            '🎉 ¡Pomodoro completado!',
            '¡Excelente trabajo! Tómate un descanso de 5 minutos.'
          );
          
        } else {
          // Terminó el Break
          enviarNotificacion(
            '☕ ¡Break terminado!',
            '¡Hora de concentrarse! Empieza tu siguiente Pomodoro.'
          );
          
        }
      }
    }, 1000);
  } else {
    clearInterval(intervaloRef.current);
  }

  return () => clearInterval(intervaloRef.current);
}, [corriendo]);
  

  // AppState — detectar salida y regreso
  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextAppState => {

      // App pasa a background
      if (appStateRef.current === 'active' && nextAppState === 'background') {
        if (corriendoRef.current) {
          segundosAlSalirRef.current = Date.now();
          setCorriendo(false);
          clearInterval(intervaloRef.current);
        }
      }

      // App regresa a foreground
      if (appStateRef.current === 'background' && nextAppState === 'active') {
        if (segundosAlSalirRef.current !== null) {
          const horaRegreso = Date.now();
          const segundosFuera = Math.floor((horaRegreso - segundosAlSalirRef.current) / 1000);
          const minutosFuera = Math.floor(segundosFuera / 60);
          const segundosExtra = segundosFuera % 60;

          const tiempoFueraTexto = minutosFuera > 0
            ? `${minutosFuera} min ${segundosExtra} seg`
            : `${segundosExtra} seg`;

          // Guardar interrupción en la base de datos
          if (usuarioRef.current) {
            guardarInterrupcion(
              new Date(segundosAlSalirRef.current).toISOString(),
              new Date(horaRegreso).toISOString(),
              segundosFuera
            );
          }

          segundosAlSalirRef.current = null;

          setAlertInterrupcion({ visible: true, tiempoFuera: tiempoFueraTexto });
        }
      }

      appStateRef.current = nextAppState;
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

  const enviarNotificacion = async (titulo, cuerpo) => {
    if (!Notifications) {
      return;
    }
    try {
      await Notifications.scheduleNotificationAsync({
        content: { title: titulo, body: cuerpo, sound: true },
        trigger: null,
      });
    } catch (error) {
      console.log('Error al enviar notificación', error);
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
    setSegundos(TIEMPO_POMODORO);
    inicioTimestampRef.current = null;
    segundosAlSalirRef.current = null;
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