import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
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
  const [editRecord, setEditRecord] = useState<TimeRecord | null>(null);
  const [editArrival, setEditArrival] = useState('');
  const [editDeparture, setEditDeparture] = useState('');
  const [editRemarks, setEditRemarks] = useState('');
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

  const openEditRecord = (record: TimeRecord) => {
    setEditRecord(record);
    setEditArrival(record.arrivalTime ? moment(record.arrivalTime).format('YYYY-MM-DDTHH:mm') : '');
    setEditDeparture(record.departureTime ? moment(record.departureTime).format('YYYY-MM-DDTHH:mm') : '');
    setEditRemarks(record.remarks || '');
  };

  const saveEditRecord = async () => {
    if (!editRecord) return;
    try {
      setLoading(true);
      await axios.patch(`/api/time-tracking/${editRecord._id}`, {
        arrivalTime: editArrival || null,
        departureTime: editDeparture || null,
        remarks: editRemarks || '',
      }, { headers: { 'Content-Type': 'application/json' } });
      setEditRecord(null);
      setSuccess('Запись успешно обновлена');
      fetchTodayRecords();
    } catch (e: any) {
      setError('Ошибка при сохранении записи: ' + (e.response?.data?.message || e.message));
    } finally {
      setLoading(false);
    }
  };

  const deleteRecord = async (record: TimeRecord) => {
    if (!window.confirm(`Удалить запись учета времени для ${record.personnelId.name}?`)) return;
    try {
      setLoading(true);
      await axios.delete(`/api/time-tracking/${record._id}`);
      setSuccess('Запись успешно удалена');
      fetchTodayRecords();
    } catch (e: any) {
      setError('Ошибка при удалении записи: ' + (e.response?.data?.message || e.message));
    } finally {
      setLoading(false);
    }
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
                        <Button size="small" onClick={() => openEditRecord(record)}>Редактировать</Button>
                        <Button size="small" color="error" onClick={() => deleteRecord(record)}>Удалить</Button>
                      </Box>
                    </Card>
                  ))}
                </Box>
              )}
            </CardContent>
          </Card>
        </Box>
      </Box>

      {editRecord && (
        <Box sx={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Card sx={{ p: 2, minWidth: 320 }}>
            <Typography variant="h6" gutterBottom>Редактирование записи</Typography>
            <TextField
              label="Прибытие"
              type="datetime-local"
              value={editArrival}
              onChange={(e) => setEditArrival(e.target.value)}
              fullWidth
              sx={{ mb: 2 }}
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              label="Убытие"
              type="datetime-local"
              value={editDeparture}
              onChange={(e) => setEditDeparture(e.target.value)}
              fullWidth
              sx={{ mb: 2 }}
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              label="Замечания"
              value={editRemarks}
              onChange={(e) => setEditRemarks(e.target.value)}
              fullWidth
              multiline
              rows={3}
              sx={{ mb: 2 }}
            />
            <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
              <Button onClick={() => setEditRecord(null)} disabled={loading}>Отмена</Button>
              <Button variant="contained" onClick={saveEditRecord} disabled={loading}>
                {loading ? 'Сохранение...' : 'Сохранить'}
              </Button>
            </Box>
          </Card>
        </Box>
      )}
    </Box>
  );
};

export default TimeTracking;
