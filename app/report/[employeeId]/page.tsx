'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { PiSpinnerGapBold } from 'react-icons/pi';
import Breadcrumb from '@/components/Breadcrumb';

type Detail = {
  groupid: number;
  groupname: string;
  deptcode: number;
  deptname: string;
  person_id: number;
  person_code: number;
  fullname: string;
  department: string;
  date: string;
  checkIn: string | null;
  checkOut: string | null;
};

export default function ReportDetailPage() {
  const { deptcode } = useParams();
  const [details, setDetails] = useState<Detail[]>([]);
  const [deptName, setDeptName] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const isValidDate = (dateStr: string) =>
    /^\d{4}-\d{2}-\d{2}$/.test(dateStr) && !isNaN(new Date(dateStr).getTime());

  const invalidDept = !deptcode || isNaN(Number(deptcode));
  const invalidDate = (from && !isValidDate(from)) || (to && !isValidDate(to));

  useEffect(() => {
    if (invalidDept || invalidDate) return;

    const fetchDetails = async () => {
      setLoading(true);
      const params = new URLSearchParams();
      if (from) params.append('from', from);
      if (to) params.append('to', to);
      params.append('deptcode', deptcode as string);

      const res = await fetch(`/api/attendance/report/detail?${params.toString()}`);
      const data = await res.json();
      setDetails(data.records);
      setDeptName(data.deptname || '');
      setLoading(false);
    };

    fetchDetails();
  }, [deptcode, from, to, invalidDept, invalidDate]);

  const exportToCSV = () => {
    if (details.length === 0) return;

    const headers = ['ชื่อ', 'เวลาเข้า', 'เวลาออก'];
    const rows = details.map((d) => [d.fullname, d.checkIn || '-', d.checkOut || '-']);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers, ...rows].map((e) => e.join(',')).join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `report_${deptName}_${from || 'start'}_to_${to || 'end'}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (invalidDept) {
    return <div className="text-red-600">รหัสแผนกไม่ถูกต้อง</div>;
  }
  if (invalidDate) {
    return <div className="text-red-600">วันที่ไม่ถูกต้อง</div>;
  }

  const filtered = details;

  const total = details.length;
  const came = details.filter((d) => d.checkIn).length;
  const absent = details.filter((d) => !d.checkIn).length;

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginatedData = filtered.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="p-6 space-y-6">
      <Breadcrumb
        items={[
          { label: 'หน้าแรก', href: '/' },
          { label: 'รายงาน', href: '/report' },
          { label: deptName },
        ]}
      />

      <h1 className="text-2xl font-bold">รายละเอียดแผนก: {deptName}</h1>

      <div className="flex items-center gap-3">
        <label className="text-sm font-medium">เลือกวันที่:</label>
        <input
          type="date"
          value={from}
          onChange={(e) => setFrom(e.target.value)}
          className="border border-slate-300 px-2 py-1 rounded"
        />
        <span>ถึง</span>
        <input
          type="date"
          value={to}
          onChange={(e) => setTo(e.target.value)}
          className="border border-slate-300 px-2 py-1 rounded"
        />
        <button
          onClick={exportToCSV}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Export CSV
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-blue-100 text-blue-900 p-4 rounded-xl shadow">
          <div className="text-sm">ทั้งหมด</div>
          <div className="text-xl font-bold">{total} คน</div>
        </div>
        <div className="bg-green-100 text-green-900 p-4 rounded-xl shadow">
          <div className="text-sm">มาแล้ว</div>
          <div className="text-xl font-bold">{came} คน</div>
        </div>
        <div className="bg-red-100 text-red-900 p-4 rounded-xl shadow">
          <div className="text-sm">ไม่มา</div>
          <div className="text-xl font-bold">{absent} คน</div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-10 text-gray-500 animate-spin">
          <PiSpinnerGapBold size={36} className="text-primary" />
        </div>
      ) : (
        <>
          <table className="min-w-full bg-white rounded shadow text-sm">
            <thead className="bg-gray-100 text-left">
              <tr>
                <th className="p-3">ชื่อ</th>
                <th className="p-3">เวลาเข้า</th>
                <th className="p-3">เวลาออก</th>
              </tr>
            </thead>
            <tbody>
              {paginatedData.map((row, idx) => (
                <tr key={idx}>
                  <td className="p-3">{row.fullname}</td>
                  <td className="p-3">{row.checkIn || '-'}</td>
                  <td className="p-3">{row.checkOut || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-4">
              <button
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 rounded bg-slate-200 hover:bg-slate-300 disabled:opacity-50"
              >
                ◀ ก่อนหน้า
              </button>
              <span className="text-sm font-medium px-2 py-1">
                หน้า {currentPage} / {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 rounded bg-slate-200 hover:bg-slate-300 disabled:opacity-50"
              >
                ถัดไป ▶
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
