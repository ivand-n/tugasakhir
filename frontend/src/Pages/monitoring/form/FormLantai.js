import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import axios from "axios";
import Sidebar from "@/components/Monitoring/sidebar";
import Breadcrumb from "@/components/CompanyProfile/Breadcrumbs";

export default function FormMonit() {
    const router = useRouter();
    const { id_kandang, id_lantai } = router.query;

    const [userInfo, setUserInfo] = useState({
        username: "",
        email: "",
        picture: "",
    });

    const [formData, setFormData] = useState({
        no_lantai: null,
        jenis_doc: "",
        populasi: null,
        tgl_masuk: "",
        kandang_id: id_kandang ? parseInt(id_kandang, 10) : null,
    });

    useEffect(() => {
        if (id_lantai) {
            const token = localStorage.getItem("token");
            axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/lantai/${id_kandang}/${id_lantai}`, {
                headers: { Authorization: `Bearer ${token}` }
            })
            .then(res => {
                setFormData(res.data);
            })
            .catch(() => {
                alert("Gagal mengambil data lantai");
            });
        }
    }, [id_kandang, id_lantai]);

    useEffect(() => {
        if (id_kandang) {
            setFormData((prev) => ({
                ...prev,
                kandang_id: parseInt(id_kandang, 10),
            }));
        }
    }, [id_kandang]);

    const breadcrumbPaths = [
        { label: "Monitoring", href: "/monitoring" },
        { label: "Kandang", href: "/monitoring/kandang" },
        { label: "Detail", href: `/monitoring/kandang/detail/${id_kandang}` },
        { label: id_lantai ? "Ubah Lantai" : "Tambah Lantai", href: `/monitoring/form/FormLantai?id_kandang=${id_kandang}${id_lantai ? `&id_lantai=${id_lantai}` : ""}` },
    ];

    const handleInputChange = (e) => {
        const { id, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [id]:
                id === "no_lantai" || id === "populasi" || id === "id_kandang"
                    ? parseInt(value, 10)
                    : value,
        }));
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem("token");
            if (id_lantai) {
                // Update
                await axios.put(
                    `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/lantai/${id_kandang}/${id_lantai}`,
                    formData,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                router.push(`/monitoring/kandang/detail/${id_kandang}/?success=editlantai`);
            } else {
                // Tambah
                await axios.post(
                    `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/lantai/${id_kandang}`,
                    formData,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                router.push(`/monitoring/kandang/detail/${id_kandang}/?success=tambahlantai`);
            }
        } catch (error) {
            console.error("Error submitting form:", error);
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
                <h1 className="text-2xl font-bold mb-4">
                    {id_lantai ? "Ubah Lantai" : "Tambah Lantai"}
                </h1>
                    <div className="mb-4">
                        <label className="block text-sm font-medium">Nomor Lantai</label>
                        <input
                            type="number"
                            id="no_lantai"
                            value={formData.no_lantai}
                            onChange={handleInputChange}
                            className="border rounded p-2 w-full"
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm font-medium">Jenis DOC</label>
                        <input
                            type="text"
                            id="jenis_doc"
                            value={formData.jenis_doc}
                            onChange={handleInputChange}
                            className="border rounded p-2 w-full"
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm font-medium">Populasi</label>
                        <input
                            type="number"
                            id="populasi"
                            value={formData.populasi}
                            onChange={handleInputChange}
                            className="border rounded p-2 w-full"
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm font-medium">Tanggal Masuk</label>
                        <input
                            type="date"
                            id="tgl_masuk"
                            value={formData.tgl_masuk}
                            onChange={handleInputChange}
                            className="border rounded p-2 w-full"
                        />
                    </div>
                    <div className="mb-4 hidden">
                        <label className="block text-sm font-medium">ID Kandang</label>
                        <input
                            type="number"
                            id="kandang_id"
                            value={formData.kandang_id}
                            onChange={handleInputChange}
                            className="border rounded p-2 w-full"
                            disabled
                        />
                    </div>
                    <button type="submit" className="bg-green-500 text-white px-4 py-2 rounded">
                        Simpan
                    </button>
                </form>
            </div>
        </div>
    );
}
        