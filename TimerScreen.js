import { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Image, Animated, Alert, BackHandler
} from 'react-native';
import { useFonts, Quicksand_400Regular, Quicksand_600SemiBold, Quicksand_700Bold } from '@expo-google-fonts/quicksand';
import { Audio } from 'expo-av';
import { useFocusEffect } from '@react-navigation/native';

const mascotas = {
  pomo: require('../assets/Pomo.png'),
  pochocco: require('../assets/pochacco.png'),
  capy: require('../assets/capy.png'),
};

const TIEMPO_POMODORO = 25 * 60;
const TIEMPO_BREAK = 5 * 60;

export default function TimerScreen() {
  const [enBreak, setEnBreak] = useState(false);
  const [segundos, setSegundos] = useState(TIEMPO_POMODORO);
  const [corriendo, setCorriendo] = useState(false);
  const [mascotaSeleccionada] = useState('pomo');

  const mascotaAnim = useRef(new Animated.Value(1)).current;
  const intervaloRef = useRef(null);
  const enBreakRef = useRef(false); // referencia para saber el estado actual dentro del intervalo

  const [fontsLoaded] = useFonts({
    Quicksand_400Regular,
    Quicksand_600SemiBold,
    Quicksand_700Bold,
  });

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

  // Lógica del timer — corregida
  useEffect(() => {
    if (corriendo) {
      intervaloRef.current = setInterval(() => {
        setSegundos(prev => {
          if (prev <= 1) {
            // Terminó el ciclo actual
            reproducirSonido();

            if (!enBreakRef.current) {
              // Terminó el Pomodoro → empieza el Break
              enBreakRef.current = true;
              setEnBreak(true);
              return TIEMPO_BREAK;
            } else {
              // Terminó el Break → empieza nuevo Pomodoro
              enBreakRef.current = false;
              setEnBreak(false);
              return TIEMPO_POMODORO;
            }
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      clearInterval(intervaloRef.current);
    }

    return () => clearInterval(intervaloRef.current);
  }, [corriendo]);

  // Alerta al presionar botón atrás en Android
  useFocusEffect(() => {
    const onBackPress = () => {
      if (corriendo) {
        Alert.alert(
          '¿Salir de la sesión?',
          'Si sales, perderás tu progreso de concentración actual.',
          [
            { text: 'Quedarse', style: 'cancel' },
            {
              text: 'Salir',
              style: 'destructive',
              onPress: () => {
                reiniciar();
              }
            },
          ]
        );
        return true; // bloquea el back por defecto
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
  };

  if (!fontsLoaded) return null;

  return (
    <View style={[styles.container, enBreak && styles.containerBreak]}>

      {/* Título */}
      <Text style={styles.titulo}>Pomodoro Timer</Text>
      <Text style={styles.subtitulo}>
        {enBreak ? '¡Tómate un descanso!' : 'Concentración en progreso'}
      </Text>

      {/* Círculo del timer */}
      <View style={styles.circuloContainer}>
        <View style={[styles.circuloFondo, enBreak && styles.circuloFondoBreak]} />

        <Animated.Image
          source={mascotas[mascotaSeleccionada]}
          style={[
            styles.mascotaImagen,
            { transform: [{ scale: mascotaAnim }] }
          ]}
        />

        <Text style={[styles.tiempo, enBreak && styles.tiempoBreak]}>
          {formatearTiempo(segundos)}
        </Text>

        <View style={[
          styles.progresoBarra,
          {
            borderColor: enBreak ? '#FFA94D' : '#FF8C69',
            opacity: 0.3 + progreso * 0.7,
          }
        ]} />
      </View>

      {/* Estado */}
      <Text style={styles.estadoTexto}>
        {enBreak ? '☕ Break en progreso' : corriendo ? '🎯 Concentración en progreso' : '¡Lista para comenzar!'}
      </Text>

      {/* Botones */}
      <View style={styles.botonesRow}>
        <TouchableOpacity
          style={[styles.btnPrincipal, enBreak && styles.btnPrincipalBreak]}
          onPress={() => setCorriendo(!corriendo)}
        >
          <Text style={styles.btnPrincipalTexto}>
            {corriendo ? 'Pausar' : segundos === (enBreak ? TIEMPO_BREAK : TIEMPO_POMODORO) ? 'Iniciar' : 'Reanudar'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.btnReiniciar}
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
          <Text style={styles.btnReiniciarTexto}>↺</Text>
        </TouchableOpacity>
      </View>

      {/* Indicador de ciclo */}
      <View style={styles.cicloIndicador}>
        <View style={[styles.cicloPunto, !enBreak && styles.cicloPuntoActivo]} />
        <Text style={styles.cicloTexto}>
          {enBreak ? 'Break 5 min' : 'Pomodoro 25 min'}
        </Text>
        <View style={[styles.cicloPunto, enBreak && styles.cicloPuntoActivo]} />
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF8F0',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  containerBreak: {
    backgroundColor: '#FFF0E0',
  },
  titulo: {
    fontFamily: 'Quicksand_700Bold',
    fontSize: 26,
    color: '#5C3D2E',
    marginBottom: 6,
  },
  subtitulo: {
    fontFamily: 'Quicksand_400Regular',
    fontSize: 14,
    color: '#A07850',
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
    backgroundColor: '#FFE8CC',
    borderWidth: 6,
    borderColor: '#FFCFA0',
  },
  circuloFondoBreak: {
    backgroundColor: '#FFD6A5',
    borderColor: '#FFA94D',
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
    color: '#5C3D2E',
    position: 'absolute',
    bottom: 20,
  },
  tiempoBreak: {
    color: '#E07B39',
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
    color: '#A07850',
    marginBottom: 8,
  },
  botonesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginTop: 30,
  },
  btnPrincipal: {
    backgroundColor: '#FF8C69',
    paddingHorizontal: 48,
    paddingVertical: 16,
    borderRadius: 30,
    shadowColor: '#FF8C69',
    shadowOpacity: 0.4,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  btnPrincipalBreak: {
    backgroundColor: '#FFA94D',
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
    backgroundColor: '#FFE8CC',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#FFCFA0',
  },
  btnReiniciarTexto: {
    fontSize: 24,
    color: '#A07850',
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
    backgroundColor: '#FFE8CC',
    borderWidth: 1,
    borderColor: '#FFCFA0',
  },
  cicloPuntoActivo: {
    backgroundColor: '#FF8C69',
    borderColor: '#FF8C69',
  },
  cicloTexto: {
    fontFamily: 'Quicksand_600SemiBold',
    fontSize: 13,
    color: '#A07850',
  },
});