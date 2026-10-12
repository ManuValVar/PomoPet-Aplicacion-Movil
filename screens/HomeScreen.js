import { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, Dimensions, TouchableOpacity } from 'react-native';
import { useFonts, Quicksand_400Regular, Quicksand_600SemiBold, Quicksand_700Bold } from '@expo-google-fonts/quicksand';
import { LineChart } from 'react-native-chart-kit';
import { useMascota } from '../Context/MascotaContext';
import { useFocusEffect } from '@react-navigation/native';

const API_URL = 'http://192.168.1.7:3001';
const screenWidth = Dimensions.get('window').width;

export default function HomeScreen({ navigation }) {
  const { mascota, tema, usuario } = useMascota();

  const [pomodorosHoy, setPomodorosHoy] = useState(0);
  const [pomodorosTotal, setPomodorosTotal] = useState(0);
  const [materiasRecientes, setMateriasRecientes] = useState([]);
  const [progresoSemanal, setProgresoSemanal] = useState([0, 0, 0, 0, 0, 0, 0]);
  const [tareasCompletadas, setTareasCompletadas] = useState(0);
  const [tareasTotal, setTareasTotal] = useState(0);
  const [tareasHoy, setTareasHoy] = useState(0);

  const [fontsLoaded] = useFonts({
    Quicksand_400Regular,
    Quicksand_600SemiBold,
    Quicksand_700Bold,
  });

  useFocusEffect(
    useCallback(() => {
      if (usuario) cargarDatos();
    }, [usuario])
  );

  const cargarDatos = async () => {
    try {
      const resPomodoros = await fetch(`${API_URL}/usuarios/${usuario.id}/pomodoros`);
      const dataPomodoros = await resPomodoros.json();
      setPomodorosTotal(dataPomodoros.total);

      const resHoy = await fetch(`${API_URL}/usuarios/${usuario.id}/pomodoros/hoy`);
      const dataHoy = await resHoy.json();
      setPomodorosHoy(dataHoy.total);

      const resSemanal = await fetch(`${API_URL}/usuarios/${usuario.id}/pomodoros/semanal`);
      const dataSemanal = await resSemanal.json();
      setProgresoSemanal(dataSemanal);

      const resMaterias = await fetch(`${API_URL}/usuarios/${usuario.id}/materias`);
      const dataMaterias = await resMaterias.json();
      setMateriasRecientes(dataMaterias.slice(0, 3));

      const resTareas = await fetch(`${API_URL}/usuarios/${usuario.id}/tareas/stats`);
      const dataTareas = await resTareas.json();
      setTareasCompletadas(dataTareas.completadas);
      setTareasTotal(dataTareas.total);

      const resTareasHoy = await fetch(`${API_URL}/usuarios/${usuario.id}/tareas/hoy`);
      const dataTareasHoy = await resTareasHoy.json();
      setTareasHoy(Number(dataTareasHoy.completadas) || 0);

    } catch (error) {
      console.log('Error al cargar datos del home:', error);
    }
  };

  if (!fontsLoaded) return null;

  const porcentajeObjetivos = tareasTotal > 0
    ? Math.round((tareasCompletadas / tareasTotal) * 100)
    : 0;

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

        <Text style={[styles.saludo, { color: tema.texto }]}>
          Hola, {usuario?.nombre || 'estudiante'}!
        </Text>
        <Text style={[styles.pregunta, { color: tema.textoSuave }]}>
          ¿List@ para concentrarte?
        </Text>
      </View>

      {/* Stats del día */}
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={[styles.statLabel, { color: tema.textoSuave }]}>Hoy:</Text>
          <Text style={[styles.statValor, { color: tema.texto }]}>
            {pomodorosHoy} Pomodoros
          </Text>
        </View>
        <View style={styles.statCard}>
          <Text style={[styles.statLabel, { color: tema.textoSuave }]}>Tareas Completadas:</Text>
          <Text style={[styles.statValor, { color: tema.texto }]}>
            {tareasCompletadas} ✓
          </Text>
        </View>
        
      </View>

      {/* Sesiones recientes */}
      {materiasRecientes.length > 0 && (
        <View style={styles.seccion}>
          <Text style={[styles.seccionTitulo, { color: tema.texto }]}>
            Sesiones de estudio recientes:
          </Text>
          <View style={styles.etiquetasRow}>
            {materiasRecientes.map(materia => (
              <TouchableOpacity
                key={materia.id}
                style={[styles.etiqueta, { backgroundColor: materia.color }]}
                onPress={() => navigation.navigate('Tareas', { materiaId: materia.id })}
              >
                <Text style={[styles.etiquetaTexto, { color: tema.texto }]}>{materia.nombre}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {/* Gráfico de progreso semanal */}
      <View style={styles.seccion}>
        <Text style={[styles.seccionTitulo, { color: tema.texto }]}>Progreso semanal:</Text>
        <View style={styles.graficoCard}>
          {progresoSemanal && progresoSemanal.length === 7 && (
            <LineChart
              data={{
                labels: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'],
                datasets: [
                  {
                    data: progresoSemanal.every(v => v === 0) 
                      ? [0, 0, 0, 0, 0, 0, 0.00000] // ← evita que todos sean 0
                      : progresoSemanal,
                    color: () => tema.principal,
                    strokeWidth: 2,
                  },
                ],
              }}
              width={screenWidth - 80}
              height={180}
              segments={4}
              fromZero={true}
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
              yAxisInterval={1}
            />
          )}
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
  container: { flex: 1 },
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
    width: 140,
    height: 140,
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
  grafico: { borderRadius: 12 },
  graficoSubtitulo: {
    fontSize: 11,
    fontFamily: 'Quicksand_400Regular',
    marginTop: 6,
  },
});