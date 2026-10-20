import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Linking,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/context/auth-context';
import AdminDashboard from '@/components/admin/AdminDashboard';

export default function ExploreScreen() {
  const { profile, signOut } = useAuth();
  const isAdmin = profile?.role === 'admin';

  // If user is Admin, render the full interactive Admin Dashboard
  if (isAdmin) {
    return <AdminDashboard />;
  }

  // If client, render VIP Club & Points benefits screen
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header Profile Card */}
      <View style={styles.profileCard}>
        <View style={styles.avatarCircle}>
          <Text style={styles.avatarText}>
            {(profile?.username || 'GG').slice(0, 2).toUpperCase()}
          </Text>
        </View>
        <Text style={styles.username}>{profile?.username || 'Cliente Gucci'}</Text>
        <Text style={styles.email}>{profile?.email || 'Miembro de Gucci Games'}</Text>

        {/* Gucci Points Box */}
        <View style={styles.pointsBadgeBox}>
          <Ionicons name="sparkles" size={18} color="#F5A623" />
          <Text style={styles.pointsBadgeText}>
            {profile?.gucci_points || 0} Puntos Gucci
          </Text>
        </View>
      </View>

      {/* VIP Club Benefits */}
      <View style={styles.benefitsSection}>
        <Text style={styles.sectionTitle}>Beneficios Exclusivos Gucci Games</Text>
        
        <View style={styles.benefitCard}>
          <View style={styles.benefitIconBox}>
            <Ionicons name="gift" size={20} color="#F5A623" />
          </View>
          <View style={styles.benefitInfo}>
            <Text style={styles.benefitTitle}>Acumula Puntos por Compras</Text>
            <Text style={styles.benefitDesc}>
              Cada compra que realizas en la app te suma puntos canjeables por descuentos o juegos retro.
            </Text>
          </View>
        </View>

        <View style={styles.benefitCard}>
          <View style={[styles.benefitIconBox, { backgroundColor: 'rgba(56, 189, 248, 0.15)' }]}>
            <Ionicons name="swap-horizontal" size={20} color="#38BDF8" />
          </View>
          <View style={styles.benefitInfo}>
            <Text style={styles.benefitTitle}>Canjes MJU • Mi Juego Usado</Text>
            <Text style={styles.benefitDesc}>
              Entrega tus juegos usados originales como parte de pago para llevarte tus títulos favoritos.
            </Text>
          </View>
        </View>

        <View style={styles.benefitCard}>
          <View style={[styles.benefitIconBox, { backgroundColor: 'rgba(52, 211, 153, 0.15)' }]}>
            <Ionicons name="shield-checkmark" size={20} color="#34D399" />
          </View>
          <View style={styles.benefitInfo}>
            <Text style={styles.benefitTitle}>Garantía 100% Original</Text>
            <Text style={styles.benefitDesc}>
              Todos nuestros juegos y consolas importados cuentan con garantía técnica y autenticidad comprobada.
            </Text>
          </View>
        </View>
      </View>

      {/* Direct WhatsApp Support */}
      <TouchableOpacity
        style={styles.whatsappButton}
        onPress={() => {
          const msg = encodeURIComponent(
            `¡Hola Gucci Games! 🎮 Soy ${profile?.username || 'un cliente'} y tengo una consulta sobre el catálogo.`
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
        <Text style={styles.logoutButtonText}>Cerrar Sesión</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B0B0E',
  },
  content: {
    padding: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    alignItems: 'center',
  },
  profileCard: {
    width: '100%',
    backgroundColor: '#121217',
    borderRadius: 18,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#27272A',
    marginBottom: 24,
  },
  avatarCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#1C1C24',
    borderWidth: 2,
    borderColor: '#F5A623',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarText: {
    color: '#F5A623',
    fontSize: 22,
    fontWeight: '800',
  },
  username: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '800',
  },
  email: {
    color: '#71717A',
    fontSize: 13,
    marginTop: 4,
  },
  pointsBadgeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(245, 166, 35, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(245, 166, 35, 0.35)',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginTop: 16,
    gap: 8,
  },
  pointsBadgeText: {
    color: '#F5A623',
    fontSize: 14,
    fontWeight: '800',
  },
  benefitsSection: {
    width: '100%',
    marginBottom: 24,
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 14,
  },
  benefitCard: {
    flexDirection: 'row',
    backgroundColor: '#141418',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#27272A',
    marginBottom: 10,
    alignItems: 'center',
  },
  benefitIconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: 'rgba(245, 166, 35, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  benefitInfo: {
    flex: 1,
  },
  benefitTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  benefitDesc: {
    color: '#A1A1AA',
    fontSize: 12,
    marginTop: 3,
    lineHeight: 17,
  },
  whatsappButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#25D366',
    width: '100%',
    height: 50,
    borderRadius: 14,
    marginBottom: 14,
  },
  whatsappButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
  },
  logoutButtonText: {
    color: '#EF4444',
    fontSize: 14,
    fontWeight: '600',
  },
});
