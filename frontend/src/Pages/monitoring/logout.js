import { useEffect } from "react";
import axios from "axios";

export default function LogoutPage() {
    useEffect(() => {
        async function doLogout() {
            try {
                await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/logout`);
                localStorage.removeItem("token");
                localStorage.removeItem("username");
                window.location.href = "/monitoring/login";
            } catch (error) {
                console.error("Logout failed:", error);
            }
        }
        doLogout();
    }, []);

    return <p>Logging out...</p>;
}