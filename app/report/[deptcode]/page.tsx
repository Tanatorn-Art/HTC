'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { PiSpinnerGapBold } from 'react-icons/pi';
import { ArrowLeft } from 'lucide-react';

type Detail = {
  full_name: string;
  firstscantime: string | null;
  lastscantime: string | null;
};

export default function ReportDetailPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const deptcode = params.deptcode as string;
  const initialWorkdate = searchParams.get('workdate') || '';

  const [from, setFrom] = useState(initialWorkdate);
  const [to, setTo] = useState(initialWorkdate);
  const [details, setDetails] = useState<Detail[]>([]);
  const [deptName, setDeptName] = useState('');
  const [loading, setLoading] = useState(false);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const isValidDate = (dateStr: string) =>
    /^\d{4}-\d{2}-\d{2}$/.test(dateStr) && !isNaN(new Date(dateStr).getTime());

  const goBack = () => {
    router.back();
  };

  useEffect(() => {
    const invalidDept = !deptcode || deptcode === 'undefined' || deptcode === '';
    const invalidWorkdate = !initialWorkdate || !isValidDate(initialWorkdate);

    if (invalidDept || invalidWorkdate) {
      if (invalidDept) console.error('รหัสแผนกไม่ถูกต้อง:', deptcode);
      if (invalidWorkdate) console.error('วันที่ไม่ถูกต้อง:', initialWorkdate);
      return;
    }

    const fetchDetails = async () => {
      setLoading(true);
      const searchParamsForApi = new URLSearchParams();
      searchParamsForApi.append('from', from);
      searchParamsForApi.append('to', to);
      searchParamsForApi.append('deptcode', deptcode);

      try {
        const res = await fetch(`/api/attendance/report/detail?${searchParamsForApi.toString()}`);
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.error || 'Failed to fetch report detail data');
        }
        const data = await res.json();
        setDetails(data.detil || []);
        setDeptName(data.deptname || 'ไม่พบชื่อแผนก');
      } catch {
        console.error('เกิดข้อผิดพลาด');
        setDetails([]);
        setDeptName('เกิดข้อผิดพลาด');
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [deptcode, from, to, initialWorkdate]);

  const formatTime = (isoString: string | null): string => {
    if (!isoString) return '-';
    try {
      const date = new Date(isoString);
      if (isNaN(date.getTime())) return isoString.substring(0, 8);
      return date.toLocaleTimeString('th-TH', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      });
    } catch {
      return isoString.substring(0, 8) || '-';
    }
  };

  const exportToCSV = () => {
    if (details.length === 0) {
      alert('ไม่มีข้อมูลให้ Export');
      return;
    }

    const headers = ['ชื่อ-สกุล', 'เวลาเข้า', 'เวลาออก', 'เข้างานสาย'];
    const rows = details.map((d) => [
      d.full_name,
      formatTime(d.firstscantime),
      formatTime(d.lastscantime),
      getOverIn(d.firstscantime) || '-',
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers, ...rows].map((e) => e.join(',')).join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `report_${deptName}_${from}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getOverIn = (time: string | null) => {
    if (!time) return null;

    let timePart = '';
    try {
      const dateObj = new Date(time);
      if (!isNaN(dateObj.getTime())) {
        timePart = dateObj.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false,
        });
      } else {
        timePart = time.substring(0, 8);
        if (timePart.length < 8) timePart += ':00';
      }
    } catch {
      timePart = time.substring(0, 8);
      if (timePart.length < 8) timePart += ':00';
    }

    const overTime = new Date(`1970-01-01T${timePart}`);
    const threshold = new Date('1970-01-01T08:00:00');

    return overTime > threshold ? formatTime(time) : '-';
  };

  const notScannedDetails = details.filter((d) => !d.firstscantime);
  const scannedDetails = details.filter((d) => d.firstscantime);

  const paginatedNotScanned = notScannedDetails.slice(0, rowsPerPage);
  const paginatedScanned = scannedDetails.slice(0, rowsPerPage);

  const handleRowsPerPageChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setRowsPerPage(Number(event.target.value));
  };

  const invalidDept = !deptcode || deptcode === 'undefined' || deptcode === '';
  const invalidWorkdate = !initialWorkdate || !isValidDate(initialWorkdate);

  if (invalidDept) {
    return <div className="p-6 text-red-600">รหัสแผนกไม่ถูกต้อง หรือไม่พบข้อมูลสำหรับแผนกนี้</div>;
  }

  if (invalidWorkdate) {
    return <div className="p-6 text-red-600">รูปแบบวันที่ไม่ถูกต้อง</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <button
        onClick={goBack}
        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-shadow shadow-md hover:shadow-lg"
      >
        <ArrowLeft className="w-5 h-5" />
        <span>Back</span>
      </button>

      <h1 className="text-2xl font-bold">แผนก: {deptName} ({from})</h1>

      <div className="flex flex-wrap items-center gap-3">
        <input
          type="date"
          value={from}
          onChange={(e) => {
            setFrom(e.target.value);
            setTo(e.target.value);
          }}
          className="border border-slate-300 px-2 py-1 rounded"
        />
      </div>

     <div className="flex gap-4 flex-wrap">
  <div className="flex items-center gap-4 bg-blue-100 text-blue-900 p-4 rounded-xl shadow min-w-[200px] flex-1 max-w-[300px]">
    <div className="text-left">
      <div className="text-2xl font-extrabold">{details.length}</div>
      <div className="text-base font-medium">Total</div>
    </div>
  </div>

  <div className="flex items-center gap-4 bg-green-100 text-green-900 p-4 rounded-xl shadow min-w-[200px] flex-1 max-w-[300px]">
    <div className="text-left">
      <div className="text-2xl font-extrabold">{scannedDetails.length}</div>
      <div className="text-base font-medium">Scan</div>
    </div>
  </div>

  <div className="flex items-center gap-4 bg-red-100 text-red-900 p-4 rounded-xl shadow min-w-[200px] flex-1 max-w-[300px]">
    <div className="text-left">
      <div className="text-2xl font-extrabold">{notScannedDetails.length}</div>
      <div className="text-base font-medium">No Scan</div>
    </div>
  </div>
</div>


      {loading ? (
        <div className="flex justify-center py-10 text-gray-500 animate-spin">
          <PiSpinnerGapBold size={36} className="text-primary" />
        </div>
      ) : (
        <>
          {notScannedDetails.length > 0 && (
            <>
              <h2 className="text-lg font-semibold mt-6">
                No Scan ({notScannedDetails.length} คน)
              </h2>
              <table className="min-w-full bg-white rounded shadow text-sm mb-6">
                <thead className="bg-red-100 text-left">
                  <tr>
                    <th className="p-3">FullName</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedNotScanned.map((row, idx) => (
                    <tr key={idx}>
                      <td className="p-3">{row.full_name}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}

          {scannedDetails.length > 0 && (
            <>
              <h2 className="text-lg font-semibold mt-6">
                Scan ({scannedDetails.length} คน)
              </h2>
              <table className="min-w-full bg-white rounded shadow text-sm">
                <thead className="bg-green-100 text-left">
                  <tr>
                    <th className="p-3">FullName</th>
                    <th className="p-3">Time In</th>
                    <th className="p-3">Time Out</th>
                    <th className="p-3">Over In</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedScanned.map((row, idx) => (
                    <tr key={idx}>
                      <td className="p-3">{row.full_name}</td>
                      <td className="p-3">{formatTime(row.firstscantime)}</td>
                      <td className="p-3">{formatTime(row.lastscantime)}</td>
                      <td className="p-3">{getOverIn(row.firstscantime) || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}

          {details.length > 0 && (
            <div className="flex flex-wrap items-center justify-center gap-4 mt-4">
              <label htmlFor="rows-per-page-bottom" className="text-sm font-medium text-gray-700">
                select row :
              </label>
              <select
                id="rows-per-page-bottom"
                value={rowsPerPage}
                onChange={handleRowsPerPageChange}
                className="border border-slate-300 px-2 py-1 rounded"
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
                <option value={details.length}>ทั้งหมด</option>
              </select>

              <button
                onClick={exportToCSV}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Export CSV
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
