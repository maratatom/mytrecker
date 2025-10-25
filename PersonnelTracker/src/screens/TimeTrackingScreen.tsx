import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  TextInput,
  ScrollView,
} from 'react-native';
import axios from 'axios';
import moment from 'moment';

interface Personnel {
  _id: string;
  name: string;
  position: string;
  photo?: string;
}

interface TimeTrackingScreenProps {
  navigation: any;
  route: any;
}

const TimeTrackingScreen: React.FC<TimeTrackingScreenProps> = ({ navigation, route }) => {
  const { personnel } = route.params;
  const [remarks, setRemarks] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentStatus, setCurrentStatus] = useState<string>('');

  useEffect(() => {
    checkCurrentStatus();
  }, []);

  const checkCurrentStatus = async () => {
    try {
      const response = await axios.get(`http://10.0.2.2:5000/api/time-tracking/today`);
      const todayRecords = response.data;
      const personRecord = todayRecords.find((record: any) => record.personnelId._id === personnel._id);
      
      if (personRecord) {
        if (personRecord.departureTime) {
          setCurrentStatus('Ушел');
        } else if (personRecord.arrivalTime) {
          setCurrentStatus('На работе');
        }
      } else {
        setCurrentStatus('Не пришел');
      }
    } catch (error) {
      console.error('Error checking status:', error);
    }
  };

  const handleTimeAction = async (action: 'arrival' | 'departure') => {
    setLoading(true);
    try {
      const response = await axios.post(`http://10.0.2.2:5000/api/time-tracking/${action}`, {
        personnelId: personnel._id,
        remarks: remarks.trim() || undefined,
      });

      if (response.data) {
        const actionText = action === 'arrival' ? 'прибытие' : 'убытие';
        Alert.alert('Успех', `Успешно отмечено ${actionText}`);
        setRemarks('');
        checkCurrentStatus();
      }
    } catch (error) {
      Alert.alert('Ошибка', `Ошибка при отметке ${action === 'arrival' ? 'прибытия' : 'убытия'}`);
      console.error('Time action error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'На работе': return '#4CAF50';
      case 'Ушел': return '#FF9800';
      case 'Не пришел': return '#F44336';
      default: return '#9E9E9E';
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Учет времени</Text>
        <Text style={styles.personnelName}>{personnel.name}</Text>
        <Text style={styles.personnelPosition}>{personnel.position}</Text>
        
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(currentStatus) }]}>
          <Text style={styles.statusText}>{currentStatus}</Text>
        </View>
      </View>

      <View style={styles.content}>
        <Text style={styles.sectionTitle}>Замечания</Text>
        <TextInput
          style={styles.remarksInput}
          placeholder="Введите замечания (необязательно)"
          value={remarks}
          onChangeText={setRemarks}
          multiline
          numberOfLines={3}
        />

        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={[styles.actionButton, styles.arrivalButton]}
            onPress={() => handleTimeAction('arrival')}
            disabled={loading || currentStatus === 'На работе'}
          >
            <Text style={styles.actionButtonText}>
              {loading ? 'Обработка...' : 'Прибытие'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.departureButton]}
            onPress={() => handleTimeAction('departure')}
            disabled={loading || currentStatus !== 'На работе'}
          >
            <Text style={styles.actionButtonText}>
              {loading ? 'Обработка...' : 'Убытие'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.infoContainer}>
          <Text style={styles.infoTitle}>Информация</Text>
          <Text style={styles.infoText}>
            • Нажмите "Прибытие" при начале рабочего дня
          </Text>
          <Text style={styles.infoText}>
            • Нажмите "Убытие" при окончании рабочего дня
          </Text>
          <Text style={styles.infoText}>
            • Замечания сохраняются с каждой отметкой
          </Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: 'white',
    padding: 20,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  personnelName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1976d2',
    marginBottom: 5,
  },
  personnelPosition: {
    fontSize: 14,
    color: '#666',
    marginBottom: 15,
  },
  statusBadge: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  statusText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  content: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  remarksInput: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ddd',
    textAlignVertical: 'top',
  },
  actionsContainer: {
    marginBottom: 30,
  },
  actionButton: {
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    alignItems: 'center',
  },
  arrivalButton: {
    backgroundColor: '#4CAF50',
  },
  departureButton: {
    backgroundColor: '#F44336',
  },
  actionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  infoContainer: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
});

export default TimeTrackingScreen;
