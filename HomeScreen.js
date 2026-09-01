import { View, Text, StyleSheet, ScrollView, Image, Dimensions } from 'react-native';
import { useFonts, Quicksand_400Regular, Quicksand_600SemiBold, Quicksand_700Bold } from '@expo-google-fonts/quicksand';
import { LineChart } from 'react-native-chart-kit'; // Importa el componente de gráfico de líneas para mostrar el progreso semanal.

const mascotas = {
  pomo: require('../assets/Pomo.png'),
  pochocco: require('../assets/pochacco.png'),
  capy: require('../assets/capy.png'),
};

const screenWidth = Dimensions.get('window').width; //Obtiene el ancho real de la pantalla del celular. Lo necesitamos para que el gráfico se ajuste a cualquier tamaño de pantalla.

export default function HomeScreen() {
  const mascotaSeleccionada = 'pomo';

  const [fontsLoaded] = useFonts({
    Quicksand_400Regular,
    Quicksand_600SemiBold,
    Quicksand_700Bold,
  });

  if (!fontsLoaded) return null; //Mientras las fuentes no estén cargadas, no muestra nada en pantalla. Esto evita que el texto aparezca con fuente incorrecta por un instante.

  return (
    <ScrollView style={styles.container}>

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.appName}>PomoPet</Text>
        <Text style={styles.appSubtitle}>Planner Académico</Text>

        <View style={styles.mascotaCirculo}>
          <Image
            source={mascotas[mascotaSeleccionada]}
            style={styles.mascotaImagen}
          />
        </View>

        <Text style={styles.saludo}>Hola, Manu!</Text>
        <Text style={styles.pregunta}>¿Lista para concentrarte?</Text>
      </View>

      {/* Stats del día */}
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Hoy:</Text>
          <Text style={styles.statValor}>2/4 Pomodoros</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Objetivos:</Text>
          <Text style={styles.statValor}>60% Hecho</Text>
        </View>
      </View>

      {/* Sesiones recientes */}
      <View style={styles.seccion}>
        <Text style={styles.seccionTitulo}>Sesiones de estudio recientes:</Text>
        <View style={styles.etiquetasRow}>
          <View style={[styles.etiqueta, { backgroundColor: '#FFD6A5' }]}>
            <Text style={styles.etiquetaTexto}>Cálculo</Text>
          </View>
          <View style={[styles.etiqueta, { backgroundColor: '#CAFFBF' }]}>
            <Text style={styles.etiquetaTexto}>Historia</Text>
          </View>
          <View style={[styles.etiqueta, { backgroundColor: '#BDE0FE' }]}>
            <Text style={styles.etiquetaTexto}>Arte</Text>
          </View>
        </View>
      </View>

      {/* Gráfico de progreso semanal */}
      <View style={styles.seccion}>
        <Text style={styles.seccionTitulo}>Progreso semanal:</Text>
        <View style={styles.graficoCard}>
          <LineChart
            data={{
              labels: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'],
              datasets: [
                {
                  data: [2, 4, 3, 5, 2, 6, 4],
                  color: () => '#FF8C69',
                  strokeWidth: 2,
                },
              ],
            }}
            width={screenWidth - 80}
            height={180}
            chartConfig={{    
              backgroundColor: '#fff',
              backgroundGradientFrom: '#fff',
              backgroundGradientTo: '#fff',
              decimalPlaces: 0,
              color: () => '#FF8C69',
              labelColor: () => '#A07850',
              style: { borderRadius: 12 },
              propsForDots: {  //Configura los puntitos que aparecen en cada día de la gráfica.
                r: '5',
                strokeWidth: '2',
                stroke: '#FF8C69',
                fill: '#FFE8CC',
              },
              propsForBackgroundLines: {
                strokeDasharray: '',
                stroke: '#F0E6D3',
                strokeWidth: 1,
              },
            }}
            bezier  //Esta prop hace que la línea sea curva y suave en lugar de recta entre puntos.
            style={styles.grafico}
            withInnerLines={true}
            withOuterLines={false}
          />
          <Text style={styles.graficoSubtitulo}>Pomodoros completados por día</Text>
        </View>
      </View>

    

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF8F0',
  },

  // Header
  header: {
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 20,
  },
  appName: {
    fontSize: 45,
    fontFamily: 'Quicksand_700Bold',
    color: '#5C3D2E',
  },
  appSubtitle: {
    fontSize: 13,
    fontFamily: 'Quicksand_400Regular',
    color: '#A07850',
    marginBottom: 16,
  },
  mascotaCirculo: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: '#FFE8CC',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
    borderWidth: 3,
    borderColor: '#FFCFA0',
    overflow: 'hidden', //recorta la imagen para que quede dentro del círculo
  },
  mascotaImagen: {
    width: 150,
    height: 150,
    resizeMode: 'contain',
  },
  saludo: {
    fontSize: 22,
    fontFamily: 'Quicksand_700Bold',
    color: '#5C3D2E',
  },
  pregunta: {
    fontSize: 14,
    fontFamily: 'Quicksand_400Regular',
    color: '#A07850',
    marginTop: 4,
  },

  // Stats
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    paddingHorizontal: 24,
    marginTop: 16,
  },
  statCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    flex: 1,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statLabel: {
    fontSize: 11,
    fontFamily: 'Quicksand_600SemiBold',
    color: '#A07850',
    marginBottom: 4,
  },
  statValor: {
    fontSize: 13,
    fontFamily: 'Quicksand_700Bold',
    color: '#5C3D2E',
  },

  // Secciones
  seccion: {
    paddingHorizontal: 24,
    marginTop: 24,
  },
  seccionTitulo: {
    fontSize: 15,
    fontFamily: 'Quicksand_700Bold',
    color: '#5C3D2E',
    marginBottom: 10,
  },

  // Etiquetas materias
  etiquetasRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  etiqueta: {
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 6,
  },
  etiquetaTexto: {
    fontSize: 13,
    fontFamily: 'Quicksand_600SemiBold',
    color: '#5C3D2E',
  },

  // Gráfico
  graficoCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  grafico: {
    borderRadius: 12,
  },
  graficoSubtitulo: {
    fontSize: 11,
    fontFamily: 'Quicksand_400Regular',
    color: '#A07850',
    marginTop: 6,
  },

 
});