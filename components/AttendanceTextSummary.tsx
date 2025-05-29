'use client';

type Props = {
  date: string;
  totalEmployees: number;
  checkedIn: number;
  notCheckedIn: number;
};

const AttendanceTextSummary = ({
  date,
  totalEmployees,
  checkedIn,
  notCheckedIn,
}: Props) => {
  return (
    <div className="text-gray-700 text-base">
      วันที่ <span className="font-semibold">{date}</span> มีพนักงานทั้งหมด{' '}
      <span className="font-semibold">{totalEmployees}</span> คน,
      เข้าแล้ว{' '}
      <span className="text-green-600 font-semibold">
        {isNaN(checkedIn) ? 'N/A' : checkedIn}
      </span>{' '}
      คน,
      ยังไม่เข้า{' '}
      <span className="text-red-600 font-semibold">
        {isNaN(notCheckedIn) ? 'N/A' : notCheckedIn}
      </span>{' '}
      คน
    </div>
  );
};

export default AttendanceTextSummary;