'use client';

import { useState } from 'react';
import ReportFilterForm from '@/components/ReportFilterForm';
import { DepartmentTable } from '@/components/DepartmentTable';
import Papa from 'papaparse';

type filters = {
  date: string;
  departmentId: string;
  employeeId: string;
};

type Record = {
  workda
}