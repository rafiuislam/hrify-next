import { useData } from '@/contexts/DataContext';
import { AttendanceRecord } from '@/types/employee';

export function useAttendance() {
  const { attendance, addAttendance, updateAttendance } = useData();

  const getAttendanceByEmployeeId = (employeeId: string): AttendanceRecord[] => {
    return attendance.filter(a => a.employeeId === employeeId);
  };

  const getAttendanceByDate = (date: string): AttendanceRecord[] => {
    return attendance.filter(a => a.date === date);
  };

  const getTodayAttendance = (): AttendanceRecord[] => {
    const today = new Date().toISOString().split('T')[0];
    return getAttendanceByDate(today);
  };

  return {
    attendance,
    addAttendance,
    updateAttendance,
    getAttendanceByEmployeeId,
    getAttendanceByDate,
    getTodayAttendance,
  };
}
