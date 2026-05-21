import { contactNotification } from '@/email/contactNotification'
import { catchError, response } from '@/lib/helperFunction'
import { sendMail } from '@/lib/sendMail'
import ContactModel from '@/models/Contact.model'
import { connectDB } from '@/lib/databaseConnection'
import { isAuthenticated } from '@/lib/authentication'
import { NextResponse } from 'next/server'

// Public: submit contact form
export async function POST(request) {
  try {
    const body = await request.json()
    const { name, email, subject, message } = body

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return response(false, 400, 'Name is required.')
    }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return response(false, 400, 'A valid email is required.')
    }
    if (!message || typeof message !== 'string' || message.trim().length < 10) {
      return response(false, 400, 'Message must be at least 10 characters.')
    }
    if (name.trim().length > 100 || message.trim().length > 2000) {
      return response(false, 400, 'Input exceeds maximum allowed length.')
    }

    const payload = {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      subject: subject?.trim() || '',
      message: message.trim(),
    }

    await connectDB()
    await ContactModel.create(payload)

    await sendMail(
      `New Contact Message${payload.subject ? `: ${payload.subject}` : ''} — from ${payload.name}`,
      process.env.NODEMAILER_EMAIL,
      contactNotification(payload)
    )

    return response(true, 200, 'Message sent successfully.')
  } catch (error) {
    return catchError(error, 'Failed to send message.')
  }
}

// Admin: paginated list
export async function GET(request) {
  try {
    const auth = await isAuthenticated('admin')
    if (!auth.isAuth) {
      return response(false, 403, 'Unauthorized.')
    }

    await connectDB()

    const searchParams = request.nextUrl.searchParams
    const start = parseInt(searchParams.get('start') || 0, 10)
    const size = parseInt(searchParams.get('size') || 10, 10)
    const filters = JSON.parse(searchParams.get('filters') || '[]')
    const globalFilter = searchParams.get('globalFilter') || ''
    const sorting = JSON.parse(searchParams.get('sorting') || '[]')
    const deleteType = searchParams.get('deleteType')

    let matchQuery = {}
    if (deleteType === 'SD') {
      matchQuery = { deletedAt: null }
    } else if (deleteType === 'PD') {
      matchQuery = { deletedAt: { $ne: null } }
    }

    if (globalFilter) {
      matchQuery['$or'] = [
        { name: { $regex: globalFilter, $options: 'i' } },
        { email: { $regex: globalFilter, $options: 'i' } },
        { subject: { $regex: globalFilter, $options: 'i' } },
        { message: { $regex: globalFilter, $options: 'i' } },
      ]
    }

    filters.forEach((filter) => {
      matchQuery[filter.id] = { $regex: filter.value, $options: 'i' }
    })

    let sortQuery = {}
    sorting.forEach((sort) => {
      sortQuery[sort.id] = sort.desc ? -1 : 1
    })

    const aggregatePipeline = [
      { $match: matchQuery },
      { $sort: Object.keys(sortQuery).length ? sortQuery : { createdAt: -1 } },
      { $skip: start },
      { $limit: size },
    ]

    const contacts = await ContactModel.aggregate(aggregatePipeline)
    const totalRowCount = await ContactModel.countDocuments(matchQuery)

    return NextResponse.json({
      success: true,
      data: contacts,
      meta: { totalRowCount },
    })
  } catch (error) {
    return catchError(error)
  }
}
