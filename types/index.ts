// พนักงาน
export interface Employee {
  id: number;
  name: string;
  departmentId: number;
  checkInTime: string | null;
  checkOutTime: string | null;
}

// แผนก
export interface Department {
  id: number;
  name: string;
  hod_wecom_id?: string; // เพิ่มฟิลด์ hod_wecom_id
}

// สรุปการเช็คอิน/เช็คเอาท์
export interface AttendanceSummary {
  date: string;
  totalEmployees: number;
  checkedIn: number;
  notCheckedIn: number;
}

// ข้อมูลการเข้าออกต่อวัน
export interface DailyAttendance {
  employeeId: number;
  name: string;
  department: string;
  checkInTime: string | null;
  checkOutTime: string | null;
}

// HOD / หัวหน้าแผนก
export interface HOD {
  id: number;
  name: string;
}

// การตั้งค่า WeCom
export interface WeComSettings {
  hodId: number;
  departmentIds: number[];
  receiveOnScan: boolean;
}