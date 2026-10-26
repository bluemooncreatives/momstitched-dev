import { isAuthenticated } from "@/lib/authentication"
import { connectDB } from "@/lib/databaseConnection"
import { catchError, escapeRegex, response } from "@/lib/helperFunction"
import { reviewStatusFilter } from "@/lib/reviewModeration"
import ReviewModel from "@/models/Review.model"

import { NextResponse } from "next/server"

export async function GET(request) {
    try {
        const auth = await isAuthenticated('admin')
        if (!auth.isAuth) {
            return response(false, 403, 'Unauthorized.')
        }

        await connectDB()

        const searchParams = request.nextUrl.searchParams

        // Extract query parameters 
        const start = parseInt(searchParams.get('start') || 0, 10)
        const size = parseInt(searchParams.get('size') || 10, 10)
        const filters = JSON.parse(searchParams.get('filters') || "[]")
        const globalFilter = searchParams.get('globalFilter') || ""
        const sorting = JSON.parse(searchParams.get('sorting') || "[]")
        const deleteType = searchParams.get('deleteType')
        // 'live' | 'draft' | '' (all)
        const status = searchParams.get('status') || ''

        // Build match query  
        let matchQuery = {}
        let preMatchQuery = {}
        let postMatchQuery = {}

        if (deleteType === 'SD') {
            matchQuery = { deletedAt: null }
            preMatchQuery = { deletedAt: null }
        } else if (deleteType === 'PD') {
            matchQuery = { deletedAt: { $ne: null } }
            preMatchQuery = { deletedAt: { $ne: null } }
        }

        // Counts for the Draft/Live filter tabs ignore search and the current
        // status, so each tab always shows how many it holds.
        const statusBaseQuery = { ...preMatchQuery }

        Object.assign(preMatchQuery, reviewStatusFilter(status))

        // Global search (escaped: raw input like "(" would otherwise throw)
        if (globalFilter) {
            const searchRegex = { $regex: escapeRegex(globalFilter), $options: 'i' }
            const numericRating = Number(globalFilter)
            matchQuery["$or"] = [
                { "productData.name": searchRegex },
                { "userData.name": searchRegex },
                ...(Number.isInteger(numericRating) ? [{ rating: numericRating }] : []),
                { title: searchRegex },
                { review: searchRegex },

            ]
            postMatchQuery["$or"] = matchQuery["$or"]
        }

        //  Column filteration  

        const FILTERABLE = ['title', 'review']
        filters.forEach(filter => {
            const regex = { $regex: escapeRegex(filter.value ?? ''), $options: 'i' }
            if (filter.id === 'product') {
                matchQuery['productData.name'] = regex
                postMatchQuery['productData.name'] = regex
            } else if (filter.id === 'user') {
                matchQuery['userData.name'] = regex
                postMatchQuery['userData.name'] = regex
            } else if (FILTERABLE.includes(filter.id)) {
                matchQuery[filter.id] = regex
                preMatchQuery[filter.id] = regex
            }
        });

        //   Sorting  
        let sortQuery = {}
        sorting.forEach(sort => {
            // The table's "status" column sorts on the underlying flag.
            sortQuery[sort.id === 'status' ? 'isPublished' : sort.id] = sort.desc ? -1 : 1
        });


        // Aggregate pipeline  

        const aggregatePipeline = [
            ...(Object.keys(preMatchQuery).length ? [{ $match: preMatchQuery }] : []),
            {
                $lookup: {
                    from: 'products',
                    localField: 'product',
                    foreignField: '_id',
                    as: 'productData'
                }
            },
            {
                $unwind: { path: '$productData', preserveNullAndEmptyArrays: true }
            },
            {
                $lookup: {
                    from: 'users',
                    localField: 'user',
                    foreignField: '_id',
                    as: 'userData'
                }
            },
            {
                $unwind: { path: '$userData', preserveNullAndEmptyArrays: true }
            },
            ...(Object.keys(postMatchQuery).length ? [{ $match: postMatchQuery }] : []),
            { $sort: Object.keys(sortQuery).length ? sortQuery : { createdAt: -1 } },
            { $skip: start },
            { $limit: size },
            {
                $project: {
                    _id: 1,
                    product: '$productData.name',
                    user: '$userData.name',
                    rating: 1,
                    review: 1,
                    title: 1,
                    // Legacy reviews without the field are live.
                    isPublished: { $ne: ['$isPublished', false] },
                    createdAt: 1,
                    updatedAt: 1,
                    deletedAt: 1
                }
            }
        ]

        // Execute query  

        const getReview = await ReviewModel.aggregate(aggregatePipeline)

        // Get totalRowCount with the same pre/post match logic
        let totalRowCount = 0
        if (Object.keys(postMatchQuery).length) {
            const countPipeline = [
                ...(Object.keys(preMatchQuery).length ? [{ $match: preMatchQuery }] : []),
                {
                    $lookup: {
                        from: 'products',
                        localField: 'product',
                        foreignField: '_id',
                        as: 'productData'
                    }
                },
                {
                    $unwind: { path: '$productData', preserveNullAndEmptyArrays: true }
                },
                {
                    $lookup: {
                        from: 'users',
                        localField: 'user',
                        foreignField: '_id',
                        as: 'userData'
                    }
                },
                {
                    $unwind: { path: '$userData', preserveNullAndEmptyArrays: true }
                },
                { $match: postMatchQuery },
                { $count: 'count' }
            ]
            const countResult = await ReviewModel.aggregate(countPipeline)
            totalRowCount = countResult[0]?.count ?? 0
        } else {
            totalRowCount = await ReviewModel.countDocuments(preMatchQuery)
        }

        const [liveCount, draftCount] = await Promise.all([
            ReviewModel.countDocuments({ ...statusBaseQuery, ...reviewStatusFilter('live') }),
            ReviewModel.countDocuments({ ...statusBaseQuery, ...reviewStatusFilter('draft') }),
        ])

        return NextResponse.json({
            success: true,
            data: getReview,
            meta: {
                totalRowCount,
                statusCounts: { all: liveCount + draftCount, live: liveCount, draft: draftCount },
            }
        })

    } catch (error) {
        return catchError(error)
    }
}
