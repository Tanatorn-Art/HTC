//HTC\components\ReportFilterForm

'use client';

import { useEffect, useState } from 'react';

// กำหนด Type ของข้อมูลดิบที่ได้รับจาก API (ใช้ร่วมกับ app/types/employee.ts)
// ในคอมโพเนนต์นี้ เราใช้โครงสร้างพื้นฐานเพื่อสร้าง dropdown options
type ReportApiRawDataForFilter = {
  deptcode: string; // รหัสส่วนงาน/หน่วยงาน (อาจจะ 8 หลัก หรือ 6 หลักก็ได้ ขอแค่มีโครงสร้างให้แยกได้)
  deptname: string; // ชื่อของส่วนงาน/หน่วยงานนั้นๆ
};

// กำหนด Type ของ Props สำหรับ Component นี้
type Props = {
  onSearch: (filters: { 
    date: string; 
    factoryId: string; // ตรงกับ deptcode 2 หลักแรก
    mainDepartmentId: string; // ตรงกับ deptcode 4 หลักแรก
    subDepartmentId: string; // ตรงกับ deptcode 6 หลักแรก (เป็นระดับสุดท้ายที่เลือกได้)
    employeeId: string; // สถานะการสแกน
  }) => void;
  initialFilters: { // ค่าเริ่มต้นของฟิลเตอร์
    date: string;
    factoryId: string; 
    mainDepartmentId: string; 
    subDepartmentId: string; // เป็นระดับสุดท้าย
    employeeId: string;
  };
};

// --- Types สำหรับ Dropdown แต่ละระดับ (อิงตามโครงสร้าง deptcode 6 หลัก) ---

// สำหรับ Dropdown 'โรงงาน' (deptcode 2 หลักแรก)
type FactoryForDropdown = {
  factoryCode: string; // เช่น "01"
  factoryName: string; // ชื่อโรงงาน
};

// สำหรับ Dropdown 'แผนกหลัก' (deptcode 4 หลักแรก)
type MainDepartmentForDropdown = {
  deptcodelevel2: string; // เช่น "0102"
  deptnamelevel2: string; // ชื่อแผนกหลัก
  parentFactoryCode: string; // เช่น "01"
};

// สำหรับ Dropdown 'แผนกย่อย/ส่วนงาน' (deptcode 6 หลักแรก) - เป็นระดับสุดท้าย
type SubDepartmentForDropdown = {
  deptcodelevel3: string; // เช่น "010203"
  deptnamelevel3: string; // ชื่อแผนกย่อย/ส่วนงาน
  parentMainDepartmentCode: string; // เช่น "0102"
  parentFactoryCode: string; // เช่น "01"
};


// --- ฟังก์ชันช่วย: แยก deptcode ออกเป็นระดับต่างๆ (แค่ 3 ระดับ) ---
const parseDeptCode = (fullDeptCode: string) => {
  // ตรวจสอบความยาวของ deptcode ก่อนแยก เพื่อป้องกัน error
  const level1 = fullDeptCode.length >= 2 ? fullDeptCode.substring(0, 2) : '';
  const level2 = fullDeptCode.length >= 4 ? fullDeptCode.substring(0, 4) : '';
  const level3 = fullDeptCode.length >= 6 ? fullDeptCode.substring(0, 6) : ''; // ใช้ 6 หลักเป็นระดับสุดท้าย
  return { level1, level2, level3 };
};

// --- Component ReportFilterForm ---
const ReportFilterForm = ({ onSearch, initialFilters }: Props) => {
  // States สำหรับเก็บค่าที่เลือกในแต่ละฟิลเตอร์
  const [date, setDate] = useState(initialFilters.date);
  const [factoryId, setFactoryId] = useState(initialFilters.factoryId);
  const [mainDepartmentId, setMainDepartmentId] = useState(initialFilters.mainDepartmentId); 
  const [subDepartmentId, setSubDepartmentId] = useState(initialFilters.subDepartmentId); 
  const [scanStatus, setScanStatus] = useState(initialFilters.employeeId);

  // States สำหรับเก็บข้อมูลทั้งหมดที่ดึงมาจาก API (แบบไม่ซ้ำในแต่ละระดับ)
  const [factories, setFactories] = useState<FactoryForDropdown[]>([]);
  const [allMainDepartments, setAllMainDepartments] = useState<MainDepartmentForDropdown[]>([]);
  const [allSubDepartments, setAllSubDepartments] = useState<SubDepartmentForDropdown[]>([]); 

  // States สำหรับเก็บข้อมูลที่ถูกกรองแล้ว เพื่อแสดงใน Dropdown แต่ละตัว
  const [filteredMainDepartments, setFilteredMainDepartments] = useState<MainDepartmentForDropdown[]>([]);
  const [filteredSubDepartments, setFilteredSubDepartments] = useState<SubDepartmentForDropdown[]>([]); 

  const [loadingData, setLoadingData] = useState(true); // สถานะการโหลดข้อมูล

  // --- Effect 1: ดึงข้อมูลทั้งหมดจาก API และประมวลผลลำดับชั้นและชื่อ (3 ระดับ) ---
  useEffect(() => {
    setLoadingData(true);
    // เรียก API เพื่อดึงข้อมูลเฉพาะส่วน deptcode และ deptname มาสร้าง dropdown options
    // API endpoint นี้อาจจะแตกต่างจาก /api/manpower หากคุณมี API สำหรับ master data
    fetch('/api/manpower') // ใช้ API เดียวกันไปก่อน ถ้าคุณไม่มี API สำหรับ master data แยก
      .then(res => {
        if (!res.ok) { 
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then((data: ReportApiRawDataForFilter[]) => { // ใช้ ReportApiRawDataForFilter ที่มีแค่ deptcode, deptname
        if (Array.isArray(data)) { 
          const uniqueFactories: FactoryForDropdown[] = [];
          const seenFactoryCodes = new Set<string>(); 

          const uniqueMainDepartments: MainDepartmentForDropdown[] = [];
          const seenMainDeptCodes = new Set<string>(); 

          const uniqueSubDepartments: SubDepartmentForDropdown[] = []; 
          const seenSubDeptCodes = new Set<string>(); 
          
          const levelCodeToNameMap = new Map<string, string>(); 

          data.forEach(item => { 
            if (!item.deptcode || !item.deptname) return; // ข้ามรายการที่ไม่สมบูรณ์
            
            const { level1, level2, level3 } = parseDeptCode(item.deptcode);

            // เก็บชื่อที่ยาวที่สุด (ละเอียดที่สุด) ที่สัมพันธ์กับแต่ละระดับ code
            if (level1 && (!levelCodeToNameMap.has(level1) || item.deptname.length > (levelCodeToNameMap.get(level1)?.length || 0))) {
                levelCodeToNameMap.set(level1, item.deptname);
            }
            if (level2 && (!levelCodeToNameMap.has(level2) || item.deptname.length > (levelCodeToNameMap.get(level2)?.length || 0))) {
                levelCodeToNameMap.set(level2, item.deptname);
            }
            // สำหรับ level3 ให้ใช้ deptname ตรงๆ ของ item นั้น หากต้องการให้ชื่อตรงกับรายการที่ API ให้มา
            if (level3 && (!levelCodeToNameMap.has(level3) || item.deptname.length > (levelCodeToNameMap.get(level3)?.length || 0))) {
                levelCodeToNameMap.set(level3, item.deptname);
            }


            // --- เก็บข้อมูลสำหรับ Dropdown แต่ละระดับ ---

            // 1. โรงงาน (Factory)
            if (level1 && !seenFactoryCodes.has(level1)) {
              uniqueFactories.push({ 
                factoryCode: level1, 
                factoryName: levelCodeToNameMap.get(level1) || `โรงงาน ${level1}` 
              }); 
              seenFactoryCodes.add(level1);
            }

            // 2. แผนกหลัก (Main Department)
            if (level2 && level1 && !seenMainDeptCodes.has(level2)) {
                uniqueMainDepartments.push({ 
                    deptcodelevel2: level2, 
                    deptnamelevel2: levelCodeToNameMap.get(level2) || `แผนกหลัก ${level2}`,
                    parentFactoryCode: level1 
                });
                seenMainDeptCodes.add(level2);
            }

            // 3. แผนกย่อย/ส่วนงาน (Sub-Department) - เป็นระดับสุดท้ายที่เราจะกรอง
            if (level3 && level2 && level1 && !seenSubDeptCodes.has(level3)) {
                uniqueSubDepartments.push({
                    deptcodelevel3: level3,
                    deptnamelevel3: levelCodeToNameMap.get(level3) || item.deptname, // ใช้ item.deptname ตรงๆ สำหรับระดับสุดท้าย
                    parentMainDepartmentCode: level2,
                    parentFactoryCode: level1
                });
                seenSubDeptCodes.add(level3);
            }
          });

          setFactories(uniqueFactories);
          setAllMainDepartments(uniqueMainDepartments); 
          setAllSubDepartments(uniqueSubDepartments); 

        } else {
          console.warn('รูปแบบข้อมูลไม่ถูกต้อง: ข้อมูลไม่ใช่ Array', data);
          setFactories([]);
          setAllMainDepartments([]);
          setAllSubDepartments([]);
        }
      })
      .catch(err => {
        console.error('เกิดข้อผิดพลาดในการดึงข้อมูล:', err);
        setFactories([]);
        setAllMainDepartments([]);
        setAllSubDepartments([]);
      })
      .finally(() => {
        setLoadingData(false); 
      });
  }, []); 

  // --- Effect 2: กรอง 'แผนกหลัก' ตาม 'โรงงาน' ที่เลือก ---
  useEffect(() => {
    let newFilteredMainDepartments: MainDepartmentForDropdown[] = [];

    if (factoryId === '') { 
      newFilteredMainDepartments = allMainDepartments; 
    } else { 
      newFilteredMainDepartments = allMainDepartments.filter(
        d => d.parentFactoryCode === factoryId 
      );
    }
    setFilteredMainDepartments(newFilteredMainDepartments);

    const currentMainDepartmentIsValid = newFilteredMainDepartments.some(d => d.deptcodelevel2 === mainDepartmentId);
    if (mainDepartmentId && !currentMainDepartmentIsValid) {
        setMainDepartmentId('');
    }
    if (!mainDepartmentId && newFilteredMainDepartments.length === 1) {
      setMainDepartmentId(newFilteredMainDepartments[0].deptcodelevel2);
    }
  }, [factoryId, allMainDepartments, mainDepartmentId]); 

  // --- Effect 3: กรอง 'แผนกย่อย/ส่วนงาน' ตาม 'โรงงาน' และ 'แผนกหลัก' ที่เลือก ---
  useEffect(() => {
    let newFilteredSubDepartments: SubDepartmentForDropdown[] = [];

    if (factoryId === '' && mainDepartmentId === '') { 
      newFilteredSubDepartments = allSubDepartments; 
    } else if (factoryId !== '' && mainDepartmentId === '') { 
      newFilteredSubDepartments = allSubDepartments.filter(
        s => s.parentFactoryCode === factoryId
      );
    } else if (factoryId !== '' && mainDepartmentId !== '') { 
      newFilteredSubDepartments = allSubDepartments.filter(
        s => s.parentFactoryCode === factoryId && s.parentMainDepartmentCode === mainDepartmentId
      );
    } else if (factoryId === '' && mainDepartmentId !== '') { 
        newFilteredSubDepartments = allSubDepartments.filter(
          s => s.parentMainDepartmentCode === mainDepartmentId
        );
    }
    
    setFilteredSubDepartments(newFilteredSubDepartments);

    const currentSubDepartmentIsValid = newFilteredSubDepartments.some(d => d.deptcodelevel3 === subDepartmentId);
    if (subDepartmentId && !currentSubDepartmentIsValid) {
        setSubDepartmentId('');
    }
    if (!subDepartmentId && newFilteredSubDepartments.length === 1) {
      setSubDepartmentId(newFilteredSubDepartments[0].deptcodelevel3);
    }
  }, [factoryId, mainDepartmentId, allSubDepartments, subDepartmentId]); 

  // --- ฟังก์ชันเมื่อกดปุ่มค้นหา ---
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault(); 
    onSearch({ 
      date, 
      factoryId,
      mainDepartmentId, 
      subDepartmentId, 
      employeeId: scanStatus 
    });
  };

  // --- UI (ส่วนแสดงผล) ของ Filter Form ---
  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-white p-4 rounded-xl shadow">
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4"> 
        {/* Dropdown วันที่ */}
        <div>
          <label className="block mb-1 font-medium">วันที่</label>
          <input
            type="date"
            className="w-full border rounded px-2 py-1"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
        </div>

        {/* Dropdown โรงงาน */}
        <div>
          <label className="block mb-1 font-medium">โรงงาน</label>
          <select
            className="w-full border rounded px-2 py-1"
            value={factoryId}
            onChange={(e) => {
              setFactoryId(e.target.value);
              setMainDepartmentId(''); 
              setSubDepartmentId(''); 
            }}
            disabled={loadingData}
          >
            <option key="default-factory" value="">
              {loadingData ? 'กำลังโหลดโรงงาน...' : '-- ทั้งหมด --'}
            </option>
            {factories.map((f, idx) => (
              <option key={`factory-${f.factoryCode}-${idx}`} value={f.factoryCode}>
                {f.factoryName}
              </option>
            ))}
          </select>
        </div>

        {/* Dropdown แผนกหลัก */}
        <div>
          <label className="block mb-1 font-medium">แผนกหลัก</label>
          <select
            className="w-full border rounded px-2 py-1"
            value={mainDepartmentId}
            onChange={(e) => {
              setMainDepartmentId(e.target.value);
              setSubDepartmentId(''); 
            }}
            disabled={loadingData}
          >
            <option key="default-main-department" value="">
              {loadingData ? 'กำลังโหลดแผนกหลัก...' : '-- ทั้งหมด --'}
            </option>
            {filteredMainDepartments.map((d, idx) => (
              <option key={`main-department-${d.deptcodelevel2}-${idx}`} value={d.deptcodelevel2}>
                {d.deptnamelevel2}
              </option>
            ))}
          </select>
        </div>
        
        {/* Dropdown แผนกย่อย/ส่วนงาน (เป็นระดับสุดท้าย) */}
        <div>
          <label className="block mb-1 font-medium">แผนกย่อย/ส่วนงาน</label>
          <select
            className="w-full border rounded px-2 py-1"
            value={subDepartmentId}
            onChange={(e) => {
                setSubDepartmentId(e.target.value);
            }}
            disabled={loadingData}
          >
            <option key="default-sub-department" value="">
              {loadingData ? 'กำลังโหลดแผนกย่อย/ส่วนงาน...' : '-- ทั้งหมด --'}
            </option>
            {filteredSubDepartments.map((d, idx) => (
              <option key={`sub-department-${d.deptcodelevel3}-${idx}`} value={d.deptcodelevel3}>
                {d.deptnamelevel3}
              </option>
            ))}
          </select>
        </div>

        {/* Dropdown สถานะการสแกน */}
        <div className="md:col-span-1"> 
          <label className="block mb-1 font-medium">สถานะ</label>
          <select
            className="w-full border rounded px-2 py-1"
            value={scanStatus}
            onChange={(e) => setScanStatus(e.target.value)}
          >
            <option key="scan-status-all" value="all">
              -- ทั้งหมด --
            </option>
            <option key="scan-status-scanned" value="scanned">
              สแกนแล้ว
            </option>
            <option key="scan-status-notscanned" value="not_scanned">
              ยังไม่สแกน
            </option>
          </select>
        </div>
      </div>
      <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
        ค้นหา
      </button>
    </form>
  );
};

export default ReportFilterForm;