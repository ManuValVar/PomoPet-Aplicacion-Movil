import { useState } from 'react';
import {
  View, Text, StyleSheet, TextInput,
  TouchableOpacity, Image, KeyboardAvoidingView,
  Platform, Alert, ScrollView
} from 'react-native';
import { useFonts, Quicksand_400Regular, Quicksand_600SemiBold, Quicksand_700Bold } from '@expo-google-fonts/quicksand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useMascota } from '../Context/MascotaContext';
import { API_URL } from '../config';

export default function RegistroScreen({ navigation }) {
  const { iniciarSesion } = useMascota();
  const [nombre, setNombre] = useState('');
  const [correo, setCorreo] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [confirmar, setConfirmar] = useState('');
  const [cargando, setCargando] = useState(false);
  const [verContrasena, setVerContrasena] = useState(false);

  const [fontsLoaded] = useFonts({
    Quicksand_400Regular,
    Quicksand_600SemiBold,
    Quicksand_700Bold,
  });

  if (!fontsLoaded) return null;

  const handleRegistro = async () => {
    if (!nombre.trim() || !correo.trim() || !contrasena.trim() || !confirmar.trim()) {
      Alert.alert('⚠️ Campos vacíos', 'Por favor completa todos los campos');
      return;
    }

    if (contrasena !== confirmar) {
      Alert.alert('⚠️ Error', 'Las contraseñas no coinciden');
      return;
    }

    if (contrasena.length < 6) {
      Alert.alert('⚠️ Error', 'La contraseña debe tener al menos 6 caracteres');
      return;
    }

    setCargando(true);
    try {
      const response = await fetch(`${API_URL}/auth/registro`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre: nombre.trim(),
          correo: correo.trim(),
          contrasena,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        await AsyncStorage.setItem('usuario', JSON.stringify(data));
        await iniciarSesion(data);
        navigation.replace('Main');
      } else {
        Alert.alert('❌ Error', data.error || 'Error al registrarse');
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
      <ScrollView contentContainerStyle={styles.contenido}>

        <Text style={styles.titulo}>PomoPet</Text>
        <Text style={styles.subtitulo}>Crea tu cuenta</Text>

        <Image
          source={require('../assets/mascotas/Gato_Home.png')}
          style={styles.mascota}
        />

        {/* Nombre */}
        <Text style={styles.label}>Nombre</Text>
        <TextInput
          style={styles.input}
          placeholder='¿Cómo te llamas?'
          placeholderTextColor='#C4A882'
          value={nombre}
          onChangeText={setNombre}
        />

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
            placeholder='Mínimo 6 caracteres'
            placeholderTextColor='#C4A882'
            value={contrasena}
            onChangeText={setContrasena}
            secureTextEntry={!verContrasena}
          />
          <TouchableOpacity onPress={() => setVerContrasena(!verContrasena)}>
            <Text style={styles.ojito}>{verContrasena ? '🙈' : '👁️'}</Text>
          </TouchableOpacity>
        </View>

        {/* Confirmar contraseña */}
        <Text style={styles.label}>Confirmar contraseña</Text>
        <TextInput
          style={styles.input}
          placeholder='Repite tu contraseña'
          placeholderTextColor='#C4A882'
          value={confirmar}
          onChangeText={setConfirmar}
          secureTextEntry={!verContrasena}
        />

        {/* Botón registro */}
        <TouchableOpacity
          style={[styles.btn, cargando && styles.btnDesactivado]}
          onPress={handleRegistro}
          disabled={cargando}
        >
          <Text style={styles.btnTexto}>
            {cargando ? 'Creando cuenta...' : '¡Crear cuenta! 🐾'}
          </Text>
        </TouchableOpacity>

        {/* Ir a login */}
        <TouchableOpacity
          style={styles.linkLogin}
          onPress={() => navigation.navigate('Login')}
        >
          <Text style={styles.linkTexto}>
            ¿Ya tienes cuenta? <Text style={styles.linkResaltado}>Inicia sesión</Text>
          </Text>
        </TouchableOpacity>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF8F0',
  },
  contenido: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingVertical: 40,
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
    width: 100,
    height: 100,
    resizeMode: 'contain',
    marginBottom: 16,
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
  linkLogin: {
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