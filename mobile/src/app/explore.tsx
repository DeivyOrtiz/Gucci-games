import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Linking,
  Platform,
  useWindowDimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/context/auth-context';
import AdminDashboard from '@/components/admin/AdminDashboard';

export default function ExploreScreen() {
  const { profile, signOut } = useAuth();
  const isAdmin = profile?.role === 'admin';
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;

  // If user is Admin, render the full interactive Admin Dashboard
  if (isAdmin) {
    return <AdminDashboard />;
  }

  // Client VIP Club & Points benefits screen
  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[
        styles.content,
        isDesktop && styles.contentDesktop,
      ]}>
      <View style={[styles.mainWrapper, isDesktop && styles.mainWrapperDesktop]}>
        
        {/* Header Profile Card */}
        <View style={[styles.profileCard, isDesktop && styles.profileCardDesktop]}>
          <View style={styles.profileLeftBlock}>
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarText}>
                {(profile?.username || 'GG').slice(0, 2).toUpperCase()}
              </Text>
            </View>
            <View style={styles.profileTextCol}>
              <View style={styles.vipBadgeRow}>
                <Text style={styles.username}>{profile?.username || 'Cliente Gucci'}</Text>
                <View style={styles.vipStatusBadge}>
                  <Ionicons name="sparkles" size={11} color="#000000" />
                  <Text style={styles.vipStatusBadgeText}>MIEMBRO VIP</Text>
                </View>
              </View>
              <Text style={styles.email}>{profile?.email || 'Miembro de Gucci Games Santa Cruz'}</Text>
              <Text style={styles.memberSince}>
                Cliente verificado • Acumulando recompensas en cada compra
              </Text>
            </View>
          </View>

          {/* Gucci Points Box */}
          <View style={[styles.pointsBadgeBox, isDesktop && styles.pointsBadgeBoxDesktop]}>
            <Ionicons name="sparkles" size={20} color="#F5A623" />
            <View>
              <Text style={styles.pointsBadgeNumber}>
                {profile?.gucci_points || 0}
              </Text>
              <Text style={styles.pointsBadgeLabel}>PUNTOS GUCCI ACUMULADOS</Text>
            </View>
          </View>
        </View>

        {/* VIP Club Benefits */}
        <View style={styles.benefitsSection}>
          <View style={styles.benefitsHeaderRow}>
            <View style={styles.indicatorBar} />
            <Text style={styles.sectionTitle}>Beneficios Exclusivos Club Gucci Games</Text>
          </View>
          
          <View style={[styles.benefitsGrid, isDesktop && styles.benefitsGridDesktop]}>
            {/* Benefit 1 */}
            <View style={[styles.benefitCard, isDesktop && styles.benefitCardDesktop]}>
              <View style={styles.benefitIconBox}>
                <Ionicons name="gift" size={24} color="#F5A623" />
              </View>
              <View style={styles.benefitInfo}>
                <Text style={styles.benefitTitle}>Puntos por Cada Compra</Text>
                <Text style={styles.benefitDesc}>
                  Cada videojuego o accesorio te suma puntos canjeables por saldo en efectivo o juegos retro japoneses.
                </Text>
              </View>
            </View>

            {/* Benefit 2 */}
            <View style={[styles.benefitCard, isDesktop && styles.benefitCardDesktop]}>
              <View style={[styles.benefitIconBox, { backgroundColor: 'rgba(56, 189, 248, 0.15)' }]}>
                <Ionicons name="swap-horizontal" size={24} color="#38BDF8" />
              </View>
              <View style={styles.benefitInfo}>
                <Text style={styles.benefitTitle}>Canjes MJU • Mi Juego Usado</Text>
                <Text style={styles.benefitDesc}>
                  Trae tus títulos usados originales y canjéalos de inmediato como parte de pago para estrenar nuevos lanzamientos.
                </Text>
              </View>
            </View>

            {/* Benefit 3 */}
            <View style={[styles.benefitCard, isDesktop && styles.benefitCardDesktop]}>
              <View style={[styles.benefitIconBox, { backgroundColor: 'rgba(52, 211, 153, 0.15)' }]}>
                <Ionicons name="shield-checkmark" size={24} color="#34D399" />
              </View>
              <View style={styles.benefitInfo}>
                <Text style={styles.benefitTitle}>Garantía 100% Original</Text>
                <Text style={styles.benefitDesc}>
                  Todos los cartuchos, discos y consolas importados cuentan con garantía técnica y autenticidad comprobada.
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Direct WhatsApp Support */}
        <View style={styles.supportContainer}>
          <TouchableOpacity
            style={styles.whatsappButton}
            onPress={() => {
              const msg = encodeURIComponent(
                `¡Hola Gucci Games! 🎮 Soy ${profile?.username || 'un cliente'} y quiero consultar sobre mis puntos o canjes.`
              );
              const storeWhatsApp = process.env.EXPO_PUBLIC_WHATSAPP_NUMBER || '59177617306';
              Linking.openURL(`https://wa.me/${storeWhatsApp}?text=${msg}`);
            }}
            activeOpacity={0.88}>
            <Ionicons name="logo-whatsapp" size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
            <Text style={styles.whatsappButtonText}>Atención al Cliente por WhatsApp</Text>
          </TouchableOpacity>

          {/* Logout Button */}
          <TouchableOpacity style={styles.logoutButton} onPress={signOut} activeOpacity={0.8}>
            <Ionicons name="log-out-outline" size={18} color="#EF4444" style={{ marginRight: 6 }} />
            <Text style={styles.logoutButtonText}>Cerrar Sesión de la Cuenta</Text>
          </TouchableOpacity>
        </View>

      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B0B0E',
  },
  content: {
    padding: 16,
    paddingTop: Platform.OS === 'ios' ? 50 : 24,
    alignItems: 'center',
  },
  contentDesktop: {
    paddingTop: 36,
    paddingBottom: 60,
  },
  mainWrapper: {
    width: '100%',
  },
  mainWrapperDesktop: {
    maxWidth: 1100,
  },
  profileCard: {
    width: '100%',
    backgroundColor: '#121217',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#242430',
    marginBottom: 24,
  },
  profileCardDesktop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 32,
  },
  profileLeftBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
  },
  avatarCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#1A1A22',
    borderWidth: 2.5,
    borderColor: '#F5A623',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#F5A623',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  avatarText: {
    color: '#F5A623',
    fontSize: 24,
    fontWeight: '900',
  },
  profileTextCol: {
    justifyContent: 'center',
  },
  vipBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  username: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  vipStatusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5A623',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    gap: 4,
  },
  vipStatusBadgeText: {
    color: '#000000',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  email: {
    color: '#A1A1AA',
    fontSize: 13,
    marginTop: 4,
  },
  memberSince: {
    color: '#71717A',
    fontSize: 11,
    marginTop: 4,
  },
  pointsBadgeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(245, 166, 35, 0.12)',
    borderWidth: 1.5,
    borderColor: 'rgba(245, 166, 35, 0.35)',
    paddingVertical: 14,
    paddingHorizontal: 22,
    borderRadius: 20,
    marginTop: 18,
    gap: 14,
  },
  pointsBadgeBoxDesktop: {
    marginTop: 0,
  },
  pointsBadgeNumber: {
    color: '#F5A623',
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  pointsBadgeLabel: {
    color: '#D4D4D8',
    fontSize: 9.5,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  benefitsSection: {
    width: '100%',
    marginBottom: 28,
  },
  benefitsHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  indicatorBar: {
    width: 4,
    height: 18,
    borderRadius: 2,
    backgroundColor: '#F5A623',
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  benefitsGrid: {
    width: '100%',
    gap: 12,
  },
  benefitsGridDesktop: {
    flexDirection: 'row',
    gap: 16,
  },
  benefitCard: {
    flexDirection: 'row',
    backgroundColor: '#14141A',
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: '#242430',
    alignItems: 'center',
  },
  benefitCardDesktop: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'flex-start',
    padding: 24,
  },
  benefitIconBox: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: 'rgba(245, 166, 35, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    marginBottom: 12,
  },
  benefitInfo: {
    flex: 1,
  },
  benefitTitle: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 6,
  },
  benefitDesc: {
    color: '#A1A1AA',
    fontSize: 12.5,
    lineHeight: 18,
  },
  supportContainer: {
    width: '100%',
    alignItems: 'center',
    marginTop: 10,
  },
  whatsappButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#25D366',
    width: '100%',
    maxWidth: 420,
    height: 52,
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#25D366',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 4,
  },
  whatsappButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 12,
    backgroundColor: 'rgba(239, 68, 68, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.2)',
  },
  logoutButtonText: {
    color: '#EF4444',
    fontSize: 13,
    fontWeight: '700',
  },
});
