import React from 'react';
import { Tabs, useRouter, usePathname } from 'expo-router';
import {
  Pressable,
  View,
  Text,
  Image,
  StyleSheet,
  useWindowDimensions,
  Linking,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/context/auth-context';

export default function AppTabs() {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;

  return (
    <View style={styles.webContainer}>
      {/* On desktop, show Top Navigation Header */}
      {isDesktop && <DesktopWebHeader />}

      {/* Official Expo Router Tabs Navigator */}
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: isDesktop
            ? { display: 'none' }
            : {
                backgroundColor: '#0F0F13',
                borderTopColor: '#202028',
                borderTopWidth: 1,
                height: 62,
                paddingBottom: 8,
                paddingTop: 6,
              },
          tabBarActiveTintColor: '#F5A623',
          tabBarInactiveTintColor: '#71717A',
          tabBarLabelStyle: {
            fontSize: 10,
            fontWeight: '700',
          },
        }}>
        <Tabs.Screen
          name="index"
          options={{
            title: 'Tienda',
            tabBarIcon: ({ color, focused }) => (
              <Ionicons
                name={focused ? 'game-controller' : 'game-controller-outline'}
                size={22}
                color={color}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="explore"
          options={{
            title: 'Mi Perfil',
            tabBarIcon: ({ color, focused }) => (
              <Ionicons
                name={focused ? 'person' : 'person-outline'}
                size={22}
                color={color}
              />
            ),
          }}
        />
      </Tabs>
    </View>
  );
}

// ==========================================
// DESKTOP TOP HEADER (Full E-Commerce Web Bar)
// ==========================================
function DesktopWebHeader() {
  const router = useRouter();
  const pathname = usePathname();
  const { profile, signOut, isGuest, exitGuestMode, session } = useAuth();
  const storeWhatsApp = process.env.EXPO_PUBLIC_WHATSAPP_NUMBER || '59177617306';

  const isHomeActive = pathname === '/' || pathname === '/index' || pathname === '';
  const isExploreActive = pathname === '/explore';

  const handleOpenWhatsApp = () => {
    const msg = encodeURIComponent('¡Hola Gucci Games! 🎮 Necesito atención y asesoría sobre un producto del catálogo.');
    Linking.openURL(`https://wa.me/${storeWhatsApp}?text=${msg}`);
  };

  return (
    <View style={styles.desktopHeaderOuter}>
      <View style={styles.desktopHeaderInner}>
        {/* Left: Brand Identity */}
        <TouchableOpacity
          style={styles.desktopBrandPressable}
          onPress={() => router.push('/')}
          activeOpacity={0.85}>
          <View style={styles.desktopLogoBox}>
            <Image
              source={require('@/assets/images/gucci-logo.png')}
              style={styles.desktopLogoImage}
              resizeMode="cover"
            />
          </View>
          <View style={styles.desktopBrandTextCol}>
            <View style={styles.desktopBrandRow}>
              <Text style={styles.desktopBrandTitle}>GUCCI GAMES</Text>
              <View style={styles.officialBadge}>
                <Text style={styles.officialBadgeText}>OFICIAL</Text>
              </View>
            </View>
            <Text style={styles.desktopBrandSubtitle}>
              TIENDA DE VIDEOJUEGOS & RETRO JAPÓN SCZ
            </Text>
          </View>
        </TouchableOpacity>

        {/* Center: Web Navigation Links */}
        <View style={styles.desktopNavLinks}>
          <TouchableOpacity
            style={[styles.desktopNavLinkBtn, isHomeActive && styles.desktopNavLinkBtnActive]}
            onPress={() => router.push('/')}
            activeOpacity={0.8}>
            <Ionicons
              name={isHomeActive ? 'game-controller' : 'game-controller-outline'}
              size={18}
              color={isHomeActive ? '#000000' : '#A1A1AA'}
            />
            <Text
              style={[
                styles.desktopNavLinkText,
                isHomeActive && styles.desktopNavLinkTextActive,
              ]}>
              Tienda & Catálogo
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.desktopNavLinkBtn, isExploreActive && styles.desktopNavLinkBtnActive]}
            onPress={() => router.push('/explore')}
            activeOpacity={0.8}>
            <Ionicons
              name={isExploreActive ? 'sparkles' : 'sparkles-outline'}
              size={18}
              color={isExploreActive ? '#000000' : '#A1A1AA'}
            />
            <Text
              style={[
                styles.desktopNavLinkText,
                isExploreActive && styles.desktopNavLinkTextActive,
              ]}>
              Club VIP & Beneficios
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.desktopWhatsAppLink}
            onPress={handleOpenWhatsApp}
            activeOpacity={0.75}>
            <Ionicons name="logo-whatsapp" size={17} color="#25D366" />
            <Text style={styles.desktopWhatsAppText}>WhatsApp Directo</Text>
          </TouchableOpacity>
        </View>

        {/* Right: VIP Points & User Account Pill */}
        <View style={styles.desktopUserActions}>
          {/* Gucci Points Live Counter (When logged in) */}
          {session && profile && (
            <View style={styles.desktopPointsPill}>
              <Ionicons name="sparkles" size={14} color="#F5A623" />
              <Text style={styles.desktopPointsNumber}>
                {profile?.gucci_points ?? 0}
              </Text>
              <Text style={styles.desktopPointsLabel}>PUNTOS</Text>
            </View>
          )}

          {/* User Account / Login Button */}
          {isGuest || !session ? (
            <TouchableOpacity
              style={styles.desktopLoginTriggerBtn}
              onPress={exitGuestMode}
              activeOpacity={0.8}>
              <Ionicons name="person-circle" size={18} color="#000000" />
              <Text style={styles.desktopLoginTriggerText}>Iniciar Sesión</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.desktopUserPill}>
              <View style={styles.desktopUserAvatar}>
                <Text style={styles.desktopUserAvatarText}>
                  {(profile?.username || 'GG').slice(0, 2).toUpperCase()}
                </Text>
              </View>
              <View style={styles.desktopUserInfoCol}>
                <Text style={styles.desktopUserName} numberOfLines={1}>
                  {profile?.username || 'Cliente Gucci'}
                </Text>
                <Text style={styles.desktopUserTier}>
                  {profile?.role === 'admin' ? 'Administrador' : 'Miembro VIP'}
                </Text>
              </View>

              {/* Logout Action */}
              <TouchableOpacity
                style={styles.desktopLogoutBtn}
                onPress={signOut}
                accessibilityLabel="Cerrar Sesión"
                activeOpacity={0.7}>
                <Ionicons name="log-out-outline" size={18} color="#A1A1AA" />
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  webContainer: {
    flex: 1,
    backgroundColor: '#0B0B0E',
    minHeight: '100%',
  },

  // Desktop Header Styles
  desktopHeaderOuter: {
    height: 72,
    backgroundColor: '#0E0E12',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(245, 166, 35, 0.2)',
    zIndex: 100,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  desktopHeaderInner: {
    width: '100%',
    maxWidth: 1400,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  desktopBrandPressable: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  desktopLogoBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#F5A623',
    borderWidth: 1.5,
    borderColor: '#F5A623',
    shadowColor: '#F5A623',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
  },
  desktopLogoImage: {
    width: '100%',
    height: '100%',
  },
  desktopBrandTextCol: {
    justifyContent: 'center',
  },
  desktopBrandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  desktopBrandTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  officialBadge: {
    backgroundColor: '#F5A623',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
  },
  officialBadgeText: {
    color: '#000000',
    fontSize: 8.5,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  desktopBrandSubtitle: {
    fontSize: 9.5,
    fontWeight: '700',
    color: '#F5A623',
    letterSpacing: 0.8,
    marginTop: 1,
  },

  // Desktop Navigation
  desktopNavLinks: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#14141A',
    borderRadius: 24,
    padding: 4,
    borderWidth: 1,
    borderColor: '#262632',
    gap: 4,
  },
  desktopNavLinkBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    gap: 8,
  },
  desktopNavLinkBtnActive: {
    backgroundColor: '#F5A623',
  },
  desktopNavLinkText: {
    color: '#A1A1AA',
    fontSize: 13,
    fontWeight: '700',
  },
  desktopNavLinkTextActive: {
    color: '#000000',
    fontWeight: '800',
  },
  desktopWhatsAppLink: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    gap: 6,
    backgroundColor: 'rgba(37, 211, 102, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(37, 211, 102, 0.25)',
  },
  desktopWhatsAppText: {
    color: '#25D366',
    fontSize: 12.5,
    fontWeight: '700',
  },

  // Desktop User Actions
  desktopUserActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  desktopPointsPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(245, 166, 35, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(245, 166, 35, 0.35)',
    borderRadius: 20,
    paddingVertical: 7,
    paddingHorizontal: 14,
    gap: 6,
  },
  desktopPointsNumber: {
    color: '#F5A623',
    fontSize: 14,
    fontWeight: '900',
  },
  desktopPointsLabel: {
    color: '#E4E4E7',
    fontSize: 9.5,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  desktopUserPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#16161D',
    borderRadius: 24,
    paddingVertical: 5,
    paddingLeft: 5,
    paddingRight: 10,
    borderWidth: 1,
    borderColor: '#262632',
    gap: 8,
  },
  desktopUserAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F5A623',
    alignItems: 'center',
    justifyContent: 'center',
  },
  desktopUserAvatarText: {
    color: '#000000',
    fontSize: 12,
    fontWeight: '900',
  },
  desktopUserInfoCol: {
    justifyContent: 'center',
    maxWidth: 110,
  },
  desktopUserName: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  desktopUserTier: {
    color: '#71717A',
    fontSize: 9.5,
    fontWeight: '500',
  },
  desktopLogoutBtn: {
    padding: 6,
    borderRadius: 12,
    backgroundColor: '#202028',
    marginLeft: 4,
  },
  desktopLoginTriggerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5A623',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    gap: 6,
  },
  desktopLoginTriggerText: {
    color: '#000000',
    fontSize: 12.5,
    fontWeight: '800',
  },
});
