
import { LuLayoutDashboard } from "react-icons/lu";
import { LuLayers3 } from "react-icons/lu";
import { LuShirt } from "react-icons/lu";
import { LuShoppingBag } from "react-icons/lu";
import { LuUserRound } from "react-icons/lu";
import { LuStar } from "react-icons/lu";
import { LuImageDown} from "react-icons/lu";
import { LuTicket } from "react-icons/lu";
import { ADMIN_CATEGORY_ADD, ADMIN_CATEGORY_SHOW, ADMIN_COUPON_ADD, ADMIN_COUPON_SHOW, ADMIN_CUSTOMERS_SHOW, ADMIN_DASHBOARD, ADMIN_MEDIA_SHOW, ADMIN_ORDER_SHOW, ADMIN_PRODUCT_ADD, ADMIN_PRODUCT_SHOW, ADMIN_PRODUCT_VARIANT_ADD, ADMIN_PRODUCT_VARIANT_SHOW, ADMIN_REVIEW_SHOW } from "@/routes/AdminPanelRoute";


export const adminAppSidebarMenu = [
    {
        title: "Dashboard",
        url: ADMIN_DASHBOARD,
        icon: LuLayoutDashboard
    },
    {
        title: "Category",
        url: ADMIN_CATEGORY_SHOW,
        icon: LuLayers3,
        submenu: [
            {
                title: "Add Category",
                url: ADMIN_CATEGORY_ADD
            },
            {
                title: "All Category",
                url: ADMIN_CATEGORY_SHOW
            }
        ]
    },
    {
        title: "Products",
        url: ADMIN_PRODUCT_SHOW,
        icon: LuShirt,
        submenu: [
            {
                title: "Add Product",
                url: ADMIN_PRODUCT_ADD
            },
            {
                title: "Add Variant",
                url: ADMIN_PRODUCT_VARIANT_ADD
            },
            {
                title: "All Products",
                url: ADMIN_PRODUCT_SHOW
            },
            {
                title: "Product Variants",
                url: ADMIN_PRODUCT_VARIANT_SHOW
            },
        ]
    },
    {
        title: "Coupons",
        url: ADMIN_COUPON_SHOW,
        icon: LuTicket,
        submenu: [
            {
                title: "Add Coupon",
                url: ADMIN_COUPON_ADD
            },
            {
                title: "All Coupons",
                url: ADMIN_COUPON_SHOW
            },

        ]
    },
    {
        title: "Orders",
        url: ADMIN_ORDER_SHOW,
        icon: LuShoppingBag,

    },
    {
        title: "Customers",
        url: ADMIN_CUSTOMERS_SHOW,
        icon: LuUserRound,
    },
    {
        title: "Rating & Review",
        url: ADMIN_REVIEW_SHOW,
        icon: LuStar,
    },
    {
        title: "Media",
        url: ADMIN_MEDIA_SHOW,
        icon: LuImageDown,
    },
]