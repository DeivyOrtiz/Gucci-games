import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  Modal,
  Linking,
  Share,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Database } from '@/types/database';

type Product = Database['public']['Tables']['products']['Row'];

interface ProductDetailModalProps {
  product: Product | null;
  visible: boolean;
  onClose: () => void;
  getImageSource: (product: Product) => any;
  userPhone?: string;
}

export default function ProductDetailModal({
  product,
  visible,
  onClose,
  getImageSource,
}: ProductDetailModalProps) {
  const [isFavorite, setIsFavorite] = useState(false);

  if (!product) return null;

  // Gucci Games WhatsApp Phone (Santa Cruz, Bolivia: default country code 591)
  const GUCCI_GAMES_WHATSAPP = '59178555555';

  const handleBuyWhatsApp = () => {
    const message = `¡Hola Gucci Games! 🎮\nEstoy interesado en comprar *${product.title}* para *${product.platform}* por *Bs. ${product.price}*.\n¿Sigue disponible para entrega inmediata?`;
    const whatsappUrl = `https://wa.me/${GUCCI_GAMES_WHATSAPP}?text=${encodeURIComponent(
      message
    )}`;

    Linking.canOpenURL(whatsappUrl).then((supported) => {
      if (supported || Platform.OS === 'web') {
        Linking.openURL(whatsappUrl);
      } else {
        // Fallback for devices without WhatsApp app installed
        Linking.openURL(`https://api.whatsapp.com/send?phone=${GUCCI_GAMES_WHATSAPP}&text=${encodeURIComponent(message)}`);
      }
    });
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `¡Mira este juego en Gucci Games! ${product.title} (${product.platform}) por solo Bs. ${product.price} con recompensas de puntos Gucci.`,
      });
    } catch (e) {
      console.warn(e);
    }
  };

  // Determine category badge label and style
  const getCategoryBadgeLabel = () => {
    if (product.category === 'retro') return 'RETRO GAME';
    if (product.category === 'mju') return 'MJU USADOS';
    return 'DESTACADO';
  };

  // Format description
  const descriptionText =
    product.description ||
    `La descripción del juego en formato de ${product.platform}. Incluye cartucho físico original en excelente estado de conservación, testeado funcionalmente y garantizado por Gucci Games. Adéntrate en épicas mazmorras y aventuras, suma recompensas instantáneas a tu cuenta de cliente.`;

  return (
    <Modal
      animationType="slide"
      transparent={false}
      visible={visible}
      onRequestClose={onClose}>
      <View style={styles.container}>
        
        {/* Scrollable Content */}
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}>
          
          {/* Top Hero Image Container */}
          <View style={styles.imageContainer}>
            <Image
              source={getImageSource(product)}
              style={styles.heroImage}
              resizeMode="cover"
            />

            {/* Gradient overlay to smoothly blend with dark background */}
            <LinearGradient
              colors={[
                'rgba(13, 13, 16, 0.4)',
                'rgba(13, 13, 16, 0.1)',
                'rgba(13, 13, 16, 0.7)',
                '#0D0D10',
              ]}
              locations={[0, 0.3, 0.75, 1]}
              style={styles.imageGradientOverlay}
            />

            {/* Floating Top Bar (Back, Share, Heart) */}
            <SafeAreaView edges={['top']} style={styles.floatingTopBar}>
              <TouchableOpacity
                style={styles.roundIconButton}
                onPress={onClose}
                activeOpacity={0.8}
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
                <Ionicons name="chevron-back" size={22} color="#FFFFFF" />
              </TouchableOpacity>

              <View style={styles.floatingRightRow}>
                <TouchableOpacity
                  style={styles.roundIconButton}
                  onPress={handleShare}
                  activeOpacity={0.8}>
                  <Ionicons name="share-social-outline" size={19} color="#FFFFFF" />
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.roundIconButton}
                  onPress={() => setIsFavorite(!isFavorite)}
                  activeOpacity={0.8}>
                  <Ionicons
                    name={isFavorite ? 'heart' : 'heart-outline'}
                    size={20}
                    color={isFavorite ? '#EF4444' : '#FFFFFF'}
                  />
                </TouchableOpacity>
              </View>
            </SafeAreaView>
          </View>

          {/* Product Info Section */}
          <View style={styles.infoSection}>
            
            {/* Badges Row */}
            <View style={styles.badgesRow}>
              <View style={styles.categoryBadge}>
                <Text style={styles.categoryBadgeText}>{getCategoryBadgeLabel()}</Text>
              </View>

              <View style={styles.stockBadge}>
                <Text style={styles.stockBadgeText}>EN STOCK</Text>
              </View>

              <View style={styles.platformBadge}>
                <Text style={styles.platformBadgeText}>
                  ORIGINAL {product.platform.toUpperCase().replace('NINTENDO ', '')}
                </Text>
              </View>
            </View>

            {/* Title & Platform Subtitle */}
            <Text style={styles.title}>{product.title}</Text>
            <Text style={styles.subtitle}>
              {product.platform} • Colección Oficial Gucci Games
            </Text>

            {/* Price & Points Card */}
            <View style={styles.priceCard}>
              <View>
                <Text style={styles.priceLabel}>PRECIO DE CONTADO</Text>
                <Text style={styles.priceValue}>Bs. {product.price}</Text>
              </View>

              <View style={styles.pointsPill}>
                <Ionicons name="star" size={13} color="#000000" style={{ marginRight: 3 }} />
                <Text style={styles.pointsPillText}>+{product.points_reward} PUNTOS</Text>
              </View>
            </View>

            {/* Loyalty Rewards Callout Box */}
            <View style={styles.rewardCalloutCard}>
              <View style={styles.coinCircle}>
                <Ionicons name="cash" size={20} color="#F5A623" />
              </View>

              <View style={styles.rewardTextContainer}>
                <Text style={styles.rewardTitle}>
                  ¡Gana {product.points_reward} puntos Gucci Games!
                </Text>
                <Text style={styles.rewardSubtitle}>
                  Canjéalos como saldo en tus próximas compras o sorteos exclusivos.
                </Text>
              </View>
            </View>

            {/* Section: DESCRIPCIÓN DEL JUEGO */}
            <Text style={styles.sectionHeaderTitle}>DESCRIPCIÓN DEL JUEGO</Text>
            
            <View style={styles.descriptionCard}>
              <Text style={styles.descriptionContent}>{descriptionText}</Text>
            </View>

            {/* Condition & Immediate Delivery Pills */}
            <View style={styles.guaranteeRow}>
              <View style={styles.guaranteePill}>
                <Ionicons name="refresh-circle" size={18} color="#F5A623" />
                <Text style={styles.guaranteeText}>Estado: 9.5 / 10 Seminuevo</Text>
              </View>

              <View style={styles.guaranteePill}>
                <Ionicons name="flash" size={18} color="#10B981" />
                <Text style={styles.guaranteeText}>Entrega Inmediata</Text>
              </View>
            </View>

          </View>
        </ScrollView>

        {/* Fixed Bottom Action: Comprar por WhatsApp */}
        <SafeAreaView edges={['bottom']} style={styles.bottomBarContainer}>
          <TouchableOpacity
            style={styles.whatsAppButton}
            onPress={handleBuyWhatsApp}
            activeOpacity={0.88}>
            <Ionicons name="logo-whatsapp" size={24} color="#FFFFFF" style={{ marginRight: 8 }} />
            <Text style={styles.whatsAppButtonText}>Comprar por WhatsApp</Text>
          </TouchableOpacity>
          <Text style={styles.footerNote}>
            Atención inmediata • Entrega garantizada por Gucci Games
          </Text>
        </SafeAreaView>

      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0D0D10',
  },
  scrollContent: {
    paddingBottom: 110,
  },
  imageContainer: {
    width: '100%',
    height: 360,
    position: 'relative',
    backgroundColor: '#16161A',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  imageGradientOverlay: {
    ...StyleSheet.absoluteFill,
  },
  floatingTopBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 10,
    zIndex: 20,
  },
  floatingRightRow: {
    flexDirection: 'row',
    gap: 10,
  },
  roundIconButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(18, 18, 22, 0.65)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoSection: {
    paddingHorizontal: 18,
    marginTop: -20,
    zIndex: 10,
  },
  badgesRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
    flexWrap: 'wrap',
  },
  categoryBadge: {
    backgroundColor: 'rgba(245, 166, 35, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(245, 166, 35, 0.4)',
    borderRadius: 6,
    paddingHorizontal: 9,
    paddingVertical: 4,
  },
  categoryBadgeText: {
    color: '#F5A623',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  stockBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.4)',
    borderRadius: 6,
    paddingHorizontal: 9,
    paddingVertical: 4,
  },
  stockBadgeText: {
    color: '#10B981',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  platformBadge: {
    backgroundColor: '#1C1C22',
    borderWidth: 1,
    borderColor: '#2E2E38',
    borderRadius: 6,
    paddingHorizontal: 9,
    paddingVertical: 4,
  },
  platformBadgeText: {
    color: '#A1A1AA',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 26,
    fontWeight: '900',
    letterSpacing: 0.3,
  },
  subtitle: {
    color: '#A1A1AA',
    fontSize: 13,
    fontWeight: '500',
    marginTop: 3,
    marginBottom: 16,
  },
  priceCard: {
    backgroundColor: '#151519',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#23232B',
    paddingHorizontal: 18,
    paddingVertical: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  priceLabel: {
    color: '#71717A',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.6,
  },
  priceValue: {
    color: '#FFFFFF',
    fontSize: 26,
    fontWeight: '900',
    marginTop: 2,
  },
  pointsPill: {
    backgroundColor: '#F5A623',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  pointsPillText: {
    color: '#000000',
    fontWeight: '900',
    fontSize: 12,
    letterSpacing: 0.2,
  },
  rewardCalloutCard: {
    backgroundColor: '#18150F',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(245, 166, 35, 0.35)',
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 20,
  },
  coinCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#2A1E0B',
    borderWidth: 1.5,
    borderColor: '#F5A623',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rewardTextContainer: {
    flex: 1,
  },
  rewardTitle: {
    color: '#F5A623',
    fontSize: 13,
    fontWeight: '800',
  },
  rewardSubtitle: {
    color: '#D4D4D8',
    fontSize: 11,
    marginTop: 2,
    lineHeight: 15,
  },
  sectionHeaderTitle: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.8,
    marginBottom: 10,
  },
  descriptionCard: {
    backgroundColor: '#151519',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#23232B',
    padding: 16,
    marginBottom: 14,
  },
  descriptionContent: {
    color: '#A1A1AA',
    fontSize: 13,
    lineHeight: 20,
  },
  guaranteeRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  guaranteePill: {
    flex: 1,
    backgroundColor: '#151519',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#23232B',
    paddingVertical: 12,
    paddingHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  guaranteeText: {
    color: '#E4E4E7',
    fontSize: 11,
    fontWeight: '600',
    flex: 1,
  },
  bottomBarContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(13, 13, 16, 0.95)',
    borderTopWidth: 1,
    borderTopColor: '#202026',
    paddingHorizontal: 18,
    paddingTop: 12,
    paddingBottom: 12,
  },
  whatsAppButton: {
    backgroundColor: '#10B981',
    borderRadius: 26,
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 6,
  },
  whatsAppButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  footerNote: {
    color: '#71717A',
    fontSize: 10,
    textAlign: 'center',
    marginTop: 8,
  },
});
