interface Props {
  departments: {
    id: number;
    name: string;
    employees: { id: number; name: string; wecom_id: string }[];
  }[];
  hods: { [deptId: number]: string };
  setHods: (value: { [deptId: number]: string }) => void;
}

export default function WeComSettingsTable({ departments, hods, setHods }: Props) {
  const handleResetDept = (deptId: number) => {
    const updated = { ...hods };
    delete updated[deptId]; 
    setHods(updated);
  };

  return (
    <div className="space-y-4">
      {departments.map((dept) => (
        <div key={dept.id} className="border p-4 rounded">
          <div className="flex justify-between items-center mb-2">
            <p className="font-semibold">{dept.name}</p>
            <button
              onClick={() => handleResetDept(dept.id)}
              className="text-sm text-gray-500 hover:underline"
            >
               รีเซ็ตแผนกนี้
            </button>
          </div>

          <select
            value={hods[dept.id] || ''}
            onChange={(e) =>
              setHods({ ...hods, [dept.id]: e.target.value })
            }
            className="w-full border rounded px-4 py-2"
          >
            <option value="">-- เลือกหัวหน้า --</option>
            {dept.employees.map(emp => (
              <option key={emp.id} value={emp.wecom_id}>
                {emp.name} ({emp.wecom_id})
              </option>
            ))}
          </select>

          {hods[dept.id] === '' && (
            <p className="text-red-500 text-sm mt-1"> ยังไม่ได้เลือกหัวหน้า</p>
          )}
        </div>
      ))}
    </div>
  );
}
