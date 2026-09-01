import { View, Text, StyleSheet, ScrollView, Image, Dimensions } from 'react-native';
import { useFonts, Quicksand_400Regular, Quicksand_600SemiBold, Quicksand_700Bold } from '@expo-google-fonts/quicksand';
import { LineChart } from 'react-native-chart-kit';
import { useMascota } from '../Context/MascotaContext';

const screenWidth = Dimensions.get('window').width;

export default function HomeScreen() {
  const { mascota, tema } = useMascota();

  const [fontsLoaded] = useFonts({
    Quicksand_400Regular,
    Quicksand_600SemiBold,
    Quicksand_700Bold,
  });

  if (!fontsLoaded) return null;

  return (
    <ScrollView style={[styles.container, { backgroundColor: tema.suave }]}>

      {/* Header */}
      <View style={[styles.header, { backgroundColor: tema.suave }]}>
        <Text style={[styles.appName, { color: tema.texto }]}>PomoPet</Text>
        <Text style={[styles.appSubtitle, { color: tema.textoSuave }]}>Planner Académico</Text>

        <View style={[styles.mascotaCirculo, { backgroundColor: tema.medio, borderColor: tema.principal }]}>
          <Image
            source={mascota.imagenes.home}
            style={styles.mascotaImagen}
          />
        </View>

        <Text style={[styles.saludo, { color: tema.texto }]}>Hola, Manu!</Text>
        <Text style={[styles.pregunta, { color: tema.textoSuave }]}>¿Lista para concentrarte?</Text>
      </View>

      {/* Stats del día */}
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={[styles.statLabel, { color: tema.textoSuave }]}>Hoy:</Text>
          <Text style={[styles.statValor, { color: tema.texto }]}>2/4 Pomodoros</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={[styles.statLabel, { color: tema.textoSuave }]}>Objetivos:</Text>
          <Text style={[styles.statValor, { color: tema.texto }]}>60% Hecho</Text>
        </View>
      </View>

      {/* Sesiones recientes */}
      <View style={styles.seccion}>
        <Text style={[styles.seccionTitulo, { color: tema.texto }]}>Sesiones de estudio recientes:</Text>
        <View style={styles.etiquetasRow}>
          <View style={[styles.etiqueta, { backgroundColor: '#FFD6A5' }]}>
            <Text style={[styles.etiquetaTexto, { color: tema.texto }]}>Cálculo</Text>
          </View>
          <View style={[styles.etiqueta, { backgroundColor: '#CAFFBF' }]}>
            <Text style={[styles.etiquetaTexto, { color: tema.texto }]}>Historia</Text>
          </View>
          <View style={[styles.etiqueta, { backgroundColor: '#BDE0FE' }]}>
            <Text style={[styles.etiquetaTexto, { color: tema.texto }]}>Arte</Text>
          </View>
        </View>
      </View>

      {/* Gráfico de progreso semanal */}
      <View style={styles.seccion}>
        <Text style={[styles.seccionTitulo, { color: tema.texto }]}>Progreso semanal:</Text>
        <View style={styles.graficoCard}>
          <LineChart
            data={{
              labels: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'],
              datasets: [
                {
                  data: [2, 4, 3, 5, 2, 6, 4],
                  color: () => tema.principal,
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
              color: () => tema.principal,
              labelColor: () => tema.textoSuave,
              style: { borderRadius: 12 },
              propsForDots: {
                r: '5',
                strokeWidth: '2',
                stroke: tema.principal,
                fill: tema.medio,
              },
              propsForBackgroundLines: {
                strokeDasharray: '',
                stroke: tema.medio,
                strokeWidth: 1,
              },
            }}
            bezier
            style={styles.grafico}
            withInnerLines={true}
            withOuterLines={false}
          />
          <Text style={[styles.graficoSubtitulo, { color: tema.textoSuave }]}>
            Pomodoros completados por día
          </Text>
        </View>
      </View>

      <View style={{ height: 40 }} />

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 20,
  },
  appName: {
    fontSize: 45,
    fontFamily: 'Quicksand_700Bold',
  },
  appSubtitle: {
    fontSize: 13,
    fontFamily: 'Quicksand_400Regular',
    marginBottom: 16,
  },
  mascotaCirculo: {
    width: 175,
    height: 175,
    borderRadius: 85,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
    borderWidth: 3,
    overflow: 'hidden',
  },
  mascotaImagen: {
    width: 150,
    height: 150,
    resizeMode: 'contain',
  },
  saludo: {
    fontSize: 22,
    fontFamily: 'Quicksand_700Bold',
  },
  pregunta: {
    fontSize: 14,
    fontFamily: 'Quicksand_400Regular',
    marginTop: 4,
  },
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
    marginBottom: 4,
  },
  statValor: {
    fontSize: 13,
    fontFamily: 'Quicksand_700Bold',
  },
  seccion: {
    paddingHorizontal: 24,
    marginTop: 24,
  },
  seccionTitulo: {
    fontSize: 15,
    fontFamily: 'Quicksand_700Bold',
    marginBottom: 10,
  },
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
  },
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
    marginTop: 6,
  },
});