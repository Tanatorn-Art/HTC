// route.ts

import { NextRequest, NextResponse } from 'next/server'
import db from '@/services/db'
import { reportDetailQuerySchema, employeeDetailSchema } from '@/lib/validate'
import { ZodError } from 'zod'

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const deptcode = url.searchParams.get('deptcode')
    const employeeId = url.searchParams.get('employeeId')
    const date = url.searchParams.get('date')

    if (employeeId) {
      const parsed = employeeDetailSchema.parse({ employeeId })

      const empRes = await db.query(
        'SELECT name FROM employees WHERE id = $1',
        [parsed.employeeId]
      )
      const recordRes = await db.query(
        'SELECT workdate, check_in FROM public.vw_manpower_detail WHERE person_code = $1 ORDER BY date DESC',
        [parsed.employeeId]
      )

      return NextResponse.json({
        name: empRes.rows[0]?.name || '',
        records: recordRes.rows,
      })
    }

    const parsed = reportDetailQuerySchema.parse({ deptcode, date })
    const targetDate = parsed.date || new Date().toISOString().split('T')[0]

    const recordRes = await db.query(
      `
      SELECT d.name AS deptname, e.name AS fullname,
        a.date, a.check_in AS "checkIn", a.check_out AS "checkOut"
      FROM employees e
      JOIN department d ON e.department_id = d.id
      LEFT JOIN attendance a ON a.employee_id = e.id AND a.date = $2
      WHERE d.id = $1
      ORDER BY e.name ASC
      `,
      [parsed.deptcode, targetDate]
    )

    return NextResponse.json({
      deptname: recordRes.rows[0]?.deptname || '',
      records: recordRes.rows,
    })
  } catch (err) {
    if (err instanceof ZodError) {
      return NextResponse.json(
        { error: err.errors[0]?.message },
        { status: 400 }
      )
    }
    console.error(err)
    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาดในฝั่งเซิร์ฟเวอร์' },
      { status: 500 }
    )
  }
}
