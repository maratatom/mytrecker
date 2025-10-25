import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Alert,
  Chip,
  Avatar,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { ArrowBack, Download, Refresh } from '@mui/icons-material';
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

const DailyReport: React.FC = () => {
  const [records, setRecords] = useState<TimeRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedDate, setSelectedDate] = useState(moment().format('YYYY-MM-DD'));
  const navigate = useNavigate();

  useEffect(() => {
    fetchRecords();
  }, [selectedDate]);

  const fetchRecords = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await axios.get(`http://localhost:5000/api/time-tracking/date/${selectedDate}`);
      setRecords(response.data);
    } catch (error) {
      setError('Ошибка при загрузке записей');
      console.error('Error fetching records:', error);
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

  const calculateWorkTime = (record: TimeRecord) => {
    if (!record.arrivalTime) return '-';
    
    const arrival = moment(record.arrivalTime);
    const departure = record.departureTime ? moment(record.departureTime) : moment();
    
    const duration = moment.duration(departure.diff(arrival));
    const hours = Math.floor(duration.asHours());
    const minutes = duration.minutes();
    
    return `${hours}ч ${minutes}м`;
  };

  const getStats = () => {
    const total = records.length;
    const present = records.filter(r => r.arrivalTime).length;
    const absent = total - present;
    const left = records.filter(r => r.departureTime).length;
    const stillWorking = present - left;

    return { total, present, absent, left, stillWorking };
  };

  const stats = getStats();

  const handleExport = () => {
    // Простой экспорт в CSV
    const csvContent = [
      ['Имя', 'Должность', 'Прибытие', 'Убытие', 'Статус', 'Время работы', 'Замечания'],
      ...records.map(record => [
        record.personnelId.name,
        record.personnelId.position,
        record.arrivalTime ? moment(record.arrivalTime).format('HH:mm') : '-',
        record.departureTime ? moment(record.departureTime).format('HH:mm') : '-',
        getStatusText(record),
        calculateWorkTime(record),
        record.remarks || '-'
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `report_${selectedDate}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
        Ежедневный отчет
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Фильтры и действия */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                type="date"
                label="Дата"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<Refresh />}
                onClick={fetchRecords}
                disabled={loading}
              >
                Обновить
              </Button>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Button
                fullWidth
                variant="contained"
                startIcon={<Download />}
                onClick={handleExport}
                disabled={records.length === 0}
              >
                Экспорт CSV
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Статистика */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={6} sm={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="primary">
                {stats.total}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Всего сотрудников
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="success.main">
                {stats.present}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Присутствуют
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="error.main">
                {stats.absent}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Отсутствуют
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="warning.main">
                {stats.stillWorking}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                На работе
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Таблица записей */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Записи за {moment(selectedDate).format('DD.MM.YYYY')}
          </Typography>
          
          {loading ? (
            <Typography>Загрузка...</Typography>
          ) : records.length === 0 ? (
            <Typography color="text.secondary">
              Нет записей за выбранную дату
            </Typography>
          ) : (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Сотрудник</TableCell>
                    <TableCell>Прибытие</TableCell>
                    <TableCell>Убытие</TableCell>
                    <TableCell>Время работы</TableCell>
                    <TableCell>Статус</TableCell>
                    <TableCell>Замечания</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {records.map((record) => (
                    <TableRow key={record._id}>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Avatar
                            src={record.personnelId.photo ? `http://localhost:5000/uploads/${record.personnelId.photo}` : undefined}
                            alt={record.personnelId.name}
                            sx={{ width: 32, height: 32 }}
                          />
                          <Box>
                            <Typography variant="body2">
                              {record.personnelId.name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {record.personnelId.position}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        {record.arrivalTime ? moment(record.arrivalTime).format('HH:mm') : '-'}
                      </TableCell>
                      <TableCell>
                        {record.departureTime ? moment(record.departureTime).format('HH:mm') : '-'}
                      </TableCell>
                      <TableCell>
                        {calculateWorkTime(record)}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={getStatusText(record)}
                          color={getStatusColor(record)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        {record.remarks || '-'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default DailyReport;
