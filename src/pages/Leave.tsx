import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Header } from '@/components/Header';
import { Navigation } from '@/components/Navigation';
import { LeaveRequest } from '@/types/employee';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { Calendar, Plus, Check, X } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { StatsCard } from '@/components/StatsCard';

export default function Leave() {
  const [leaveRequests, setLeaveRequests] = useLocalStorage<LeaveRequest[]>('hrms_leave_requests', []);

  useEffect(() => {
    // Initialize with sample data if empty
    if (leaveRequests.length === 0) {
      const sampleRequests: LeaveRequest[] = [
        {
          id: '1',
          employeeId: '1',
          type: 'vacation',
          startDate: '2024-01-20',
          endDate: '2024-01-25',
          reason: 'Family vacation',
          status: 'approved',
          appliedDate: '2024-01-10',
          approvedBy: 'HR Manager',
          approvedDate: '2024-01-12'
        },
        {
          id: '2',
          employeeId: '2',
          type: 'sick',
          startDate: '2024-01-15',
          endDate: '2024-01-16',
          reason: 'Medical appointment',
          status: 'pending',
          appliedDate: '2024-01-14'
        },
        {
          id: '3',
          employeeId: '3',
          type: 'personal',
          startDate: '2024-01-30',
          endDate: '2024-01-30',
          reason: 'Personal matters',
          status: 'rejected',
          appliedDate: '2024-01-25'
        }
      ];
      setLeaveRequests(sampleRequests);
    }
  }, [leaveRequests.length, setLeaveRequests]);

  const handleApprove = (id: string) => {
    setLeaveRequests(prev => prev.map(request => 
      request.id === id 
        ? { 
            ...request, 
            status: 'approved', 
            approvedBy: 'HR Manager', 
            approvedDate: new Date().toISOString().split('T')[0] 
          }
        : request
    ));
    toast({
      title: "Leave Approved",
      description: "The leave request has been approved.",
    });
  };

  const handleReject = (id: string) => {
    setLeaveRequests(prev => prev.map(request => 
      request.id === id ? { ...request, status: 'rejected' } : request
    ));
    toast({
      title: "Leave Rejected",
      description: "The leave request has been rejected.",
      variant: "destructive",
    });
  };

  const pendingRequests = leaveRequests.filter(req => req.status === 'pending').length;
  const approvedRequests = leaveRequests.filter(req => req.status === 'approved').length;
  const rejectedRequests = leaveRequests.filter(req => req.status === 'rejected').length;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex">
        <Navigation />
        <main className="flex-1 p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">Leave Management</h1>
            <p className="text-muted-foreground">Manage employee leave requests and balances</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <StatsCard
              title="Pending Requests"
              value={pendingRequests}
              icon={Calendar}
              changeType="neutral"
            />
            <StatsCard
              title="Approved Requests"
              value={approvedRequests}
              icon={Check}
              changeType="positive"
            />
            <StatsCard
              title="Rejected Requests"
              value={rejectedRequests}
              icon={X}
              changeType="negative"
            />
          </div>

          <div className="flex justify-between items-center mb-6">
            <div></div>
            <Button className="bg-primary hover:bg-primary/90">
              <Plus className="h-4 w-4 mr-2" />
              New Leave Request
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>All Leave Requests</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee ID</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Start Date</TableHead>
                    <TableHead>End Date</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {leaveRequests.map((request) => (
                    <TableRow key={request.id}>
                      <TableCell className="font-medium">{request.employeeId}</TableCell>
                      <TableCell className="capitalize">{request.type}</TableCell>
                      <TableCell>{new Date(request.startDate).toLocaleDateString()}</TableCell>
                      <TableCell>{new Date(request.endDate).toLocaleDateString()}</TableCell>
                      <TableCell>{request.reason}</TableCell>
                      <TableCell>
                        <Badge 
                          variant={
                            request.status === 'approved' ? 'default' : 
                            request.status === 'rejected' ? 'destructive' : 
                            'secondary'
                          }
                        >
                          {request.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {request.status === 'pending' && (
                          <div className="flex space-x-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleApprove(request.id)}
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleReject(request.id)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
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