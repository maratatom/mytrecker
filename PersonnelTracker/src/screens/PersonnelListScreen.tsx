import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  RefreshControl,
  Image,
} from 'react-native';
import axios from 'axios';

interface Personnel {
  _id: string;
  name: string;
  position: string;
  photo?: string;
  description?: string;
}

interface PersonnelListScreenProps {
  navigation: any;
}

const PersonnelListScreen: React.FC<PersonnelListScreenProps> = ({ navigation }) => {
  const [personnel, setPersonnel] = useState<Personnel[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchPersonnel();
  }, []);

  const fetchPersonnel = async () => {
    try {
      const response = await axios.get('http://10.0.2.2:5000/api/personnel');
      setPersonnel(response.data);
    } catch (error) {
      Alert.alert('Ошибка', 'Ошибка при загрузке списка персонала');
      console.error('Error fetching personnel:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchPersonnel();
    setRefreshing(false);
  };

  const handlePersonnelPress = (person: Personnel) => {
    navigation.navigate('TimeTracking', { personnel: person });
  };

  const renderPersonnelItem = ({ item }: { item: Personnel }) => (
    <TouchableOpacity 
      style={styles.personnelCard} 
      onPress={() => handlePersonnelPress(item)}
    >
      <View style={styles.cardContent}>
        <Image
          source={
            item.photo 
              ? { uri: `http://10.0.2.2:5000/uploads/${item.photo}` }
              : require('../assets/default-avatar.png')
          }
          style={styles.avatar}
        />
        <View style={styles.personnelInfo}>
          <Text style={styles.personnelName}>{item.name}</Text>
          <Text style={styles.personnelPosition}>{item.position}</Text>
          {item.description && (
            <Text style={styles.personnelDescription} numberOfLines={2}>
              {item.description}
            </Text>
          )}
        </View>
        <View style={styles.arrowContainer}>
          <Text style={styles.arrow}>›</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Загрузка...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Список персонала</Text>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => navigation.navigate('AddPersonnel')}
        >
          <Text style={styles.addButtonText}>+</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={personnel}
        renderItem={renderPersonnelItem}
        keyExtractor={(item) => item._id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  addButton: {
    backgroundColor: '#1976d2',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  listContainer: {
    padding: 10,
  },
  personnelCard: {
    backgroundColor: 'white',
    borderRadius: 10,
    marginBottom: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 15,
  },
  personnelInfo: {
    flex: 1,
  },
  personnelName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  personnelPosition: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  personnelDescription: {
    fontSize: 12,
    color: '#999',
  },
  arrowContainer: {
    marginLeft: 10,
  },
  arrow: {
    fontSize: 20,
    color: '#ccc',
  },
});

export default PersonnelListScreen;
