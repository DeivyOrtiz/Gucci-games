import { DarkTheme, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { ActivityIndicator, View } from 'react-native';
import '@/global.css';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import AppTabs from '@/components/app-tabs';
import { AuthProvider, useAuth } from '@/context/auth-context';
import LoginScreen from '@/components/auth/LoginScreen';
import AdminDashboard from '@/components/admin/AdminDashboard';

SplashScreen.preventAutoHideAsync();

function RootNavigator() {
  const { session, loading, isRecoveryMode, profile, isGuest } = useAuth();

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: '#0B0B0E',
          justifyContent: 'center',
          alignItems: 'center',
        }}>
        <ActivityIndicator size="large" color="#F5A623" />
      </View>
    );
  }

  if ((!session && !isGuest) || isRecoveryMode) {
    return <LoginScreen />;
  }

  // Separación estricta por roles:
  // Si es Administrador, entra directamente a su Panel Administrativo (sin tienda ni carrito de cliente)
  if (profile?.role === 'admin') {
    return <AdminDashboard />;
  }

  // Si es Cliente, ve la Tienda oficial y su Perfil con Puntos VIP
  return <AppTabs />;
}

export default function RootLayout() {
  return (
    <ThemeProvider value={DarkTheme}>
      <AuthProvider>
        <AnimatedSplashOverlay />
        <RootNavigator />
      </AuthProvider>
    </ThemeProvider>
  );
}
