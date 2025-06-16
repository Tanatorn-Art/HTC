/** D:\สหกิจ\facescan\HTC\app\types\index.ts */
/**
 * @typedef Employee
 * @description Represents individual employee data, likely for detailed views or raw data before aggregation.
 */
export type Employee = {
  employeeId: string;
  groupid: string;
  groupname: string;
  workdate: string;
  deptcode: string;
  deptname: string;
  deptsbu: string;
  deptstd: string;
  countscan: number; 
  countnotscan: number; 
  countperson: number; 
  late?: number; 
};

/**
 * @typedef ReportApiRawData
 * @description Represents the raw data format received directly from an API,
 * where count-related fields are typically strings before type conversion.
 */
export type ReportApiRawData = {
  employeeId?: string;
  groupid?: string;
  groupname?: string;
  workdate?: string;
  deptcode?: string;
  deptname?: string;
  deptsbu?: string;
  deptstd?: string;
  countscan?: string; // จำนวนที่สแกน (เป็นสตริง)
  countnotscan?: string; // จำนวนที่ยังไม่สแกน (เป็นสตริง)
  countperson?: string; // จำนวนคนทั้งหมด (เป็นสตริง)
  late?: string; // จำนวนที่มาสาย (เป็นสตริง, ไม่จำเป็น)
};

/**
 * @typedef HierarchicalDepartment
 * @description Represents aggregated department data with a hierarchical structure,

 */
export type HierarchicalDepartment = {
  deptcode: string;
  hierarchy: string; // เช่น "President → HR → HR PF" แสดงลำดับชั้นแผนก
  parentcode: string | null;
  deptsbu: string;
  deptstd: string;
  countscan: string; // จำนวนคนสแกนรวม (เป็นสตริงจาก API)
  countnotscan: string; // จำนวนคนไม่สแกนรวม (เป็นสตริงจาก API)
  countperson: string; // จำนวนคนทั้งหมดรวม (เป็นสตริงจาก API)
  workdate: string; // วันที่ทำงาน (จาก API)
  persontype: string | null; // ประเภทบุคคล (จาก API)
  persongroup: string | null; // กลุ่มบุคคล (จาก API)
  min_level: number; // ระดับของแผนกใน hierarchy
};