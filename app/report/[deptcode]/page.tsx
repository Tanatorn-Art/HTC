// ...\app\report\[deptcode]\page.tsx
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

  // Separate states for from and to dates
  const [from, setFrom] = useState(initialWorkdate);
  const [to, setTo] = useState(initialWorkdate);
  
  const [details, setDetails] = useState<Detail[]>([]);
  const [deptName, setDeptName] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10); 

  const isValidDate = (dateStr: string) =>
    /^\d{4}-\d{2}-\d{2}$/.test(dateStr) && !isNaN(new Date(dateStr).getTime());

  const goBack = () => {
    router.back();
  };

  useEffect(() => {
    // Validate both from and to dates for the API call
    const invalidDept = !deptcode || deptcode === 'undefined' || deptcode === '';
    const invalidFromDate = !from || !isValidDate(from);
    const invalidToDate = !to || !isValidDate(to);

    if (invalidDept || invalidFromDate || invalidToDate) {
      if (invalidDept) {
        console.error('รหัสแผนกไม่ถูกต้อง:', deptcode);
      }
      if (invalidFromDate) {
        console.error('วันที่เริ่มต้นไม่ถูกต้อง:', from);
      }
      if (invalidToDate) {
        console.error('วันที่สิ้นสุดไม่ถูกต้อง:', to);
      }
      return;
    }

    const fetchDetails = async () => {
      setLoading(true);
      const searchParamsForApi = new URLSearchParams();
      searchParamsForApi.append('from', from);
      searchParamsForApi.append('to', to); // Append 'to' date
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
      } catch (err) {
        console.error('เกิดข้อผิดพลาด:', err);
        setDetails([]);
        setDeptName('เกิดข้อผิดพลาด');
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
   
  }, [deptcode, from, to]); 

  
  const formatTime = (isoString: string | null): string => {
    if (!isoString) return '-';
    try {
      const date = new Date(isoString);
      if (isNaN(date.getTime())) {
        // พยายามดึงส่วนเวลาออกมา 8 ตัว (HH:MM:SS)
        return isoString.substring(0, 8); 
      }
      // ถ้าเป็น Date object ที่ถูกต้อง ให้ format เป็น HH:MM:SS
      return date.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
    } catch (e) {
      console.error("Error formatting time:", isoString, e);
      return isoString.substring(0, 8) || '-'; // Fallback ในกรณีเกิดข้อผิดพลาด
    }
  };

  const exportToCSV = () => {
    if (details.length === 0) {
      console.log('ไม่มีข้อมูลให้ Export'); 
      return;
    }

    const headers = ['ชื่อ-สกุล', 'เวลาเข้า', 'เวลาออก', 'over-in'];
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
    // Adjust download filename to reflect the date range
    link.setAttribute('download', `report_${deptName}_${from}_to_${to}.csv`); 
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // --- ปรับปรุงฟังก์ชัน getOverIn เพื่อให้ถูกต้องเมื่อมีวินาที ---
  const getOverIn = (time: string | null) => {
    if (!time) return null;
    
    let timePart = '';
    try {
        const dateObj = new Date(time);
        if (!isNaN(dateObj.getTime())) { // ถ้าเป็น ISO string ที่ถูกต้อง
            timePart = dateObj.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
        } else { // อาจจะเป็นแค่ "HH:MM:SS" หรือ "HH:MM"
            timePart = time.substring(0,8); 
            if (timePart.length < 8) timePart += ':00'; // เพิ่มวินาทีถ้าไม่มี (HH:MM -> HH:MM:00)
        }
    } catch (e) {
        timePart = time.substring(0,8); 
        if (timePart.length < 8) timePart += ':00';
    }
    
    // สร้าง Date objects สำหรับเปรียบเทียบ โดยใช้ Base Date เดียวกัน
    const overTime = new Date(`1970-01-01T${timePart}`);
    const threshold = new Date('1970-01-01T08:00:00'); // เวลา 08:00:00
    
    // เปรียบเทียบเวลาทั้งหมด (ชั่วโมง, นาที, วินาที)
    if (overTime.getTime() > threshold.getTime()) { // ใช้ getTime() เพื่อเปรียบเทียบ milliseconds
      return formatTime(time); // แสดงเวลาที่เข้างานสายด้วยวินาที
    } else {
      return '-';
    }
  };

  // Keep these validations for initial render based on URL params
  const initialInvalidDept = !deptcode || deptcode === 'undefined' || deptcode === '';
  const initialInvalidWorkdate = !initialWorkdate || !isValidDate(initialWorkdate);

  if (initialInvalidDept) {
    return <div className="p-6 text-red-600">รหัสแผนกไม่ถูกต้อง หรือไม่พบข้อมูลสำหรับแผนกนี้</div>;
  }
  if (initialInvalidWorkdate) {
    return <div className="p-6 text-red-600">รูปแบบวันที่ไม่ถูกต้อง</div>;
  }

  // Paginated data logic remains the same
  const notScannedDetails = details.filter((d) => !d.firstscantime);
  const scannedDetails = details.filter((d) => d.firstscantime);

  // Apply pagination only to the filtered results, not the full dataset
  const paginatedNotScanned = notScannedDetails.slice(0, rowsPerPage);
  const paginatedScanned = scannedDetails.slice(0, rowsPerPage);

  const handleRowsPerPageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setRowsPerPage(Number(e.target.value));
  };

  return (
    <div className="p-6 space-y-6">
      <button
        onClick={goBack}
        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-shadow shadow-md hover:shadow-lg"
      >
        <ArrowLeft className="w-5 h-5" />
        <span>ย้อนกลับ</span>
      </button>

      <h1 className="text-2xl font-bold">
        แผนก: {deptName}  
      </h1>

      <div className="flex flex-wrap items-center gap-3">
        {/* Input for 'From' Date */}
        <label className="flex flex-col items-start">
          <span className="text-gray-700 text-sm font-medium mb-1">จากวันที่:</span>
          <input
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className="border border-slate-300 px-2 py-1 rounded"
          />
        </label>
        {/* Input for 'To' Date */}
        <label className="flex flex-col items-start">
          <span className="text-gray-700 text-sm font-medium mb-1">ถึงวันที่:</span>
          <input
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="border border-slate-300 px-2 py-1 rounded"
          />
        </label>
      </div>

      <div className="flex gap-4">
        <div className="flex-1 bg-blue-100 text-blue-900 p-4 rounded-xl shadow">
          <div className="text-sm">รวมทั้งหมด</div>
          <div className="text-xl font-bold">{details.length} คน</div>
        </div>
        <div className="flex-1 bg-green-100 text-green-900 p-4 rounded-xl shadow">
          <div className="text-sm">สแกนแล้ว</div>
          <div className="text-xl font-bold">{scannedDetails.length} คน</div>
        </div>
        <div className="flex-1 bg-red-100 text-red-900 p-4 rounded-xl shadow">
          <div className="text-sm">ยังไม่สแกน</div>
          <div className="text-xl font-bold">{notScannedDetails.length} คน</div>
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
                ยังไม่สแกน ({notScannedDetails.length} คน)
              </h2>
              <table className="min-w-full bg-white rounded shadow text-sm mb-6">
                <thead className="bg-red-100 text-left">
                  <tr>
                    <th className="p-3">ชื่อ-สกุล</th>
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
                สแกนแล้ว ({scannedDetails.length} คน)
              </h2>
              <table className="min-w-full bg-white rounded shadow text-sm">
                <thead className="bg-green-100 text-left">
                  <tr>
                    <th className="p-3">ชื่อ-สกุล</th>
                    <th className="p-3">เวลาเข้า</th>
                    <th className="p-3">เวลาออก</th>
                    <th className="p-3">เข้างานสาย</th>
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
                เลือกจำนวนแถว:
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