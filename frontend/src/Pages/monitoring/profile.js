import Sidebar from "@/components/Monitoring/sidebar";
import Breadcrumb from "@/components/CompanyProfile/Breadcrumbs";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import axios from "axios";
import Image from "next/image";

export default function ProfilePage() {
    const router = useRouter();
    const [userInfo, setUserInfo] = useState({
        username: "",
        email: "",
        picture: "",
    });

    const breadcrumbPaths = [
        { label: "Monitoring", href: "/monitoring" },
        { label: "Profile", href: "/monitoring/profile" },
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
                <h1 className="text-2xl font-bold text-black mb-4">Profil Pengguna</h1>
                <Breadcrumb paths={breadcrumbPaths} />
                <div className="flex flex-col items-center mt-8">
                    {userInfo.picture && (
                        <Image
                            src={userInfo.picture}
                            alt="Profile"
                            width={128}
                            height={128}
                            className="w-32 h-32 rounded-full mb-4 border-4 border-blue-400 object-cover"
                        />
                    )}
                    <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-md">
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700">Nama Pengguna</label>
                            <div className="text-lg font-semibold text-black">{userInfo.username}</div>
                        </div>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700">Email</label>
                            <div className="text-lg font-semibold text-black">{userInfo.email}</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}