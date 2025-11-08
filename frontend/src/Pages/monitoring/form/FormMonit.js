import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import axios from "axios";
import Sidebar from "@/components/Monitoring/sidebar";
import Breadcrumb from "@/components/CompanyProfile/Breadcrumbs";

export default function FormMonit() {
    const router = useRouter();
    const { id_kandang, id_lantai, id_monit } = router.query;
    const [loading, setLoading] = useState(false);

    const [userInfo, setUserInfo] = useState({
        username: "",
        email: "",
        picture: "",
    });

    const [formData, setFormData] = useState({
        umur: null,
        mati: null,
        culing: null,
        konsumsi: null,
        bb_ekor: null,
        id_lantai: null,
    });

    useEffect(() => {
        if(!router.isReady) return; // Ensure router is ready before accessing query params
        if (id_monit) {
            setLoading(true);
            const token = localStorage.getItem("token");
            axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/data/${id_lantai}/${id_monit}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            })
            .then(res => {
                const data = Array.isArray(res.data) ? res.data[0] : res.data;
                setFormData({
                    umur: data?.umur ?? null,
                    mati: data?.mati ?? null,
                    culing: data?.culing ?? null,
                    konsumsi: data?.konsumsi ?? null,
                    bb_ekor: data?.bb_ekor ?? null,
                    id_lantai: data?.id_lantai ?? id_lantai ?? null,
                });
                setLoading(false);
            })
            .catch(() =>{
                alert("Terjadi kesalahan saat mengambil data.");
                setLoading(false);
            });  
        } else if (id_lantai) {
            setFormData((prev) => ({
                ...prev,
                id_lantai: parseInt(id_lantai, 10),
            }));
        }
    }, [router.isReady, id_lantai, id_monit]);

    const breadcrumbPaths = [
        { label: "Monitoring", href: "/monitoring" },
        { label: "Kandang", href: "/monitoring/kandang" },
        { label: "Detail", href: `/monitoring/kandang/detail/${id_kandang}` },
        { label: id_monit ? "Ubah Monitoring" : "Tambah Monitoring", href: `/monitoring/form/FormMonit?id_kandang=${id_kandang}&id_lantai=${id_lantai}${id_monit ? `&id_monit=${id_monit}` : ""}` },
    ];

    const handleInputChange = (e) => {
        const { id, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [id]: id === "bb_ekor" ? parseFloat(value) 
            : ["mati", "culing", "konsumsi"].includes(id) ? parseInt(value, 10)
            : value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (loading) return;
        setLoading(true);
        try {
            const token = localStorage.getItem("token");
            if (id_monit) {
                await axios.put(
                    `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/data/${id_lantai}/${id_monit}`,
                    {
                        ...formData,
                    },
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );
                router.push(`/monitoring/kandang/detail/${id_kandang}/?success=ubah`);
            } else {
                await axios.post(
                    `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/data/${id_lantai}`,
                    {
                        ...formData,
                    },
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );
                router.push(`/monitoring/kandang/detail/${id_kandang}/?success=tambah`);
            }
        } catch (error) {
            console.error("Error submitting form:", error);
            alert("Terjadi kesalahan saat menyimpan data.");
        } finally {
            setLoading(false);
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
            // Hapus token jika sudah kedaluwarsa
            localStorage.removeItem("token");
            localStorage.removeItem("name");
            localStorage.removeItem("email");
            localStorage.removeItem("picture");
            localStorage.removeItem("token_expiration");

            // Arahkan pengguna ke halaman login
            router.push("/monitoring/login");
        }
    }, [router]);

    if (loading) {
        return <div className="flex justify-center items-center h-screen">Loading...</div>;
    }
    return (
        <div className="flex flex-col md:flex-row bg-white h-auto min-h-svh">
            <Sidebar/>
            <div className="md:ml-64 mt-10 container mx-auto p-4 text-black">
            <h1 className="text-2xl font-bold">{id_monit ? `Ubah Monitoring Umur ke  ${formData.umur}` : "Tambah Monitoring"}</h1>
                <div className="flex items-center mt-4">
                    <div>
                        <h2 className="text-lg font-semibold">
                            Selamat Datang, {userInfo.username} !
                        </h2>
                    </div>
                </div>
                <Breadcrumb paths={breadcrumbPaths} />
                <form onSubmit={handleSubmit} className="p-4">
                    {id_monit && (
                        <div className="mb-4">
                            <label className="block text-sm font-medium">Umur</label>
                            <input
                                type="number"
                                id="umur"
                                value={formData.umur}
                                onChange={handleInputChange}
                                disabled
                                className="border rounded p-2 w-full bg-gray-100 cursor-not-allowed"
                            />
                        </div>
                    )}
                    <div className="mb-4">
                        <label className="block text-sm font-medium">Mati</label>
                        <input
                            type="number"
                            id="mati"
                            value={formData.mati}
                            onChange={handleInputChange}
                            className="border rounded p-2 w-full"
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm font-medium">Culing</label>
                        <input
                            type="number"
                            id="culing"
                            value={formData.culing}
                            onChange={handleInputChange}
                            className="border rounded p-2 w-full"
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm font-medium">Konsumsi (Kg)</label>
                        <input
                            type="number"
                            id="konsumsi"
                            value={formData.konsumsi}
                            onChange={handleInputChange}
                            className="border rounded p-2 w-full"
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm font-medium">BB / Ekor (gunakan koma sebagai pemisah)</label>
                        <input
                            type="number"
                            id="bb_ekor"
                            value={formData.bb_ekor}
                            onChange={handleInputChange}
                            className="border rounded p-2 w-full"
                        />
                    </div>
                    <button type="submit" disabled={loading} className="bg-green-500 text-white px-4 py-2 rounded">
                        {id_monit ? "Update" : "Simpan"} {loading ? "loading..." : "submit"}
                    </button>
                </form>
            </div>
        </div>
    );
}