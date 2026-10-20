import React, { useEffect, useState, useRef } from 'react';
import {
  StyleSheet,
  ScrollView,
  View,
  Image,
  TouchableOpacity,
  Text,
  TextInput,
  Modal,
  Alert,
  Dimensions,
  FlatList,
  Linking,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { ThemedView } from '@/components/themed-view';
import { useAuth } from '@/context/auth-context';
import { supabase } from '@/lib/supabase';
import { Database } from '@/types/database';
import ProductDetailModal from '@/components/product/ProductDetailModal';
import AdminPinModal from '@/components/admin/AdminPinModal';
import AdminDashboard from '@/components/admin/AdminDashboard';

type Product = Database['public']['Tables']['products']['Row'];

interface CartItem {
  product: Product;
  quantity: number;
}

const { width } = Dimensions.get('window');

const LOCAL_GAME_IMAGES: Record<string, any> = {
  game_mario_party: require('@/assets/images/game_mario_party.png'),
  game_mario_kart: require('@/assets/images/game_mario_kart.png'),
  game_super_mario: require('@/assets/images/game_super_mario.png'),
  game_pokemon: require('@/assets/images/game_pokemon.png'),
  game_zelda: require('@/assets/images/game_zelda.png'),
  game_donkey_kong: require('@/assets/images/game_donkey_kong.png'),
};

// Promotional Banners (Atacado Connect style slider)
const PROMO_BANNERS = [
  {
    id: '1',
    tag: 'OFERTAS DE LA SEMANA',
    title: 'GUCCI GAMES',
    subtitle: 'Nuevos lanzamientos y clásicos con entrega inmediata en SCZ',
    badge: 'HASTA 30% OFF',
    accentColor: '#F5A623',
    bgGradient: '#19150E',
  },
  {
    id: '2',
    tag: 'COLECCIÓN EXCLUSIVA',
    title: 'RETRO JAPÓN SCZ',
    subtitle: 'Cartuchos originales, consolas vintage y rarezas de colección',
    badge: '100% ORIGINAL',
    accentColor: '#38BDF8',
    bgGradient: '#0C1724',
  },
  {
    id: '3',
    tag: 'SEMINUEVOS GARANTIZADOS',
    title: 'MJU • MI JUEGO USADO',
    subtitle: 'Canjea tus juegos usados y llévate saldo al instante',
    badge: 'CANJES & VENTAS',
    accentColor: '#F59E0B',
    bgGradient: '#1C1307',
  },
];

// Categories / Classifications (Atacado Connect style with circular icons)
const CLASSIFICATIONS = [
  { id: 'all', name: 'Todos', icon: 'grid', filter: null, count: 'Catálogo' },
  { id: 'games', name: 'Games', icon: 'game-controller', filter: 'general', count: 'PS5 & Switch' },
  { id: 'mju', name: 'MJU Usados', icon: 'repeat', filter: 'mju', count: 'Seminuevos' },
  { id: 'retro', name: 'Retro', icon: 'hardware-chip', filter: 'retro', count: 'Japón SCZ' },
  { id: 'consolas', name: 'Consolas', icon: 'tv', filter: 'consolas', count: 'Portátiles' },
  { id: 'accesorios', name: 'Accesorios', icon: 'headset', filter: 'accesorios', count: 'Mandos' },
];

export default function HomeScreen() {
  const { profile, signOut, refreshProfile } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedFilter, setSelectedFilter] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartVisible, setIsCartVisible] = useState(false);
  const [activeBannerIndex, setActiveBannerIndex] = useState(0);

  // Secret Admin Access via double-tap on logo
  const tapCountRef = useRef<number>(0);
  const tapTimerRef = useRef<any>(null);
  const [isAdminPinVisible, setIsAdminPinVisible] = useState(false);
  const [isAdminDashboardVisible, setIsAdminDashboardVisible] = useState(false);

  const handleLogoDoubleTap = () => {
    tapCountRef.current += 1;
    if (tapTimerRef.current) clearTimeout(tapTimerRef.current);

    if (tapCountRef.current >= 2) {
      tapCountRef.current = 0;
      setIsAdminPinVisible(true);
    } else {
      tapTimerRef.current = setTimeout(() => {
        tapCountRef.current = 0;
      }, 750);
    }
  };

  const bannerListRef = useRef<FlatList>(null);

  const fetchProducts = async () => {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setProducts(data);
    }
  };

  useEffect(() => {
    fetchProducts();
    refreshProfile();
  }, []);

  const getProductImage = (item: Product) => {
    if (item.image_url) {
      if (item.image_url.startsWith('http') || item.image_url.startsWith('data:') || item.image_url.startsWith('file:')) {
        return { uri: item.image_url };
      }
      if (item.image_url.startsWith('/uploads')) {
        return { uri: `http://192.168.31.140:3000${item.image_url}` };
      }
      if (LOCAL_GAME_IMAGES[item.image_url]) {
        return LOCAL_GAME_IMAGES[item.image_url];
      }
    }
    const cleanTitle = item.title.toLowerCase();
    if (cleanTitle.includes('mario party')) return LOCAL_GAME_IMAGES.game_mario_party;
    if (cleanTitle.includes('mario kart')) return LOCAL_GAME_IMAGES.game_mario_kart;
    if (cleanTitle.includes('super mario')) return LOCAL_GAME_IMAGES.game_super_mario;
    if (cleanTitle.includes('pokemon')) return LOCAL_GAME_IMAGES.game_pokemon;
    if (cleanTitle.includes('zelda')) return LOCAL_GAME_IMAGES.game_zelda;
    if (cleanTitle.includes('donkey')) return LOCAL_GAME_IMAGES.game_donkey_kong;
    return LOCAL_GAME_IMAGES.game_mario_party;
  };

  const getProductSKU = (item: Product) => {
    // Generate Atacado Connect-style numerical product code
    const numericPart = item.id.replace(/\D/g, '').slice(0, 7);
    return numericPart || '1440034';
  };

  const toggleFavorite = (productId: string) => {
    if (favorites.includes(productId)) {
      setFavorites(favorites.filter((id) => id !== productId));
    } else {
      setFavorites([...favorites, productId]);
    }
  };

  const addToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });

    Alert.alert(
      'Agregado a la Bolsa',
      `"${product.title}" se agregó a tu bolsa de compras.`,
      [
        { text: 'Seguir mirando', style: 'cancel' },
        { text: 'Ver Bolsa', onPress: () => setIsCartVisible(true) },
      ]
    );
  };

  const updateCartQuantity = (productId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.product.id === productId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const totalCartPrice = cart.reduce(
    (sum, item) => sum + Number(item.product.price) * item.quantity,
    0
  );

  const totalCartPoints = cart.reduce(
    (sum, item) => sum + (item.product.points_reward || 0) * item.quantity,
    0
  );

  const totalCartItemsCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const handleCheckoutWhatsApp = async () => {
    if (cart.length === 0) return;

    let orderCodeStr = '';
    try {
      // 1. Create order in Supabase
      const { data: newOrder } = await supabase
        .from('orders')
        .insert({
          user_id: profile?.id || null,
          customer_name: profile?.username || 'Cliente Gucci',
          customer_email: profile?.email || null,
          customer_phone: profile?.phone || null,
          total_price: totalCartPrice,
          points_earned: totalCartPoints,
          status: 'pending',
        })
        .select()
        .single();

      if (newOrder) {
        orderCodeStr = `#${newOrder.id.slice(0, 8).toUpperCase()}`;

        // 2. Insert order items
        const orderItems = cart.map((item) => ({
          order_id: newOrder.id,
          product_id: item.product.id,
          product_title: item.product.title,
          unit_price: Number(item.product.price),
          quantity: item.quantity,
          platform: item.product.platform,
          image_url: item.product.image_url,
        }));
        await supabase.from('order_items').insert(orderItems);

        // 3. Accumulate Gucci Points if logged in
        if (profile?.id && totalCartPoints > 0) {
          const newPts = (profile.gucci_points || 0) + totalCartPoints;
          await supabase
            .from('profiles')
            .update({ gucci_points: newPts })
            .eq('id', profile.id);

          await supabase.from('point_transactions').insert({
            user_id: profile.id,
            points_change: totalCartPoints,
            reason: `Compra Pedido ${orderCodeStr}`,
            created_by: profile.id,
          });

          refreshProfile();
        }
      }
    } catch (err) {
      console.warn('Error saving order to Supabase:', err);
    }

    const itemsList = cart
      .map(
        (item) =>
          `• ${item.quantity}x *${item.product.title}* (${item.product.platform}) - Bs. ${(
            Number(item.product.price) * item.quantity
          ).toFixed(2)}`
      )
      .join('\n');

    const message = `¡Hola Gucci Games! 🎮\nQuiero hacer el siguiente pedido ${orderCodeStr}:\n\n${itemsList}\n\n*Total a pagar:* Bs. ${totalCartPrice.toFixed(
      2
    )}\n*Puntos a sumar:* +${totalCartPoints} pts\n\n¿Tienen disponibilidad para coordinar la entrega en Santa Cruz?`;

    const storeWhatsApp = process.env.EXPO_PUBLIC_WHATSAPP_NUMBER || '59177617306';
    const whatsappUrl = `https://wa.me/${storeWhatsApp}?text=${encodeURIComponent(message)}`;
    Linking.canOpenURL(whatsappUrl).then((supported) => {
      if (supported || Platform.OS === 'web') {
        Linking.openURL(whatsappUrl);
      } else {
        Linking.openURL(
          `https://api.whatsapp.com/send?phone=${storeWhatsApp}&text=${encodeURIComponent(message)}`
        );
      }
    });

    setCart([]);
    setIsCartVisible(false);
  };

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.platform.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = selectedFilter ? p.category === selectedFilter : true;
    return matchesSearch && matchesFilter;
  });

  // Sections
  const featuredProducts = filteredProducts.slice(0, 4);
  const mjuProducts = filteredProducts.filter((p) => p.category === 'mju').length > 0
    ? filteredProducts.filter((p) => p.category === 'mju')
    : filteredProducts.slice(2, 6);
  const retroProducts = filteredProducts.filter((p) => p.category === 'retro').length > 0
    ? filteredProducts.filter((p) => p.category === 'retro')
    : filteredProducts.slice(1, 5);

  const handleCopySKU = (sku: string) => {
    Alert.alert('Código copiado', `Código de producto #${sku} listo para cotización.`);
  };

  // Render individual Atacado Connect-style product card
  const renderProductCard = (item: Product) => {
    const isFav = favorites.includes(item.id);
    const sku = getProductSKU(item);

    return (
      <TouchableOpacity
        key={item.id}
        style={styles.cardContainer}
        onPress={() => setSelectedProduct(item)}
        activeOpacity={0.88}>
        
        {/* Top Badges & Favorite Heart */}
        <View style={styles.cardHeaderRow}>
          <View style={styles.pointsRewardBadge}>
            <Text style={styles.pointsRewardBadgeText}>+{item.points_reward} PTS</Text>
          </View>

          <TouchableOpacity
            style={styles.heartButton}
            onPress={() => toggleFavorite(item.id)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            activeOpacity={0.7}>
            <Ionicons
              name={isFav ? 'heart' : 'heart-outline'}
              size={18}
              color={isFav ? '#EF4444' : '#71717A'}
            />
          </TouchableOpacity>
        </View>

        {/* Product Image */}
        <View style={styles.cardImageContainer}>
          <Image
            source={getProductImage(item)}
            style={styles.cardProductImage}
            resizeMode="contain"
          />
        </View>

        {/* Product Title (2 lines clamp) */}
        <Text style={styles.cardTitle} numberOfLines={2}>
          {item.title}
        </Text>

        {/* Category & Brand/Platform info */}
        <View style={styles.cardMetaContainer}>
          <Text style={styles.cardCategoryText}>{item.platform}</Text>
          <Text style={styles.cardBrandText}>GUCCI GAMES</Text>
        </View>

        {/* Divider line */}
        <View style={styles.cardDivider} />

        {/* Pricing Section (Bs. en Bolivianos) */}
        <View style={styles.cardPriceContainer}>
          <Text style={styles.cardPricePrimary}>Bs. {Number(item.price).toFixed(2)}</Text>
        </View>

        {/* Bottom Bar: SKU with copy button + Quick Add to Bag */}
        <View style={styles.cardFooterRow}>
          <TouchableOpacity
            style={styles.skuContainer}
            onPress={() => handleCopySKU(sku)}
            activeOpacity={0.7}>
            <Text style={styles.skuText}>{sku}</Text>
            <Ionicons name="copy-outline" size={12} color="#71717A" style={{ marginLeft: 4 }} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.bagAddButton}
            onPress={() => addToCart(item)}
            activeOpacity={0.85}>
            <Ionicons name="bag-add" size={16} color="#000000" />
          </TouchableOpacity>
        </View>

      </TouchableOpacity>
    );
  };

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView edges={['top']} style={styles.safeArea}>
        
        {/* Top Utility Ticker: VIP Club & Puntos Gucci */}
        <View style={styles.tickerBar}>
          <View style={styles.tickerItem}>
            <Ionicons name="sparkles" size={13} color="#F5A623" />
            <Text style={styles.tickerGold}>Club VIP Gucci Games</Text>
          </View>
          <View style={styles.tickerItem}>
            <Text style={styles.tickerMuted}>Puntos Gucci:</Text>
            <Text style={styles.tickerGold}>🪙 {profile?.gucci_points ?? 0} pts</Text>
          </View>
        </View>

        {/* Main Header: Logo + Search + Action Icons */}
        <View style={styles.mainHeader}>
          {/* Logo Brand with double-tap admin trigger */}
          <TouchableOpacity
            style={styles.brandRow}
            onPress={handleLogoDoubleTap}
            activeOpacity={0.85}
          >
            <View style={styles.logoBox}>
              <Image
                source={require('@/assets/images/gucci-logo.png')}
                style={styles.logoImage}
                resizeMode="cover"
              />
            </View>
            <View style={{ marginLeft: 8 }}>
              <Text style={styles.brandName}>GUCCI GAMES</Text>
              <Text style={styles.brandTagline}>STORE & REWARDS</Text>
            </View>
          </TouchableOpacity>

          {/* Right Header Actions: Wishlist, Cart/Sacola, Sign Out */}
          <View style={styles.headerActionsRow}>
            {/* Wishlist Button */}
            <TouchableOpacity
              style={styles.headerIconButton}
              onPress={() => {
                if (favorites.length === 0) {
                  Alert.alert('Favoritos', 'Aún no has agregado juegos a tus favoritos.');
                } else {
                  Alert.alert('Favoritos', `Tienes ${favorites.length} juegos en tu lista de deseos.`);
                }
              }}
              activeOpacity={0.8}>
              <Ionicons name="heart-outline" size={20} color="#FFFFFF" />
              {favorites.length > 0 && (
                <View style={styles.badgeIndicator}>
                  <Text style={styles.badgeIndicatorText}>{favorites.length}</Text>
                </View>
              )}
            </TouchableOpacity>

            {/* Shopping Bag Button ("Minha Sacola") */}
            <TouchableOpacity
              style={[styles.headerIconButton, styles.bagIconButton]}
              onPress={() => setIsCartVisible(true)}
              activeOpacity={0.8}>
              <Ionicons name="bag-handle" size={20} color="#000000" />
              {totalCartItemsCount > 0 && (
                <View style={styles.cartBadgeIndicator}>
                  <Text style={styles.cartBadgeText}>{totalCartItemsCount}</Text>
                </View>
              )}
            </TouchableOpacity>

            {/* Sign Out */}
            <TouchableOpacity
              style={styles.headerIconButton}
              onPress={signOut}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              activeOpacity={0.8}>
              <Ionicons name="log-out-outline" size={18} color="#A1A1AA" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Search Bar (Prominent, Atacado Connect Style) */}
        <View style={styles.searchBarWrapper}>
          <View style={styles.searchBar}>
            <Ionicons name="search" size={18} color="#71717A" style={{ marginRight: 10 }} />
            <TextInput
              style={styles.searchInput}
              placeholder="Buscar juegos, consolas, accesorios..."
              placeholderTextColor="#52525B"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={18} color="#71717A" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Main Scroll Content */}
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          
          {/* Classification Categories Bar (Horizontal Circular Icons) */}
          <View style={styles.classificationSection}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.classificationScroll}>
              {CLASSIFICATIONS.map((c) => {
                const isSelected = selectedFilter === c.filter;
                return (
                  <TouchableOpacity
                    key={c.id}
                    style={[
                      styles.classificationCard,
                      isSelected && styles.classificationCardSelected,
                    ]}
                    onPress={() => setSelectedFilter(isSelected ? null : c.filter)}
                    activeOpacity={0.8}>
                    <View
                      style={[
                        styles.classificationIconCircle,
                        isSelected && styles.classificationIconCircleSelected,
                      ]}>
                      <Ionicons
                        name={c.icon as any}
                        size={20}
                        color={isSelected ? '#000000' : '#F5A623'}
                      />
                    </View>
                    <Text
                      style={[
                        styles.classificationName,
                        isSelected && styles.classificationNameSelected,
                      ]}>
                      {c.name}
                    </Text>
                    <Text style={styles.classificationSub}>{c.count}</Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          {/* Hero Promotional Banner Slider */}
          <View style={styles.bannerSection}>
            <FlatList
              ref={bannerListRef}
              data={PROMO_BANNERS}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              keyExtractor={(item) => item.id}
              onMomentumScrollEnd={(e) => {
                const index = Math.round(e.nativeEvent.contentOffset.x / (width - 32));
                setActiveBannerIndex(index);
              }}
              renderItem={({ item }) => (
                <View
                  style={[
                    styles.bannerCard,
                    { borderColor: item.accentColor + '40', backgroundColor: item.bgGradient },
                  ]}>
                  <View style={styles.bannerGlowEffect} />
                  
                  <View style={styles.bannerBadgeRow}>
                    <View style={[styles.bannerTagBadge, { backgroundColor: item.accentColor }]}>
                      <Text style={styles.bannerTagBadgeText}>{item.tag}</Text>
                    </View>
                    <Text style={[styles.bannerMiniBadge, { color: item.accentColor }]}>
                      {item.badge}
                    </Text>
                  </View>

                  <Text style={styles.bannerTitle}>{item.title}</Text>
                  <Text style={styles.bannerSubtitle}>{item.subtitle}</Text>

                  <TouchableOpacity
                    style={[styles.bannerCTA, { borderColor: item.accentColor }]}
                    onPress={() => {
                      if (item.id === '2') setSelectedFilter('retro');
                      else if (item.id === '3') setSelectedFilter('mju');
                      else setSelectedFilter(null);
                    }}
                    activeOpacity={0.8}>
                    <Text style={[styles.bannerCTAText, { color: item.accentColor }]}>
                      Explorar Catálogo →
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            />

            {/* Banner Pagination Dots */}
            <View style={styles.paginationDots}>
              {PROMO_BANNERS.map((_, idx) => (
                <View
                  key={idx}
                  style={[
                    styles.dot,
                    activeBannerIndex === idx ? styles.dotActive : styles.dotInactive,
                  ]}
                />
              ))}
            </View>
          </View>

          {/* Section 1: GAMES DESTACADOS (Atacado Connect Layout) */}
          <View style={styles.catalogSection}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleBlock}>
                <View style={styles.sectionIndicator} />
                <Text style={styles.sectionTitle}>GAMES DESTACADOS</Text>
              </View>
              <TouchableOpacity onPress={() => setSelectedFilter(null)}>
                <Text style={styles.seeAllLink}>Ver todos</Text>
              </TouchableOpacity>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalProductsScroll}>
              {featuredProducts.map((item) => renderProductCard(item))}
            </ScrollView>
          </View>

          {/* Section 2: MJU - MI JUEGO USADO (Seminuevos & Canjes) */}
          <View style={styles.catalogSection}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleBlock}>
                <View style={[styles.sectionIndicator, { backgroundColor: '#F59E0B' }]} />
                <Text style={styles.sectionTitle}>MJU • MI JUEGO USADO</Text>
                <View style={styles.usadosMiniBadge}>
                  <Text style={styles.usadosMiniBadgeText}>Canjes</Text>
                </View>
              </View>
              <TouchableOpacity onPress={() => setSelectedFilter('mju')}>
                <Text style={styles.seeAllLink}>Ver catálogo</Text>
              </TouchableOpacity>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalProductsScroll}>
              {mjuProducts.map((item) => renderProductCard(item))}
            </ScrollView>
          </View>

          {/* Section 3: RETRO NOSTALGIA & COLECCIÓN JAPÓN */}
          <View style={styles.catalogSection}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleBlock}>
                <View style={[styles.sectionIndicator, { backgroundColor: '#38BDF8' }]} />
                <Text style={styles.sectionTitle}>RETRO & COLECCIÓN JAPÓN</Text>
              </View>
              <TouchableOpacity onPress={() => setSelectedFilter('retro')}>
                <Text style={styles.seeAllLink}>Ver catálogo</Text>
              </TouchableOpacity>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalProductsScroll}>
              {retroProducts.map((item) => renderProductCard(item))}
            </ScrollView>
          </View>

          <View style={{ height: 40 }} />
        </ScrollView>

        {/* Product Detail Modal (Full Screen Atacado Connect specs) */}
        {selectedProduct && (
          <ProductDetailModal
            visible={!!selectedProduct}
            product={selectedProduct}
            onClose={() => setSelectedProduct(null)}
            getImageSource={getProductImage}
          />
        )}

        {/* Shopping Cart Modal ("Minha Sacola" - Atacado Connect Style) */}
        <Modal
          visible={isCartVisible}
          animationType="slide"
          transparent
          onRequestClose={() => setIsCartVisible(false)}>
          <View style={styles.cartModalBackdrop}>
            <View style={styles.cartModalContainer}>
              <View style={styles.cartModalHandle} />

              <View style={styles.cartModalHeader}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Ionicons name="bag-handle" size={22} color="#F5A623" style={{ marginRight: 8 }} />
                  <Text style={styles.cartModalTitle}>Mi Bolsa de Compras</Text>
                </View>
                <TouchableOpacity onPress={() => setIsCartVisible(false)}>
                  <Ionicons name="close-circle" size={24} color="#71717A" />
                </TouchableOpacity>
              </View>

              {cart.length === 0 ? (
                <View style={styles.cartEmptyView}>
                  <Ionicons name="bag-outline" size={54} color="#3F3F46" />
                  <Text style={styles.cartEmptyTitle}>Tu bolsa está vacía</Text>
                  <Text style={styles.cartEmptySubtitle}>
                    Explora los juegos destacados y agrégalos a tu pedido.
                  </Text>
                  <TouchableOpacity
                    style={styles.cartContinueButton}
                    onPress={() => setIsCartVisible(false)}>
                    <Text style={styles.cartContinueButtonText}>Continuar Comprando</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <>
                  <ScrollView style={styles.cartItemsScroll} showsVerticalScrollIndicator={false}>
                    {cart.map((item) => (
                      <View key={item.product.id} style={styles.cartItemRow}>
                        <Image
                          source={getProductImage(item.product)}
                          style={styles.cartItemImage}
                          resizeMode="contain"
                        />
                        <View style={styles.cartItemDetails}>
                          <Text style={styles.cartItemTitle} numberOfLines={1}>
                            {item.product.title}
                          </Text>
                          <Text style={styles.cartItemPlatform}>{item.product.platform}</Text>
                          <Text style={styles.cartItemPrice}>
                            Bs. {Number(item.product.price).toFixed(2)}
                          </Text>
                        </View>

                        {/* Quantity Controls */}
                        <View style={styles.quantityControls}>
                          <TouchableOpacity
                            style={styles.qtyBtn}
                            onPress={() => updateCartQuantity(item.product.id, -1)}>
                            <Ionicons name="remove" size={14} color="#FFFFFF" />
                          </TouchableOpacity>
                          <Text style={styles.qtyValue}>{item.quantity}</Text>
                          <TouchableOpacity
                            style={styles.qtyBtn}
                            onPress={() => updateCartQuantity(item.product.id, 1)}>
                            <Ionicons name="add" size={14} color="#FFFFFF" />
                          </TouchableOpacity>
                        </View>
                      </View>
                    ))}
                  </ScrollView>

                  {/* Summary & WhatsApp Checkout */}
                  <View style={styles.cartFooter}>
                    <View style={styles.cartSummaryRow}>
                      <Text style={styles.cartSummaryLabel}>Total a pagar:</Text>
                      <Text style={styles.cartSummaryTotal}>Bs. {totalCartPrice.toFixed(2)}</Text>
                    </View>
                    <View style={styles.cartSummaryRow}>
                      <Text style={styles.cartPointsLabel}>🪙 Puntos a acumular:</Text>
                      <Text style={styles.cartPointsValue}>+{totalCartPoints} pts</Text>
                    </View>

                    <TouchableOpacity
                      style={styles.whatsappCheckoutBtn}
                      onPress={handleCheckoutWhatsApp}
                      activeOpacity={0.88}>
                      <Ionicons
                        name="logo-whatsapp"
                        size={20}
                        color="#FFFFFF"
                        style={{ marginRight: 8 }}
                      />
                      <Text style={styles.whatsappCheckoutBtnText}>
                        Finalizar Pedido por WhatsApp
                      </Text>
                    </TouchableOpacity>
                  </View>
                </>
              )}
            </View>
          </View>
        </Modal>

        {/* Secret Admin PIN Modal (opened via 2 taps on Gucci Games logo) */}
        <AdminPinModal
          visible={isAdminPinVisible}
          onClose={() => setIsAdminPinVisible(false)}
          onSuccess={() => {
            setIsAdminPinVisible(false);
            setIsAdminDashboardVisible(true);
          }}
        />

        {/* Admin Dashboard Full Screen Modal */}
        <Modal
          visible={isAdminDashboardVisible}
          animationType="slide"
          presentationStyle="fullScreen"
          onRequestClose={() => setIsAdminDashboardVisible(false)}
        >
          <ThemedView style={{ flex: 1, backgroundColor: '#0B0B0E' }}>
            <AdminDashboard
              onClose={() => {
                setIsAdminDashboardVisible(false);
                fetchProducts();
              }}
            />
          </ThemedView>
        </Modal>

      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B0B0E',
  },
  safeArea: {
    flex: 1,
  },
  tickerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 5,
    backgroundColor: '#121217',
    borderBottomWidth: 1,
    borderBottomColor: '#1A1A22',
  },
  tickerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  tickerMuted: {
    color: '#71717A',
    fontSize: 11,
    fontWeight: '500',
  },
  tickerGold: {
    color: '#F5A623',
    fontSize: 11,
    fontWeight: '700',
  },
  tickerDivider: {
    width: 1,
    height: 12,
    backgroundColor: '#272730',
  },
  mainHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 8,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#F5A623',
    borderWidth: 1,
    borderColor: 'rgba(245, 166, 35, 0.4)',
  },
  logoImage: {
    width: '100%',
    height: '100%',
  },
  brandName: {
    fontSize: 16,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 0.8,
  },
  brandTagline: {
    fontSize: 9,
    fontWeight: '700',
    color: '#F5A623',
    letterSpacing: 1.2,
  },
  headerActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerIconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#17171D',
    borderWidth: 1,
    borderColor: '#262632',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  bagIconButton: {
    backgroundColor: '#F5A623',
    borderColor: '#F5A623',
  },
  badgeIndicator: {
    position: 'absolute',
    top: -3,
    right: -3,
    backgroundColor: '#EF4444',
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  badgeIndicatorText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: 'bold',
  },
  cartBadgeIndicator: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#000000',
    borderRadius: 9,
    minWidth: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#F5A623',
    paddingHorizontal: 3,
  },
  cartBadgeText: {
    color: '#F5A623',
    fontSize: 10,
    fontWeight: '900',
  },
  searchBarWrapper: {
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#14141A',
    borderWidth: 1,
    borderColor: '#242430',
    borderRadius: 14,
    height: 44,
    paddingHorizontal: 14,
  },
  searchInput: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '500',
  },
  scrollContent: {
    paddingBottom: 24,
  },
  classificationSection: {
    marginBottom: 16,
  },
  classificationScroll: {
    paddingHorizontal: 16,
    gap: 10,
  },
  classificationCard: {
    alignItems: 'center',
    backgroundColor: '#131317',
    borderWidth: 1,
    borderColor: '#22222A',
    borderRadius: 16,
    paddingVertical: 10,
    paddingHorizontal: 12,
    minWidth: 78,
  },
  classificationCardSelected: {
    borderColor: '#F5A623',
    backgroundColor: 'rgba(245, 166, 35, 0.1)',
  },
  classificationIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#1C1C24',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  classificationIconCircleSelected: {
    backgroundColor: '#F5A623',
  },
  classificationName: {
    color: '#E4E4E7',
    fontSize: 11,
    fontWeight: '700',
  },
  classificationNameSelected: {
    color: '#F5A623',
  },
  classificationSub: {
    color: '#71717A',
    fontSize: 9,
    marginTop: 2,
  },
  bannerSection: {
    marginBottom: 20,
  },
  bannerCard: {
    width: width - 32,
    marginHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    padding: 18,
    position: 'relative',
    overflow: 'hidden',
  },
  bannerGlowEffect: {
    position: 'absolute',
    top: -20,
    right: -20,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(245, 166, 35, 0.08)',
  },
  bannerBadgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  bannerTagBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  bannerTagBadgeText: {
    color: '#000000',
    fontSize: 9,
    fontWeight: '900',
  },
  bannerMiniBadge: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  bannerTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  bannerSubtitle: {
    color: '#A1A1AA',
    fontSize: 12,
    lineHeight: 16,
    marginBottom: 12,
  },
  bannerCTA: {
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  bannerCTAText: {
    fontSize: 11,
    fontWeight: '700',
  },
  paginationDots: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    gap: 6,
  },
  dot: {
    height: 4,
    borderRadius: 2,
  },
  dotActive: {
    width: 20,
    backgroundColor: '#F5A623',
  },
  dotInactive: {
    width: 6,
    backgroundColor: '#272730',
  },
  catalogSection: {
    marginBottom: 22,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  sectionTitleBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionIndicator: {
    width: 4,
    height: 16,
    borderRadius: 2,
    backgroundColor: '#F5A623',
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 0.6,
  },
  usadosMiniBadge: {
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#F59E0B',
  },
  usadosMiniBadgeText: {
    color: '#F59E0B',
    fontSize: 9,
    fontWeight: 'bold',
  },
  seeAllLink: {
    color: '#F5A623',
    fontSize: 12,
    fontWeight: '700',
  },
  horizontalProductsScroll: {
    paddingHorizontal: 16,
    gap: 12,
  },
  cardContainer: {
    width: 165,
    backgroundColor: '#131318',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#22222A',
    padding: 12,
    position: 'relative',
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  pointsRewardBadge: {
    backgroundColor: 'rgba(245, 166, 35, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(245, 166, 35, 0.35)',
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  pointsRewardBadgeText: {
    color: '#F5A623',
    fontSize: 9,
    fontWeight: '800',
  },
  heartButton: {
    padding: 2,
  },
  cardImageContainer: {
    width: '100%',
    height: 110,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    backgroundColor: '#16161D',
    borderRadius: 14,
    overflow: 'hidden',
  },
  cardProductImage: {
    width: '85%',
    height: '85%',
  },
  cardTitle: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 17,
    minHeight: 34,
    marginBottom: 4,
  },
  cardMetaContainer: {
    marginBottom: 8,
  },
  cardCategoryText: {
    color: '#71717A',
    fontSize: 10,
    fontWeight: '500',
  },
  cardBrandText: {
    color: '#F5A623',
    fontSize: 10,
    fontWeight: '700',
  },
  cardDivider: {
    width: '100%',
    height: 1,
    backgroundColor: '#202028',
    marginBottom: 8,
  },
  cardPriceContainer: {
    marginBottom: 10,
  },
  cardPricePrimary: {
    color: '#F5A623',
    fontSize: 16,
    fontWeight: '900',
  },
  cardPriceSecondary: {
    color: '#71717A',
    fontSize: 11,
    fontWeight: '600',
    marginTop: 1,
  },
  cardFooterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  skuContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  skuText: {
    color: '#71717A',
    fontSize: 11,
    fontWeight: '500',
  },
  bagAddButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#F5A623',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cartModalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'flex-end',
  },
  cartModalContainer: {
    backgroundColor: '#14141A',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: '80%',
    borderWidth: 1,
    borderColor: '#262632',
  },
  cartModalHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#3F3F46',
    alignSelf: 'center',
    marginBottom: 14,
  },
  cartModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#22222C',
  },
  cartModalTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
  },
  cartEmptyView: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  cartEmptyTitle: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
    marginTop: 12,
  },
  cartEmptySubtitle: {
    color: '#71717A',
    fontSize: 13,
    textAlign: 'center',
    marginTop: 6,
    marginBottom: 20,
  },
  cartContinueButton: {
    backgroundColor: '#F5A623',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  cartContinueButtonText: {
    color: '#000000',
    fontSize: 13,
    fontWeight: '800',
  },
  cartItemsScroll: {
    maxHeight: 280,
  },
  cartItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#191922',
    borderRadius: 14,
    padding: 10,
    marginBottom: 10,
  },
  cartItemImage: {
    width: 45,
    height: 45,
    borderRadius: 8,
    marginRight: 10,
  },
  cartItemDetails: {
    flex: 1,
  },
  cartItemTitle: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  cartItemPlatform: {
    color: '#71717A',
    fontSize: 11,
  },
  cartItemPrice: {
    color: '#F5A623',
    fontSize: 13,
    fontWeight: '800',
    marginTop: 2,
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#121217',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  qtyBtn: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#262632',
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyValue: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  cartFooter: {
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#22222C',
  },
  cartSummaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  cartSummaryLabel: {
    color: '#A1A1AA',
    fontSize: 14,
    fontWeight: '600',
  },
  cartSummaryTotal: {
    color: '#F5A623',
    fontSize: 20,
    fontWeight: '900',
  },
  cartPointsLabel: {
    color: '#71717A',
    fontSize: 12,
  },
  cartPointsValue: {
    color: '#F5A623',
    fontSize: 13,
    fontWeight: '800',
  },
  whatsappCheckoutBtn: {
    backgroundColor: '#22C55E',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 48,
    borderRadius: 24,
    marginTop: 14,
  },
  whatsappCheckoutBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
});
