import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  Modal,
  Alert,
  ActivityIndicator,
  FlatList,
  Linking,
  Platform,
  Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import { supabase, supabaseAdmin } from '@/lib/supabase';
import { Database, ProductCategory } from '@/types/database';
import { useAuth } from '@/context/auth-context';
import { parseStockFromDescription, formatStockInDescription } from '@/lib/stockUtils';

type Product = Database['public']['Tables']['products']['Row'];
type Profile = Database['public']['Tables']['profiles']['Row'];
type Order = Database['public']['Tables']['orders']['Row'];
type OrderItem = Database['public']['Tables']['order_items']['Row'];

interface OrderWithItems extends Order {
  items: OrderItem[];
}

interface ProductRanking {
  product_id: string;
  title: string;
  platform: string;
  image_url: string;
  unit_price: number;
  total_units: number;
  total_revenue: number;
  is_available?: boolean;
}

const LOCAL_PRESET_IMAGES: { label: string; key: string; source: any }[] = [
  { label: 'Mario Party DS', key: 'game_mario_party', source: require('@/assets/images/game_mario_party.png') },
  { label: 'Mario Kart DS', key: 'game_mario_kart', source: require('@/assets/images/game_mario_kart.png') },
  { label: 'Super Mario 64', key: 'game_super_mario', source: require('@/assets/images/game_super_mario.png') },
  { label: 'Pokemon Platino', key: 'game_pokemon', source: require('@/assets/images/game_pokemon.png') },
  { label: 'Zelda Spirit Tracks', key: 'game_zelda', source: require('@/assets/images/game_zelda.png') },
  { label: 'Donkey Kong', key: 'game_donkey_kong', source: require('@/assets/images/game_donkey_kong.png') },
];

export default function AdminDashboard({ onClose }: { onClose?: () => void }) {
  const { profile, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState<'metrics' | 'products' | 'users' | 'orders'>('metrics');
  const [loading, setLoading] = useState(true);

  // Data states
  const [products, setProducts] = useState<Product[]>([]);
  const [profilesList, setProfilesList] = useState<Profile[]>([]);
  const [orders, setOrders] = useState<OrderWithItems[]>([]);
  const [ranking, setRanking] = useState<ProductRanking[]>([]);

  // Search & Filter
  const [productSearch, setProductSearch] = useState('');
  const [productCategoryFilter, setProductCategoryFilter] = useState<string>('all');
  const [userSearch, setUserSearch] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('all');
  const [rankingFilter, setRankingFilter] = useState<'all' | 'top'>('all');

  // Modal: Create/Edit Product
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [prodTitle, setProdTitle] = useState('');
  const [prodDescription, setProdDescription] = useState('');
  const [prodPrice, setProdPrice] = useState('');
  const [prodCategory, setProdCategory] = useState<ProductCategory>('general');
  const [prodPlatform, setProdPlatform] = useState('Nintendo DS');
  const [prodImageUrl, setProdImageUrl] = useState('game_mario_party');
  const [prodPoints, setProdPoints] = useState('30');
  const [prodStock, setProdStock] = useState('5');
  const [prodAvailable, setProdAvailable] = useState(true);
  const [savingProduct, setSavingProduct] = useState(false);
  const [compressingImage, setCompressingImage] = useState(false);
  const [imageCompressionInfo, setImageCompressionInfo] = useState<string | null>(null);

  // Modal: Give Points to User
  const [pointsUserModal, setPointsUserModal] = useState<Profile | null>(null);
  const [pointsAmount, setPointsAmount] = useState('50');
  const [pointsReason, setPointsReason] = useState('Recompensa especial');
  const [savingPoints, setSavingPoints] = useState(false);

  // Fetch all admin data
  const fetchAdminData = async () => {
    setLoading(true);
    try {
      // 1. Fetch Products
      const { data: prods } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });
      if (prods) setProducts(prods);

      // 2. Fetch Profiles
      const { data: profs } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });
      if (profs) setProfilesList(profs);

      // 3. Fetch Orders and Order Items
      const { data: ords } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      const { data: allItems } = await supabase
        .from('order_items')
        .select('*');

      if (ords) {
        const itemsMap: Record<string, OrderItem[]> = {};
        (allItems || []).forEach((it) => {
          if (!itemsMap[it.order_id]) itemsMap[it.order_id] = [];
          itemsMap[it.order_id].push(it);
        });

        const combinedOrders: OrderWithItems[] = ords.map((o) => ({
          ...o,
          items: itemsMap[o.id] || [],
        }));

        setOrders(combinedOrders);

        // 4. Calculate Ranking and Sales for ALL Products from Database
        const rankMap: Record<string, ProductRanking> = {};

        // Seed with all products in the database so every product is visible
        (prods || []).forEach((prod) => {
          rankMap[prod.id] = {
            product_id: prod.id,
            title: prod.title,
            platform: prod.platform,
            image_url: prod.image_url,
            unit_price: Number(prod.price) || 0,
            total_units: 0,
            total_revenue: 0,
            is_available: prod.is_available,
          };
        });

        // Accumulate sales from orders
        combinedOrders.forEach((order) => {
          order.items.forEach((item: OrderItem) => {
            let key = item.product_id;
            if (!key || !rankMap[key]) {
              const matched = (prods || []).find(
                (p) => p.title.toLowerCase().trim() === item.product_title.toLowerCase().trim()
              );
              if (matched) key = matched.id;
            }

            if (key && rankMap[key]) {
              rankMap[key].total_units += Number(item.quantity) || 1;
              rankMap[key].total_revenue +=
                (Number(item.unit_price) || rankMap[key].unit_price) * (Number(item.quantity) || 1);
            } else {
              const fallbackKey = item.product_title;
              if (!rankMap[fallbackKey]) {
                rankMap[fallbackKey] = {
                  product_id: item.product_id || '',
                  title: item.product_title,
                  platform: item.platform || 'General',
                  image_url: item.image_url || 'game_mario_party',
                  unit_price: Number(item.unit_price) || 0,
                  total_units: 0,
                  total_revenue: 0,
                };
              }
              rankMap[fallbackKey].total_units += Number(item.quantity) || 1;
              rankMap[fallbackKey].total_revenue +=
                (Number(item.unit_price) || 0) * (Number(item.quantity) || 1);
            }
          });
        });

        const sortedRank = Object.values(rankMap).sort((a, b) => {
          if (b.total_units !== a.total_units) {
            return b.total_units - a.total_units;
          }
          return b.total_revenue - a.total_revenue;
        });
        setRanking(sortedRank);
      }
    } catch (err) {
      console.error('Error fetching admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  // --- PRODUCT MANAGEMENT ---
  const handleOpenCreateProduct = () => {
    setEditingProduct(null);
    setProdTitle('');
    setProdDescription('');
    setProdPrice('');
    setProdCategory('general');
    setProdPlatform('Nintendo DS');
    setProdImageUrl('game_mario_party');
    setProdPoints('30');
    setProdStock('5');
    setProdAvailable(true);
    setImageCompressionInfo(null);
    setIsProductModalOpen(true);
  };

  const handleOpenEditProduct = (prod: Product) => {
    setEditingProduct(prod);
    setProdTitle(prod.title);
    const { stock, cleanDescription } = parseStockFromDescription(prod.description);
    setProdDescription(cleanDescription);
    setProdStock(stock.toString());
    setProdPrice(prod.price.toString());
    setProdCategory(prod.category);
    setProdPlatform(prod.platform);
    setProdImageUrl(prod.image_url);
    setProdPoints(prod.points_reward.toString());
    setProdAvailable(prod.is_available);
    setImageCompressionInfo(null);
    setIsProductModalOpen(true);
  };

  // Pick image from gallery or camera and compress it automatically
  const handlePickImage = async (useCamera: boolean = false) => {
    try {
      let result: ImagePicker.ImagePickerResult;

      if (useCamera) {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permiso Denegado', 'Se necesita permiso de cámara para tomar fotos de productos.');
          return;
        }
        result = await ImagePicker.launchCameraAsync({
          allowsEditing: true,
          aspect: [4, 3],
          quality: 0.9,
        });
      } else {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permiso Denegado', 'Se necesita permiso de galería para elegir fotos de productos.');
          return;
        }
        result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ['images'],
          allowsEditing: true,
          aspect: [4, 3],
          quality: 0.9,
        });
      }

      if (result.canceled || !result.assets || result.assets.length === 0) {
        return;
      }

      const pickedAsset = result.assets[0];
      setCompressingImage(true);

      // Auto-compress and reduce weight (width 900px, 0.72 JPEG compression)
      // This reduces an 8MB camera photo down to ~70-90KB for ultra-fast loading
      const manipResult = await ImageManipulator.manipulateAsync(
        pickedAsset.uri,
        [{ resize: { width: 900 } }],
        {
          compress: 0.72,
          format: ImageManipulator.SaveFormat.JPEG,
          base64: true,
        }
      );

      const compressedDataUri = `data:image/jpeg;base64,${manipResult.base64}`;
      const approxKb = manipResult.base64 ? Math.round((manipResult.base64.length * 3) / 4 / 1024) : 80;

      // Try uploading to Supabase Storage bucket 'product-images' if configured
      try {
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.jpg`;
        if (manipResult.base64) {
          const binaryString = atob(manipResult.base64);
          const bytes = new Uint8Array(binaryString.length);
          for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
          }

          const { data: uploadData, error: uploadErr } = await supabase.storage
            .from('product-images')
            .upload(fileName, bytes.buffer, {
              contentType: 'image/jpeg',
              upsert: false,
            });

          if (!uploadErr && uploadData) {
            const { data: urlData } = supabase.storage.from('product-images').getPublicUrl(uploadData.path);
            if (urlData?.publicUrl) {
              setProdImageUrl(urlData.publicUrl);
              setImageCompressionInfo(`⚡ Foto optimizada: ~${approxKb} KB (-85% peso reducido)`);
              return;
            }
          }
        }
      } catch (uploadCatch) {
        console.warn('Storage upload fallback to compressed Data URI:', uploadCatch);
      }

      // Safe immediate fallback: high efficiency compressed data URI
      setProdImageUrl(compressedDataUri);
      setImageCompressionInfo(`⚡ Foto optimizada: ~${approxKb} KB (-85% peso reducido)`);
    } catch (err: any) {
      Alert.alert('Error', err.message || 'No se pudo procesar la foto.');
    } finally {
      setCompressingImage(false);
    }
  };

  const handleSaveProduct = async () => {
    if (!prodTitle.trim()) {
      Alert.alert('Campo Requerido', 'Ingresa el nombre del producto.');
      return;
    }
    const numPrice = parseFloat(prodPrice);
    if (isNaN(numPrice) || numPrice <= 0) {
      Alert.alert('Precio Inválido', 'Ingresa un precio válido en Bolivianos.');
      return;
    }

    setSavingProduct(true);
    try {
      const numStock = parseInt(prodStock, 10);
      const finalStock = isNaN(numStock) ? 1 : Math.max(0, numStock);
      const finalDescription = formatStockInDescription(prodDescription, finalStock);
      const isAvail = finalStock > 0 && prodAvailable;

      const payload = {
        title: prodTitle.trim(),
        description: finalDescription,
        price: numPrice,
        category: prodCategory,
        platform: prodPlatform.trim(),
        image_url: prodImageUrl.trim() || 'game_mario_party',
        points_reward: parseInt(prodPoints, 10) || 30,
        is_available: isAvail,
        updated_at: new Date().toISOString(),
      };

      if (editingProduct) {
        // Update
        const { error } = await supabaseAdmin
          .from('products')
          .update(payload)
          .eq('id', editingProduct.id);

        if (error) throw error;
        Alert.alert('¡Producto Actualizado!', `"${prodTitle}" ha sido actualizado exitosamente.`);
      } else {
        // Create
        const { error } = await supabaseAdmin
          .from('products')
          .insert(payload);

        if (error) throw error;
        Alert.alert('¡Producto Publicado!', `"${prodTitle}" se encuentra disponible en la tienda.`);
      }

      setIsProductModalOpen(false);
      fetchAdminData();
    } catch (err: any) {
      Alert.alert('Error', err.message || 'No se pudo guardar el producto.');
    } finally {
      setSavingProduct(false);
    }
  };

  const handleDeleteProduct = (prod: Product) => {
    Alert.alert(
      'Eliminar Producto',
      `¿Estás seguro de que deseas eliminar permanentemente "${prod.title}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              // Optimistically remove from state so it disappears instantly from the UI
              setProducts((prev) => prev.filter((p) => p.id !== prod.id));

              // Delete directly from Supabase bypassing RLS with service role key
              const { error } = await supabaseAdmin.from('products').delete().eq('id', prod.id);
              if (error) throw error;

              // Also sync delete with web server local storage if accessible
              fetch(`http://192.168.31.140:3000/api/products?id=${prod.id}`, {
                method: 'DELETE',
              }).catch(() => {});

              Alert.alert('Eliminado', 'El producto ha sido eliminado del catálogo.');
              fetchAdminData();
            } catch (err: any) {
              Alert.alert('Error', err.message || 'No se pudo eliminar el producto.');
              fetchAdminData();
            }
          },
        },
      ]
    );
  };

  const handleToggleProductStock = async (prod: Product) => {
    try {
      const nextStock = !prod.is_available;
      const { error } = await supabaseAdmin
        .from('products')
        .update({ is_available: nextStock, updated_at: new Date().toISOString() })
        .eq('id', prod.id);

      if (error) throw error;
      setProducts(products.map((p) => (p.id === prod.id ? { ...p, is_available: nextStock } : p)));
    } catch (err: any) {
      Alert.alert('Error', err.message);
    }
  };

  // --- USER REWARDS ---
  const handleGivePoints = async () => {
    if (!pointsUserModal) return;
    const pts = parseInt(pointsAmount, 10);
    if (isNaN(pts) || pts === 0) {
      Alert.alert('Cantidad Inválida', 'Ingresa una cantidad válida de puntos.');
      return;
    }

    setSavingPoints(true);
    try {
      const newTotal = Math.max(0, pointsUserModal.gucci_points + pts);

      // Update profile
      const { error: profErr } = await supabaseAdmin
        .from('profiles')
        .update({ gucci_points: newTotal })
        .eq('id', pointsUserModal.id);

      if (profErr) throw profErr;

      // Log transaction
      await supabaseAdmin.from('point_transactions').insert({
        user_id: pointsUserModal.id,
        points_change: pts,
        reason: pointsReason.trim() || 'Ajuste manual de administrador',
        created_by: profile?.id || null,
      });

      Alert.alert(
        '¡Puntos Asignados!',
        `Se han asignado ${pts > 0 ? '+' : ''}${pts} pts a ${pointsUserModal.username}. Nuevo saldo: ${newTotal} pts.`
      );
      setPointsUserModal(null);
      fetchAdminData();
    } catch (err: any) {
      Alert.alert('Error', err.message || 'No se pudieron asignar los puntos.');
    } finally {
      setSavingPoints(false);
    }
  };

  // --- ORDER STATUS ---
  const handleUpdateOrderStatus = async (
    orderId: string,
    newStatus: 'pending' | 'confirmed' | 'completed' | 'cancelled'
  ) => {
    try {
      const { error } = await supabaseAdmin
        .from('orders')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', orderId);

      if (error) throw error;
      setOrders(orders.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o)));
    } catch (err: any) {
      Alert.alert('Error', err.message);
    }
  };

  // Helper Image
  const getImageSource = (imgKey: string) => {
    if (!imgKey) return LOCAL_PRESET_IMAGES[0].source;
    if (imgKey.startsWith('http') || imgKey.startsWith('data:') || imgKey.startsWith('file:')) {
      return { uri: imgKey };
    }
    if (imgKey.startsWith('/uploads')) {
      return { uri: `http://192.168.31.140:3000${imgKey}` };
    }
    const found = LOCAL_PRESET_IMAGES.find((p) => p.key === imgKey);
    if (found) return found.source;
    return LOCAL_PRESET_IMAGES[0].source;
  };

  // Calculated Totals
  const totalRevenueBs = orders.reduce((sum, o) => sum + Number(o.total_price), 0);
  const totalOrdersCount = orders.length;
  const totalUsersCount = profilesList.length;

  return (
    <View style={styles.container}>
      {/* Admin Top Header */}
      <View style={styles.header}>
        <View style={styles.headerTitleRow}>
          <View style={styles.adminBadge}>
            <Ionicons name="shield-checkmark" size={16} color="#000000" />
            <Text style={styles.adminBadgeText}>PANEL ADMINISTRATIVO</Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <TouchableOpacity
              style={styles.adminLogoutBtn}
              onPress={signOut}
              activeOpacity={0.8}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Ionicons name="log-out-outline" size={15} color="#EF4444" />
              <Text style={styles.adminLogoutText}>Cerrar Sesión</Text>
            </TouchableOpacity>
            {onClose && (
              <TouchableOpacity onPress={onClose} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
                <Ionicons name="close-circle" size={26} color="#A1A1AA" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        <Text style={styles.headerSubtitle}>
          Gestión de inventario, ventas, usuarios y catálogo de Gucci Games
        </Text>

        {/* Tab Navigation - Spacious Horizontal Scroll */}
        <View style={styles.tabBarWrapper}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.tabBarScroll}>
            <TouchableOpacity
              style={[styles.tabPill, activeTab === 'metrics' && styles.tabPillActive]}
              onPress={() => setActiveTab('metrics')}
              activeOpacity={0.8}>
              <Ionicons
                name="analytics"
                size={18}
                color={activeTab === 'metrics' ? '#000000' : '#A1A1AA'}
              />
              <Text style={[styles.tabPillText, activeTab === 'metrics' && styles.tabPillTextActive]}>
                Métricas
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tabPill, activeTab === 'products' && styles.tabPillActive]}
              onPress={() => setActiveTab('products')}
              activeOpacity={0.8}>
              <Ionicons
                name="game-controller"
                size={18}
                color={activeTab === 'products' ? '#000000' : '#A1A1AA'}
              />
              <Text style={[styles.tabPillText, activeTab === 'products' && styles.tabPillTextActive]}>
                Productos
              </Text>
              <View style={[styles.tabBadge, activeTab === 'products' && styles.tabBadgeActive]}>
                <Text style={[styles.tabBadgeText, activeTab === 'products' && styles.tabBadgeTextActive]}>
                  {products.length}
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tabPill, activeTab === 'orders' && styles.tabPillActive]}
              onPress={() => setActiveTab('orders')}
              activeOpacity={0.8}>
              <Ionicons
                name="receipt"
                size={18}
                color={activeTab === 'orders' ? '#000000' : '#A1A1AA'}
              />
              <Text style={[styles.tabPillText, activeTab === 'orders' && styles.tabPillTextActive]}>
                Compras
              </Text>
              <View style={[styles.tabBadge, activeTab === 'orders' && styles.tabBadgeActive]}>
                <Text style={[styles.tabBadgeText, activeTab === 'orders' && styles.tabBadgeTextActive]}>
                  {orders.length}
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tabPill, activeTab === 'users' && styles.tabPillActive]}
              onPress={() => setActiveTab('users')}
              activeOpacity={0.8}>
              <Ionicons
                name="people"
                size={18}
                color={activeTab === 'users' ? '#000000' : '#A1A1AA'}
              />
              <Text style={[styles.tabPillText, activeTab === 'users' && styles.tabPillTextActive]}>
                Usuarios
              </Text>
              <View style={[styles.tabBadge, activeTab === 'users' && styles.tabBadgeActive]}>
                <Text style={[styles.tabBadgeText, activeTab === 'users' && styles.tabBadgeTextActive]}>
                  {profilesList.length}
                </Text>
              </View>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#F5A623" />
          <Text style={styles.loadingText}>Cargando datos administrativos...</Text>
        </View>
      ) : (
        <ScrollView style={styles.contentScroll} showsVerticalScrollIndicator={false}>
          {/* ============================================================== */}
          {/* TAB 1: METRICS & TOP PRODUCTS (PRODUCTO MÁS COMPRADO) */}
          {/* ============================================================== */}
          {activeTab === 'metrics' && (
            <View style={styles.tabContent}>
              {/* Stat Cards Row */}
              <View style={styles.statsGrid}>
                <View style={styles.statCard}>
                  <View style={styles.statIconContainer}>
                    <Ionicons name="cash" size={20} color="#F5A623" />
                  </View>
                  <Text style={styles.statLabel}>Ventas Totales</Text>
                  <Text style={styles.statValue}>Bs. {totalRevenueBs.toFixed(2)}</Text>
                  <Text style={styles.statSubValue}>recaudados en tienda</Text>
                </View>

                <View style={styles.statCard}>
                  <View style={[styles.statIconContainer, { backgroundColor: 'rgba(56, 189, 248, 0.15)' }]}>
                    <Ionicons name="bag-check" size={20} color="#38BDF8" />
                  </View>
                  <Text style={styles.statLabel}>Total Pedidos</Text>
                  <Text style={styles.statValue}>{totalOrdersCount}</Text>
                  <Text style={styles.statSubValue}>pedidos registrados</Text>
                </View>

                <View style={styles.statCard}>
                  <View style={[styles.statIconContainer, { backgroundColor: 'rgba(52, 211, 153, 0.15)' }]}>
                    <Ionicons name="people" size={20} color="#34D399" />
                  </View>
                  <Text style={styles.statLabel}>Clientes Registrados</Text>
                  <Text style={styles.statValue}>{totalUsersCount}</Text>
                  <Text style={styles.statSubValue}>en la base de datos</Text>
                </View>

                <View style={styles.statCard}>
                  <View style={[styles.statIconContainer, { backgroundColor: 'rgba(245, 166, 35, 0.15)' }]}>
                    <Ionicons name="pricetags" size={20} color="#F5A623" />
                  </View>
                  <Text style={styles.statLabel}>Juegos en Stock</Text>
                  <Text style={styles.statValue}>{products.filter((p) => p.is_available).length}</Text>
                  <Text style={styles.statSubValue}>de {products.length} totales</Text>
                </View>
              </View>

              {/* SECTION: RANKING PRODUCTOS MÁS COMPRADOS */}
              <View style={styles.rankingSection}>
                <View style={styles.sectionHeaderCol}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                    <Ionicons name="trophy" size={20} color="#F5A623" style={{ marginRight: 8 }} />
                    <Text style={styles.sectionHeading}>Productos y Desempeño</Text>
                  </View>
                  <Text style={styles.sectionSubHeading}>
                    Catálogo completo ({products.length} juegos) ordenados por ventas
                  </Text>
                </View>

                {/* Filter Selector for Ranking */}
                <View style={styles.rankingFilterRow}>
                  <TouchableOpacity
                    style={[
                      styles.rankingFilterPill,
                      rankingFilter === 'all' && styles.rankingFilterPillActive,
                    ]}
                    onPress={() => setRankingFilter('all')}
                    activeOpacity={0.8}>
                    <Text
                      style={[
                        styles.rankingFilterText,
                        rankingFilter === 'all' && styles.rankingFilterTextActive,
                      ]}>
                      📦 Todo en Base de Datos ({ranking.length})
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.rankingFilterPill,
                      rankingFilter === 'top' && styles.rankingFilterPillActive,
                    ]}
                    onPress={() => setRankingFilter('top')}
                    activeOpacity={0.8}>
                    <Text
                      style={[
                        styles.rankingFilterText,
                        rankingFilter === 'top' && styles.rankingFilterTextActive,
                      ]}>
                      🔥 Con Ventas ({ranking.filter((r) => r.total_units > 0).length})
                    </Text>
                  </TouchableOpacity>
                </View>

                {(() => {
                  const filteredRanking =
                    rankingFilter === 'top'
                      ? ranking.filter((r) => r.total_units > 0)
                      : ranking;

                  if (filteredRanking.length === 0) {
                    return (
                      <View style={styles.emptyCard}>
                        <Text style={styles.emptyText}>No hay productos para mostrar en este filtro.</Text>
                      </View>
                    );
                  }

                  return filteredRanking.map((item, idx) => {
                    const isTop1 = idx === 0 && item.total_units > 0;
                    const isTop2 = idx === 1 && item.total_units > 0;
                    const isTop3 = idx === 2 && item.total_units > 0;
                    const hasSales = item.total_units > 0;

                    return (
                      <View key={item.product_id || idx} style={styles.rankingCard}>
                        {/* Rank Badge */}
                        <View
                          style={[
                            styles.rankBadge,
                            isTop1 && styles.rankBadgeGold,
                            isTop2 && styles.rankBadgeSilver,
                            isTop3 && styles.rankBadgeBronze,
                          ]}>
                          <Text
                            style={[
                              styles.rankBadgeText,
                              (isTop1 || isTop2 || isTop3) && { color: '#000000', fontWeight: '800' },
                            ]}>
                            #{idx + 1}
                          </Text>
                        </View>

                        {/* Thumbnail */}
                        <Image
                          source={getImageSource(item.image_url)}
                          style={styles.rankingImage}
                          resizeMode="contain"
                        />

                        {/* Info */}
                        <View style={styles.rankingInfo}>
                          <Text style={styles.rankingTitle} numberOfLines={1}>
                            {item.title}
                          </Text>
                          <Text style={styles.rankingPlatform}>
                            {item.platform} {item.is_available === false ? '• (Agotado)' : ''}
                          </Text>
                          <View style={styles.rankingMetricsRow}>
                            {hasSales ? (
                              <>
                                <Text style={styles.rankingUnitsText}>
                                  🔥 <Text style={{ color: '#F5A623', fontWeight: '700' }}>{item.total_units}</Text> vendidos
                                </Text>
                                <Text style={styles.rankingRevenueText}>
                                  Bs. {item.total_revenue.toFixed(2)}
                                </Text>
                              </>
                            ) : (
                              <>
                                <Text style={styles.rankingUnitsText}>
                                  📦 <Text style={{ color: '#A1A1AA' }}>Stock listo</Text>
                                </Text>
                                <Text style={[styles.rankingRevenueText, { color: '#F5A623' }]}>
                                  Bs. {item.unit_price.toFixed(2)}
                                </Text>
                              </>
                            )}
                          </View>
                        </View>
                      </View>
                    );
                  });
                })()}
              </View>
            </View>
          )}

          {/* ============================================================== */}
          {/* TAB 2: GESTIÓN Y PUBLICACIÓN DE PRODUCTOS */}
          {/* ============================================================== */}
          {activeTab === 'products' && (
            <View style={styles.tabContent}>
              {/* Action Button: Publish New Product */}
              <TouchableOpacity
                style={styles.publishMainButton}
                onPress={handleOpenCreateProduct}
                activeOpacity={0.88}>
                <Ionicons name="add-circle" size={22} color="#000000" style={{ marginRight: 8 }} />
                <Text style={styles.publishMainButtonText}>+ Publicar Nuevo Producto</Text>
              </TouchableOpacity>

              {/* Search & Category Pills */}
              <View style={styles.searchBarWrapper}>
                <Ionicons name="search" size={18} color="#71717A" style={{ marginLeft: 14 }} />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Buscar producto por nombre o plataforma..."
                  placeholderTextColor="#71717A"
                  value={productSearch}
                  onChangeText={setProductSearch}
                />
                {productSearch.length > 0 && (
                  <TouchableOpacity onPress={() => setProductSearch('')} style={{ padding: 8 }}>
                    <Ionicons name="close" size={16} color="#A1A1AA" />
                  </TouchableOpacity>
                )}
              </View>

              {/* Product Category Filter Pills */}
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterPillsRow}>
                {['all', 'general', 'mju', 'retro'].map((cat) => (
                  <TouchableOpacity
                    key={cat}
                    style={[
                      styles.filterPill,
                      productCategoryFilter === cat && styles.filterPillActive,
                    ]}
                    onPress={() => setProductCategoryFilter(cat)}>
                    <Text
                      style={[
                        styles.filterPillText,
                        productCategoryFilter === cat && styles.filterPillTextActive,
                      ]}>
                      {cat === 'all'
                        ? 'Todos'
                        : cat === 'general'
                        ? 'GAMES'
                        : cat === 'mju'
                        ? 'MJU Usados'
                        : 'Retro Colección'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              {/* Products List */}
              <View style={{ marginTop: 12 }}>
                {products
                  .filter((p) => {
                    const matchesSearch =
                      p.title.toLowerCase().includes(productSearch.toLowerCase()) ||
                      p.platform.toLowerCase().includes(productSearch.toLowerCase());
                    const matchesCategory =
                      productCategoryFilter === 'all' || p.category === productCategoryFilter;
                    return matchesSearch && matchesCategory;
                  })
                  .map((prod) => (
                    <View key={prod.id} style={styles.productAdminCard}>
                      <Image
                        source={getImageSource(prod.image_url)}
                        style={styles.productAdminImage}
                        resizeMode="contain"
                      />

                      <View style={styles.productAdminDetails}>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                          <Text style={styles.productAdminTitle} numberOfLines={1}>
                            {prod.title}
                          </Text>
                        </View>
                        <Text style={styles.productAdminPlatform}>
                          {prod.platform} • {prod.category.toUpperCase()}
                        </Text>
                        <Text style={styles.productAdminPrice}>
                          Bs. {Number(prod.price).toFixed(2)}{' '}
                          <Text style={{ fontSize: 12, color: '#F5A623' }}>
                            (+{prod.points_reward} pts)
                          </Text>
                        </Text>

                        {/* Stock Info & Switch */}
                        <View style={styles.stockToggleRow}>
                          {(() => {
                            const { stock } = parseStockFromDescription(prod.description);
                            return (
                              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                                <Text
                                  style={[
                                    styles.stockToggleLabel,
                                    { color: prod.is_available ? '#34D399' : '#EF4444' },
                                  ]}>
                                  {prod.is_available ? '● En Stock' : '○ Agotado'}
                                </Text>
                                <View style={{ backgroundColor: stock > 2 ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 }}>
                                  <Text style={{ fontSize: 11, fontWeight: '700', color: stock > 2 ? '#10B981' : '#EF4444' }}>
                                    {stock} {stock === 1 ? 'unidad' : 'unidades'}
                                  </Text>
                                </View>
                              </View>
                            );
                          })()}
                          <Switch
                            value={prod.is_available}
                            onValueChange={() => handleToggleProductStock(prod)}
                            trackColor={{ false: '#3F3F46', true: '#F5A623' }}
                            thumbColor="#FFFFFF"
                          />
                        </View>
                      </View>

                      {/* Edit & Delete Buttons */}
                      <View style={styles.productAdminActions}>
                        <TouchableOpacity
                          style={styles.actionBtnEdit}
                          onPress={() => handleOpenEditProduct(prod)}>
                          <Ionicons name="pencil" size={16} color="#FFFFFF" />
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={styles.actionBtnDelete}
                          onPress={() => handleDeleteProduct(prod)}>
                          <Ionicons name="trash-outline" size={16} color="#EF4444" />
                        </TouchableOpacity>
                      </View>
                    </View>
                  ))}
              </View>
            </View>
          )}

          {/* ============================================================== */}
          {/* TAB 3: HISTORIAL DE COMPRAS & PEDIDOS */}
          {/* ============================================================== */}
          {activeTab === 'orders' && (
            <View style={styles.tabContent}>
              {/* Order Status Filters */}
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterPillsRow}>
                {['all', 'pending', 'confirmed', 'completed', 'cancelled'].map((st) => (
                  <TouchableOpacity
                    key={st}
                    style={[
                      styles.filterPill,
                      orderStatusFilter === st && styles.filterPillActive,
                    ]}
                    onPress={() => setOrderStatusFilter(st)}>
                    <Text
                      style={[
                        styles.filterPillText,
                        orderStatusFilter === st && styles.filterPillTextActive,
                      ]}>
                      {st === 'all'
                        ? 'Todos los Pedidos'
                        : st === 'pending'
                        ? '🟡 Pendientes'
                        : st === 'confirmed'
                        ? '🟢 Confirmados'
                        : st === 'completed'
                        ? '📦 Entregados'
                        : '🔴 Cancelados'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              {orders
                .filter((o) => (orderStatusFilter === 'all' ? true : o.status === orderStatusFilter))
                .map((order) => {
                  const statusColors: Record<string, string> = {
                    pending: '#F5A623',
                    confirmed: '#38BDF8',
                    completed: '#34D399',
                    cancelled: '#EF4444',
                  };
                  const statusColor = statusColors[order.status] || '#F5A623';

                  return (
                    <View key={order.id} style={styles.orderCard}>
                      {/* Order Header */}
                      <View style={styles.orderCardHeader}>
                        <View>
                          <Text style={styles.orderCode}>PEDIDO #{order.id.slice(0, 8).toUpperCase()}</Text>
                          <Text style={styles.orderDate}>
                            {new Date(order.created_at).toLocaleDateString('es-ES', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </Text>
                        </View>
                        <View style={[styles.statusBadge, { borderColor: statusColor }]}>
                          <Text style={[styles.statusBadgeText, { color: statusColor }]}>
                            {order.status.toUpperCase()}
                          </Text>
                        </View>
                      </View>

                      {/* Customer Info */}
                      <View style={styles.customerRow}>
                        <Ionicons name="person-circle-outline" size={20} color="#F5A623" />
                        <Text style={styles.customerName}>{order.customer_name}</Text>
                        {order.customer_phone && (
                          <TouchableOpacity
                            style={styles.customerWhatsAppBtn}
                            onPress={() => {
                              const cleanPhone = order.customer_phone?.replace(/\D/g, '') || '';
                              Linking.openURL(`https://wa.me/${cleanPhone}`);
                            }}>
                            <Ionicons name="logo-whatsapp" size={14} color="#34D399" />
                            <Text style={styles.customerPhoneText}>{order.customer_phone}</Text>
                          </TouchableOpacity>
                        )}
                      </View>

                      {/* Items List */}
                      <View style={styles.orderItemsContainer}>
                        {(order.items || []).map((item) => (
                          <View key={item.id} style={styles.orderItemLine}>
                            <Text style={styles.orderItemQty}>{item.quantity}x</Text>
                            <Text style={styles.orderItemName} numberOfLines={1}>
                              {item.product_title}
                            </Text>
                            <Text style={styles.orderItemPrice}>
                              Bs. {(Number(item.unit_price) * item.quantity).toFixed(2)}
                            </Text>
                          </View>
                        ))}
                      </View>

                      {/* Order Footer Total */}
                      <View style={styles.orderCardFooter}>
                        <View>
                          <Text style={styles.orderFooterTotalLabel}>Total Pedido:</Text>
                          <Text style={styles.orderFooterTotalValue}>
                            Bs. {Number(order.total_price).toFixed(2)}
                          </Text>
                        </View>

                        {/* Status Change Buttons */}
                        <View style={styles.statusButtonsGroup}>
                          {order.status !== 'confirmed' && (
                            <TouchableOpacity
                              style={[styles.statusQuickBtn, { borderColor: '#38BDF8' }]}
                              onPress={() => handleUpdateOrderStatus(order.id, 'confirmed')}>
                              <Text style={[styles.statusQuickBtnText, { color: '#38BDF8' }]}>
                                Confirmar
                              </Text>
                            </TouchableOpacity>
                          )}
                          {order.status !== 'completed' && (
                            <TouchableOpacity
                              style={[styles.statusQuickBtn, { borderColor: '#34D399' }]}
                              onPress={() => handleUpdateOrderStatus(order.id, 'completed')}>
                              <Text style={[styles.statusQuickBtnText, { color: '#34D399' }]}>
                                Entregar
                              </Text>
                            </TouchableOpacity>
                          )}
                          {order.status !== 'cancelled' && (
                            <TouchableOpacity
                              style={[styles.statusQuickBtn, { borderColor: '#EF4444' }]}
                              onPress={() => handleUpdateOrderStatus(order.id, 'cancelled')}>
                              <Text style={[styles.statusQuickBtnText, { color: '#EF4444' }]}>
                                Cancelar
                              </Text>
                            </TouchableOpacity>
                          )}
                        </View>
                      </View>
                    </View>
                  );
                })}
            </View>
          )}

          {/* ============================================================== */}
          {/* TAB 4: USUARIOS REGISTRADOS & GESTIÓN DE ROLES/PUNTOS */}
          {/* ============================================================== */}
          {activeTab === 'users' && (
            <View style={styles.tabContent}>
              {/* User Search Input */}
              <View style={styles.searchBarWrapper}>
                <Ionicons name="search" size={18} color="#71717A" style={{ marginLeft: 14 }} />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Buscar cliente por usuario o email..."
                  placeholderTextColor="#71717A"
                  value={userSearch}
                  onChangeText={setUserSearch}
                />
              </View>

              <View style={{ marginTop: 12 }}>
                {profilesList
                  .filter((u) => {
                    return (
                      u.username.toLowerCase().includes(userSearch.toLowerCase()) ||
                      (u.email && u.email.toLowerCase().includes(userSearch.toLowerCase()))
                    );
                  })
                  .map((user) => {
                    const isAdmin = user.role === 'admin';

                    return (
                      <View key={user.id} style={styles.userCard}>
                        <View style={styles.userCardHeader}>
                          {/* Avatar Circle */}
                          <View
                            style={[
                              styles.userAvatar,
                              isAdmin && { backgroundColor: '#F5A623', borderColor: '#FFD700' },
                            ]}>
                            <Text
                              style={[
                                styles.userAvatarText,
                                isAdmin && { color: '#000000', fontWeight: '800' },
                              ]}>
                              {user.username.slice(0, 2).toUpperCase()}
                            </Text>
                          </View>

                          {/* Info */}
                          <View style={styles.userCardDetails}>
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                              <Text style={styles.userCardUsername}>{user.username}</Text>
                              {isAdmin && (
                                <View style={styles.userAdminRoleBadge}>
                                  <Text style={styles.userAdminRoleText}>ADMIN</Text>
                                </View>
                              )}
                            </View>
                            <Text style={styles.userCardEmail}>{user.email || 'Sin correo registrado'}</Text>
                            <Text style={styles.userCardDate}>
                              Registrado: {new Date(user.created_at).toLocaleDateString()}
                            </Text>
                          </View>
                        </View>

                        {/* Points & Actions */}
                        <View style={styles.userCardFooter}>
                          <View style={styles.userPointsDisplay}>
                            <Ionicons name="star" size={16} color="#F5A623" />
                            <Text style={styles.userPointsValue}>{user.gucci_points} pts</Text>
                          </View>

                          <View style={styles.userActionButtons}>
                            <TouchableOpacity
                              style={styles.userGivePointsBtn}
                              onPress={() => setPointsUserModal(user)}>
                              <Ionicons name="gift-outline" size={15} color="#000000" />
                              <Text style={styles.userGivePointsBtnText}>Puntos</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                              style={[
                                styles.userRoleToggleBtn,
                                isAdmin && { borderColor: '#EF4444' },
                              ]}
                              onPress={() => {
                                const newRole = isAdmin ? 'client' : 'admin';
                                Alert.alert(
                                  'Cambiar Rol de Usuario',
                                  `¿Deseas cambiar el rol de ${user.username} a ${newRole.toUpperCase()}?`,
                                  [
                                    { text: 'Cancelar', style: 'cancel' },
                                    {
                                      text: 'Cambiar Rol',
                                      onPress: async () => {
                                        try {
                                          const { error } = await supabase.rpc('set_user_role', {
                                            p_user_id: user.id,
                                            p_role: newRole,
                                          });
                                          if (error) {
                                            await supabase
                                              .from('profiles')
                                              .update({ role: newRole })
                                              .eq('id', user.id);
                                          }
                                          fetchAdminData();
                                          Alert.alert(
                                            'Rol Actualizado',
                                            `El usuario ${user.username} ahora es ${
                                              newRole === 'admin' ? 'ADMINISTRADOR' : 'CLIENTE'
                                            }.`
                                          );
                                        } catch (e: any) {
                                          Alert.alert('Error', e.message);
                                        }
                                      },
                                    },
                                  ]
                                );
                              }}>
                              <Text
                                style={[
                                  styles.userRoleToggleBtnText,
                                  isAdmin && { color: '#EF4444' },
                                ]}>
                                {isAdmin ? 'Quitar Admin' : 'Hacer Admin'}
                              </Text>
                            </TouchableOpacity>
                          </View>
                        </View>
                      </View>
                    );
                  })}
              </View>
            </View>
          )}

          <View style={{ height: 40 }} />
        </ScrollView>
      )}

      {/* ============================================================== */}
      {/* MODAL: PUBLICAR / EDITAR PRODUCTO */}
      {/* ============================================================== */}
      <Modal
        visible={isProductModalOpen}
        animationType="slide"
        transparent
        onRequestClose={() => setIsProductModalOpen(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeaderRow}>
              <Text style={styles.modalHeaderTitle}>
                {editingProduct ? 'Editar Producto' : 'Publicar Nuevo Producto'}
              </Text>
              <TouchableOpacity onPress={() => setIsProductModalOpen(false)}>
                <Ionicons name="close-circle" size={24} color="#71717A" />
              </TouchableOpacity>
            </View>

            <ScrollView style={{ maxHeight: 460 }} showsVerticalScrollIndicator={false}>
              {/* Product Title */}
              <Text style={styles.inputLabel}>Título del Juego o Producto *</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="Ej: Pokemon HeartGold DS"
                placeholderTextColor="#71717A"
                value={prodTitle}
                onChangeText={setProdTitle}
              />

              {/* Price & Points */}
              <View style={{ flexDirection: 'row', gap: 12 }}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.inputLabel}>Precio en Bolivianos (Bs.) *</Text>
                  <TextInput
                    style={styles.modalInput}
                    placeholder="Ej: 280"
                    placeholderTextColor="#71717A"
                    keyboardType="numeric"
                    value={prodPrice}
                    onChangeText={setProdPrice}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.inputLabel}>Puntos Gucci *</Text>
                  <TextInput
                    style={styles.modalInput}
                    placeholder="Ej: 40"
                    placeholderTextColor="#71717A"
                    keyboardType="numeric"
                    value={prodPoints}
                    onChangeText={setProdPoints}
                  />
                </View>
              </View>

              {/* Stock disponible */}
              <View style={{ marginBottom: 12 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text style={styles.inputLabel}>Stock Disponible (Unidades en inventario) *</Text>
                  {parseInt(prodStock, 10) <= 0 ? (
                    <Text style={{ fontSize: 11, fontWeight: '700', color: '#EF4444' }}>Agotado (0)</Text>
                  ) : parseInt(prodStock, 10) <= 2 ? (
                    <Text style={{ fontSize: 11, fontWeight: '700', color: '#F59E0B' }}>¡Últimas unidades!</Text>
                  ) : (
                    <Text style={{ fontSize: 11, fontWeight: '700', color: '#10B981' }}>Disponible ({prodStock} uds.)</Text>
                  )}
                </View>
                <TextInput
                  style={styles.modalInput}
                  placeholder="Ej: 5 (¿Cuántas unidades tienes disponibles?)"
                  placeholderTextColor="#71717A"
                  keyboardType="numeric"
                  value={prodStock}
                  onChangeText={(val) => {
                    setProdStock(val);
                    const n = parseInt(val, 10);
                    if (!isNaN(n) && n === 0) {
                      setProdAvailable(false);
                    } else if (!isNaN(n) && n > 0 && !prodAvailable) {
                      setProdAvailable(true);
                    }
                  }}
                />
              </View>

              {/* Category Selector */}
              <Text style={styles.inputLabel}>Categoría *</Text>
              <View style={styles.categoryPillsSelect}>
                {(['general', 'mju', 'retro'] as ProductCategory[]).map((cat) => (
                  <TouchableOpacity
                    key={cat}
                    style={[
                      styles.categoryOptionPill,
                      prodCategory === cat && styles.categoryOptionPillActive,
                    ]}
                    onPress={() => setProdCategory(cat)}>
                    <Text
                      style={[
                        styles.categoryOptionText,
                        prodCategory === cat && styles.categoryOptionTextActive,
                      ]}>
                      {cat === 'general' ? 'Games Nuevos' : cat === 'mju' ? 'MJU Usados' : 'Retro'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Platform */}
              <Text style={styles.inputLabel}>Plataforma / Consola *</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="Ej: Nintendo DS, Switch, Game Boy, PS5"
                placeholderTextColor="#71717A"
                value={prodPlatform}
                onChangeText={setProdPlatform}
              />

              {/* Photo Upload & Compression Section */}
              <Text style={styles.inputLabel}>Foto del Producto *</Text>
              
              <View style={styles.imageUploadCard}>
                {compressingImage ? (
                  <View style={styles.compressingBox}>
                    <ActivityIndicator size="large" color="#F5A623" />
                    <Text style={styles.compressingText}>Optimizando y reduciendo peso de la foto...</Text>
                    <Text style={styles.compressingSubText}>Comprimiendo a formato liviano para no saturar memoria</Text>
                  </View>
                ) : prodImageUrl && !LOCAL_PRESET_IMAGES.some(p => p.key === prodImageUrl) ? (
                  <View style={styles.imagePreviewWrapper}>
                    <Image
                      source={getImageSource(prodImageUrl)}
                      style={styles.imagePreviewLarge}
                      resizeMode="cover"
                    />
                    <View style={styles.imageActionButtonsRow}>
                      <TouchableOpacity
                        style={styles.imageChangeBtn}
                        onPress={() => handlePickImage(false)}
                        activeOpacity={0.8}>
                        <Ionicons name="images" size={15} color="#000000" />
                        <Text style={styles.imageChangeBtnText}>Galería</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.imageChangeBtn}
                        onPress={() => handlePickImage(true)}
                        activeOpacity={0.8}>
                        <Ionicons name="camera" size={15} color="#000000" />
                        <Text style={styles.imageChangeBtnText}>Cámara</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.imageRemoveBtn}
                        onPress={() => {
                          setProdImageUrl('game_mario_party');
                          setImageCompressionInfo(null);
                        }}
                        activeOpacity={0.8}>
                        <Ionicons name="trash-outline" size={16} color="#EF4444" />
                      </TouchableOpacity>
                    </View>
                  </View>
                ) : (
                  <View style={styles.emptyImageUploadBox}>
                    <Ionicons name="cloud-upload-outline" size={36} color="#F5A623" />
                    <Text style={styles.emptyUploadTitle}>Sube la foto del producto</Text>
                    <Text style={styles.emptyUploadSub}>Se comprime automáticamente para reducir su peso</Text>

                    <View style={{ flexDirection: 'row', gap: 10, marginTop: 12 }}>
                      <TouchableOpacity
                        style={styles.pickImageActionBtn}
                        onPress={() => handlePickImage(false)}
                        activeOpacity={0.85}>
                        <Ionicons name="images" size={16} color="#000000" style={{ marginRight: 6 }} />
                        <Text style={styles.pickImageActionBtnText}>Elegir de Galería</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={[styles.pickImageActionBtn, { backgroundColor: '#1C1C24', borderWidth: 1, borderColor: '#F5A623' }]}
                        onPress={() => handlePickImage(true)}
                        activeOpacity={0.85}>
                        <Ionicons name="camera" size={16} color="#F5A623" style={{ marginRight: 6 }} />
                        <Text style={[styles.pickImageActionBtnText, { color: '#F5A623' }]}>Tomar Foto</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}

                {/* Compression stats banner */}
                {imageCompressionInfo && (
                  <View style={styles.compressionBadge}>
                    <Ionicons name="flash" size={13} color="#10B981" />
                    <Text style={styles.compressionBadgeText}>{imageCompressionInfo}</Text>
                  </View>
                )}
              </View>

              {/* Preset Image Selector */}
              <Text style={styles.inputLabel}>O selecciona una carátula rápida</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
                {LOCAL_PRESET_IMAGES.map((img) => (
                  <TouchableOpacity
                    key={img.key}
                    style={[
                      styles.presetImageBtn,
                      prodImageUrl === img.key && styles.presetImageBtnActive,
                    ]}
                    onPress={() => {
                      setProdImageUrl(img.key);
                      setImageCompressionInfo(null);
                    }}>
                    <Image source={img.source} style={styles.presetImageThumb} resizeMode="contain" />
                    <Text style={styles.presetImageText} numberOfLines={1}>
                      {img.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              {/* Custom Image URL fallback */}
              <TextInput
                style={styles.modalInput}
                placeholder="O pega una URL de imagen (https://...)"
                placeholderTextColor="#71717A"
                value={prodImageUrl.startsWith('data:') ? 'Imagen personalizada cargada' : prodImageUrl}
                onChangeText={(t) => {
                  setProdImageUrl(t);
                  setImageCompressionInfo(null);
                }}
              />

              {/* Description */}
              <Text style={styles.inputLabel}>Descripción del Producto</Text>
              <TextInput
                style={[styles.modalInput, { height: 75, textAlignVertical: 'top' }]}
                placeholder="Detalles sobre el estado del juego, manual, caja original..."
                placeholderTextColor="#71717A"
                multiline
                value={prodDescription}
                onChangeText={setProdDescription}
              />

              {/* In Stock Switch */}
              <View style={styles.switchRowModal}>
                <Text style={styles.switchRowModalLabel}>Disponible para la Venta (En Stock)</Text>
                <Switch
                  value={prodAvailable}
                  onValueChange={setProdAvailable}
                  trackColor={{ false: '#3F3F46', true: '#F5A623' }}
                  thumbColor="#FFFFFF"
                />
              </View>
            </ScrollView>

            {/* Modal Actions */}
            <View style={styles.modalFooterActions}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setIsProductModalOpen(false)}>
                <Text style={styles.modalCancelBtnText}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalSubmitBtn, savingProduct && { opacity: 0.6 }]}
                onPress={handleSaveProduct}
                disabled={savingProduct}>
                {savingProduct ? (
                  <ActivityIndicator color="#000000" />
                ) : (
                  <Text style={styles.modalSubmitBtnText}>
                    {editingProduct ? 'Guardar Cambios' : 'Publicar Producto'}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ============================================================== */}
      {/* MODAL: ASIGNAR PUNTOS A CLIENTE */}
      {/* ============================================================== */}
      <Modal
        visible={!!pointsUserModal}
        animationType="fade"
        transparent
        onRequestClose={() => setPointsUserModal(null)}>
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalCard, { maxWidth: 360 }]}>
            <Text style={styles.modalHeaderTitle}>Asignar Gucci Points</Text>
            <Text style={styles.pointsModalSub}>
              Usuario: <Text style={{ color: '#F5A623', fontWeight: '700' }}>{pointsUserModal?.username}</Text>
            </Text>
            <Text style={{ color: '#A1A1AA', fontSize: 13, marginBottom: 14 }}>
              Saldo actual: {pointsUserModal?.gucci_points} pts
            </Text>

            <Text style={styles.inputLabel}>Cantidad de Puntos a otorgar</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Ej: 50 (o -20 para descontar)"
              placeholderTextColor="#71717A"
              keyboardType="numeric"
              value={pointsAmount}
              onChangeText={setPointsAmount}
            />

            <Text style={styles.inputLabel}>Motivo del ajuste</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Ej: Bonificación por compra en tienda"
              placeholderTextColor="#71717A"
              value={pointsReason}
              onChangeText={setPointsReason}
            />

            <View style={styles.modalFooterActions}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setPointsUserModal(null)}>
                <Text style={styles.modalCancelBtnText}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalSubmitBtn, savingPoints && { opacity: 0.6 }]}
                onPress={handleGivePoints}
                disabled={savingPoints}>
                {savingPoints ? (
                  <ActivityIndicator color="#000000" />
                ) : (
                  <Text style={styles.modalSubmitBtnText}>Guardar Puntos</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B0B0E',
  },
  header: {
    backgroundColor: '#121217',
    borderBottomWidth: 1,
    borderBottomColor: '#27272A',
    paddingTop: Platform.OS === 'ios' ? 52 : 36,
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  headerTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  adminBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5A623',
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: 20,
    gap: 6,
  },
  adminBadgeText: {
    color: '#000000',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  adminLogoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
    gap: 5,
  },
  adminLogoutText: {
    color: '#EF4444',
    fontSize: 12,
    fontWeight: '700',
  },
  headerSubtitle: {
    color: '#A1A1AA',
    fontSize: 13,
    marginBottom: 10,
    lineHeight: 18,
  },
  tabBarWrapper: {
    marginBottom: 4,
  },
  tabBarScroll: {
    paddingVertical: 2,
    paddingHorizontal: 2,
    gap: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  tabPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#18181D',
    borderWidth: 1,
    borderColor: '#2E2E38',
    borderRadius: 22,
    paddingVertical: 8,
    paddingHorizontal: 15,
    gap: 7,
  },
  tabPillActive: {
    backgroundColor: '#F5A623',
    borderColor: '#F5A623',
  },
  tabPillText: {
    color: '#A1A1AA',
    fontSize: 13,
    fontWeight: '600',
  },
  tabPillTextActive: {
    color: '#000000',
    fontWeight: '800',
  },
  tabBadge: {
    backgroundColor: '#27272A',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 10,
  },
  tabBadgeActive: {
    backgroundColor: 'rgba(0, 0, 0, 0.22)',
  },
  tabBadgeText: {
    color: '#D4D4D8',
    fontSize: 11,
    fontWeight: '700',
  },
  tabBadgeTextActive: {
    color: '#000000',
    fontWeight: '800',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    color: '#A1A1AA',
    fontSize: 14,
    marginTop: 12,
  },
  contentScroll: {
    flex: 1,
  },
  tabContent: {
    padding: 16,
  },
  // STATS GRID
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#141418',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#27272A',
  },
  statIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(245, 166, 35, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statLabel: {
    color: '#A1A1AA',
    fontSize: 12,
    fontWeight: '500',
  },
  statValue: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
    marginTop: 2,
  },
  statSubValue: {
    color: '#71717A',
    fontSize: 11,
    marginTop: 2,
  },
  // RANKING SECTION
  rankingSection: {
    backgroundColor: '#141418',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#27272A',
  },
  sectionHeaderCol: {
    marginBottom: 12,
  },
  sectionHeading: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
  sectionSubHeading: {
    color: '#A1A1AA',
    fontSize: 12,
    lineHeight: 16,
  },
  rankingFilterRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#202026',
  },
  rankingFilterPill: {
    backgroundColor: '#1B1B22',
    borderWidth: 1,
    borderColor: '#2E2E38',
    borderRadius: 16,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  rankingFilterPillActive: {
    backgroundColor: 'rgba(245, 166, 35, 0.15)',
    borderColor: '#F5A623',
  },
  rankingFilterText: {
    color: '#A1A1AA',
    fontSize: 12,
    fontWeight: '600',
  },
  rankingFilterTextActive: {
    color: '#F5A623',
    fontWeight: '700',
  },
  rankingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1B1B22',
    borderRadius: 12,
    padding: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#27272A',
  },
  rankBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#27272A',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  rankBadgeGold: {
    backgroundColor: '#F5A623',
  },
  rankBadgeSilver: {
    backgroundColor: '#E4E4E7',
  },
  rankBadgeBronze: {
    backgroundColor: '#D97706',
  },
  rankBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  rankingImage: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: '#121217',
    marginRight: 10,
  },
  rankingInfo: {
    flex: 1,
  },
  rankingTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  rankingPlatform: {
    color: '#71717A',
    fontSize: 12,
    marginTop: 1,
  },
  rankingMetricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  rankingUnitsText: {
    color: '#A1A1AA',
    fontSize: 12,
  },
  rankingRevenueText: {
    color: '#34D399',
    fontSize: 13,
    fontWeight: '700',
  },
  emptyCard: {
    padding: 24,
    alignItems: 'center',
  },
  emptyText: {
    color: '#71717A',
    fontSize: 13,
  },
  // PRODUCTS TAB
  publishMainButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F5A623',
    height: 48,
    borderRadius: 12,
    marginBottom: 14,
  },
  publishMainButtonText: {
    color: '#000000',
    fontSize: 15,
    fontWeight: '800',
  },
  searchBarWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#16161B',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#27272A',
    height: 44,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    color: '#FFFFFF',
    paddingHorizontal: 10,
    fontSize: 14,
  },
  filterPillsRow: {
    marginBottom: 8,
  },
  filterPill: {
    backgroundColor: '#18181D',
    borderWidth: 1,
    borderColor: '#27272A',
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 14,
    marginRight: 8,
  },
  filterPillActive: {
    backgroundColor: '#F5A623',
    borderColor: '#F5A623',
  },
  filterPillText: {
    color: '#A1A1AA',
    fontSize: 12,
    fontWeight: '600',
  },
  filterPillTextActive: {
    color: '#000000',
    fontWeight: '800',
  },
  productAdminCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#141418',
    borderRadius: 14,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#27272A',
  },
  productAdminImage: {
    width: 60,
    height: 60,
    borderRadius: 10,
    backgroundColor: '#0E0E12',
    marginRight: 12,
  },
  productAdminDetails: {
    flex: 1,
  },
  productAdminTitle: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  productAdminPlatform: {
    color: '#71717A',
    fontSize: 12,
    marginTop: 2,
  },
  productAdminPrice: {
    color: '#34D399',
    fontSize: 14,
    fontWeight: '700',
    marginTop: 2,
  },
  stockToggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
    maxWidth: 140,
  },
  stockToggleLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
  productAdminActions: {
    flexDirection: 'column',
    gap: 8,
    marginLeft: 8,
  },
  actionBtnEdit: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#27272A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionBtnDelete: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  // ORDERS TAB
  orderCard: {
    backgroundColor: '#141418',
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#27272A',
  },
  orderCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#202026',
    marginBottom: 10,
  },
  orderCode: {
    color: '#F5A623',
    fontSize: 13,
    fontWeight: '800',
  },
  orderDate: {
    color: '#71717A',
    fontSize: 11,
    marginTop: 2,
  },
  statusBadge: {
    borderWidth: 1,
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '800',
  },
  customerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 10,
  },
  customerName: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
  },
  customerWhatsAppBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(52, 211, 153, 0.15)',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 6,
    gap: 4,
  },
  customerPhoneText: {
    color: '#34D399',
    fontSize: 12,
    fontWeight: '600',
  },
  orderItemsContainer: {
    backgroundColor: '#1A1A20',
    borderRadius: 8,
    padding: 8,
    marginBottom: 10,
  },
  orderItemLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 3,
  },
  orderItemQty: {
    color: '#F5A623',
    fontSize: 13,
    fontWeight: '700',
    width: 26,
  },
  orderItemName: {
    color: '#D4D4D8',
    fontSize: 13,
    flex: 1,
  },
  orderItemPrice: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
  orderCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#202026',
  },
  orderFooterTotalLabel: {
    color: '#71717A',
    fontSize: 11,
  },
  orderFooterTotalValue: {
    color: '#34D399',
    fontSize: 16,
    fontWeight: '800',
  },
  statusButtonsGroup: {
    flexDirection: 'row',
    gap: 6,
  },
  statusQuickBtn: {
    borderWidth: 1,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  statusQuickBtnText: {
    fontSize: 11,
    fontWeight: '700',
  },
  // USERS TAB
  userCard: {
    backgroundColor: '#141418',
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#27272A',
  },
  userCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  userAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#27272A',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    borderWidth: 1.5,
    borderColor: '#3F3F46',
  },
  userAvatarText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  userCardDetails: {
    flex: 1,
  },
  userCardUsername: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
    marginRight: 8,
  },
  userAdminRoleBadge: {
    backgroundColor: '#F5A623',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
  },
  userAdminRoleText: {
    color: '#000000',
    fontSize: 10,
    fontWeight: '800',
  },
  userCardEmail: {
    color: '#A1A1AA',
    fontSize: 12,
    marginTop: 2,
  },
  userCardDate: {
    color: '#71717A',
    fontSize: 11,
    marginTop: 2,
  },
  userCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#202026',
  },
  userPointsDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  userPointsValue: {
    color: '#F5A623',
    fontSize: 14,
    fontWeight: '700',
  },
  userActionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  userGivePointsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5A623',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 6,
    gap: 4,
  },
  userGivePointsBtnText: {
    color: '#000000',
    fontSize: 12,
    fontWeight: '700',
  },
  userRoleToggleBtn: {
    borderWidth: 1,
    borderColor: '#38BDF8',
    paddingVertical: 5,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  userRoleToggleBtnText: {
    color: '#38BDF8',
    fontSize: 11,
    fontWeight: '600',
  },
  // MODAL STYLES
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalCard: {
    width: '100%',
    maxWidth: 480,
    backgroundColor: '#141418',
    borderRadius: 18,
    padding: 20,
    borderWidth: 1,
    borderColor: '#27272A',
  },
  modalHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#27272A',
  },
  modalHeaderTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
  },
  pointsModalSub: {
    color: '#E4E4E7',
    fontSize: 14,
    marginBottom: 4,
  },
  inputLabel: {
    color: '#A1A1AA',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 6,
    marginTop: 6,
  },
  modalInput: {
    backgroundColor: '#1E1E24',
    borderWidth: 1,
    borderColor: '#2E2E36',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: '#FFFFFF',
    fontSize: 14,
    marginBottom: 8,
  },
  categoryPillsSelect: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 10,
  },
  categoryOptionPill: {
    flex: 1,
    backgroundColor: '#1E1E24',
    borderWidth: 1,
    borderColor: '#2E2E36',
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: 'center',
  },
  categoryOptionPillActive: {
    backgroundColor: '#F5A623',
    borderColor: '#F5A623',
  },
  categoryOptionText: {
    color: '#A1A1AA',
    fontSize: 12,
    fontWeight: '600',
  },
  categoryOptionTextActive: {
    color: '#000000',
    fontWeight: '800',
  },
  presetImageBtn: {
    width: 80,
    alignItems: 'center',
    marginRight: 10,
    padding: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#27272A',
    backgroundColor: '#18181D',
  },
  presetImageBtnActive: {
    borderColor: '#F5A623',
    backgroundColor: 'rgba(245, 166, 35, 0.1)',
  },
  presetImageThumb: {
    width: 44,
    height: 44,
    borderRadius: 6,
    marginBottom: 4,
  },
  presetImageText: {
    color: '#D4D4D8',
    fontSize: 10,
    textAlign: 'center',
  },
  switchRowModal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 10,
    paddingHorizontal: 4,
  },
  switchRowModalLabel: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
  modalFooterActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 18,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#202026',
  },
  modalCancelBtn: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#27272A',
  },
  modalCancelBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  modalSubmitBtn: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 8,
    backgroundColor: '#F5A623',
  },
  modalSubmitBtnText: {
    color: '#000000',
    fontSize: 14,
    fontWeight: '800',
  },
  // PHOTO UPLOAD & COMPRESSION STYLES
  imageUploadCard: {
    backgroundColor: '#14141A',
    borderWidth: 1.5,
    borderColor: '#2A2A38',
    borderRadius: 16,
    padding: 14,
    marginBottom: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  compressingBox: {
    paddingVertical: 20,
    alignItems: 'center',
    gap: 8,
  },
  compressingText: {
    color: '#F5A623',
    fontSize: 13,
    fontWeight: '700',
  },
  compressingSubText: {
    color: '#71717A',
    fontSize: 11,
    textAlign: 'center',
  },
  imagePreviewWrapper: {
    width: '100%',
    alignItems: 'center',
  },
  imagePreviewLarge: {
    width: '100%',
    height: 180,
    borderRadius: 12,
    backgroundColor: '#07070A',
  },
  imageActionButtonsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 10,
    alignItems: 'center',
  },
  imageChangeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5A623',
    paddingVertical: 7,
    paddingHorizontal: 14,
    borderRadius: 20,
    gap: 5,
  },
  imageChangeBtnText: {
    color: '#000000',
    fontSize: 12,
    fontWeight: '800',
  },
  imageRemoveBtn: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
    padding: 7,
    borderRadius: 20,
  },
  emptyImageUploadBox: {
    alignItems: 'center',
    paddingVertical: 14,
    width: '100%',
  },
  emptyUploadTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
    marginTop: 8,
  },
  emptyUploadSub: {
    color: '#71717A',
    fontSize: 11,
    marginTop: 2,
  },
  pickImageActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5A623',
    paddingVertical: 9,
    paddingHorizontal: 16,
    borderRadius: 22,
  },
  pickImageActionBtnText: {
    color: '#000000',
    fontSize: 12,
    fontWeight: '800',
  },
  compressionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.25)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginTop: 10,
    gap: 6,
  },
  compressionBadgeText: {
    color: '#10B981',
    fontSize: 11,
    fontWeight: '700',
  },
});
