import axios from "axios";
import Sidebar from "@/components/Monitoring/sidebar";
import Breadcrumb from "@/components/CompanyProfile/Breadcrumbs";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import "chart.js/auto";
import Image from "next/image";

export default function ArsipPage() {
    const router = useRouter();
    const [data, setData] = useState(null);
    const [userInfo, setUserInfo] = useState({
        username: "",
        email: "",
        picture: "",
    });

    const [showAlert, setShowAlert] = useState(false);
    const [alertType, setAlertType] = useState("");

    const breadcrumbPaths = [
        { label: "Monitoring", href: "/monitoring" },
        { label: "Kandang", href: "/monitoring/kandang" }, // Current page
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

            // Arahkan pengguna ke halaman login
            router.push("/monitoring/login");
        }

        if (token) {
            axios
                .get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/kandang/panen?email=${storedEmail}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                })
                .then((response) => {
                    setData(response.data);
                })
                .catch((error) => {
                    console.error("Error fetching monitoring data:", error);
                });
        } else {
            console.error("No token found");
        }

        // Tangkap success untuk alert
        if (router.query.success) {
            setShowAlert(true);
            setAlertType(router.query.success);
            setTimeout(() => setShowAlert(false), 3000);
        }
    }, [router]);

    if (!data || data.length === 0) {
        return (
            <div className="flex flex-col md:flex-row bg-white h-auto min-h-svh">
                <Sidebar />
                <div className="flex-row flex md:ml-64 mt-10 container justify-center items-center mx-auto p-4">
                <div className="justify-center items-center bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
                    <p className="mb-4 text-lg text-gray-700">Belum ada data arsip kandang.</p>
                </div>
                </div>
            </div>
        );
    }

    if (!data) {
        return <p>Loading...</p>;
    }

    return (
        <div className="flex flex-col md:flex-row bg-white h-auto min-h-svh">
            <Sidebar />
            <div className="md:ml-64 mt-10 container mx-auto p-4">
                <h1 className="text-2xl font-bold text-black">Monitoring Chick-A</h1>
                <div className="flex items-center mt-4">
                    <div>
                        <h2 className="text-lg font-semibold text-black">
                            Selamat Datang, {userInfo.username}!
                        </h2>
                    </div>
                </div>
                <Breadcrumb paths={breadcrumbPaths} />
                {showAlert && alertType === "editkandang" && (
                    <div className="fixed top-5 left-1/2 transform -translate-x-1/2 bg-yellow-500 text-white px-4 py-2 rounded shadow-lg">
                        Kandang berhasil diubah!
                    </div>
                )}
                {showAlert && alertType === "hapuskandang" && (
                    <div className="fixed top-5 left-1/2 transform -translate-x-1/2 bg-red-500 text-white px-4 py-2 rounded shadow-lg">
                        Kandang berhasil dihapus!
                    </div>
                )}
                {showAlert && (!alertType || alertType === "tambahkandang") && (
                    <div className="fixed top-5 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-4 py-2 rounded shadow-lg">
                        Kandang berhasil ditambahkan!
                    </div>
                )}

                <h2 className="text-lg font-semibold text-black">Total Kandang : {data.length}</h2>
                {data.map((kandang) => (
                <div key={kandang.id} className="relative w-auto h-56 md:h-68 bg-[#ebe1e1] rounded-xl shadow-md mt-4">
                    <div className="w-full h-1/2 bg-black rounded-xl shadow-md">
                        <Image 
                        src="/1.jpeg"
                        alt=""
                        width={500}
                        height={500}
                        className="w-full h-full object-cover rounded-t-xl" />
                    </div>
                    <div className="w-full h-1/2 bg-[#d9d9d9] rounded-xl shadow-md p-4">
                        <h2 className="text-black text-lg md:text-2xl font-semibold">Kandang {kandang.nama}</h2>
                        <div className="text-black text-sm md:text-lg">Tingkat: {kandang.tingkat}</div>
                        <div className="text-black text-sm md:text-lg">Alamat: {kandang.alamat}</div>
                    </div>
                    <Link href={`/monitoring/kandang/detail/${kandang.id}`}
                     className="absolute top-1/2 right-0 translate-y-1/2 w-24 md:w-28 h-6 md:h-8 focus:outline-none text-white bg-yellow-400 hover:bg-yellow-500 focus:ring-4 focus:ring-yellow-300 font-sm rounded-lg text-md md:text-lg me-2 text-center items-center justify-center dark:focus:ring-yellow-900">
                    Detail
                    </Link>
                    <div className= {`absolute top-44 right-0 translate-y-1/2 w-24 md:w-28 h-6 md:h-8 focus:outline-none text-white ${kandang.status == 0 ? "bg-green-500 focus:ring-green-300" : kandang.status == 1 ? "bg-amber-500 focus:ring-amber-300" : ""} focus:ring-4 font-sm rounded-lg text-md md:text-lg me-2 text-center items-center justify-center`}>
                    <p>{kandang.status == 0 ? "Aktif" : kandang.status == 1 ? "Panen" : ""}</p>
                    </div>
                </div>
                ))}
            </div>
        </div>
    );
}