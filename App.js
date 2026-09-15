import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { MascotaProvider } from './Context/MascotaContext';
import BienvenidaScreen from './screens/BienvenidaScreen';
import TabNavigator from './navigation/TabNavigator';

const Stack = createStackNavigator();

export default function App() {
  console.log('APP SE ESTÁ EJECUTANDO');
  return (
    <MascotaProvider>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Bienvenida" component={BienvenidaScreen} />
          <Stack.Screen name="Main" component={TabNavigator} />
        </Stack.Navigator>
      </NavigationContainer>
    </MascotaProvider>
  );
}
//NavigationContainer envuelve todo — es obligatorio para que la navegación funcione. Adentro va TabNavigator que tiene las 4 pantallas y el navbar.