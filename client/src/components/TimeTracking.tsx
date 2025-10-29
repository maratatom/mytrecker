import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  TextField,
  Alert,
  Chip,
  Avatar,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { ArrowBack, AccessTime, ExitToApp } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import moment from 'moment';

interface Personnel {
  _id: string;
  name: string;
  position: string;
  photo?: string;
}

interface TimeRecord {
  _id: string;
  personnelId: Personnel;
  arrivalTime?: string;
  departureTime?: string;
  remarks?: string;
  isPresent: boolean;
}

const TimeTracking: React.FC = () => {
  const [personnel, setPersonnel] = useState<Personnel[]>([]);
  const [selectedPersonnelId, setSelectedPersonnelId] = useState('');
  const [remarks, setRemarks] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [todayRecords, setTodayRecords] = useState<TimeRecord[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchPersonnel();
    fetchTodayRecords();
  }, []);

  const fetchPersonnel = async () => {
    try {
      const response = await axios.get('/api/personnel');
      setPersonnel(response.data);
    } catch (error) {
      setError('Ошибка при загрузке списка персонала');
      console.error('Error fetching personnel:', error);
    }
  };

  const fetchTodayRecords = async () => {
    try {
      const response = await axios.get('/api/time-tracking/today');
      setTodayRecords(response.data);
    } catch (error) {
      console.error('Error fetching today records:', error);
    }
  };

  const handleTimeAction = async (action: 'arrival' | 'departure') => {
    if (!selectedPersonnelId) {
      setError('Выберите сотрудника');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await axios.post(`/api/time-tracking/${action}`, {
        personnelId: selectedPersonnelId,
        remarks: remarks.trim() || undefined,
      });

      if (response.data) {
        setSuccess(`Успешно отмечено ${action === 'arrival' ? 'прибытие' : 'убытие'}`);
        setRemarks('');
        fetchTodayRecords(); // Обновляем список записей
      }
    } catch (error) {
      setError(`Ошибка при отметке ${action === 'arrival' ? 'прибытия' : 'убытия'}`);
      console.error('Error with time action:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (record: TimeRecord) => {
    if (record.departureTime) return 'default'; // Ушел
    if (record.arrivalTime) return 'success'; // На работе
    return 'error'; // Не пришел
  };

  const getStatusText = (record: TimeRecord) => {
    if (record.departureTime) return 'Ушел';
    if (record.arrivalTime) return 'На работе';
    return 'Не пришел';
  };

  return (
    <Box sx={{ p: 3 }}>
      <Button
        startIcon={<ArrowBack />}
        onClick={() => navigate('/')}
        sx={{ mb: 2 }}
      >
        Назад к списку
      </Button>

      <Typography variant="h4" gutterBottom>
        Учет времени
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}

      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
        {/* Форма для отметки времени */}
        <Box sx={{ flex: 1 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Отметка времени
              </Typography>
              
              <FormControl fullWidth margin="normal">
                <InputLabel>Выберите сотрудника</InputLabel>
                <Select
                  value={selectedPersonnelId}
                  onChange={(e) => setSelectedPersonnelId(e.target.value)}
                  label="Выберите сотрудника"
                >
                  {personnel.map((person) => (
                    <MenuItem key={person._id} value={person._id}>
                      {person.name} - {person.position}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <TextField
                fullWidth
                margin="normal"
                label="Замечания (необязательно)"
                multiline
                rows={3}
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
              />

              <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
                <Button
                  variant="contained"
                  color="success"
                  startIcon={<AccessTime />}
                  onClick={() => handleTimeAction('arrival')}
                  disabled={loading || !selectedPersonnelId}
                  fullWidth
                >
                  Прибытие
                </Button>
                <Button
                  variant="contained"
                  color="error"
                  startIcon={<ExitToApp />}
                  onClick={() => handleTimeAction('departure')}
                  disabled={loading || !selectedPersonnelId}
                  fullWidth
                >
                  Убытие
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Box>

        {/* Список записей за сегодня */}
        <Box sx={{ flex: 1 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Записи за сегодня ({moment().format('DD.MM.YYYY')})
              </Typography>
              
              {todayRecords.length === 0 ? (
                <Typography color="text.secondary">
                  Нет записей за сегодня
                </Typography>
              ) : (
                <Box sx={{ maxHeight: 400, overflow: 'auto' }}>
                  {todayRecords.map((record) => (
                    <Card key={record._id} sx={{ mb: 2, p: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar
                          src={record.personnelId.photo ? `/uploads/${record.personnelId.photo}` : undefined}
                          alt={record.personnelId.name}
                        />
                        <Box sx={{ flexGrow: 1 }}>
                          <Typography variant="subtitle1">
                            {record.personnelId.name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {record.personnelId.position}
                          </Typography>
                          {record.arrivalTime && (
                            <Typography variant="caption" display="block">
                              Прибытие: {moment(record.arrivalTime).format('HH:mm')}
                            </Typography>
                          )}
                          {record.departureTime && (
                            <Typography variant="caption" display="block">
                              Убытие: {moment(record.departureTime).format('HH:mm')}
                            </Typography>
                          )}
                          {record.remarks && (
                            <Typography variant="caption" display="block" color="text.secondary">
                              Замечания: {record.remarks}
                            </Typography>
                          )}
                        </Box>
                        <Chip
                          label={getStatusText(record)}
                          color={getStatusColor(record)}
                          size="small"
                        />
                        <Button size="small" onClick={async () => {
                          const newRemarks = prompt('Изменить замечания', record.remarks || '');
                          if (newRemarks === null) return;
                          try {
                            await axios.patch(`/api/time-tracking/${record._id}/remarks`, { remarks: newRemarks });
                            fetchTodayRecords();
                          } catch (e) {
                            setError('Ошибка при обновлении замечаний');
                          }
                        }}>Править</Button>
                      </Box>
                    </Card>
                  ))}
                </Box>
              )}
            </CardContent>
          </Card>
        </Box>
      </Box>
    </Box>
  );
};

export default TimeTracking;
