import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useMascota } from '../Context/MascotaContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import HomeScreen from '../screens/HomeScreen';
import TareasScreen from '../screens/TareasScreen';
import TimerScreen from '../screens/TimerScreen';
import PerfilScreen from '../screens/PerfilScreen';

const Tab = createBottomTabNavigator();

export default function TabNavigator() {
  const { tema } = useMascota();
  const insets = useSafeAreaInsets();

  // Espacio inferior real del celular (barra de botones o gestos).
  // El mínimo de 8 evita que quede pegado cuando el celular no reserva espacio.
  const espacioInferior = Math.max(insets.bottom, 8);

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: tema.suave,
          borderTopColor: tema.medio,
          borderTopWidth: 1,
          height: 60 + espacioInferior,
          paddingBottom: espacioInferior,
          paddingTop: 6,
        },
        tabBarActiveTintColor: tema.principal,
        tabBarInactiveTintColor: tema.textoSuave,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Home') iconName = focused ? 'home' : 'home-outline';
          else if (route.name === 'Tareas') iconName = focused ? 'checkbox' : 'checkbox-outline';
          else if (route.name === 'Timer') iconName = focused ? 'timer' : 'timer-outline';
          else if (route.name === 'Perfil') iconName = focused ? 'person' : 'person-outline';

          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Tareas" component={TareasScreen} />
      <Tab.Screen name="Timer" component={TimerScreen} />
      <Tab.Screen name="Perfil" component={PerfilScreen} />
    </Tab.Navigator>
  );
}