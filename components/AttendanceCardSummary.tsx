'use client';

import { useState } from 'react';
import { FaCheckCircle, FaExclamationCircle, FaUsers } from 'react-icons/fa';

type Props = {
  totalScanned: number;
  totalNotScanned: number;
};

const AttendanceCardSummary = ({ totalScanned, totalNotScanned }: Props) => {
  const totalEmployees = totalScanned + totalNotScanned;
  const [hovered, setHovered] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6 items-stretch">

        <div
          onMouseEnter={() => setHovered('total')}
          onMouseLeave={() => setHovered(null)}
          className="flex flex-col items-center justify-center bg-blue-100 text-blue-800 px-6 py-5 rounded-2xl shadow-md transition-transform duration-300 transform hover:scale-105 hover:shadow-lg h-full"
        >
          <div className="flex items-center gap-4">
            <FaUsers size={36} />
            <div className="text-left">
              <div className="text-2xl font-extrabold">{totalEmployees}</div>
              <div className="text-base text-blue-900 font-medium">Total</div>
            </div>
          </div>
          {hovered === 'total' && (
            <div className="mt-2 text-sm text-blue-900">รวมพนักงานทั้งหมด</div>
          )}
        </div>

        {/* Scanned */}
        <div
          onMouseEnter={() => setHovered('scanned')}
          onMouseLeave={() => setHovered(null)}
          className="flex flex-col items-center justify-center bg-green-100 text-green-800 px-6 py-5 rounded-2xl shadow-md transition-transform duration-300 transform hover:scale-105 hover:shadow-lg h-full"
        >
          <div className="flex items-center gap-4">
            <FaCheckCircle size={36} />
            <div className="text-left">
              <div className="text-2xl font-extrabold">{totalScanned}</div>
              <div className="text-base text-green-900 font-medium">Scan</div>
            </div>
          </div>
          {hovered === 'scanned' && (
            <div className="mt-2 text-sm text-green-900">จำนวนคนที่สแกนแล้ว</div>
          )}
        </div>

        <div
          onMouseEnter={() => setHovered('not_scanned')}
          onMouseLeave={() => setHovered(null)}
          className="flex flex-col items-center justify-center bg-red-100 text-red-800 px-6 py-5 rounded-2xl shadow-md transition-transform duration-300 transform hover:scale-105 hover:shadow-lg h-full"
        >
          <div className="flex items-center gap-4">
            <FaExclamationCircle size={36} />
            <div className="text-left">
              <div className="text-2xl font-extrabold">{totalNotScanned}</div>
              <div className="text-base text-red-900 font-medium">No Scan</div>
            </div>
          </div>
          {hovered === 'not_scanned' && (
            <div className="mt-2 text-sm text-red-900">จำนวนคนที่ยังไม่ได้สแกน</div>
          )}
        </div>

      </div>
    </div>
  );
};

export default AttendanceCardSummary;
