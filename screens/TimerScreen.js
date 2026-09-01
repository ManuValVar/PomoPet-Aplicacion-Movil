import { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Alert,
  BackHandler
} from 'react-native';
import {
  useFonts,
  Quicksand_400Regular,
  Quicksand_600SemiBold,
  Quicksand_700Bold
} from '@expo-google-fonts/quicksand';
import { Audio } from 'expo-av';
import { useFocusEffect } from '@react-navigation/native';
import { useMascota } from '../Context/MascotaContext';

const TIEMPO_POMODORO = 1 * 60; // 1 minuto para pruebas
const TIEMPO_BREAK = 5 * 60;    // 5 minutos de descanso

export default function TimerScreen() {
  const [enBreak, setEnBreak] = useState(false);
  const [segundos, setSegundos] = useState(TIEMPO_POMODORO);
  const [corriendo, setCorriendo] = useState(false);

  const { mascota, tema, completarPomodoro } = useMascota();

  const mascotaAnim = useRef(new Animated.Value(1)).current;
  const intervaloRef = useRef(null);
  const enBreakRef = useRef(false);
  const terminoCicloRef = useRef(false);

  const [fontsLoaded] = useFonts({
    Quicksand_400Regular,
    Quicksand_600SemiBold,
    Quicksand_700Bold,
  });

  // =====================================================
  // ANIMACIÓN DE LA MASCOTA
  // =====================================================

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


  // =====================================================
  // LÓGICA DEL TIMER
  // =====================================================

  useEffect(() => {
    if (!corriendo) {
      clearInterval(intervaloRef.current);
      return;
    }

    intervaloRef.current = setInterval(() => {

      setSegundos(prev => {

        // Si todavía queda tiempo
        if (prev > 1) {
          return prev - 1;
        }

        // ================================================
        // TERMINÓ EL POMODORO
        // ================================================

        if (!enBreakRef.current) {
          terminoCicloRef.current = true;

          enBreakRef.current = true;
          setEnBreak(true);

          return TIEMPO_BREAK;
        }

        // ================================================
        // TERMINÓ EL BREAK
        // ================================================

        terminoCicloRef.current = true;

        enBreakRef.current = false;
        setEnBreak(false);

        return TIEMPO_POMODORO;
      });

    }, 1000);

    return () => {
      clearInterval(intervaloRef.current);
    };

  }, [corriendo]);


  // =====================================================
  // ACCIONES AL TERMINAR UN CICLO
  // =====================================================

  useEffect(() => {
    if (terminoCicloRef.current) {

      terminoCicloRef.current = false;

      reproducirSonido();

      // Solo cuenta un Pomodoro cuando termina
      // el período de concentración, no el break.
      if (enBreakRef.current) {
        completarPomodoro();
      }
    }

  }, [segundos]);


  // =====================================================
  // BOTÓN ATRÁS DE ANDROID
  // =====================================================

  useFocusEffect(() => {

    const onBackPress = () => {

      if (corriendo) {

        Alert.alert(
          '¿Salir de la sesión?',
          'Si sales, perderás tu progreso de concentración actual.',
          [
            {
              text: 'Quedarse',
              style: 'cancel'
            },
            {
              text: 'Salir',
              style: 'destructive',
              onPress: () => reiniciar()
            },
          ]
        );

        return true;
      }

      return false;
    };

    const subscription = BackHandler.addEventListener(
      'hardwareBackPress',
      onBackPress
    );

    return () => subscription.remove();

  });


  // =====================================================
  // SONIDO
  // =====================================================

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


  // =====================================================
  // FORMATEAR TIEMPO
  // =====================================================

  const formatearTiempo = (seg) => {

    const minutos = Math.floor(seg / 60);
    const segundosRestantes = seg % 60;

    return `${String(minutos).padStart(2, '0')}:${String(segundosRestantes).padStart(2, '0')}`;

  };


  // =====================================================
  // PROGRESO
  // =====================================================

  const progreso = enBreak
    ? 1 - segundos / TIEMPO_BREAK
    : 1 - segundos / TIEMPO_POMODORO;


  // =====================================================
  // REINICIAR
  // =====================================================

  const reiniciar = () => {

    clearInterval(intervaloRef.current);

    setCorriendo(false);

    enBreakRef.current = false;
    terminoCicloRef.current = false;

    setEnBreak(false);

    setSegundos(TIEMPO_POMODORO);

  };


  // =====================================================
  // ESPERAR FUENTES
  // =====================================================

  if (!fontsLoaded) return null;


  // =====================================================
  // INTERFAZ
  // =====================================================

  return (

    <View
      style={[
        styles.container,
        {
          backgroundColor: enBreak
            ? tema.medio
            : tema.suave
        }
      ]}
    >

      {/* Título */}

      <Text
        style={[
          styles.titulo,
          {
            color: tema.texto
          }
        ]}
      >
        Pomodoro Timer
      </Text>


      <Text
        style={[
          styles.subtitulo,
          {
            color: tema.textoSuave
          }
        ]}
      >
        {enBreak
          ? '¡Tómate un descanso!'
          : 'Concentración en progreso'}
      </Text>


      {/* =================================================
          CÍRCULO DEL TIMER
      ================================================= */}

      <View style={styles.circuloContainer}>

        {/* Fondo del círculo */}

        <View
          style={[
            styles.circuloFondo,
            {
              backgroundColor: enBreak
                ? tema.suave
                : tema.medio,

              borderColor: tema.principal,
            }
          ]}
        />


        {/* Mascota */}

        <Animated.Image
          source={
            enBreak
              ? mascota.imagenes.break
              : mascota.imagenes.study
          }

          style={[
            styles.mascotaImagen,
            {
              transform: [
                {
                  scale: mascotaAnim
                }
              ]
            }
          ]}
        />


        {/* Tiempo */}

        <Text
          style={[
            styles.tiempo,
            {
              color: tema.texto
            }
          ]}
        >
          {formatearTiempo(segundos)}
        </Text>


        {/* Barra de progreso */}

        <View
          style={[
            styles.progresoBarra,
            {
              borderColor: tema.principal,
              opacity: 0.3 + progreso * 0.7,
            }
          ]}
        />

      </View>


      {/* =================================================
          ESTADO
      ================================================= */}

      <Text
        style={[
          styles.estadoTexto,
          {
            color: tema.textoSuave
          }
        ]}
      >
        {
          enBreak
            ? '☕ Break en progreso'
            : corriendo
              ? '🎯 Concentración en progreso'
              : '¡Lista para comenzar!'
        }
      </Text>


      {/* =================================================
          BOTONES
      ================================================= */}

      <View style={styles.botonesRow}>

        {/* Botón iniciar / pausar */}

        <TouchableOpacity
          style={[
            styles.btnPrincipal,
            {
              backgroundColor: tema.principal,
              shadowColor: tema.principal
            }
          ]}

          onPress={() => setCorriendo(!corriendo)}
        >

          <Text style={styles.btnPrincipalTexto}>

            {
              corriendo
                ? 'Pausar'
                : segundos === (
                    enBreak
                      ? TIEMPO_BREAK
                      : TIEMPO_POMODORO
                  )
                  ? 'Iniciar'
                  : 'Reanudar'
            }

          </Text>

        </TouchableOpacity>


        {/* Botón reiniciar */}

        <TouchableOpacity
          style={[
            styles.btnReiniciar,
            {
              backgroundColor: tema.medio,
              borderColor: tema.principal
            }
          ]}

          onPress={() => {

            if (corriendo) {

              Alert.alert(
                '¿Reiniciar sesión?',
                'Perderás tu progreso actual.',
                [
                  {
                    text: 'Cancelar',
                    style: 'cancel'
                  },

                  {
                    text: 'Reiniciar',
                    style: 'destructive',
                    onPress: reiniciar
                  },
                ]
              );

            } else {

              reiniciar();

            }

          }}
        >

          <Text
            style={[
              styles.btnReiniciarTexto,
              {
                color: tema.textoSuave
              }
            ]}
          >
            ↺
          </Text>

        </TouchableOpacity>

      </View>


      {/* =================================================
          INDICADOR DE CICLO
      ================================================= */}

      <View style={styles.cicloIndicador}>

        {/* Punto Pomodoro */}

        <View
          style={[
            styles.cicloPunto,
            {
              backgroundColor: tema.medio,
              borderColor: tema.principal
            },

            !enBreak && {
              backgroundColor: tema.principal
            }
          ]}
        />


        <Text
          style={[
            styles.cicloTexto,
            {
              color: tema.textoSuave
            }
          ]}
        >
          {enBreak
            ? 'Break 5 min'
            : 'Pomodoro 1 min'}
        </Text>


        {/* Punto Break */}

        <View
          style={[
            styles.cicloPunto,
            {
              backgroundColor: tema.medio,
              borderColor: tema.principal
            },

            enBreak && {
              backgroundColor: tema.principal
            }
          ]}
        />

      </View>

    </View>
  );
}


// =====================================================
// ESTILOS
// =====================================================

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
    shadowOffset: {
      width: 0,
      height: 4
    },
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