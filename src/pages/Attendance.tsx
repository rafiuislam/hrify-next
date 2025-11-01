import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Header } from '@/components/Header';
import { Navigation } from '@/components/Navigation';
import { Clock, Calendar, Users, AlertCircle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { StatsCard } from '@/components/StatsCard';
import { supabase } from '@/integrations/supabase/client';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface AttendanceRecord {
  id: string;
  employee_id: string;
  date: string;
  check_in: string;
  check_out: string | null;
  total_hours: number;
  overtime: number;
  status: string;
  created_at: string;
}

export default function Attendance() {
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [isWhitelisted, setIsWhitelisted] = useState(true);
  const [currentIP, setCurrentIP] = useState<string>('');

  // Fetch attendance records
  const fetchAttendance = async () => {
    const { data, error } = await supabase
      .from('attendance')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching attendance:', error);
      toast({
        title: "Error",
        description: "Failed to load attendance records",
        variant: "destructive"
      });
    } else {
      setAttendance(data || []);
    }
  };

  // Set up real-time subscription
  useEffect(() => {
    fetchAttendance();

    const channel = supabase
      .channel('attendance-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'attendance'
        },
        (payload) => {
          console.log('Real-time update:', payload);
          fetchAttendance(); // Refresh data on any change
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleCheckIn = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('attendance-action', {
        body: {
          action: 'checkin',
          employeeId: 'current-user'
        }
      });

      if (error) throw error;

      if (data.error) {
        if (data.error === 'Unauthorized location') {
          setIsWhitelisted(false);
          setCurrentIP(data.ip);
        }
        toast({
          title: "Error",
          description: data.message || data.error,
          variant: "destructive"
        });
      } else {
        toast({
          title: "Checked In",
          description: data.message,
        });
      }
    } catch (error: any) {
      console.error('Check-in error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to check in",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCheckOut = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('attendance-action', {
        body: {
          action: 'checkout',
          employeeId: 'current-user'
        }
      });

      if (error) throw error;

      if (data.error) {
        toast({
          title: "Error",
          description: data.message || data.error,
          variant: "destructive"
        });
      } else {
        toast({
          title: "Checked Out",
          description: data.message,
        });
      }
    } catch (error: any) {
      console.error('Check-out error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to check out",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const today = new Date().toISOString().split('T')[0];
  const todayRecords = attendance.filter(record => record.date === today);
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

          {!isWhitelisted && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                You are outside the authorized network (IP: {currentIP}). Check-in/out is only allowed from the office network.
              </AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button 
                  onClick={handleCheckIn} 
                  className="w-full"
                  disabled={loading || !isWhitelisted}
                >
                  <Clock className="h-4 w-4 mr-2" />
                  Check In
                </Button>
                <Button 
                  onClick={handleCheckOut} 
                  variant="outline" 
                  className="w-full"
                  disabled={loading || !isWhitelisted}
                >
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
                    <TableHead>Overtime</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {attendance.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center text-muted-foreground">
                        No attendance records found
                      </TableCell>
                    </TableRow>
                  ) : (
                    attendance.slice(0, 20).map((record) => (
                      <TableRow key={record.id}>
                        <TableCell className="font-medium">{record.employee_id}</TableCell>
                        <TableCell>{new Date(record.date).toLocaleDateString()}</TableCell>
                        <TableCell>
                          {record.check_in ? new Date(record.check_in).toLocaleTimeString() : '-'}
                        </TableCell>
                        <TableCell>
                          {record.check_out ? new Date(record.check_out).toLocaleTimeString() : '-'}
                        </TableCell>
                        <TableCell>{record.total_hours.toFixed(2)} hrs</TableCell>
                        <TableCell>
                          {record.overtime > 0 ? (
                            <span className="text-primary font-medium">{record.overtime.toFixed(2)} hrs</span>
                          ) : (
                            '-'
                          )}
                        </TableCell>
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
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}