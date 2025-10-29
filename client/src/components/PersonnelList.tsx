import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Button,
  Grid,
  Fab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
} from '@mui/material';
import { Add, Person, Schedule, Assessment } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

interface Personnel {
  _id: string;
  name: string;
  position: string;
  photo?: string;
  description?: string;
}

const PersonnelList: React.FC = () => {
  const [personnel, setPersonnel] = useState<Personnel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const debouncedQuery = useMemo(() => query, [query]);
  const [selectedPersonnel, setSelectedPersonnel] = useState<Personnel | null>(null);
  const [remarks, setRemarks] = useState('');
  const [actionDialogOpen, setActionDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editData, setEditData] = useState<{ name: string; position: string; description?: string }>({ name: '', position: '', description: '' });
  const navigate = useNavigate();

  useEffect(() => {
    fetchPersonnel();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedQuery]);

  const fetchPersonnel = async () => {
    try {
      const response = await axios.get('/api/personnel', {
        params: query.trim() ? { q: query.trim() } : undefined,
      });
      setPersonnel(response.data);
    } catch (error) {
      setError('Ошибка при загрузке списка персонала');
      console.error('Error fetching personnel:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePersonnelClick = (person: Personnel) => {
    setSelectedPersonnel(person);
    setRemarks('');
    setActionDialogOpen(true);
  };

  const handleTimeAction = async (action: 'arrival' | 'departure') => {
    if (!selectedPersonnel) return;

    try {
      const response = await axios.post(`http://localhost:5000/api/time-tracking/${action}`, {
        personnelId: selectedPersonnel._id,
        remarks: remarks.trim() || undefined,
      });

      if (response.data) {
        setActionDialogOpen(false);
        setSelectedPersonnel(null);
        setRemarks('');
        // Можно показать уведомление об успехе
      }
    } catch (error) {
      setError(`Ошибка при отметке ${action === 'arrival' ? 'прибытия' : 'убытия'}`);
      console.error('Error with time action:', error);
    }
  };

  const handleCloseDialog = () => {
    setActionDialogOpen(false);
    setSelectedPersonnel(null);
    setRemarks('');
  };

  const openEditDialog = (person: Personnel) => {
    setSelectedPersonnel(person);
    setEditData({ name: person.name, position: person.position, description: person.description || '' });
    setEditDialogOpen(true);
  };

  const closeEditDialog = () => {
    setEditDialogOpen(false);
    setSelectedPersonnel(null);
  };

  const saveEdit = async () => {
    if (!selectedPersonnel) return;
    try {
      await axios.put(`/api/personnel/${selectedPersonnel._id}`, editData);
      closeEditDialog();
      fetchPersonnel();
    } catch (e) {
      setError('Ошибка при сохранении сотрудника');
    }
  };

  if (loading) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography>Загрузка...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Список персонала
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Box sx={{ maxWidth: 400, mb: 2 }}>
        <TextField
          fullWidth
          placeholder="Поиск по имени, должности, описанию"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          size="small"
        />
      </Box>

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
        {personnel.map((person) => (
          <Box key={person._id} sx={{ flex: '1 1 300px', minWidth: '280px', maxWidth: '400px' }}>
            <Card 
              sx={{ 
                cursor: 'pointer',
                '&:hover': { 
                  boxShadow: 6,
                  transform: 'translateY(-2px)',
                  transition: 'all 0.2s ease-in-out'
                }
              }}
              onClick={() => handlePersonnelClick(person)}
            >
              <CardMedia
                component="img"
                height="200"
                image={person.photo ? `/uploads/${person.photo}` : '/default-avatar.png'}
                alt={person.name}
                sx={{ objectFit: 'cover' }}
              />
              <CardContent>
                <Typography gutterBottom variant="h6" component="div">
                  {person.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {person.position}
                </Typography>
                {person.description && (
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    {person.description}
                  </Typography>
                )}
              </CardContent>
              <Box sx={{ display: 'flex', gap: 1, p: 2 }}>
                <Button size="small" variant="outlined" onClick={(e) => { e.stopPropagation(); openEditDialog(person); }}>Редактировать</Button>
              </Box>
            </Card>
          </Box>
        ))}
      </Box>

      {/* Floating Action Buttons */}
      <Box sx={{ position: 'fixed', bottom: 16, right: 16, display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Fab 
          color="primary" 
          aria-label="add personnel"
          onClick={() => navigate('/add-personnel')}
        >
          <Add />
        </Fab>
        <Fab 
          color="secondary" 
          aria-label="time tracking"
          onClick={() => navigate('/time-tracking')}
        >
          <Schedule />
        </Fab>
        <Fab 
          color="default" 
          aria-label="daily report"
          onClick={() => navigate('/daily-report')}
        >
          <Assessment />
        </Fab>
      </Box>

      {/* Action Dialog */}
      <Dialog open={actionDialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          Отметка времени - {selectedPersonnel?.name}
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Замечания (необязательно)"
            fullWidth
            multiline
            rows={3}
            variant="outlined"
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Отмена</Button>
          <Button 
            onClick={() => handleTimeAction('arrival')}
            variant="contained"
            color="success"
          >
            Прибытие
          </Button>
          <Button 
            onClick={() => handleTimeAction('departure')}
            variant="contained"
            color="error"
          >
            Убытие
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Personnel Dialog */}
      <Dialog open={editDialogOpen} onClose={closeEditDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Редактирование сотрудника</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField label="Имя" fullWidth value={editData.name} onChange={(e) => setEditData({ ...editData, name: e.target.value })} />
            <TextField label="Должность" fullWidth value={editData.position} onChange={(e) => setEditData({ ...editData, position: e.target.value })} />
            <TextField label="Описание" fullWidth multiline rows={3} value={editData.description} onChange={(e) => setEditData({ ...editData, description: e.target.value })} />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeEditDialog}>Отмена</Button>
          <Button onClick={saveEdit} variant="contained">Сохранить</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PersonnelList;
