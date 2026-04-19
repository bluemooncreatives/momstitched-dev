import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { showToast } from "@/lib/showToast";
import { WEBSITE_LOGIN } from "@/routes/WebsiteRoute";
import { logout } from "@/store/reducer/authReducer";
import { persistor } from "@/store/store";

import axios from "axios";
import { LogOut } from "lucide-react";
import { useDispatch } from "react-redux";

const LogoutButton = () => {
  const dispatch = useDispatch();

  const handleLogout = async () => {
    try {
      const { data } = await axios.post(
        "/api/auth/logout",
        {},
        {
          withCredentials: true,
        }
      );

      if (!data.success) {
        throw new Error(data.message);
      }

      // Clear redux auth state
      dispatch(logout());

      // Remove persisted storage
      await persistor.purge();

      // Optional cleanup
      localStorage.clear();
      sessionStorage.clear();

      showToast("success", data.message);

      // Hard redirect
      window.location.replace(WEBSITE_LOGIN);
    } catch (error) {
      showToast("error", error.message || "Logout failed");
    }
  };

  return (
    <DropdownMenuItem
      onClick={handleLogout}
      className="cursor-pointer"
    >
      <LogOut className="size-4 text-red-500" />
      Logout
    </DropdownMenuItem>
  );
};

export default LogoutButton;