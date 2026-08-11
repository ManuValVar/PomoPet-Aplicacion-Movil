import { NavigationContainer } from '@react-navigation/native';  //Trae el contenedor principal de navegación. Debe envolver toda la app para que la navegación funcione.
import TabNavigator from './navigation/TabNavigator'; //Importa el componente TabNavigator que creamos, que es el que tiene el navbar de pestañas con las diferentes pantallas.

export default function App() {
  return (
    <NavigationContainer>
      <TabNavigator />
    </NavigationContainer>
  );
}
//NavigationContainer envuelve todo — es obligatorio para que la navegación funcione. Adentro va TabNavigator que tiene las 4 pantallas y el navbar.