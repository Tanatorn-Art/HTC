export async function fetchEmployees(departmentId?: number) {
  const url = departmentId
    ? `/api/employees?departmentId=${departmentId}`
    : '/api/employees';

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Failed to fetch employees');
  }
  return response.json();
}

export async function fetchAttendanceSummary(date: string) {
  const response = await fetch(`/api/attendance-summary?date=${date}`);
  if (!response.ok) {
    throw new Error('Failed to fetch attendance summary');
  }
  return response.json();
}

export async function getWeComToken() {
  const response = await fetch('/api/wecom/token');
  if (!response.ok) {
    throw new Error('Failed to fetch WeCom token');
  }
  return response.json();
}

const API = process.env.NEXT_PUBLIC_API_URL;

export const fetchDepartments = async () => {
  const res = await fetch(`${API}/api/org/departments`);
  return res.json();
};

export const fetchAttendance = async (date: string, deptId: number) => {
  const res = await fetch(`${API}/api/attendance?date=${date}&departmentId=${deptId}`);
  return res.json();
};

export const sendWeComMessage = async (toUser: string, content: string) => {
  const res = await fetch(`${API}/api/wecom/send`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ toUser, content }),
  });
  return res.json();
};

export async function getDepartments() {
  const res = await fetch('/api/org/departments');
  if (!res.ok) {
    throw new Error('Failed to fetch departments');
  }
  return res.json();
}

export async function updateHodSettings(data: Record<number, string>) {
  const res = await fetch('/api/settings/hod', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ hods: data }),
  });
  if (!res.ok) {
    throw new Error('Failed to update HOD settings');
  }
  return res.json();
}