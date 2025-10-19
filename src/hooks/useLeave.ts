import { useData } from '@/contexts/DataContext';
import { LeaveRequest } from '@/types/employee';

export function useLeave() {
  const { leaves, addLeave, updateLeave } = useData();

  const getLeaveByEmployeeId = (employeeId: string): LeaveRequest[] => {
    return leaves.filter(l => l.employeeId === employeeId);
  };

  const getPendingLeaves = (): LeaveRequest[] => {
    return leaves.filter(l => l.status === 'pending');
  };

  const getApprovedLeaves = (): LeaveRequest[] => {
    return leaves.filter(l => l.status === 'approved');
  };

  const getRejectedLeaves = (): LeaveRequest[] => {
    return leaves.filter(l => l.status === 'rejected');
  };

  return {
    leaves,
    addLeave,
    updateLeave,
    getLeaveByEmployeeId,
    getPendingLeaves,
    getApprovedLeaves,
    getRejectedLeaves,
  };
}
