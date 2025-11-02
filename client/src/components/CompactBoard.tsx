import React, { useEffect, useState, useRef } from 'react';
import {
  Box,
  Typography,
  Button,
  Avatar,
  ButtonGroup,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  useMediaQuery,
  useTheme,
  Card,
  CardContent,
  Chip,
} from '@mui/material';
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
  departureTime?: string;
  remarks?: string;
  isPresent: boolean;
}

const CompactBoard: React.FC = () => {
  const [records, setRecords] = useState<TimeRecord[]>([]);
  const boardRef = useRef<HTMLDivElement | null>(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));

  useEffect(() => {
    (async () => {
      const today = moment().format('YYYY-MM-DD');
      const recordsRes = await axios.get(`/api/time-tracking/date/${today}`);
      const records: TimeRecord[] = recordsRes.data;
      
      // Сортируем по времени прибытия
      const sortedRecords = records
        .filter(r => r.arrivalTime) // Только с прибытием
        .sort((a, b) => {
          const timeA = a.arrivalTime ? moment(a.arrivalTime).valueOf() : 0;
          const timeB = b.arrivalTime ? moment(b.arrivalTime).valueOf() : 0;
          return timeA - timeB;
        });
      
      setRecords(sortedRecords);
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

  // Мобильный вид - карточки
  if (isMobile) {
    return (
      <Box sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 2 }}>
          <Box>
            <Typography variant="h5">Персонал (мобильный вид)</Typography>
            <Typography variant="body2" color="text.secondary">
              Только сотрудники, которые были сегодня ({moment().format('DD.MM.YYYY')})
            </Typography>
          </Box>
          <ButtonGroup variant="contained" fullWidth>
            <Button onClick={saveScreenshot} size="small">Скриншот</Button>
            <Button onClick={savePDF} size="small">PDF</Button>
          </ButtonGroup>
        </Box>

        <Box ref={boardRef}>
          {records.map(record => (
            <Card key={record._id} sx={{ mb: 2 }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <Avatar
                    src={record.personnelId.photo ? `/uploads/${record.personnelId.photo}` : undefined}
                    sx={{ width: 40, height: 40 }}
                  />
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="subtitle1" fontWeight="bold">
                      {record.personnelId.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {record.personnelId.position}
                    </Typography>
                  </Box>
                  {record.departureTime ? (
                    <Chip label="Ушел" size="small" color="default" />
                  ) : (
                    <Chip label="На работе" size="small" color="success" />
                  )}
                </Box>
                
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, mt: 1.5 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="text.secondary">Приезд:</Typography>
                    <Typography variant="body2" fontWeight="medium">
                      {record.arrivalTime ? moment(record.arrivalTime).format('HH:mm') : '-'}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="text.secondary">Уезд:</Typography>
                    <Typography variant="body2" fontWeight="medium">
                      {record.departureTime ? moment(record.departureTime).format('HH:mm') : '-'}
                    </Typography>
                  </Box>
                  {record.remarks && (
                    <Box sx={{ mt: 1, pt: 1, borderTop: '1px solid', borderColor: 'divider' }}>
                      <Typography variant="caption" color="text.secondary">Комментарии:</Typography>
                      <Typography variant="body2">{record.remarks}</Typography>
                    </Box>
                  )}
                </Box>
              </CardContent>
            </Card>
          ))}
        </Box>
      </Box>
    );
  }

  // Десктоп/планшет вид - таблица
  return (
    <Box sx={{ p: 2 }}>
      <Box sx={{ 
        display: 'flex', 
        flexDirection: { xs: 'column', sm: 'row' },
        justifyContent: 'space-between', 
        alignItems: { xs: 'flex-start', sm: 'center' }, 
        mb: 2,
        gap: 2 
      }}>
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

      <TableContainer component={Paper} ref={boardRef}>
        <Table sx={{ minWidth: 650 }} size={isTablet ? 'small' : 'medium'}>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold' }}>Имя</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }} align="center">Приезд</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }} align="center">Уезд</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Комментарии</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {records.map((record) => (
              <TableRow key={record._id} hover>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Avatar
                      src={record.personnelId.photo ? `/uploads/${record.personnelId.photo}` : undefined}
                      sx={{ width: 32, height: 32 }}
                    />
                    <Box>
                      <Typography variant="body2" fontWeight="medium">
                        {record.personnelId.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {record.personnelId.position}
                      </Typography>
                    </Box>
                  </Box>
                </TableCell>
                <TableCell align="center">
                  <Typography variant="body2">
                    {record.arrivalTime ? moment(record.arrivalTime).format('HH:mm') : '-'}
                  </Typography>
                </TableCell>
                <TableCell align="center">
                  {record.departureTime ? (
                    <Typography variant="body2">
                      {moment(record.departureTime).format('HH:mm')}
                    </Typography>
                  ) : (
                    <Chip label="На работе" size="small" color="success" />
                  )}
                </TableCell>
                <TableCell>
                  <Typography variant="body2" sx={{ maxWidth: { xs: 150, md: 300 }, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {record.remarks || '-'}
                  </Typography>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default CompactBoard;


