import { useState } from 'react';
import {
  View, Text, StyleSheet, TextInput,
  TouchableOpacity, Image, KeyboardAvoidingView,
  Platform, Alert
} from 'react-native';
import { useFonts, Quicksand_400Regular, Quicksand_600SemiBold, Quicksand_700Bold } from '@expo-google-fonts/quicksand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useMascota } from '../Context/MascotaContext';
import { API_URL } from '../config';


export default function LoginScreen({ navigation }) {
  const { iniciarSesion } = useMascota();
  const [correo, setCorreo] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [cargando, setCargando] = useState(false);
  const [verContrasena, setVerContrasena] = useState(false);

  const [fontsLoaded] = useFonts({
    Quicksand_400Regular,
    Quicksand_600SemiBold,
    Quicksand_700Bold,
  });

  if (!fontsLoaded) return null;

  const handleLogin = async () => {
    if (!correo.trim() || !contrasena.trim()) {
      Alert.alert('⚠️ Campos vacíos', 'Por favor completa todos los campos');
      return;
    }

    setCargando(true);
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ correo: correo.trim(), contrasena }),
      });

      const data = await response.json();

      if (response.ok) {
        // Guardar sesión en AsyncStorage
        await AsyncStorage.setItem('usuario', JSON.stringify(data));
        await iniciarSesion(data);
        navigation.replace('Main');
      } else {
        Alert.alert('❌ Error', data.error || 'Error al iniciar sesión');
      }
    } catch (error) {
      Alert.alert('❌ Error de conexión', 'No se pudo conectar al servidor');
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

        {/* Logo */}
        <Text style={styles.titulo}>PomoPet</Text>
        <Text style={styles.subtitulo}>Planner Académico</Text>

        <Image
          source={require('../assets/mascotas/Gato_Home.png')}
          style={styles.mascota}
        />

        <Text style={styles.bienvenida}>Inicia sesión</Text>

        {/* Correo */}
        <Text style={styles.label}>Correo electrónico</Text>
        <TextInput
          style={styles.input}
          placeholder='correo@ejemplo.com'
          placeholderTextColor='#C4A882'
          value={correo}
          onChangeText={setCorreo}
          keyboardType='email-address'
          autoCapitalize='none'
        />

        {/* Contraseña */}
        <Text style={styles.label}>Contraseña</Text>
        <View style={styles.inputContrasena}>
          <TextInput
            style={styles.inputInner}
            placeholder='Tu contraseña'
            placeholderTextColor='#C4A882'
            value={contrasena}
            onChangeText={setContrasena}
            secureTextEntry={!verContrasena}
          />
          <TouchableOpacity onPress={() => setVerContrasena(!verContrasena)}>
            <Text style={styles.ojito}>{verContrasena ? '🙈' : '👁️'}</Text>
          </TouchableOpacity>
        </View>

        {/* Botón login */}
        <TouchableOpacity
          style={[styles.btn, cargando && styles.btnDesactivado]}
          onPress={handleLogin}
          disabled={cargando}
        >
          <Text style={styles.btnTexto}>
            {cargando ? 'Ingresando...' : 'Ingresar 🐾'}
          </Text>
        </TouchableOpacity>

        {/* Ir a registro */}
        <TouchableOpacity
          style={styles.linkRegistro}
          onPress={() => navigation.navigate('Registro')}
        >
          <Text style={styles.linkTexto}>
            ¿No tienes cuenta? <Text style={styles.linkResaltado}>Regístrate</Text>
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
    marginBottom: 16,
  },
  mascota: {
    width: 120,
    height: 120,
    resizeMode: 'contain',
    marginBottom: 16,
  },
  bienvenida: {
    fontFamily: 'Quicksand_700Bold',
    fontSize: 20,
    color: '#5C3D2E',
    marginBottom: 24,
  },
  label: {
    fontFamily: 'Quicksand_600SemiBold',
    fontSize: 13,
    color: '#A07850',
    alignSelf: 'flex-start',
    marginBottom: 6,
    marginTop: 12,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    fontFamily: 'Quicksand_400Regular',
    fontSize: 15,
    color: '#5C3D2E',
    borderWidth: 2,
    borderColor: '#FFD6A5',
    width: '100%',
  },
  inputContrasena: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#FFD6A5',
    width: '100%',
    paddingRight: 14,
  },
  inputInner: {
    flex: 1,
    padding: 14,
    fontFamily: 'Quicksand_400Regular',
    fontSize: 15,
    color: '#5C3D2E',
  },
  ojito: {
    fontSize: 18,
  },
  btn: {
    backgroundColor: '#FF8C69',
    borderRadius: 30,
    paddingHorizontal: 48,
    paddingVertical: 16,
    marginTop: 24,
    width: '100%',
    alignItems: 'center',
    shadowColor: '#FF8C69',
    shadowOpacity: 0.4,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  btnDesactivado: {
    opacity: 0.6,
  },
  btnTexto: {
    fontFamily: 'Quicksand_700Bold',
    fontSize: 18,
    color: '#fff',
  },
  linkRegistro: {
    marginTop: 20,
  },
  linkTexto: {
    fontFamily: 'Quicksand_400Regular',
    fontSize: 14,
    color: '#A07850',
  },
  linkResaltado: {
    fontFamily: 'Quicksand_700Bold',
    color: '#FF8C69',
  },
});