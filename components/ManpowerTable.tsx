'use client';

import { useEffect, useState } from 'react';
import Spinner from '@/components/ui/Spinner';

type Manpower = {
  section: string;
  type: string;
  sbu: string;
  current: number;
  htc_thai: number;
  htc_kh: number;
  sub_thai: number;
  sub_kh: number;
  htc_ho: number;
  management_ho: number;
  foreign_ho: number;
};

export function ManpowerTable() {
  const [data, setData] = useState<Manpower[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch('/api/manpower');
        const result = await res.json();
        setData(result);
      } catch (error) {
        console.error('Error fetching manpower:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  if (loading) {
    return <Spinner />;
  }

  if (!data.length) {
    return <div className="text-center text-gray-500">ไม่พบข้อมูลพนักงานในขณะนี้</div>;
  }

  return (
    <div className="overflow-x-auto bg-white rounded-xl shadow-md p-4">
      <table className="min-w-full text-sm text-center border-collapse">
        <thead className="bg-yellow-100 text-gray-700">
          <tr>
            <th className="px-4 py-2">Section</th>
            <th className="px-4 py-2">Type</th>
            <th className="px-4 py-2">SBU HC</th>
            <th className="px-4 py-2">Current HC(1)</th>
            <th className="px-4 py-2">HTC THAI (KB)</th>
            <th className="px-4 py-2">HTC KH (KB)</th>
            <th className="px-4 py-2">Sub THAI (KB)</th>
            <th className="px-4 py-2">Sub KH (KB)</th>
            <th className="px-4 py-2">HTC (HO)</th>
            <th className="px-4 py-2">Management (HO)</th>
            <th className="px-4 py-2">Foreign (HO)</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row, idx) => (
            <tr key={idx} className="border-t hover:bg-gray-50">
              <td className="px-4 py-2">{row.section}</td>
              <td className="px-4 py-2">{row.type}</td>
              <td className="px-4 py-2">{row.sbu}</td>
              <td className="px-4 py-2">{row.current}</td>
              <td className="px-4 py-2">{row.htc_thai}</td>
              <td className="px-4 py-2">{row.htc_kh}</td>
              <td className="px-4 py-2">{row.sub_thai}</td>
              <td className="px-4 py-2">{row.sub_kh}</td>
              <td className="px-4 py-2">{row.htc_ho}</td>
              <td className="px-4 py-2">{row.management_ho}</td>
              <td className="px-4 py-2">{row.foreign_ho}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
