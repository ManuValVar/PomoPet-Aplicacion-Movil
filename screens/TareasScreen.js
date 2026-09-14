import { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Modal, TextInput, ActivityIndicator
} from 'react-native';
import { useFonts, Quicksand_400Regular, Quicksand_600SemiBold, Quicksand_700Bold } from '@expo-google-fonts/quicksand';
import { Calendar } from 'react-native-calendars';
import { useMascota } from '../Context/MascotaContext';

const API_URL = 'http://localhost:3001';

const coloresPastel = [
  '#FFD6A5', '#CAFFBF', '#9fc7e9', '#FFC6FF', '#c7f1f7',
  '#FDFFB6', '#FFB5A7', '#D0F4DE', '#E2CFEA',
];

export default function TareasScreen() {
  const { tema, usuario } = useMascota();

  const [vistaActiva, setVistaActiva] = useState('lista');
  const [materias, setMaterias] = useState([]);
  const [materiasAbiertas, setMateriasAbiertas] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [diaSeleccionado, setDiaSeleccionado] = useState('');
  const [cargando, setCargando] = useState(true);

  const [nuevaTarea, setNuevaTarea] = useState('');
  const [materiaSeleccionada, setMateriaSeleccionada] = useState(null);
  const [fechaTarea, setFechaTarea] = useState('');
  const [mostrarCalendario, setMostrarCalendario] = useState(false);

  const [mostrarFormMateria, setMostrarFormMateria] = useState(false);
  const [nombreNuevaMateria, setNombreNuevaMateria] = useState('');
  const [colorSeleccionado, setColorSeleccionado] = useState('#FFD6A5');

  const [fontsLoaded] = useFonts({
    Quicksand_400Regular,
    Quicksand_600SemiBold,
    Quicksand_700Bold,
  });

  // Cargar materias y tareas al entrar
  useEffect(() => {
    if (usuario) cargarMaterias();
  }, [usuario]);

  const cargarMaterias = async () => {
    setCargando(true);
    try {
      // Traer materias del usuario
      const resMaterias = await fetch(`${API_URL}/usuarios/${usuario.id}/materias`);
      const dataMaterias = await resMaterias.json();

      // Por cada materia traer sus tareas
      const materiasConTareas = await Promise.all(
        dataMaterias.map(async (materia) => {
          const resTareas = await fetch(`${API_URL}/materias/${materia.id}/tareas`);
          const dataTareas = await resTareas.json();
          return { ...materia, tareas: dataTareas };
        })
      );

      setMaterias(materiasConTareas);
    } catch (error) {
      console.log('Error al cargar materias:', error);
    } finally {
      setCargando(false);
    }
  };

  if (!fontsLoaded) return null;

  const toggleMateria = (id) => {
    if (materiasAbiertas.includes(id)) {
      setMateriasAbiertas(materiasAbiertas.filter(m => m !== id));
    } else {
      setMateriasAbiertas([...materiasAbiertas, id]);
    }
  };

  const toggleTarea = async (materiaId, tareaId) => {
    // Actualizar localmente primero
    const nuevasMaterias = materias.map(materia => {
      if (materia.id === materiaId) {
        return {
          ...materia,
          tareas: materia.tareas.map(tarea => {
            if (tarea.id === tareaId) {
              return { ...tarea, completada: !tarea.completada };
            }
            return tarea;
          })
        };
      }
      return materia;
    });
    setMaterias(nuevasMaterias);

    // Buscar la tarea actualizada
    const materia = nuevasMaterias.find(m => m.id === materiaId);
    const tarea = materia.tareas.find(t => t.id === tareaId);

    // Guardar en la base de datos
    try {
      await fetch(`${API_URL}/tareas/${tareaId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre: tarea.nombre,
          fecha: tarea.fecha,
          completada: tarea.completada,
        }),
      });
    } catch (error) {
      console.log('Error al actualizar tarea:', error);
    }
  };

  const agregarMateria = async () => {
    if (!nombreNuevaMateria.trim()) return;

    try {
      const response = await fetch(`${API_URL}/materias`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre: nombreNuevaMateria.trim(),
          color: colorSeleccionado,
          usuario_id: usuario.id,
        }),
      });

      const nueva = await response.json();
      setMaterias([...materias, { ...nueva, tareas: [] }]);
      setMateriaSeleccionada(nueva.id);
      setNombreNuevaMateria('');
      setColorSeleccionado('#FFD6A5');
      setMostrarFormMateria(false);
    } catch (error) {
      console.log('Error al agregar materia:', error);
    }
  };

  const agregarTarea = async () => {
    if (!nuevaTarea.trim() || !materiaSeleccionada) return;

    try {
      const response = await fetch(`${API_URL}/tareas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre: nuevaTarea.trim(),
          fecha: fechaTarea || new Date().toISOString().split('T')[0],
          materia_id: materiaSeleccionada,
        }),
      });

      const nuevaTareaData = await response.json();

      setMaterias(materias.map(materia => {
        if (materia.id === materiaSeleccionada) {
          return { ...materia, tareas: [...materia.tareas, nuevaTareaData] };
        }
        return materia;
      }));

      setNuevaTarea('');
      setMateriaSeleccionada(null);
      setFechaTarea('');
      setModalVisible(false);
    } catch (error) {
      console.log('Error al agregar tarea:', error);
    }
  };

  const generarMarcadores = () => {
    const marcadores = {};
    materias.forEach(materia => {
      materia.tareas.forEach(tarea => {
        if (tarea.fecha) {
          if (!marcadores[tarea.fecha]) {
            marcadores[tarea.fecha] = { dots: [] };
          }
          const yaExiste = marcadores[tarea.fecha].dots.find(d => d.key === materia.nombre);
          if (!yaExiste) {
            marcadores[tarea.fecha].dots.push({
              key: materia.nombre,
              color: materia.color === '#FFD6A5' ? '#FF9500' :
                     materia.color === '#CAFFBF' ? '#34C759' :
                     materia.color === '#BDE0FE' ? '#007AFF' :
                     materia.color === '#FFC6FF' ? '#AF52DE' :
                     materia.color === '#FFB5A7' ? '#FF3B30' :
                     materia.color,
              selectedDotColor: '#fff',
            });
          }
        }
      });
    });
    return marcadores;
  };

  const tareasDelDia = () => {
    if (!diaSeleccionado) return [];
    const resultado = [];
    materias.forEach(materia => {
      materia.tareas.forEach(tarea => {
        if (tarea.fecha === diaSeleccionado) {
          resultado.push({ ...tarea, colorMateria: materia.color, nombreMateria: materia.nombre });
        }
      });
    });
    return resultado;
  };

  return (
    <View style={[styles.container, { backgroundColor: tema.suave }]}>

      {/* Header */}
      <View style={[styles.header, { backgroundColor: tema.suave }]}>
        <Text style={[styles.titulo, { color: tema.texto }]}>Mis Tareas</Text>
        <View style={[styles.toggleContainer, { backgroundColor: tema.medio }]}>
          <TouchableOpacity
            style={[styles.toggleBtn, vistaActiva === 'lista' && { backgroundColor: tema.principal }]}
            onPress={() => setVistaActiva('lista')}
          >
            <Text style={[styles.toggleTexto, { color: tema.textoSuave }, vistaActiva === 'lista' && { color: '#fff' }]}>
              Lista
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.toggleBtn, vistaActiva === 'calendario' && { backgroundColor: tema.principal }]}
            onPress={() => setVistaActiva('calendario')}
          >
            <Text style={[styles.toggleTexto, { color: tema.textoSuave }, vistaActiva === 'calendario' && { color: '#fff' }]}>
              Calendario
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Cargando */}
      {cargando ? (
        <View style={styles.cargandoContainer}>
          <ActivityIndicator size="large" color={tema.principal} />
          <Text style={[styles.cargandoTexto, { color: tema.textoSuave }]}>
            Cargando tus tareas...
          </Text>
        </View>
      ) : (
        <>
          {/* Vista Lista */}
          {vistaActiva === 'lista' && (
            <ScrollView style={styles.scroll}>
              {materias.length === 0 ? (
                <View style={styles.vacioContainer}>
                  <Text style={styles.vacioEmoji}>📚</Text>
                  <Text style={[styles.vacioTexto, { color: tema.textoSuave }]}>
                    No tienes materias aún.{'\n'}¡Agrega una con el botón +!
                  </Text>
                </View>
              ) : (
                materias.map(materia => (
                  <View key={materia.id} style={styles.materiaCard}>
                    <TouchableOpacity
                      style={[styles.materiaHeader, { backgroundColor: materia.color }]}
                      onPress={() => toggleMateria(materia.id)}
                    >
                      <Text style={[styles.materiaNombre, { color: tema.texto }]}>{materia.nombre}</Text>
                      <Text style={[styles.materiaFlecha, { color: tema.texto }]}>
                        {materiasAbiertas.includes(materia.id) ? '▲' : '▼'}
                      </Text>
                    </TouchableOpacity>

                    {materiasAbiertas.includes(materia.id) && (
                      <View style={styles.tareasLista}>
                        {materia.tareas.length === 0 ? (
                          <Text style={[styles.sinTareasLista, { color: tema.textoSuave }]}>No hay tareas aún</Text>
                        ) : (
                          materia.tareas.map(tarea => (
                            <TouchableOpacity
                              key={tarea.id}
                              style={styles.tareaItem}
                              onPress={() => toggleTarea(materia.id, tarea.id)}
                            >
                              <View style={[styles.tareaCirculo, tarea.completada && { backgroundColor: materia.color }]}>
                                {tarea.completada && <Text style={[styles.tareaCheck, { color: tema.texto }]}>✓</Text>}
                              </View>
                              <Text style={[styles.tareaNombre, { color: tema.texto }, tarea.completada && styles.tareaCompletada]}>
                                {tarea.nombre}
                              </Text>
                            </TouchableOpacity>
                          ))
                        )}
                      </View>
                    )}
                  </View>
                ))
              )}
              <View style={{ height: 100 }} />
            </ScrollView>
          )}

          {/* Vista Calendario */}
          {vistaActiva === 'calendario' && (
            <ScrollView style={styles.scroll}>
              <Calendar
                markingType='multi-dot'
                markedDates={generarMarcadores()}
                onDayPress={(day) => setDiaSeleccionado(day.dateString)}
                theme={{
                  backgroundColor: tema.suave,
                  calendarBackground: tema.suave,
                  textSectionTitleColor: tema.textoSuave,
                  selectedDayBackgroundColor: tema.principal,
                  selectedDayTextColor: '#fff',
                  todayTextColor: tema.principal,
                  dayTextColor: tema.texto,
                  arrowColor: tema.principal,
                  monthTextColor: tema.texto,
                  textDayFontFamily: 'Quicksand_600SemiBold',
                  textMonthFontFamily: 'Quicksand_700Bold',
                  textDayHeaderFontFamily: 'Quicksand_600SemiBold',
                  dotStyle: {
                    width: 8,
                    height: 8,
                    borderRadius: 4,
                    marginTop: 2,
                  },
                }}
              />

              {diaSeleccionado !== '' && (
                <View style={styles.tareasDelDia}>
                  <Text style={[styles.diaSeleccionadoTexto, { color: tema.texto }]}>
                    Tareas del {diaSeleccionado}
                  </Text>
                  {tareasDelDia().length === 0 ? (
                    <Text style={[styles.sinTareas, { color: tema.textoSuave }]}>No hay tareas este día</Text>
                  ) : (
                    tareasDelDia().map(tarea => (
                      <View key={tarea.id} style={styles.tareaCalendario}>
                        <View style={[styles.tareaCalendarioPunto, { backgroundColor: tarea.colorMateria }]} />
                        <View>
                          <Text style={[styles.tareaCalendarioNombre, { color: tema.texto }]}>{tarea.nombre}</Text>
                          <Text style={[styles.tareaCalendarioMateria, { color: tema.textoSuave }]}>{tarea.nombreMateria}</Text>
                        </View>
                      </View>
                    ))
                  )}
                </View>
              )}
              <View style={{ height: 100 }} />
            </ScrollView>
          )}
        </>
      )}

      {/* Botón + flotante */}
      <TouchableOpacity
        style={[styles.botonAgregar, { backgroundColor: tema.principal, shadowColor: tema.principal }]}
        onPress={() => setModalVisible(true)}
      >
        <Text style={styles.botonAgregarTexto}>+</Text>
      </TouchableOpacity>

      {/* Modal formulario */}
      <Modal
        visible={modalVisible}
        transparent
        animationType='slide'
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <ScrollView>
            <View style={[styles.modalCard, { backgroundColor: tema.suave }]}>

              <Text style={[styles.modalTitulo, { color: tema.texto }]}>Nueva Tarea</Text>

              <Text style={[styles.modalLabel, { color: tema.textoSuave }]}>Nombre de la tarea</Text>
              <TextInput
                style={[styles.modalInput, { color: tema.texto, borderColor: tema.medio }]}
                placeholder='Ej: Resolver problema Punto 45'
                placeholderTextColor={tema.textoSuave}
                value={nuevaTarea}
                onChangeText={setNuevaTarea}
              />

              <Text style={[styles.modalLabel, { color: tema.textoSuave }]}>Materia</Text>
              <View style={styles.materiasSelector}>
                {materias.map(materia => (
                  <TouchableOpacity
                    key={materia.id}
                    style={[
                      styles.materiaOpcion,
                      { backgroundColor: materia.color },
                      materiaSeleccionada === materia.id && { borderWidth: 2, borderColor: tema.texto }
                    ]}
                    onPress={() => setMateriaSeleccionada(materia.id)}
                  >
                    <Text style={[styles.materiaOpcionTexto, { color: tema.texto }]}>{materia.nombre}</Text>
                  </TouchableOpacity>
                ))}

                <TouchableOpacity
                  style={[styles.btnNuevaMateria, { borderColor: tema.principal }]}
                  onPress={() => setMostrarFormMateria(!mostrarFormMateria)}
                >
                  <Text style={[styles.btnNuevaMateriaTexto, { color: tema.principal }]}>+ Nueva materia</Text>
                </TouchableOpacity>
              </View>

              {mostrarFormMateria && (
                <View style={[styles.formNuevaMateria, { borderColor: tema.medio }]}>
                  <TextInput
                    style={[styles.modalInput, { color: tema.texto, borderColor: tema.medio }]}
                    placeholder='Nombre de la materia'
                    placeholderTextColor={tema.textoSuave}
                    value={nombreNuevaMateria}
                    onChangeText={setNombreNuevaMateria}
                  />

                  <Text style={[styles.modalLabel, { color: tema.textoSuave, marginTop: 10 }]}>Color</Text>
                  <View style={styles.coloresSelector}>
                    {coloresPastel.map(color => (
                      <TouchableOpacity
                        key={color}
                        style={[
                          styles.colorCirculo,
                          { backgroundColor: color },
                          colorSeleccionado === color && { borderWidth: 3, borderColor: tema.texto }
                        ]}
                        onPress={() => setColorSeleccionado(color)}
                      />
                    ))}
                  </View>

                  <TouchableOpacity
                    style={[styles.btnGuardarMateria, { backgroundColor: tema.principal }]}
                    onPress={agregarMateria}
                  >
                    <Text style={styles.btnGuardarMateriaTexto}>Guardar materia</Text>
                  </TouchableOpacity>
                </View>
              )}

              <Text style={[styles.modalLabel, { color: tema.textoSuave }]}>Fecha</Text>
              <TouchableOpacity
                style={[styles.fechaSelector, { borderColor: tema.medio }]}
                onPress={() => setMostrarCalendario(!mostrarCalendario)}
              >
                <Text style={[styles.fechaSelectorTexto, { color: fechaTarea ? tema.texto : tema.textoSuave }]}>
                  {fechaTarea ? fechaTarea : 'Seleccionar fecha'}
                </Text>
                <Text style={styles.fechaIcono}>📅</Text>
              </TouchableOpacity>

              {mostrarCalendario && (
                <Calendar
                  onDayPress={(day) => {
                    setFechaTarea(day.dateString);
                    setMostrarCalendario(false);
                  }}
                  markedDates={{
                    [fechaTarea]: {
                      selected: true,
                      selectedColor: tema.principal,
                    }
                  }}
                  minDate={new Date().toISOString().split('T')[0]}
                  theme={{
                    backgroundColor: tema.suave,
                    calendarBackground: tema.suave,
                    textSectionTitleColor: tema.textoSuave,
                    selectedDayBackgroundColor: tema.principal,
                    selectedDayTextColor: '#fff',
                    todayTextColor: tema.principal,
                    dayTextColor: tema.texto,
                    arrowColor: tema.principal,
                    monthTextColor: tema.texto,
                    textDayFontFamily: 'Quicksand_600SemiBold',
                    textMonthFontFamily: 'Quicksand_700Bold',
                    textDayHeaderFontFamily: 'Quicksand_600SemiBold',
                  }}
                />
              )}

              <View style={styles.modalBotones}>
                <TouchableOpacity
                  style={[styles.modalBtnCancelar, { borderColor: tema.medio }]}
                  onPress={() => {
                    setModalVisible(false);
                    setMostrarFormMateria(false);
                    setMostrarCalendario(false);
                  }}
                >
                  <Text style={[styles.modalBtnCancelarTexto, { color: tema.textoSuave }]}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalBtnGuardar, { backgroundColor: tema.principal }]}
                  onPress={agregarTarea}
                >
                  <Text style={styles.modalBtnGuardarTexto}>Guardar</Text>
                </TouchableOpacity>
              </View>

            </View>
          </ScrollView>
        </View>
      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingTop: 60,
    paddingHorizontal: 24,
    paddingBottom: 16,
    alignItems: 'center',
  },
  titulo: {
    fontSize: 24,
    fontFamily: 'Quicksand_700Bold',
    marginBottom: 16,
  },
  toggleContainer: {
    flexDirection: 'row',
    borderRadius: 20,
    padding: 4,
  },
  toggleBtn: {
    paddingHorizontal: 24,
    paddingVertical: 8,
    borderRadius: 16,
  },
  toggleTexto: {
    fontFamily: 'Quicksand_600SemiBold',
    fontSize: 14,
  },
  scroll: {
    flex: 1,
    paddingHorizontal: 24,
  },
  cargandoContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  cargandoTexto: {
    fontFamily: 'Quicksand_400Regular',
    fontSize: 14,
  },
  vacioContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
    gap: 12,
  },
  vacioEmoji: {
    fontSize: 48,
  },
  vacioTexto: {
    fontFamily: 'Quicksand_400Regular',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 22,
  },
  materiaCard: {
    marginBottom: 12,
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: '#fff',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  materiaHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  materiaNombre: {
    fontFamily: 'Quicksand_700Bold',
    fontSize: 15,
  },
  materiaFlecha: { fontSize: 12 },
  tareasLista: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    paddingTop: 8,
  },
  sinTareasLista: {
    fontFamily: 'Quicksand_400Regular',
    fontSize: 13,
    paddingVertical: 8,
  },
  tareaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    gap: 10,
  },
  tareaCirculo: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#C4A882',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tareaCheck: {
    fontSize: 11,
    fontWeight: 'bold',
  },
  tareaNombre: {
    fontFamily: 'Quicksand_400Regular',
    fontSize: 14,
    flex: 1,
  },
  tareaCompletada: {
    textDecorationLine: 'line-through',
    color: '#C4A882',
  },
  tareasDelDia: {
    marginTop: 16,
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  diaSeleccionadoTexto: {
    fontFamily: 'Quicksand_700Bold',
    fontSize: 14,
    marginBottom: 10,
  },
  sinTareas: {
    fontFamily: 'Quicksand_400Regular',
    fontSize: 13,
    textAlign: 'center',
    paddingVertical: 10,
  },
  tareaCalendario: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F0E6D3',
  },
  tareaCalendarioPunto: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  tareaCalendarioNombre: {
    fontFamily: 'Quicksand_600SemiBold',
    fontSize: 13,
  },
  tareaCalendarioMateria: {
    fontFamily: 'Quicksand_400Regular',
    fontSize: 11,
  },
  botonAgregar: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
    shadowOpacity: 0.4,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  botonAgregarTexto: {
    fontSize: 28,
    color: '#fff',
    fontWeight: '300',
    marginTop: -2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 28,
    marginTop: 100,
  },
  modalTitulo: {
    fontFamily: 'Quicksand_700Bold',
    fontSize: 20,
    marginBottom: 20,
    textAlign: 'center',
  },
  modalLabel: {
    fontFamily: 'Quicksand_600SemiBold',
    fontSize: 13,
    marginBottom: 6,
    marginTop: 12,
  },
  modalInput: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 12,
    fontFamily: 'Quicksand_400Regular',
    fontSize: 14,
    borderWidth: 1,
  },
  materiasSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  materiaOpcion: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  materiaOpcionTexto: {
    fontFamily: 'Quicksand_600SemiBold',
    fontSize: 13,
  },
  btnNuevaMateria: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
    borderStyle: 'dashed',
  },
  btnNuevaMateriaTexto: {
    fontFamily: 'Quicksand_600SemiBold',
    fontSize: 13,
  },
  formNuevaMateria: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    marginTop: 12,
    borderWidth: 1,
  },
  coloresSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 4,
  },
  colorCirculo: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  btnGuardarMateria: {
    borderRadius: 10,
    padding: 12,
    alignItems: 'center',
    marginTop: 12,
  },
  btnGuardarMateriaTexto: {
    fontFamily: 'Quicksand_600SemiBold',
    fontSize: 14,
    color: '#fff',
  },
  fechaSelector: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  fechaSelectorTexto: {
    fontFamily: 'Quicksand_400Regular',
    fontSize: 14,
  },
  fechaIcono: { fontSize: 18 },
  modalBotones: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
    marginBottom: 20,
  },
  modalBtnCancelar: {
    flex: 1,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  modalBtnCancelarTexto: {
    fontFamily: 'Quicksand_600SemiBold',
    fontSize: 14,
  },
  modalBtnGuardar: {
    flex: 1,
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  modalBtnGuardarTexto: {
    fontFamily: 'Quicksand_600SemiBold',
    fontSize: 14,
    color: '#fff',
  },
});