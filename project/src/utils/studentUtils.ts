import { studentData } from '../contexts/InventoryContext';

export function getStudentName(studentId: string): string {
  return studentData[studentId]?.name || 'Unknown Student';
} 