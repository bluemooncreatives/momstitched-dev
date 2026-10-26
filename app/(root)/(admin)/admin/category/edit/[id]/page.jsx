'use client'
import BreadCrumb from '@/components/Application/Admin/BreadCrumb'
import PageHeader from '@/components/Application/Admin/PageHeader'
import AdminRecordState from '@/components/Application/Admin/AdminRecordState'
import CategoryForm from '@/components/Application/Admin/CategoryForm'
import { ADMIN_CATEGORY_SHOW, ADMIN_DASHBOARD } from '@/routes/AdminPanelRoute'
import { use } from 'react'
import useFetch from '@/hooks/useFetch'
const breadcrumbData = [
    { href: ADMIN_DASHBOARD, label: 'Home' },
    { href: ADMIN_CATEGORY_SHOW, label: 'Category' },
    { href: '', label: 'Edit Category' },
]

const header = {
    title: 'Edit Category',
    description: 'Update the category details, cover image and category page.',
}

const EditCategory = ({ params }) => {

    const { id } = use(params)
    const { data: categoryData, error: recordError, errorStatus: recordErrorStatus, refetch: refetchRecord } = useFetch(`/api/category/get/${id}`)

    if (recordError) {
      return (
        <AdminRecordState
          entity="Category"
          error={recordError}
          errorStatus={recordErrorStatus}
          onRetry={refetchRecord}
          backHref={ADMIN_CATEGORY_SHOW}
          backLabel="Back to categories"
          header={{ ...header, breadcrumb: <BreadCrumb breadcrumbData={breadcrumbData} /> }}
        />
      )
    }

    return (
        <div className="flex flex-col gap-4 sm:gap-6">
            <PageHeader
                title={header.title}
                description={header.description}
                breadcrumb={<BreadCrumb breadcrumbData={breadcrumbData} />}
            />

            <div className="rounded-md bg-card p-4 sm:p-6">
                {categoryData?.success
                    ? <CategoryForm category={categoryData.data} />
                    : <div className="text-sm text-muted-foreground">Loading…</div>}
            </div>
        </div>
    )
}

export default EditCategory
