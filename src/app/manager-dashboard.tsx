import { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  Switch,
  TextInput,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from '@/config';
import { colors } from '@/constants/colors';

type MenuItem = {
  _id: string;
  name: string;
  type: string;
  price: number;
  isAvailable: boolean;
  quantity: number;
};

export default function ManagerDashboard() {
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState<string | null>(null);
  const [managerName, setManagerName] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const storedToken = await AsyncStorage.getItem('managerToken');
    const restaurantId = await AsyncStorage.getItem('managerRestaurantId');
    const name = await AsyncStorage.getItem('managerName');
    setToken(storedToken);
    setManagerName(name || '');

    try {
      const res = await api.get(`/menu/${restaurantId}`);
      setMenu(res.data);
    } catch (err) {
      console.log(err);
    }
    setLoading(false);
  };

  const toggleAvailability = async (item: MenuItem) => {
    try {
      await api.patch(
        `/menu/${item._id}/availability`,
        { isAvailable: !item.isAvailable },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMenu(menu.map(m => (m._id === item._id ? { ...m, isAvailable: !m.isAvailable } : m)));
    } catch (err: any) {
      console.log(err.response?.data);
    }
  };

  const updateQuantity = async (item: MenuItem, newQty: string) => {
    try {
      await api.patch(
        `/menu/${item._id}/quantity`,
        { quantity: Number(newQty) },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMenu(menu.map(m => (m._id === item._id ? { ...m, quantity: Number(newQty) } : m)));
    } catch (err: any) {
      console.log(err.response?.data);
    }
  };

  if (loading) {
    return <ActivityIndicator size="large" color={colors.primary} style={{ flex: 1 }} />;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>{managerName}'s Menu</Text>
      <FlatList
        data={menu}
        keyExtractor={item => item._id}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <View style={{ flex: 1 }}>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.type}>{item.type}</Text>
              <Text style={styles.price}>₹{item.price}</Text>
            </View>
            <View style={styles.controls}>
              <Switch
                value={item.isAvailable}
                onValueChange={() => toggleAvailability(item)}
                trackColor={{ false: colors.border, true: colors.primary }}
              />
              <TextInput
                style={styles.qtyInput}
                keyboardType="numeric"
                defaultValue={String(item.quantity)}
                onEndEditing={e => updateQuantity(item, e.nativeEvent.text)}
              />
            </View>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 50, paddingHorizontal: 20, backgroundColor: colors.background },
  header: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    color: colors.textPrimary,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  name: { fontSize: 16, fontWeight: '600', color: colors.textPrimary },
  type: { fontSize: 12, color: colors.textSecondary },
  price: { fontSize: 14, color: colors.primaryDark, marginTop: 2 },
  controls: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  qtyInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 6,
    width: 55,
    textAlign: 'center',
    padding: 6,
    color: colors.textPrimary,
    backgroundColor: colors.surface,
  },
});