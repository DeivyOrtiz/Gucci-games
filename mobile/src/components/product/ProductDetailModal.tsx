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
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Database } from '@/types/database';
import { parseStockFromDescription } from '@/lib/stockUtils';

type Product = Database['public']['Tables']['products']['Row'];

interface ProductDetailModalProps {
  product: Product | null;
  visible: boolean;
  onClose: () => void;
  getImageSource: (product: Product) => any;
  userPhone?: string;
  onAddToCart?: (product: Product) => void;
}

export default function ProductDetailModal({
  product,
  visible,
  onClose,
  getImageSource,
  onAddToCart,
}: ProductDetailModalProps) {
  const [isFavorite, setIsFavorite] = useState(false);
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;

  if (!product) return null;

  // Gucci Games WhatsApp Phone (Santa Cruz, Bolivia: default country code 591)
  const GUCCI_GAMES_WHATSAPP = process.env.EXPO_PUBLIC_WHATSAPP_NUMBER || '59177617306';
  const { stock, cleanDescription } = parseStockFromDescription(product.description);

  const handleBuyWhatsApp = () => {
    const stockNote = stock > 0 ? ` (Quedan ${stock} disponibles)` : ' (Agotado)';
    const message = `¡Hola Gucci Games! 🎮\nEstoy interesado en comprar *${product.title}* para *${product.platform}* por *Bs. ${product.price}*${stockNote}.\n¿Sigue disponible para entrega inmediata?`;
    const whatsappUrl = `https://wa.me/${GUCCI_GAMES_WHATSAPP}?text=${encodeURIComponent(
      message
    )}`;

    Linking.canOpenURL(whatsappUrl).then((supported) => {
      if (supported || Platform.OS === 'web') {
        Linking.openURL(whatsappUrl);
      } else {
        Linking.openURL(`https://api.whatsapp.com/send?phone=${GUCCI_GAMES_WHATSAPP}&text=${encodeURIComponent(message)}`);
      }
    });
  };

  const handleShare = async () => {
    try {
      if (Platform.OS === 'web') {
        if (navigator.share) {
          await navigator.share({
            title: product.title,
            text: `¡Mira este juego en Gucci Games! ${product.title} (${product.platform}) por solo Bs. ${product.price}`,
            url: window.location.href,
          });
          return;
        }
      }
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
    cleanDescription ||
    `Juego físico original en formato de ${product.platform}. Probado funcionalmente y garantizado por Gucci Games Santa Cruz. Incluye acumulación de Puntos Gucci en tu cuenta.`;

  // DESKTOP MODAL DIALOG
  if (isDesktop) {
    return (
      <Modal
        animationType="fade"
        transparent={true}
        visible={visible}
        onRequestClose={onClose}>
        <View style={styles.desktopModalBackdrop}>
          <View style={styles.desktopModalCard}>
            {/* Close Icon Button */}
            <TouchableOpacity
              style={styles.desktopCloseBtn}
              onPress={onClose}
              activeOpacity={0.8}>
              <Ionicons name="close" size={22} color="#FFFFFF" />
            </TouchableOpacity>

            {/* Left Column: Product Art & Visuals */}
            <View style={styles.desktopLeftCol}>
              <Image
                source={getImageSource(product)}
                style={styles.desktopImage}
                resizeMode="contain"
              />
              <View style={styles.desktopImageBottomBadges}>
                <View style={styles.categoryBadge}>
                  <Text style={styles.categoryBadgeText}>{getCategoryBadgeLabel()}</Text>
                </View>
                <View style={styles.platformBadge}>
                  <Text style={styles.platformBadgeText}>
                    ORIGINAL {product.platform.toUpperCase().replace('NINTENDO ', '')}
                  </Text>
                </View>
              </View>
            </View>

            {/* Right Column: Details & Actions */}
            <View style={styles.desktopRightCol}>
              <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.desktopDetailsScroll}>
                {/* Stock Badge & Favorites */}
                <View style={styles.desktopHeaderRow}>
                  <View style={[styles.stockBadge, { backgroundColor: stock > 0 ? (stock <= 2 ? 'rgba(245, 166, 35, 0.2)' : 'rgba(16, 185, 129, 0.2)') : 'rgba(239, 68, 68, 0.2)' }]}>
                    <Text style={[styles.stockBadgeText, { color: stock > 0 ? (stock <= 2 ? '#F5A623' : '#10B981') : '#EF4444' }]}>
                      {stock > 0 ? (stock <= 2 ? `¡ÚLTIMAS ${stock} UDS!` : `STOCK DISPONIBLE: ${stock} UDS`) : 'AGOTADO'}
                    </Text>
                  </View>

                  <View style={{ flexDirection: 'row', gap: 8 }}>
                    <TouchableOpacity
                      style={styles.desktopActionIcon}
                      onPress={handleShare}
                      accessibilityLabel="Compartir">
                      <Ionicons name="share-social-outline" size={18} color="#FFFFFF" />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.desktopActionIcon}
                      onPress={() => setIsFavorite(!isFavorite)}
                      accessibilityLabel="Favorito">
                      <Ionicons
                        name={isFavorite ? 'heart' : 'heart-outline'}
                        size={18}
                        color={isFavorite ? '#EF4444' : '#FFFFFF'}
                      />
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Title */}
                <Text style={styles.desktopTitle}>{product.title}</Text>
                <Text style={styles.desktopSubtitle}>
                  {product.platform} • Garantía Oficial Gucci Games SCZ
                </Text>

                {/* Price and Rewards */}
                <View style={styles.desktopPriceBox}>
                  <View>
                    <Text style={styles.priceLabel}>PRECIO AL CONTADO</Text>
                    <Text style={styles.desktopPriceValue}>Bs. {Number(product.price).toFixed(2)}</Text>
                  </View>
                  <View style={styles.pointsPill}>
                    <Ionicons name="sparkles" size={14} color="#000000" style={{ marginRight: 4 }} />
                    <Text style={styles.pointsPillText}>+{product.points_reward} PUNTOS VIP</Text>
                  </View>
                </View>

                {/* Description */}
                <Text style={styles.desktopDescHeader}>DETALLES DEL PRODUCTO</Text>
                <Text style={styles.desktopDescText}>{descriptionText}</Text>

                {/* Benefits Pills */}
                <View style={styles.desktopPillsRow}>
                  <View style={styles.desktopPillItem}>
                    <Ionicons name="shield-checkmark" size={16} color="#F5A623" />
                    <Text style={styles.desktopPillText}>Garantía 100% Original</Text>
                  </View>
                  <View style={styles.desktopPillItem}>
                    <Ionicons name="flash" size={16} color="#10B981" />
                    <Text style={styles.desktopPillText}>Entrega Rápida en SCZ</Text>
                  </View>
                </View>

                {/* Action Buttons */}
                <View style={styles.desktopActionButtonsRow}>
                  {onAddToCart && (
                    <TouchableOpacity
                      style={styles.desktopAddToCartBtn}
                      onPress={() => {
                        onAddToCart(product);
                        onClose();
                      }}
                      activeOpacity={0.85}>
                      <Ionicons name="bag-add" size={19} color="#F5A623" style={{ marginRight: 6 }} />
                      <Text style={styles.desktopAddToCartBtnText}>Agregar a Bolsa</Text>
                    </TouchableOpacity>
                  )}

                  <TouchableOpacity
                    style={[styles.desktopWhatsAppBtn, !onAddToCart && { flex: 1 }]}
                    onPress={handleBuyWhatsApp}
                    activeOpacity={0.88}>
                    <Ionicons name="logo-whatsapp" size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
                    <Text style={styles.whatsAppButtonText}>Comprar por WhatsApp</Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </View>
          </View>
        </View>
      </Modal>
    );
  }

  // MOBILE MODAL
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
            <View style={styles.badgesRow}>
              <View style={styles.categoryBadge}>
                <Text style={styles.categoryBadgeText}>{getCategoryBadgeLabel()}</Text>
              </View>

              <View style={[styles.stockBadge, { backgroundColor: stock > 0 ? (stock <= 2 ? 'rgba(245, 166, 35, 0.2)' : 'rgba(16, 185, 129, 0.2)') : 'rgba(239, 68, 68, 0.2)' }]}>
                <Text style={[styles.stockBadgeText, { color: stock > 0 ? (stock <= 2 ? '#F5A623' : '#10B981') : '#EF4444' }]}>
                  {stock > 0 ? (stock <= 2 ? `¡ÚLTIMAS ${stock} UDS!` : `STOCK: ${stock} UDS`) : 'AGOTADO'}
                </Text>
              </View>

              <View style={styles.platformBadge}>
                <Text style={styles.platformBadgeText}>
                  ORIGINAL {product.platform.toUpperCase().replace('NINTENDO ', '')}
                </Text>
              </View>
            </View>

            <Text style={styles.title}>{product.title}</Text>
            <Text style={styles.subtitle}>
              {product.platform} • Colección Oficial Gucci Games
            </Text>

            <View style={styles.priceCard}>
              <View>
                <Text style={styles.priceLabel}>PRECIO DE CONTADO</Text>
                <Text style={styles.priceValue}>Bs. {Number(product.price).toFixed(2)}</Text>
              </View>

              <View style={styles.pointsPill}>
                <Ionicons name="star" size={13} color="#000000" style={{ marginRight: 3 }} />
                <Text style={styles.pointsPillText}>+{product.points_reward} PUNTOS</Text>
              </View>
            </View>

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

            <Text style={styles.sectionHeaderTitle}>DESCRIPCIÓN DEL JUEGO</Text>
            
            <View style={styles.descriptionCard}>
              <Text style={styles.descriptionContent}>{descriptionText}</Text>
            </View>

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
  // Desktop Styles
  desktopModalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.82)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  desktopModalCard: {
    width: '100%',
    maxWidth: 880,
    maxHeight: '90%',
    backgroundColor: '#121217',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#272732',
    flexDirection: 'row',
    overflow: 'hidden',
    position: 'relative',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.6,
    shadowRadius: 28,
  },
  desktopCloseBtn: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 50,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#1C1C24',
    borderWidth: 1,
    borderColor: '#2F2F3D',
    alignItems: 'center',
    justifyContent: 'center',
  },
  desktopLeftCol: {
    width: 380,
    backgroundColor: '#16161E',
    padding: 24,
    justifyContent: 'center',
    alignItems: 'center',
    borderRightWidth: 1,
    borderRightColor: '#242430',
  },
  desktopImage: {
    width: '100%',
    height: 320,
  },
  desktopImageBottomBadges: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 18,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  desktopRightCol: {
    flex: 1,
    padding: 28,
    paddingRight: 32,
  },
  desktopDetailsScroll: {
    paddingBottom: 16,
  },
  desktopHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  desktopActionIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#1E1E26',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#2D2D3A',
  },
  desktopTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  desktopSubtitle: {
    fontSize: 13,
    color: '#A1A1AA',
    marginBottom: 16,
  },
  desktopPriceBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#181820',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#2A2A36',
    marginBottom: 16,
  },
  desktopPriceValue: {
    fontSize: 26,
    fontWeight: '900',
    color: '#F5A623',
  },
  desktopDescHeader: {
    fontSize: 11,
    fontWeight: '800',
    color: '#F5A623',
    letterSpacing: 1,
    marginBottom: 6,
  },
  desktopDescText: {
    fontSize: 13,
    color: '#D4D4D8',
    lineHeight: 20,
    marginBottom: 16,
  },
  desktopPillsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  desktopPillItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#181820',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#262632',
  },
  desktopPillText: {
    color: '#E4E4E7',
    fontSize: 12,
    fontWeight: '600',
  },
  desktopActionButtonsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 8,
  },
  desktopAddToCartBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1E1E28',
    borderWidth: 1.5,
    borderColor: '#F5A623',
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: 16,
  },
  desktopAddToCartBtnText: {
    color: '#F5A623',
    fontSize: 14,
    fontWeight: '800',
  },
  desktopWhatsAppBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#25D366',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 16,
  },

  // Mobile Styles
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
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  categoryBadge: {
    backgroundColor: '#F5A623',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  categoryBadgeText: {
    color: '#000000',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  stockBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  stockBadgeText: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  platformBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  platformBadgeText: {
    color: '#E4E4E7',
    fontSize: 10,
    fontWeight: '700',
  },
  title: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  subtitle: {
    color: '#A1A1AA',
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 16,
  },
  priceCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#16161B',
    borderWidth: 1,
    borderColor: '#25252E',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 16,
  },
  priceLabel: {
    color: '#71717A',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  priceValue: {
    color: '#F5A623',
    fontSize: 22,
    fontWeight: '900',
    marginTop: 2,
  },
  pointsPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5A623',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  pointsPillText: {
    color: '#000000',
    fontSize: 11,
    fontWeight: '900',
  },
  rewardCalloutCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(245, 166, 35, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(245, 166, 35, 0.25)',
    borderRadius: 14,
    padding: 14,
    marginBottom: 20,
  },
  coinCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(245, 166, 35, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  rewardTextContainer: {
    flex: 1,
  },
  rewardTitle: {
    color: '#F5A623',
    fontSize: 13,
    fontWeight: '800',
    marginBottom: 2,
  },
  rewardSubtitle: {
    color: '#A1A1AA',
    fontSize: 11,
    lineHeight: 15,
  },
  sectionHeaderTitle: {
    color: '#71717A',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.2,
    marginBottom: 8,
  },
  descriptionCard: {
    backgroundColor: '#141418',
    borderWidth: 1,
    borderColor: '#222228',
    borderRadius: 14,
    padding: 16,
    marginBottom: 20,
  },
  descriptionContent: {
    color: '#D4D4D8',
    fontSize: 13,
    lineHeight: 20,
  },
  guaranteeRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  guaranteePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#16161B',
    borderWidth: 1,
    borderColor: '#25252E',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    gap: 6,
  },
  guaranteeText: {
    color: '#E4E4E7',
    fontSize: 11,
    fontWeight: '600',
  },
  bottomBarContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#121216',
    borderTopWidth: 1,
    borderTopColor: '#222228',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 16,
    alignItems: 'center',
  },
  whatsAppButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#25D366',
    width: '100%',
    height: 52,
    borderRadius: 16,
    shadowColor: '#25D366',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 6,
  },
  whatsAppButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
  footerNote: {
    color: '#71717A',
    fontSize: 11,
    marginTop: 6,
  },
});
