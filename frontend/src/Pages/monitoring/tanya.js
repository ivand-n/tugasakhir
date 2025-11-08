import Sidebar from "@/components/Monitoring/sidebar";
import Breadcrumb from "@/components/CompanyProfile/Breadcrumbs";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import axios from "axios";

export default function ProfilePage() {
    const router = useRouter();
    const [userInfo, setUserInfo] = useState({
        username: "",
        email: "",
        picture: "",
    });

    const breadcrumbPaths = [
        { label: "Monitoring", href: "/monitoring" },
        { label: "Tanya Dokter", href: "/monitoring/tanya" },
    ];

    useEffect(() => {
        const storedUsername = localStorage.getItem("name") || "";
        const storedEmail = localStorage.getItem("email") || "";
        const storedPicture = localStorage.getItem("picture") || "";

        setUserInfo({
            username: storedUsername,
            email: storedEmail,
            picture: storedPicture,
        });

        const token = localStorage.getItem("token");
        const tokenExpiration = localStorage.getItem("token_expiration");

        if (!token || !tokenExpiration || Date.now() > parseInt(tokenExpiration, 10)) {
            // Hapus token jika sudah kedaluwarsa
            localStorage.removeItem("token");
            localStorage.removeItem("name");
            localStorage.removeItem("email");
            localStorage.removeItem("picture");
            localStorage.removeItem("token_expiration");
            router.push("/monitoring/login");
        }
    }, [router]);

    return (
        <div className="flex flex-col md:flex-row bg-white h-auto min-h-svh">
            <Sidebar />
            <div className="md:ml-64 mt-10 container mx-auto p-4">
                <h1 className="text-2xl font-bold text-black mb-4">Tanya Dokter</h1>
                <Breadcrumb paths={breadcrumbPaths} />
                <div className="flex flex-col items-center mt-8">
                <h1 className="text-7xl justify-center text-black">COMING SOON</h1>
                </div>
            </div>
        </div>
    );
}