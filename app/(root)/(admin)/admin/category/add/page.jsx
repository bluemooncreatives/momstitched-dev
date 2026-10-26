'use client'
import BreadCrumb from '@/components/Application/Admin/BreadCrumb'
import PageHeader from '@/components/Application/Admin/PageHeader'
import CategoryForm from '@/components/Application/Admin/CategoryForm'
import { ADMIN_CATEGORY_SHOW, ADMIN_DASHBOARD } from '@/routes/AdminPanelRoute'
const breadcrumbData = [
  { href: ADMIN_DASHBOARD, label: 'Home' },
  { href: ADMIN_CATEGORY_SHOW, label: 'Category' },
  { href: '', label: 'Add Category' },
]

const AddCategory = () => {
  return (
    <div className="flex flex-col gap-4 sm:gap-6">
      <PageHeader
        title="Add Category"
        description="Create a new product category for your catalog."
        breadcrumb={<BreadCrumb breadcrumbData={breadcrumbData} />}
      />

      <div className="rounded-md bg-card p-4 sm:p-6">
        <CategoryForm />
      </div>
    </div>
  )
}

export default AddCategory
