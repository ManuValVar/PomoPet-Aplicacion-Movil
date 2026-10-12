import { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MascotaProvider, useMascota } from './Context/MascotaContext';
import AlertPersonalizado from './components/AlertPersonalizado';

import LoginScreen from './screens/LoginScreen';
import RegistroScreen from './screens/RegistroScreen';
import TabNavigator from './navigation/TabNavigator';

const Stack = createStackNavigator();

function AlertesGlobales() {
  const { alertNuevaMascota, setAlertNuevaMascota } = useMascota();

  return (
    <AlertPersonalizado
      visible={alertNuevaMascota.visible}
      titulo="🎉 ¡Nueva mascota desbloqueada!"
      mensaje={`¡Llegaste al nivel ${alertNuevaMascota.nivel}! Ahora tienes a ${alertNuevaMascota.nombre} disponible en tu perfil.`}
      textoConfirmar="¡Qué emoción! 🐾"
      tipo="exito"
      mostrarMascota={false}
      onConfirmar={() => setAlertNuevaMascota({ visible: false, nivel: 0, nombre: '' })}
    />
  );
}

function AppNavigator() {
  const { iniciarSesion, sesionActiva } = useMascota();
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    verificarSesion();
  }, []);

  const verificarSesion = async () => {
    try {
      const usuarioStr = await AsyncStorage.getItem('usuario');
      if (usuarioStr) {
        const usuario = JSON.parse(usuarioStr);
        await iniciarSesion(usuario);
      }
    } catch (error) {
      console.log('Error al verificar sesión:', error);
    } finally {
      setCargando(false);
    }
  };

  if (cargando) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFF8F0' }}>
        <ActivityIndicator size="large" color="#FF8C69" />
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {sesionActiva ? (
        <Stack.Screen name="Main" component={TabNavigator} />
      ) : (
        <>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Registro" component={RegistroScreen} />
        </>
      )}
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <MascotaProvider>
      <NavigationContainer>
        <AppNavigator />
        <AlertesGlobales />
      </NavigationContainer>
    </MascotaProvider>
  );
}
//NavigationContainer envuelve todo — es obligatorio para que la navegación funcione. Adentro va TabNavigator que tiene las 4 pantallas y el navbar.