import { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Modal, TextInput
} from 'react-native';
import { useFonts, Quicksand_400Regular, Quicksand_600SemiBold, Quicksand_700Bold } from '@expo-google-fonts/quicksand';
import { Calendar } from 'react-native-calendars';

const coloresPastel = [
  '#FFD6A5', '#CAFFBF', '#9fc7e9', '#FFC6FF', '#c7f1f7',
  '#FDFFB6', '#FFB5A7', '#D0F4DE', '#E2CFEA',
];

const materiasIniciales = [
  {
    id: 1,
    nombre: 'Cálculo',
    color: '#FFD6A5',
    tareas: [
      { id: 1, nombre: 'Resolver problema Punto 45', completada: false, fecha: '2026-04-22' },
      { id: 2, nombre: 'Resolver problema Punto 15', completada: true, fecha: '2026-04-22' },
    ]
  },
  {
    id: 2,
    nombre: 'Historia',
    color: '#CAFFBF',
    tareas: [
      { id: 3, nombre: 'Hacer resumen del libro', completada: false, fecha: '2026-04-23' },
      { id: 4, nombre: 'Completar test virtual', completada: false, fecha: '2026-04-24' },
    ]
  },
  {
    id: 3,
    nombre: 'Arte',
    color: '#BDE0FE',
    tareas: [
      { id: 5, nombre: 'Entregar boceto', completada: false, fecha: '2026-04-25' },
    ]
  },
];

export default function TareasScreen() {
  const [vistaActiva, setVistaActiva] = useState('lista');
  const [materias, setMaterias] = useState(materiasIniciales);
  const [materiasAbiertas, setMateriasAbiertas] = useState([1]);
  const [modalVisible, setModalVisible] = useState(false);
  const [diaSeleccionado, setDiaSeleccionado] = useState('');

  // Estados formulario tarea
  const [nuevaTarea, setNuevaTarea] = useState('');
  const [materiaSeleccionada, setMateriaSeleccionada] = useState(null);
  const [fechaTarea, setFechaTarea] = useState('');
  const [mostrarCalendario, setMostrarCalendario] = useState(false);

  // Estados nueva materia
  const [mostrarFormMateria, setMostrarFormMateria] = useState(false);
  const [nombreNuevaMateria, setNombreNuevaMateria] = useState('');
  const [colorSeleccionado, setColorSeleccionado] = useState('#FFD6A5');

  const [fontsLoaded] = useFonts({
    Quicksand_400Regular,
    Quicksand_600SemiBold,
    Quicksand_700Bold,
  });

  if (!fontsLoaded) return null;

  const toggleMateria = (id) => {
    if (materiasAbiertas.includes(id)) {
      setMateriasAbiertas(materiasAbiertas.filter(m => m !== id));
    } else {
      setMateriasAbiertas([...materiasAbiertas, id]);
    }
  };

  const toggleTarea = (materiaId, tareaId) => {
    setMaterias(materias.map(materia => {
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
    }));
  };

  const agregarMateria = () => {
    if (!nombreNuevaMateria.trim()) return;
    const nueva = {
      id: Date.now(),
      nombre: nombreNuevaMateria.trim(),
      color: colorSeleccionado,
      tareas: [],
    };
    setMaterias([...materias, nueva]);
    setNombreNuevaMateria('');
    setColorSeleccionado('#FFD6A5');
    setMostrarFormMateria(false);
    // Seleccionar la nueva materia automáticamente
    setMateriaSeleccionada(nueva.id);
  };

  const agregarTarea = () => {
    if (!nuevaTarea.trim() || !materiaSeleccionada) return;

    setMaterias(materias.map(materia => {
      if (materia.id === materiaSeleccionada) {
        return {
          ...materia,
          tareas: [
            ...materia.tareas,
            {
              id: Date.now(),
              nombre: nuevaTarea.trim(),
              completada: false,
              fecha: fechaTarea || new Date().toISOString().split('T')[0],
            }
          ]
        };
      }
      return materia;
    }));

    setNuevaTarea('');
    setMateriaSeleccionada(null);
    setFechaTarea('');
    setModalVisible(false);
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
              color: materia.color,
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
    <View style={styles.container}>

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.titulo}>Mis Tareas</Text>
        <View style={styles.toggleContainer}>
          <TouchableOpacity
            style={[styles.toggleBtn, vistaActiva === 'lista' && styles.toggleActivo]}
            onPress={() => setVistaActiva('lista')}
          >
            <Text style={[styles.toggleTexto, vistaActiva === 'lista' && styles.toggleTextoActivo]}>
              Lista
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.toggleBtn, vistaActiva === 'calendario' && styles.toggleActivo]}
            onPress={() => setVistaActiva('calendario')}
          >
            <Text style={[styles.toggleTexto, vistaActiva === 'calendario' && styles.toggleTextoActivo]}>
              Calendario
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Vista Lista */}
      {vistaActiva === 'lista' && (
        <ScrollView style={styles.scroll}>
          {materias.map(materia => (
            <View key={materia.id} style={styles.materiaCard}>
              <TouchableOpacity
                style={[styles.materiaHeader, { backgroundColor: materia.color }]}
                onPress={() => toggleMateria(materia.id)}
              >
                <Text style={styles.materiaNombre}>{materia.nombre}</Text>
                <Text style={styles.materiaFlecha}>
                  {materiasAbiertas.includes(materia.id) ? '▲' : '▼'}
                </Text>
              </TouchableOpacity>

              {materiasAbiertas.includes(materia.id) && (
                <View style={styles.tareasLista}>
                  {materia.tareas.length === 0 ? (
                    <Text style={styles.sinTareasLista}>No hay tareas aún</Text>
                  ) : (
                    materia.tareas.map(tarea => (
                      <TouchableOpacity
                        key={tarea.id}
                        style={styles.tareaItem}
                        onPress={() => toggleTarea(materia.id, tarea.id)}
                      >
                        <View style={[styles.tareaCirculo, tarea.completada && { backgroundColor: materia.color }]}>
                          {tarea.completada && <Text style={styles.tareaCheck}>✓</Text>}
                        </View>
                        <Text style={[styles.tareaNombre, tarea.completada && styles.tareaCompletada]}>
                          {tarea.nombre}
                        </Text>
                      </TouchableOpacity>
                    ))
                  )}
                </View>
              )}
            </View>
          ))}
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
              backgroundColor: '#FFF8F0',
              calendarBackground: '#FFF8F0',
              textSectionTitleColor: '#A07850',
              selectedDayBackgroundColor: '#FF8C69',
              selectedDayTextColor: '#fff',
              todayTextColor: '#FF8C69',
              dayTextColor: '#5C3D2E',
              arrowColor: '#FF8C69',
              monthTextColor: '#5C3D2E',
              textDayFontFamily: 'Quicksand_600SemiBold',
              textMonthFontFamily: 'Quicksand_700Bold',
              textDayHeaderFontFamily: 'Quicksand_600SemiBold',
            }}
          />

          {diaSeleccionado !== '' && (
            <View style={styles.tareasDelDia}>
              <Text style={styles.diaSeleccionadoTexto}>
                Tareas del {diaSeleccionado}
              </Text>
              {tareasDelDia().length === 0 ? (
                <Text style={styles.sinTareas}>No hay tareas este día</Text>
              ) : (
                tareasDelDia().map(tarea => (
                  <View key={tarea.id} style={styles.tareaCalendario}>
                    <View style={[styles.tareaCalendarioPunto, { backgroundColor: tarea.colorMateria }]} />
                    <View>
                      <Text style={styles.tareaCalendarioNombre}>{tarea.nombre}</Text>
                      <Text style={styles.tareaCalendarioMateria}>{tarea.nombreMateria}</Text>
                    </View>
                  </View>
                ))
              )}
            </View>
          )}
          <View style={{ height: 100 }} />
        </ScrollView>
      )}

      {/* Botón + flotante */}
      <TouchableOpacity
        style={styles.botonAgregar}
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
            <View style={styles.modalCard}>

              <Text style={styles.modalTitulo}>Nueva Tarea</Text>

              {/* Nombre de la tarea */}
              <Text style={styles.modalLabel}>Nombre de la tarea</Text>
              <TextInput
                style={styles.modalInput}
                placeholder='Ej: Resolver problema Punto 45'
                placeholderTextColor='#C4A882'
                value={nuevaTarea}
                onChangeText={setNuevaTarea}
              />

              {/* Seleccionar materia */}
              <Text style={styles.modalLabel}>Materia</Text>
              <View style={styles.materiasSelector}>
                {materias.map(materia => (
                  <TouchableOpacity
                    key={materia.id}
                    style={[
                      styles.materiaOpcion,
                      { backgroundColor: materia.color },
                      materiaSeleccionada === materia.id && styles.materiaOpcionSeleccionada
                    ]}
                    onPress={() => setMateriaSeleccionada(materia.id)}
                  >
                    <Text style={styles.materiaOpcionTexto}>{materia.nombre}</Text>
                  </TouchableOpacity>
                ))}

                {/* Botón agregar nueva materia */}
                <TouchableOpacity
                  style={styles.btnNuevaMateria}
                  onPress={() => setMostrarFormMateria(!mostrarFormMateria)}
                >
                  <Text style={styles.btnNuevaMateriaTexto}>+ Nueva materia</Text>
                </TouchableOpacity>
              </View>

              {/* Formulario nueva materia */}
              {mostrarFormMateria && (
                <View style={styles.formNuevaMateria}>
                  <TextInput
                    style={styles.modalInput}
                    placeholder='Nombre de la materia'
                    placeholderTextColor='#C4A882'
                    value={nombreNuevaMateria}
                    onChangeText={setNombreNuevaMateria}
                  />

                  <Text style={[styles.modalLabel, { marginTop: 10 }]}>Color</Text>
                  <View style={styles.coloresSelector}>
                    {coloresPastel.map(color => (
                      <TouchableOpacity
                        key={color}
                        style={[
                          styles.colorCirculo,
                          { backgroundColor: color },
                          colorSeleccionado === color && styles.colorSeleccionado
                        ]}
                        onPress={() => setColorSeleccionado(color)}
                      />
                    ))}
                  </View>

                  <TouchableOpacity
                    style={styles.btnGuardarMateria}
                    onPress={agregarMateria}
                  >
                    <Text style={styles.btnGuardarMateriaTexto}>Guardar materia</Text>
                  </TouchableOpacity>
                </View>
              )}

              {/* Fecha */}
              <Text style={styles.modalLabel}>Fecha</Text>
              <TouchableOpacity
                style={styles.fechaSelector}
                onPress={() => setMostrarCalendario(!mostrarCalendario)}
              >
                <Text style={styles.fechaSelectorTexto}>
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
                      selectedColor: '#FF8C69',
                    }
                  }}
                  minDate={new Date().toISOString().split('T')[0]}
                  theme={{
                    backgroundColor: '#FFF8F0',
                    calendarBackground: '#FFF8F0',
                    textSectionTitleColor: '#A07850',
                    selectedDayBackgroundColor: '#FF8C69',
                    selectedDayTextColor: '#fff',
                    todayTextColor: '#FF8C69',
                    dayTextColor: '#5C3D2E',
                    arrowColor: '#FF8C69',
                    monthTextColor: '#5C3D2E',
                    textDayFontFamily: 'Quicksand_600SemiBold',
                    textMonthFontFamily: 'Quicksand_700Bold',
                    textDayHeaderFontFamily: 'Quicksand_600SemiBold',
                  }}
                />
              )}

              {/* Botones */}
              <View style={styles.modalBotones}>
                <TouchableOpacity
                  style={styles.modalBtnCancelar}
                  onPress={() => {
                    setModalVisible(false);
                    setMostrarFormMateria(false);
                    setMostrarCalendario(false);
                  }}
                >
                  <Text style={styles.modalBtnCancelarTexto}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.modalBtnGuardar}
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
  container: {
    flex: 1,
    backgroundColor: '#FFF8F0',
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 24,
    paddingBottom: 16,
    alignItems: 'center',
  },
  titulo: {
    fontSize: 24,
    fontFamily: 'Quicksand_700Bold',
    color: '#5C3D2E',
    marginBottom: 16,
  },
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFE8CC',
    borderRadius: 20,
    padding: 4,
  },
  toggleBtn: {
    paddingHorizontal: 24,
    paddingVertical: 8,
    borderRadius: 16,
  },
  toggleActivo: {
    backgroundColor: '#FF8C69',
  },
  toggleTexto: {
    fontFamily: 'Quicksand_600SemiBold',
    fontSize: 14,
    color: '#A07850',
  },
  toggleTextoActivo: {
    color: '#fff',
  },
  scroll: {
    flex: 1,
    paddingHorizontal: 24,
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
    color: '#5C3D2E',
  },
  materiaFlecha: {
    fontSize: 12,
    color: '#5C3D2E',
  },
  tareasLista: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    paddingTop: 8,
  },
  sinTareasLista: {
    fontFamily: 'Quicksand_400Regular',
    fontSize: 13,
    color: '#C4A882',
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
    color: '#5C3D2E',
    fontWeight: 'bold',
  },
  tareaNombre: {
    fontFamily: 'Quicksand_400Regular',
    fontSize: 14,
    color: '#5C3D2E',
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
    color: '#5C3D2E',
    marginBottom: 10,
  },
  sinTareas: {
    fontFamily: 'Quicksand_400Regular',
    fontSize: 13,
    color: '#C4A882',
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
    color: '#5C3D2E',
  },
  tareaCalendarioMateria: {
    fontFamily: 'Quicksand_400Regular',
    fontSize: 11,
    color: '#A07850',
  },
  botonAgregar: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FF8C69',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
    shadowColor: '#FF8C69',
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
    backgroundColor: '#FFF8F0',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 28,
    marginTop: 100,
  },
  modalTitulo: {
    fontFamily: 'Quicksand_700Bold',
    fontSize: 20,
    color: '#5C3D2E',
    marginBottom: 20,
    textAlign: 'center',
  },
  modalLabel: {
    fontFamily: 'Quicksand_600SemiBold',
    fontSize: 13,
    color: '#A07850',
    marginBottom: 6,
    marginTop: 12,
  },
  modalInput: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 12,
    fontFamily: 'Quicksand_400Regular',
    fontSize: 14,
    color: '#5C3D2E',
    borderWidth: 1,
    borderColor: '#F0E6D3',
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
  materiaOpcionSeleccionada: {
    borderWidth: 2,
    borderColor: '#5C3D2E',
  },
  materiaOpcionTexto: {
    fontFamily: 'Quicksand_600SemiBold',
    fontSize: 13,
    color: '#5C3D2E',
  },

  // Nueva materia
  btnNuevaMateria: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#FF8C69',
    borderStyle: 'dashed',
  },
  btnNuevaMateriaTexto: {
    fontFamily: 'Quicksand_600SemiBold',
    fontSize: 13,
    color: '#FF8C69',
  },
  formNuevaMateria: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#F0E6D3',
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
  colorSeleccionado: {
    borderWidth: 3,
    borderColor: '#5C3D2E',
  },
  btnGuardarMateria: {
    backgroundColor: '#FF8C69',
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

  // Fecha
  fechaSelector: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: '#F0E6D3',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  fechaSelectorTexto: {
    fontFamily: 'Quicksand_400Regular',
    fontSize: 14,
    color: '#5C3D2E',
  },
  fechaIcono: {
    fontSize: 18,
  },
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
    borderColor: '#F0E6D3',
    alignItems: 'center',
  },
  modalBtnCancelarTexto: {
    fontFamily: 'Quicksand_600SemiBold',
    fontSize: 14,
    color: '#A07850',
  },
  modalBtnGuardar: {
    flex: 1,
    padding: 14,
    borderRadius: 12,
    backgroundColor: '#FF8C69',
    alignItems: 'center',
  },
  modalBtnGuardarTexto: {
    fontFamily: 'Quicksand_600SemiBold',
    fontSize: 14,
    color: '#fff',
  },
});