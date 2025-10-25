import React, { useState, useEffect } from 'react';
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
  const [selectedPersonnel, setSelectedPersonnel] = useState<Personnel | null>(null);
  const [remarks, setRemarks] = useState('');
  const [actionDialogOpen, setActionDialogOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchPersonnel();
  }, []);

  const fetchPersonnel = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/personnel');
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

      <Grid container spacing={3}>
        {personnel.map((person) => (
          <Grid item xs={12} sm={6} md={4} key={person._id}>
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
                image={person.photo ? `http://localhost:5000/uploads/${person.photo}` : '/default-avatar.png'}
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
            </Card>
          </Grid>
        ))}
      </Grid>

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
    </Box>
  );
};

export default PersonnelList;
