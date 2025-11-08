import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import axios from "axios";
import Sidebar from "@/components/Monitoring/sidebar";
import Breadcrumb from "@/components/CompanyProfile/Breadcrumbs";

export default function FormKandang() {
    const router = useRouter();
    const { id_kandang } = router.query;

    const [userInfo, setUserInfo] = useState({
        username: "",
        email: "",
        picture: "",
    });

    const [formData, setFormData] = useState({
        nama: "",
        tingkat: "",
        kapasitas: "",
        alamat: "",
    });

    useEffect(() => {
        if (id_kandang) {
            const token = localStorage.getItem("token");
            axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/kandang/${id_kandang}`, {
                headers: { Authorization: `Bearer ${token}` }
            })
            .then(res => {
                setFormData({
                nama: res.data.nama,
                tingkat: res.data.tingkat,
                kapasitas: res.data.kapasitas,
                alamat: res.data.alamat,
                });
            })
            .catch(() => {
                alert("Gagal mengambil data kandang");
            });
        }
    }, [id_kandang]);

    const breadcrumbPaths = [
        { label: "Monitoring", href: "/monitoring" },
        { label: "Kandang", href: "/monitoring/kandang" },
        { label: "Ubah Kandang", href: `/monitoring/form/FormKandang?id_kandang=${id_kandang}` },
    ];

    const handleInputChange = (e) => {
        const { id, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [id]: (id === "tingkat" || id === "kapasitas") ? parseInt(value, 10) : value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem("token");
            await axios.put(
                `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/kandang/${id_kandang}`,
                formData,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            router.push(`/monitoring/kandang/?success=editkandang`);
        } catch (error) {
            alert("Terjadi kesalahan saat menyimpan data.");
        }
    };

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
            <Sidebar/>
            <div className="md:ml-64 mt-10 container mx-auto p-4 text-black">
                <div className="flex items-center mt-4">
                    <div>
                        <h2 className="text-lg font-semibold">
                            Selamat Datang, {userInfo.username}!
                        </h2>
                    </div>
                </div>
                <Breadcrumb paths={breadcrumbPaths} />
                <form onSubmit={handleSubmit} className="p-4">
                    <h1 className="text-2xl font-bold mb-4">Ubah Kandang</h1>
                    <div className="mb-4">
                        <label className="block text-sm font-medium">Nama Kandang</label>
                        <input
                            type="text"
                            id="nama"
                            value={formData.nama}
                            onChange={handleInputChange}
                            className="border rounded p-2 w-full"
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm font-medium">Tingkat</label>
                        <input
                            type="number"
                            id="tingkat"
                            value={formData.tingkat}
                            onChange={handleInputChange}
                            className="border rounded p-2 w-full"
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm font-medium">Kapasitas</label>
                        <input
                            type="number"
                            id="kapasitas"
                            value={formData.kapasitas}
                            onChange={handleInputChange}
                            className="border rounded p-2 w-full"
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm font-medium">Alamat</label>
                        <input
                            type="text"
                            id="alamat"
                            value={formData.alamat}
                            onChange={handleInputChange}
                            className="border rounded p-2 w-full"
                        />
                    </div>
                    <button type="submit" className="bg-green-500 text-white px-4 py-2 rounded">
                        Simpan Perubahan
                    </button>
                </form>
            </div>
        </div>
    );
}