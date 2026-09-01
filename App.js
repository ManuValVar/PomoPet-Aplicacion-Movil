import { NavigationContainer } from '@react-navigation/native';
import TabNavigator from './navigation/TabNavigator';
import { MascotaProvider } from './Context/MascotaContext';

export default function App() {
  return (
    <MascotaProvider>
      <NavigationContainer>
        <TabNavigator />
      </NavigationContainer>
    </MascotaProvider>
  );
}
//NavigationContainer envuelve todo — es obligatorio para que la navegación funcione. Adentro va TabNavigator que tiene las 4 pantallas y el navbar.