import Sidebar from "@/components/Monitoring/sidebar";
import Breadcrumb from "@/components/CompanyProfile/Breadcrumbs";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import dynamic from "next/dynamic";
const HlsPlayer = dynamic(() => import("@/components/Monitoring/Hsl"), {
    ssr: false,
}); 

export default function CCTVPage() {
    const router = useRouter();
    const [userInfo, setUserInfo] = useState({
        username: "",
        email: "",
        picture: "",
    });
    const [isClient, setIsClient] = useState(false);

    const breadcrumbPaths = [
        { label: "Monitoring", href: "/monitoring" },
        { label: "CCTV", href: "/monitoring/pro" },
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
    useEffect(() => {
        setIsClient(true);
    }, []);

    return (
        <div className="flex flex-col md:flex-row bg-white h-auto min-h-svh">
            <Sidebar />
            <div className="md:ml-64 mt-10 container mx-auto p-4">
                <h1 className="text-2xl font-bold text-black mb-4">CCTV</h1>
                <Breadcrumb paths={breadcrumbPaths} />

                {isClient && <HlsPlayer src={`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/cctv`} />}
            </div>
        </div>
    );
}