import { useData } from '@/contexts/DataContext';
import { Employee } from '@/types/employee';

export function useEmployees() {
  const { employees, addEmployee, updateEmployee, deleteEmployee } = useData();

  const getEmployeeById = (id: string): Employee | undefined => {
    return employees.find(e => e.id === id);
  };

  const getEmployeesByDepartment = (department: string): Employee[] => {
    return employees.filter(e => e.department === department);
  };

  const getActiveEmployees = (): Employee[] => {
    return employees.filter(e => e.status === 'active');
  };

  return {
    employees,
    addEmployee,
    updateEmployee,
    deleteEmployee,
    getEmployeeById,
    getEmployeesByDepartment,
    getActiveEmployees,
  };
}
