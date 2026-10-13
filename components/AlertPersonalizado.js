import { Modal, View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { useMascota, mascotasData } from '../Context/MascotaContext';
import { useFonts, Quicksand_400Regular, Quicksand_600SemiBold, Quicksand_700Bold } from '@expo-google-fonts/quicksand';

export default function AlertPersonalizado({
  visible,
  titulo,
  mensaje,
  textoCancelar = 'Cancelar',
  textoConfirmar = 'Confirmar',
  onCancelar,
  onConfirmar,
  tipo = 'normal', // 'normal', 'peligro', 'exito'
  mostrarMascota = false,
}) {
  const { tema, mascotaActual } = useMascota();

  const [fontsLoaded] = useFonts({
    Quicksand_400Regular,
    Quicksand_600SemiBold,
    Quicksand_700Bold,
  });

  if (!fontsLoaded || !visible) return null;

  const colorConfirmar =
    tipo === 'peligro' ? '#FF4444' :
    tipo === 'exito' ? '#34C759' :
    tema.principal;

  return (
    <Modal
      visible={visible}
      transparent
      animationType='fade'
      onRequestClose={onCancelar}
    >
      <View style={styles.overlay}>
        <View style={[styles.card, { backgroundColor: tema.suave }]}>

          {/* Mascota opcional */}
          {mostrarMascota && (
            <Image
              source={mascotasData[mascotaActual].imagenes.home}
              style={styles.mascota}
            />
          )}

          {/* Título */}
          <Text style={[styles.titulo, { color: tema.texto }]}>
            {titulo}
          </Text>

          {/* Mensaje */}
          {mensaje && (
            <Text style={[styles.mensaje, { color: tema.textoSuave }]}>
              {mensaje}
            </Text>
          )}

          {/* Botones */}
          <View style={styles.botones}>

            {/* Cancelar — solo si hay función */}
            {onCancelar && (
                <TouchableOpacity
                style={[styles.btnCancelar, { borderColor: tema.medio }]}
                onPress={onCancelar}
                >
                <Text
                    style={[styles.btnCancelarTexto, { color: tema.textoSuave }]}
                    numberOfLines={1}
                    adjustsFontSizeToFit
                >
                    {textoCancelar}
                </Text>
                </TouchableOpacity>
            )}
            

            {/* Confirmar */}
            <TouchableOpacity
                style={[
                    styles.btnConfirmar,
                    { backgroundColor: colorConfirmar },
                    !onCancelar && { flex: 1 }
                    ]}
                onPress={onConfirmar}
                >
                <Text
                    style={styles.btnConfirmarTexto}
                    numberOfLines={1}
                    adjustsFontSizeToFit
                    >
                    {textoConfirmar}
                </Text>
            </TouchableOpacity>
            

          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  card: {
    width: '100%',
    borderRadius: 24,
    padding: 28,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10,
  },
  mascota: {
    width: 80,
    height: 80,
    resizeMode: 'contain',
    marginBottom: 12,
  },
  titulo: {
    fontFamily: 'Quicksand_700Bold',
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 8,
  },
  mensaje: {
    fontFamily: 'Quicksand_400Regular',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  botones: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  btnCancelar: {
    flex: 1,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1.5,
    alignItems: 'center',
  },
  btnCancelarTexto: {
    fontFamily: 'Quicksand_600SemiBold',
    fontSize: 13,
  },
  btnConfirmar: {
    flex: 1,
    padding: 14,
    borderRadius: 14,
    alignItems: 'center',
  },
  btnConfirmarTexto: {
    fontFamily: 'Quicksand_700Bold',
    fontSize: 13,
    color: '#fff',
  },
});