// app/types/employee.ts

// Type สำหรับข้อมูลดิบที่ได้รับจาก API
export type ReportApiRawData = {
  employeeId?: string;
  groupid?: string;
  groupname?: string;
  workdate: string; // ควรเป็น string เสมอ ตามข้อมูลตัวอย่าง
  deptcode: string; // อันนี้คือ deptcode 8 หลักเต็มจาก API
  deptname: string; // ควรเป็น string เสมอ
  deptsbu?: string;
  deptstd?: string | null; // จากตัวอย่างคือ "M001" หรืออาจเป็น null ได้
  
  // *** ฟิลด์เหล่านี้คือส่วนที่ API "ควร" จะส่งมาด้วยเพื่อให้แสดงผลได้ถูกต้อง ***
  countscan?: string;      // คาดว่า API จะส่งเป็น string
  countnotscan?: string;   // คาดว่า API จะส่งเป็น string
  countperson?: string;    // คาดว่า API จะส่งเป็น string
  late?: string;           // คาดว่า API จะส่งเป็น string

  // *** ฟิลด์เพิ่มเติมที่พบในข้อมูลตัวอย่างที่คุณให้มา (API ควรจะส่งมา) ***
  deptcodelevel1?: string; 
  deptcodelevel2?: string; 
  deptcodelevel3?: string; 
  deptcodelevel4?: string; 
  parentcode?: string | null; 
};

// Type สำหรับ Employee ที่ถูกประมวลผลแล้ว เพื่อใช้ใน Front-end
// ข้อมูลใน Type นี้จะถูก Map มาจาก ReportApiRawData
export type Employee = {
  employeeId: string;
  groupid: string;
  groupname: string;
  workdate: string;
  
  // deptcode นี้จะเก็บค่า 6 หลักที่เราใช้ในการกรอง และเป็นตัวแทนระดับสุดท้ายในการกรอง (แผนกย่อย/ส่วนงาน)
  deptcode: string; // เช่น "010203" (6 หลัก)

  deptname: string; // ชื่อของส่วนงาน/หน่วยงานที่ตรงกับ deptcode (6 หลัก)
  
  deptsbu: string;
  deptstd: string | null; // ควรสะท้อนความเป็นไปได้ของข้อมูลจริง

  countscan: number;
  countnotscan: number;
  countperson: number;
  late: number;

  // เพิ่ม fields สำหรับข้อมูลลำดับชั้น (สำหรับ UI หรือ Logic อื่นๆ)
  factoryCode: string; 
  factoryName: string; 
  mainDepartmentCode: string; 
  mainDepartmentName: string; 
  subDepartmentCode: string; 
  subDepartmentName: string; 

  // *** ฟิลด์นี้สำคัญ: เก็บ deptcode 8 หลักเต็มจาก API เพื่อใช้แสดงผลในตาราง ***
  originalFullDeptcode: string; 
};