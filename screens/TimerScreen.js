import { useState, useEffect, useRef } from 'react';
import {
View, Text, StyleSheet, TouchableOpacity, Animated, Alert, BackHandler, AppState
} from 'react-native';
import { useFonts, Quicksand_400Regular, Quicksand_600SemiBold, Quicksand_700Bold } from '@expo-google-fonts/quicksand';
import { Audio } from 'expo-av';
import { useFocusEffect } from '@react-navigation/native';
import { useMascota } from '../Context/MascotaContext';

const TIEMPO_POMODORO = 25 * 60;
const TIEMPO_BREAK = 5 * 60;

export default function TimerScreen() {
  const [enBreak, setEnBreak] = useState(false);
  const [segundos, setSegundos] = useState(TIEMPO_POMODORO);
  const [corriendo, setCorriendo] = useState(false);
  const { mascota, tema, completarPomodoro } = useMascota();

  const mascotaAnim = useRef(new Animated.Value(1)).current;
  const intervaloRef = useRef(null);
  const enBreakRef = useRef(false);
  const terminoCicloRef = useRef(false);

  // Para AppState — timestamp
  const inicioTimestampRef = useRef(null);   // hora exacta en que inició el ciclo
  const segundosAlSalirRef = useRef(null);   // segundos que quedaban al salir
  const appStateRef = useRef(AppState.currentState);
  const corriendoRef = useRef(false);        // ref espejo de corriendo para usarlo dentro del listener

  const [fontsLoaded] = useFonts({
    Quicksand_400Regular,
    Quicksand_600SemiBold,
    Quicksand_700Bold,
  });

  // Mantener corriendoRef sincronizado con corriendo
  useEffect(() => {
    corriendoRef.current = corriendo;

    // Guardar timestamp cuando inicia el timer
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

  // Lógica del timer con timestamp
  useEffect(() => {
    if (corriendo) {
      intervaloRef.current = setInterval(() => {
        setSegundos(prev => {
          if (prev <= 1) {
            terminoCicloRef.current = true;
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
          completarPomodoro();
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
          // Guardar segundos exactos que quedaban
          segundosAlSalirRef.current = Date.now();
          // Pausar el timer
          setCorriendo(false);
          clearInterval(intervaloRef.current);
        }
      }

      // App regresa a foreground
      if (appStateRef.current === 'background' && nextAppState === 'active') {
        if (segundosAlSalirRef.current !== null) {
          // Calcular cuánto tiempo estuvo fuera
          const segundosFuera = Math.floor((Date.now() - segundosAlSalirRef.current) / 1000);
          const minutosFuera = Math.floor(segundosFuera / 60);
          const segundosExtra = segundosFuera % 60;

          const tiempoFueraTexto = minutosFuera > 0
            ? `${minutosFuera} min ${segundosExtra} seg`
            : `${segundosExtra} seg`;

          segundosAlSalirRef.current = null;

          // Mostrar alerta de interrupción
          Alert.alert(
            '⚠️ Sesión interrumpida',
            `Saliste de PomoPet durante tu Pomodoro.\nEstuviste fuera ${tiempoFueraTexto}.\n\n¿Qué quieres hacer?`,
            [
              {
                text: '🔄 Reiniciar Pomodoro',
                style: 'destructive',
                onPress: reiniciar,
              },
              {
                text: '▶️ Continuar',
                onPress: () => setCorriendo(true),
              },
            ]
          );
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

  const reproducirSonido = async () => {
    try {
      const { sound } = await Audio.Sound.createAsync(
        require('../assets/done.mp3')
      );
      await sound.playAsync();
    } catch (error) {
      console.log('Error al reproducir sonido', error);
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
          style={[
            styles.btnReiniciar,
            { backgroundColor: tema.medio, borderColor: tema.principal }
          ]}
          onPress={() => {
            if (corriendo) {
              Alert.alert(
                '¿Reiniciar sesión?',
                'Perderás tu progreso actual.',
                [
                  { text: 'Cancelar', style: 'cancel' },
                  { text: 'Reiniciar', style: 'destructive', onPress: reiniciar },
                ]
              );
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
    top: 20,
  },
  tiempo: {
    fontFamily: 'Quicksand_700Bold',
    fontSize: 48,
    position: 'absolute',
    bottom: 20,
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