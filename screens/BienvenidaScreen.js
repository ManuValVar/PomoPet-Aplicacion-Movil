import { useState } from 'react';
import { useMascota } from '../Context/MascotaContext';
import {
  View, Text, StyleSheet, TextInput,
  TouchableOpacity, Image, KeyboardAvoidingView, Platform
} from 'react-native';
import { useFonts, Quicksand_400Regular, Quicksand_600SemiBold, Quicksand_700Bold } from '@expo-google-fonts/quicksand';


export default function BienvenidaScreen({ navigation }) {
  const [nombre, setNombre] = useState('');
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');
  const { iniciarSesion } = useMascota();

  const [fontsLoaded] = useFonts({
    Quicksand_400Regular,
    Quicksand_600SemiBold,
    Quicksand_700Bold,
  });

  if (!fontsLoaded) {
  return (
    <View style={styles.container}>
      <Text style={{ textAlign: 'center', marginTop: 100 }}>
        Cargando fuentes...
      </Text>
    </View>
  );
  }  

  const crearUsuario = async () => {
    if (!nombre.trim()) {
      setError('Por favor escribe tu nombre');
      return;
    }

    setCargando(true);
    setError('');

    try {
        const response = await fetch('http://192.168.1.7:3001/usuarios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre: nombre.trim() }),
      });

        const data = await response.json();

      if (response.ok) {
        // Navegar al home pasando el usuario
        iniciarSesion(data);
        navigation.replace('Main', { usuario: data });
      } else {
        setError(data.error || 'Error al crear el usuario');
      }
    } catch (error) {
      console.error('ERROR COMPLETO:', error);
      setError(`Error: ${error.message}`);

    } finally {
      setCargando(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.contenido}>

        {/* Logo y título */}
        <Text style={styles.titulo}>PomoPet</Text>
        <Text style={styles.subtitulo}>Planner Académico</Text>

        {/* Mascota de bienvenida */}
        <Image
          source={require('../assets/mascotas/Gato_Home.png')}
          style={styles.mascota}
        />

        <Text style={styles.bienvenida}>¡Bienvenida! 🎉</Text>
        <Text style={styles.descripcion}>
          Estudia mejor con tu mascota virtual. ¿Cómo te llamas?
        </Text>

        {/* Input del nombre */}
        <TextInput
          style={styles.input}
          placeholder='Escribe tu nombre...'
          placeholderTextColor='#C4A882'
          value={nombre}
          onChangeText={(text) => {
            setNombre(text);
            setError('');
          }}
          maxLength={30}
          autoFocus
        />

        {/* Error */}
        {error !== '' && (
          <Text style={styles.errorTexto}>{error}</Text>
        )}

        {/* Botón */}
        <TouchableOpacity
          style={[styles.btn, cargando && styles.btnDesactivado]}
          onPress={crearUsuario}
          disabled={cargando}
        >
          <Text style={styles.btnTexto}>
            {cargando ? 'Creando tu perfil...' : '¡Empezar! 🐾'}
          </Text>
        </TouchableOpacity>

      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF8F0',
  },
  contenido: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  titulo: {
    fontFamily: 'Quicksand_700Bold',
    fontSize: 42,
    color: '#5C3D2E',
  },
  subtitulo: {
    fontFamily: 'Quicksand_400Regular',
    fontSize: 14,
    color: '#A07850',
    marginBottom: 24,
  },
  mascota: {
    width: 160,
    height: 160,
    resizeMode: 'contain',
    marginBottom: 24,
  },
  bienvenida: {
    fontFamily: 'Quicksand_700Bold',
    fontSize: 24,
    color: '#5C3D2E',
    marginBottom: 8,
  },
  descripcion: {
    fontFamily: 'Quicksand_400Regular',
    fontSize: 14,
    color: '#A07850',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    fontFamily: 'Quicksand_600SemiBold',
    fontSize: 16,
    color: '#5C3D2E',
    borderWidth: 2,
    borderColor: '#FFD6A5',
    width: '100%',
    marginBottom: 12,
    textAlign: 'center',
  },
  errorTexto: {
    fontFamily: 'Quicksand_400Regular',
    fontSize: 13,
    color: '#FF6B6B',
    marginBottom: 8,
  },
  btn: {
    backgroundColor: '#FF8C69',
    borderRadius: 30,
    paddingHorizontal: 48,
    paddingVertical: 16,
    marginTop: 8,
    shadowColor: '#FF8C69',
    shadowOpacity: 0.4,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
    width: '100%',
    alignItems: 'center',
  },
  btnDesactivado: {
    opacity: 0.6,
  },
  btnTexto: {
    fontFamily: 'Quicksand_700Bold',
    fontSize: 18,
    color: '#fff',
  },
});