import React, { useEffect, useState, useRef } from 'react';
import { Box, Card, CardContent, Typography, Button, Avatar } from '@mui/material';
import axios from 'axios';
import html2canvas from 'html2canvas';

interface Personnel {
  _id: string;
  name: string;
  position: string;
  photo?: string;
}

const CompactBoard: React.FC = () => {
  const [items, setItems] = useState<Personnel[]>([]);
  const boardRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    (async () => {
      const res = await axios.get('/api/personnel');
      setItems(res.data);
    })();
  }, []);

  const saveScreenshot = async () => {
    if (!boardRef.current) return;
    const canvas = await html2canvas(boardRef.current, { backgroundColor: '#fff', scale: 2 });
    const dataUrl = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = 'personnel-board.png';
    a.click();
  };

  return (
    <Box sx={{ p: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5">Персонал (компактный вид)</Typography>
        <Button variant="contained" onClick={saveScreenshot}>Сохранить скрин</Button>
      </Box>

      <Box ref={boardRef} sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
        {items.map(p => (
          <Card key={p._id} sx={{ width: 220 }}>
            <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Avatar src={p.photo ? `/uploads/${p.photo}` : undefined} />
              <Box>
                <Typography variant="subtitle2">{p.name}</Typography>
                <Typography variant="caption" color="text.secondary">{p.position}</Typography>
              </Box>
            </CardContent>
          </Card>
        ))}
      </Box>
    </Box>
  );
};

export default CompactBoard;


