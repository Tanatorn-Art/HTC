// app/types/employee.ts
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

export type ReportApiRawData = {
  employeeId?: string;
  groupid?: string;
  groupname?: string;
  workdate?: string;
  deptcode?: string;
  deptname?: string;
  deptsbu?: string;
  deptstd?: string;
  countscan?: string;
  countnotscan?: string;
  countperson?: string;
  late?: string;
};
