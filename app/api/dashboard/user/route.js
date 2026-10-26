import { isAuthenticated } from "@/lib/authentication";
import { connectDB } from "@/lib/databaseConnection";
import { catchError, response } from "@/lib/helperFunction";
import { getRecentUserOrders, getUserDashboardStats, toUserObjectId } from "@/lib/services/userOrderService";
import UserModel from "@/models/User.model";

const ADDRESS_FIELDS = ['address', 'landmark', 'city', 'state', 'pincode', 'country']
const REQUIRED_ADDRESS_FIELDS = ['address', 'city', 'state', 'pincode', 'country']

const filled = (value) => typeof value === 'string' && value.trim().length > 0

// Each check is worth an equal share of the completion percentage.
const getProfileCompletion = (user) => {
    const checks = [
        { key: 'name', label: 'Add your name', done: filled(user.name) },
        { key: 'email', label: 'Verify your email', done: Boolean(user.isEmailVerified) },
        { key: 'phone', label: 'Add a phone number', done: filled(user.phone) },
        { key: 'avatar', label: 'Upload a profile photo', done: filled(user.avatar?.url) },
        { key: 'address', label: 'Save a shipping address', done: REQUIRED_ADDRESS_FIELDS.every((field) => filled(user[field])) },
    ]
    const doneCount = checks.filter((check) => check.done).length

    return {
        percent: Math.round((doneCount / checks.length) * 100),
        missing: checks.filter((check) => !check.done).map(({ key, label }) => ({ key, label })),
    }
}

const getSavedAddress = (user) => {
    if (!ADDRESS_FIELDS.some((field) => filled(user[field]))) return null
    return {
        ...Object.fromEntries(ADDRESS_FIELDS.map((field) => [field, filled(user[field]) ? user[field].trim() : ''])),
        name: user.name || '',
        phone: user.phone || '',
        isComplete: REQUIRED_ADDRESS_FIELDS.every((field) => filled(user[field])),
    }
}

export async function GET(request) {
    try {
        await connectDB()
        const auth = await isAuthenticated('user', request)
        if (!auth.isAuth) {
            return response(false, 401, 'Unauthorized')
        }

        const userObjectId = toUserObjectId(auth.userId)
        if (!userObjectId) {
            return response(false, 401, 'Unauthorized')
        }

        const [user, stats, recentOrders] = await Promise.all([
            UserModel.findOne({ _id: userObjectId, deletedAt: null })
                .select('name email phone avatar isEmailVerified createdAt ' + ADDRESS_FIELDS.join(' '))
                .lean(),
            getUserDashboardStats(userObjectId),
            getRecentUserOrders(userObjectId, 5),
        ])

        if (!user) {
            return response(false, 404, 'User not found.')
        }

        return response(true, 200, 'Dashboard info.', JSON.parse(JSON.stringify({
            user: {
                name: user.name,
                email: user.email,
                avatar: user.avatar?.url || null,
                memberSince: user.createdAt,
            },
            stats,
            profileCompletion: getProfileCompletion(user),
            savedAddress: getSavedAddress(user),
            recentOrders,
        })))

    } catch (error) {
        return catchError(error)
    }
}
