import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'; //Trae la función que crea el navbar de pestañas en la parte inferior de la pantalla.
import { Ionicons } from '@expo/vector-icons'; //Importa los iconos de Ionicons, que es una biblioteca de iconos populares para aplicaciones móviles.


//Importar cada pantalla que se creó. El ../ significa "sube una carpeta" porque TabNavigator.js está dentro de navigation/ y las pantallas están en screens/.
import HomeScreen from '../screens/HomeScreen';
import TareasScreen from '../screens/TareasScreen';
import TimerScreen from '../screens/TimerScreen';
import PerfilScreen from '../screens/PerfilScreen';

const Tab = createBottomTabNavigator(); //Crea el objeto Tab que tiene todo lo necesario para construir el navbar.

export default function TabNavigator() {
  return (
    <Tab.Navigator  //Es el contenedor del navbar. screenOptions recibe una función que se ejecuta por cada pestaña — route tiene información de qué pestaña es en ese momento.
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#FFF8F0',
          borderTopColor: '#F0E6D3',
          height: 65,
          paddingBottom: 10,
          paddingTop: 5,
        },
        tabBarActiveTintColor: '#FF8C69',
        tabBarInactiveTintColor: '#906C53',
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          //Si la pestaña es Home y está activa (focused), muestra 'home' (ícono sólido). Si no está activa muestra 'home-outline' (ícono con solo el contorno). Igual para las demás pestañas.

          if (route.name === 'Home') iconName = focused ? 'home' : 'home-outline';
          else if (route.name === 'Tareas') iconName = focused ? 'checkbox' : 'checkbox-outline';
          else if (route.name === 'Timer') iconName = focused ? 'timer' : 'timer-outline';
          else if (route.name === 'Perfil') iconName = focused ? 'person' : 'person-outline';

          return <Ionicons name={iconName} size={size} color={color} />; //Dibuja el ícono con el nombre, tamaño y color que determinamos arriba.
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Tareas" component={TareasScreen} />
      <Tab.Screen name="Timer" component={TimerScreen} />
      <Tab.Screen name="Perfil" component={PerfilScreen} />
    </Tab.Navigator>

    //Cada Tab.Screen representa una pestaña. name es el nombre de la pestaña y component es la pantalla que se muestra al seleccionarla.
  );
}