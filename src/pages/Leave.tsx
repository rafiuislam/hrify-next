import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Header } from '@/components/Header';
import { Navigation } from '@/components/Navigation';
import { LeaveRequest } from '@/types/employee';
import { useLeave } from '@/hooks/useLeave';
import { Calendar, Plus, Check, X } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { StatsCard } from '@/components/StatsCard';
import { useAuth } from '@/contexts/AuthContext';

export default function Leave() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { leaves, updateLeave, getPendingLeaves, getApprovedLeaves, getRejectedLeaves } = useLeave();

  const handleApprove = (id: string) => {
    const leave = leaves.find(l => l.id === id);
    if (leave) {
      updateLeave(id, {
        ...leave,
        status: 'approved',
        approvedBy: 'HR Manager',
        approvedDate: new Date().toISOString().split('T')[0]
      });
      toast({
        title: "Leave Approved",
        description: "The leave request has been approved.",
      });
    }
  };

  const handleReject = (id: string) => {
    const leave = leaves.find(l => l.id === id);
    if (leave) {
      updateLeave(id, { ...leave, status: 'rejected' });
      toast({
        title: "Leave Rejected",
        description: "The leave request has been rejected.",
        variant: "destructive",
      });
    }
  };

  const pendingRequests = getPendingLeaves().length;
  const approvedRequests = getApprovedLeaves().length;
  const rejectedRequests = getRejectedLeaves().length;

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
            <Button 
              className="bg-primary hover:bg-primary/90"
              onClick={() => navigate('/new-leave-request')}
            >
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
                  {leaves.map((request) => (
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
                        {request.status === 'pending' && (user?.role === 'admin' || user?.role === 'hr') && (
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