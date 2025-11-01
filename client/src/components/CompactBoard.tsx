import React, { useEffect, useState, useRef } from 'react';
import { Box, Card, CardContent, Typography, Button, Avatar, ButtonGroup } from '@mui/material';
import axios from 'axios';
import html2canvas from 'html2canvas';
import moment from 'moment';
import jsPDF from 'jspdf';

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
}

const CompactBoard: React.FC = () => {
  const [items, setItems] = useState<Personnel[]>([]);
  const boardRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    (async () => {
      const today = moment().format('YYYY-MM-DD');
      const recordsRes = await axios.get(`/api/time-tracking/date/${today}`);
      const records: TimeRecord[] = recordsRes.data;
      
      // Получаем только сотрудников, которые были сегодня
      const todayPersonnelIds = records
        .filter(r => r.arrivalTime)
        .map(r => r.personnelId._id);
      
      const allPersonnelRes = await axios.get('/api/personnel');
      const todayPersonnel = allPersonnelRes.data.filter((p: Personnel) => 
        todayPersonnelIds.includes(p._id)
      );
      
      setItems(todayPersonnel);
    })();
  }, []);

  const saveScreenshot = async () => {
    if (!boardRef.current) return;
    const canvas = await html2canvas(boardRef.current, { backgroundColor: '#fff', scale: 2 });
    const dataUrl = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    const dateStr = moment().format('YYYY-MM-DD');
    a.href = dataUrl;
    a.download = `personnel-board-${dateStr}.png`;
    a.click();
  };

  const savePDF = async () => {
    if (!boardRef.current) return;
    const canvas = await html2canvas(boardRef.current, { backgroundColor: '#fff', scale: 2 });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = canvas.width;
    const imgHeight = canvas.height;
    const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
    const imgX = (pdfWidth - imgWidth * ratio) / 2;
    const imgY = 30;
    
    const dateStr = moment().format('DD.MM.YYYY');
    pdf.setFontSize(16);
    pdf.text('Персонал (компактный вид)', pdfWidth / 2, 15, { align: 'center' });
    pdf.setFontSize(12);
    pdf.text(`Дата: ${dateStr}`, pdfWidth / 2, 25, { align: 'center' });
    
    pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio);
    pdf.save(`personnel-board-${moment().format('YYYY-MM-DD')}.pdf`);
  };

  return (
    <Box sx={{ p: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Box>
          <Typography variant="h5">Персонал (компактный вид)</Typography>
          <Typography variant="body2" color="text.secondary">
            Только сотрудники, которые были сегодня ({moment().format('DD.MM.YYYY')})
          </Typography>
        </Box>
        <ButtonGroup variant="contained">
          <Button onClick={saveScreenshot}>Скриншот</Button>
          <Button onClick={savePDF}>PDF</Button>
        </ButtonGroup>
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


