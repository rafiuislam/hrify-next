import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Header } from '@/components/Header';
import { Navigation } from '@/components/Navigation';
import { AttendanceRecord } from '@/types/employee';
import { useAttendance } from '@/hooks/useAttendance';
import { Clock, Calendar, Users } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { StatsCard } from '@/components/StatsCard';

export default function Attendance() {
  const { attendance, addAttendance, updateAttendance, getTodayAttendance } = useAttendance();

  const handleCheckIn = () => {
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const currentTime = now.toTimeString().slice(0, 5);
    
    const newRecord: AttendanceRecord = {
      id: `current-user-${today}`,
      employeeId: 'current-user',
      date: today,
      checkIn: currentTime,
      checkOut: '',
      status: 'present',
      totalHours: 0
    };
    
    addAttendance(newRecord);
    toast({
      title: "Checked In",
      description: `Check-in recorded at ${currentTime}`,
    });
  };

  const handleCheckOut = () => {
    const now = new Date();
    const currentTime = now.toTimeString().slice(0, 5);
    
    const userRecord = attendance.find(record => 
      record.employeeId === 'current-user' && record.checkOut === ''
    );
    
    if (userRecord) {
      const checkInTime = new Date(`1970-01-01T${userRecord.checkIn}:00`);
      const checkOutTime = new Date(`1970-01-01T${currentTime}:00`);
      const totalHours = (checkOutTime.getTime() - checkInTime.getTime()) / (1000 * 60 * 60);
      
      updateAttendance(userRecord.id, {
        ...userRecord,
        checkOut: currentTime,
        totalHours: Number(totalHours.toFixed(2))
      });
    }
    
    toast({
      title: "Checked Out",
      description: `Check-out recorded at ${currentTime}`,
    });
  };

  const todayRecords = getTodayAttendance();
  const presentToday = todayRecords.filter(record => record.status === 'present').length;
  const absentToday = todayRecords.filter(record => record.status === 'absent').length;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex">
        <Navigation />
        <main className="flex-1 p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">Attendance Management</h1>
            <p className="text-muted-foreground">Track and manage employee attendance</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <StatsCard
              title="Present Today"
              value={presentToday}
              icon={Users}
              changeType="positive"
            />
            <StatsCard
              title="Absent Today"
              value={absentToday}
              icon={Calendar}
              changeType="negative"
            />
            <StatsCard
              title="Total Records"
              value={attendance.length}
              icon={Clock}
              changeType="neutral"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button onClick={handleCheckIn} className="w-full">
                  <Clock className="h-4 w-4 mr-2" />
                  Check In
                </Button>
                <Button onClick={handleCheckOut} variant="outline" className="w-full">
                  <Clock className="h-4 w-4 mr-2" />
                  Check Out
                </Button>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Recent Attendance Records</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee ID</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Check In</TableHead>
                    <TableHead>Check Out</TableHead>
                    <TableHead>Total Hours</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {attendance.slice(0, 20).map((record) => (
                    <TableRow key={record.id}>
                      <TableCell className="font-medium">{record.employeeId}</TableCell>
                      <TableCell>{new Date(record.date).toLocaleDateString()}</TableCell>
                      <TableCell>{record.checkIn}</TableCell>
                      <TableCell>{record.checkOut || '-'}</TableCell>
                      <TableCell>{record.totalHours}</TableCell>
                      <TableCell>
                        <Badge 
                          variant={
                            record.status === 'present' ? 'default' : 
                            record.status === 'absent' ? 'destructive' : 
                            'secondary'
                          }
                        >
                          {record.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}