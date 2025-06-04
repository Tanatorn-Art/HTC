'use client';

import { useRouter } from 'next/navigation';
import { FaCheckCircle, FaExclamationCircle, FaClock } from 'react-icons/fa';

type Props = {
  total: number;
  checkedIn: number;
  lateCount: number; 
};

const AttendanceCardSummary = ({ total, checkedIn, lateCount }: Props) => {
  const notCheckedIn = total - checkedIn;
  const router = useRouter();

  const handleRedirect = (status: string) => {
    router.push(`/report?status=${status}`);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <button
          onClick={() => handleRedirect('checked_in')}
          className="flex items-center justify-between bg-green-100 hover:bg-green-200 text-green-800 p-4 rounded-2xl shadow-md transition"
        >
          <div className="flex items-center gap-3">
            <FaCheckCircle size={28} />
            <div>
              <div className="text-xl font-bold">{checkedIn}</div>
              <div className="text-sm">Scan</div>
            </div>
          </div>
        </button>

        <button
          onClick={() => handleRedirect('not_checked')}
          className="flex items-center justify-between bg-red-100 hover:bg-red-200 text-red-800 p-4 rounded-2xl shadow-md transition"
        >
          <div className="flex items-center gap-3">
            <FaExclamationCircle size={28} />
            <div>
              <div className="text-xl font-bold">{notCheckedIn}</div>
              <div className="text-sm">No Scan</div>
            </div>
          </div>
        </button>

        <button
          onClick={() => handleRedirect('late')}
          className="flex items-center justify-between bg-yellow-100 hover:bg-yellow-200 text-yellow-800 p-4 rounded-2xl shadow-md transition"
        >
          <div className="flex items-center gap-3">
            <FaClock size={28} />
            <div>
              <div className="text-xl font-bold">{lateCount}</div>
              <div className="text-sm">Late</div>
            </div>
          </div>
        </button>
      </div>
    </div>
  );
};

export default AttendanceCardSummary;
