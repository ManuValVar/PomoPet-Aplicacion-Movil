import { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image} from 'react-native';
import { useFonts, Quicksand_400Regular, Quicksand_600SemiBold, Quicksand_700Bold } from '@expo-google-fonts/quicksand';
import { useMascota, mascotasData } from '../Context/MascotaContext';
import { useFocusEffect } from '@react-navigation/native';
import AlertPersonalizado from '../components/AlertPersonalizado';
import { API_URL } from '../config';


export default function PerfilScreen() {
  const {
    mascotaActual, tema, nivelUsuario,
    pomodorosCompletados, seleccionarMascota,
    mascotasDesbloqueadas, usuario, cerrarSesion
  } = useMascota();

  const [tareasHechas, setTareasHechas] = useState(0);
  const [pomodorosReales, setPomodorosReales] = useState(0);
  const [alertCerrarSesion, setAlertCerrarSesion] = useState(false);

  const [fontsLoaded] = useFonts({
    Quicksand_400Regular,
    Quicksand_600SemiBold,
    Quicksand_700Bold,
  });

  useFocusEffect(
    useCallback(() => {
      if (usuario) cargarStats();
    }, [usuario])
  );

  const cargarStats = async () => {
    try {
      // Tareas completadas
      const resTareas = await fetch(`${API_URL}/usuarios/${usuario.id}/tareas/stats`);
      const dataTareas = await resTareas.json();
      setTareasHechas(Number(dataTareas.completadas) || 0);

      // Pomodoros reales — solo para mostrar, NO actualiza el contexto
      const resPomodoros = await fetch(`${API_URL}/usuarios/${usuario.id}/pomodoros`);
      const dataPomodoros = await resPomodoros.json();
      setPomodorosReales(Number(dataPomodoros.total) || 0);

    } catch (error) {
      console.log('Error al cargar stats:', error);
    }
  };

  if (!fontsLoaded) return null;

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: tema.suave }]}
      contentContainerStyle={{ paddingBottom: 40 }}
    >

      {/* Header */}
      <View style={[styles.header, { backgroundColor: tema.suave }]}>
        <Text style={[styles.titulo, { color: tema.texto }]}>Mi Perfil</Text>

        <View style={[styles.mascotaCirculoGrande, { backgroundColor: tema.medio, borderColor: tema.principal }]}>
          <Image
            source={mascotasData[mascotaActual].imagenes.home}
            style={styles.mascotaImagenGrande}
          />
        </View>

        <Text style={[styles.mascotaNombreActual, { color: tema.texto }]}>
          {mascotaActual}
        </Text>
        <Text style={[styles.nivelTexto, { color: tema.textoSuave }]}>
          Nivel {nivelUsuario}
        </Text>
      </View>

      {/* Estadísticas */}
      <View style={styles.seccion}>
        <Text style={[styles.seccionTitulo, { color: tema.texto }]}>Estadísticas totales</Text>
        <View style={styles.statsGrid}>

          <View style={[styles.statCard, { backgroundColor: '#fff' }]}>
            <Text style={[styles.statNumero, { color: tema.principal }]}>
              {pomodorosReales}
            </Text>
            <Text style={[styles.statLabel, { color: tema.textoSuave }]}>Pomodoros</Text>
          </View>

          <View style={[styles.statCard, { backgroundColor: '#fff' }]}>
            <Text style={[styles.statNumero, { color: tema.principal }]}>
              {Math.floor(pomodorosReales * 25 / 60)}h
            </Text>
            <Text style={[styles.statLabel, { color: tema.textoSuave }]}>Total estudio</Text>
          </View>

          <View style={[styles.statCard, { backgroundColor: '#fff' }]}>
            <Text style={[styles.statNumero, { color: tema.principal }]}>
              {mascotasDesbloqueadas.length}
            </Text>
            <Text style={[styles.statLabel, { color: tema.textoSuave }]}>Mascotas</Text>
          </View>

          <View style={[styles.statCard, { backgroundColor: '#fff' }]}>
            <Text style={[styles.statNumero, { color: tema.principal }]}>
              {tareasHechas}
            </Text>
            <Text style={[styles.statLabel, { color: tema.textoSuave }]}>Tareas hechas</Text>
          </View>

        </View>
      </View>

      {/* Mis mascotas */}
      <View style={styles.seccion}>
        <Text style={[styles.seccionTitulo, { color: tema.texto }]}>Mis mascotas</Text>
        <View style={styles.mascotasGrid}>
          {Object.keys(mascotasData).map(nombreMascota => {
            const mascota = mascotasData[nombreMascota];
            const desbloqueada = mascotasDesbloqueadas.includes(nombreMascota);
            const seleccionada = mascotaActual === nombreMascota;

            return (
              <TouchableOpacity
                key={nombreMascota}
                style={[
                  styles.mascotaCard,
                  seleccionada && { borderColor: tema.principal, borderWidth: 3 },
                  !desbloqueada && styles.mascotaCardBloqueada,
                ]}
                onPress={() => seleccionarMascota(nombreMascota)}
                disabled={!desbloqueada}
              >
                <View style={styles.mascotaImagenContainer}>
                  <Image
                    source={mascota.imagenes.home}
                    style={[styles.mascotaImagen, !desbloqueada && styles.mascotaImagenBloqueada]}
                  />
                  {!desbloqueada && (
                    <View style={styles.candadoContainer}>
                      <Text style={styles.candado}>🔒</Text>
                    </View>
                  )}
                  {seleccionada && (
                    <View style={[styles.checkContainer, { backgroundColor: tema.principal }]}>
                      <Text style={styles.check}>✓</Text>
                    </View>
                  )}
                </View>

                <Text style={[
                  styles.mascotaCardNombre,
                  { color: desbloqueada ? tema.texto : '#C4A882' }
                ]}>
                  {nombreMascota}
                </Text>

                <Text style={[
                  styles.mascotaCardNivel,
                  { color: desbloqueada ? tema.principal : '#C4A882' }
                ]}>
                  {desbloqueada
                    ? seleccionada ? 'Seleccionada' : 'Disponible'
                    : `Nivel ${mascota.nivelRequerido}`}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Progreso al siguiente nivel */}
      <View style={styles.seccion}>
        <Text style={[styles.seccionTitulo, { color: tema.texto }]}>Progreso al siguiente nivel</Text>
        <View style={[styles.progresoCard, { backgroundColor: '#fff' }]}>
          <View style={styles.progresoInfo}>
            <Text style={[styles.progresoTexto, { color: tema.textoSuave }]}>
              Nivel {nivelUsuario} → Nivel {nivelUsuario + 1}
            </Text>
            <Text style={[styles.progresoNumero, { color: tema.principal }]}>
              {pomodorosCompletados % 5}/5 Pomodoros
            </Text>
          </View>
          <View style={[styles.progresoBarra, { backgroundColor: tema.suave }]}>
            <View style={[
              styles.progresoRelleno,
              {
                backgroundColor: tema.principal,
                width: `${(pomodorosCompletados % 5) * 20}%`,
              }
            ]} />
          </View>
        </View>
      </View>

      {/* Cerrar sesión */}
      <View style={[styles.seccion, { marginBottom: 40, marginTop: 24 }]}>
        <TouchableOpacity
          style={[styles.btnCerrarSesion, { borderColor: tema.principal }]}
          onPress={() => setAlertCerrarSesion(true)}
        >
          <Text style={[styles.btnCerrarSesionTexto, { color: tema.principal }]}>
            Cerrar sesión
          </Text>
      </TouchableOpacity>
          
        
      </View>

      <AlertPersonalizado
        visible={alertCerrarSesion}
        titulo="¿Cerrar sesión?"
        mensaje="¿Estás segura de que quieres salir de PomoPet?"
        textoCancelar="Quedarse"
        textoConfirmar="Cerrar sesión"
        tipo="peligro"
        mostrarMascota={true}
        onCancelar={() => setAlertCerrarSesion(false)}
        onConfirmar={() => {
          setAlertCerrarSesion(false);
          cerrarSesion();
        }}
    />
  


    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 24,
  },
  titulo: {
    fontFamily: 'Quicksand_700Bold',
    fontSize: 26,
    marginBottom: 20,
  },
  mascotaCirculoGrande: {
    width: 130,
    height: 130,
    borderRadius: 65,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    overflow: 'hidden',
    marginBottom: 12,
  },
  mascotaImagenGrande: {
    width: 100,
    height: 100,
    resizeMode: 'contain',
  },
  mascotaNombreActual: {
    fontFamily: 'Quicksand_700Bold',
    fontSize: 20,
  },
  nivelTexto: {
    fontFamily: 'Quicksand_400Regular',
    fontSize: 14,
    marginTop: 4,
  },
  seccion: {
    paddingHorizontal: 24,
    marginTop: 24,
  },
  seccionTitulo: {
    fontFamily: 'Quicksand_700Bold',
    fontSize: 16,
    marginBottom: 12,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    width: '47%',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  statNumero: {
    fontFamily: 'Quicksand_700Bold',
    fontSize: 28,
  },
  statLabel: {
    fontFamily: 'Quicksand_400Regular',
    fontSize: 12,
    marginTop: 4,
  },
  mascotasGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  mascotaCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 12,
    alignItems: 'center',
    width: '47%',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  mascotaCardBloqueada: { opacity: 0.6 },
  mascotaImagenContainer: {
    position: 'relative',
    width: 80,
    height: 80,
    marginBottom: 8,
  },
  mascotaImagen: {
    width: 80,
    height: 80,
    resizeMode: 'contain',
  },
  mascotaImagenBloqueada: { opacity: 0.4 },
  candadoContainer: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 2,
  },
  candado: { fontSize: 18 },
  checkContainer: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  check: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  mascotaCardNombre: {
    fontFamily: 'Quicksand_700Bold',
    fontSize: 14,
  },
  mascotaCardNivel: {
    fontFamily: 'Quicksand_400Regular',
    fontSize: 11,
    marginTop: 2,
  },
  progresoCard: {
    borderRadius: 14,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  progresoInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  progresoTexto: {
    fontFamily: 'Quicksand_400Regular',
    fontSize: 13,
  },
  progresoNumero: {
    fontFamily: 'Quicksand_700Bold',
    fontSize: 13,
  },
  progresoBarra: {
    height: 10,
    borderRadius: 5,
    overflow: 'hidden',
  },
  progresoRelleno: {
    height: 10,
    borderRadius: 5,
  },
  btnCerrarSesion: {
    borderWidth: 1.5,
    borderRadius: 30,
    padding: 14,
    alignItems: 'center',
  },
  btnCerrarSesionTexto: {
    fontFamily: 'Quicksand_600SemiBold',
    fontSize: 15,
  },
});