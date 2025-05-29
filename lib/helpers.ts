export function formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
  
  export function calculateCheckedIn(employees: { checkInTime: string | null }[]): number {
    return employees.filter(employee => employee.checkInTime !== null).length;
  }
  
  export function calculateNotCheckedIn(employees: { checkInTime: string | null }[]): number {
    return employees.filter(employee => employee.checkInTime === null).length;
  }
  