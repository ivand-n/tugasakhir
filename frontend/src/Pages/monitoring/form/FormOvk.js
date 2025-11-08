import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import axios from "axios";
import Sidebar from "@/components/Monitoring/sidebar";
import Breadcrumb from "@/components/CompanyProfile/Breadcrumbs";

export default function FormOvk() {
    const router = useRouter();
    const { id_kandang, id_lantai, id_ovk } = router.query;

    const [userInfo, setUserInfo] = useState({
        username: "",
        email: "",
        picture: "",
    });

    const [formData, setFormData] = useState({
        nama : "",
        jenis : "",
        dosis : null,
        jenis_dosis : "",
        id_lantai : id_lantai ? parseInt(id_lantai, 10) : null,
    });
    const [datalantai, setDatalantai] = useState([]);

    useEffect(() => {
        if (id_ovk) {
            const token = localStorage.getItem("token");
            axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/ovk/${id_ovk}`, {
                headers: { Authorization: `Bearer ${token}` }
            })
            .then(res => {
                setFormData(res.data);
            })
            .catch(() => {
                alert("Gagal mengambil data OVK");
            });
        }
        
    }, [id_lantai, id_ovk]);

    useEffect(() => {
        if (id_lantai) {
            const token = localStorage.getItem("token");
            axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/lantais/${id_lantai}`, {
                headers: { Authorization: `Bearer ${token}` }
            })
            .then(res => {
                setDatalantai(res.data);
            })
            .catch(() => {
                alert("Gagal mengambil data lantai");
            });
        }
    }, [id_lantai]);

    useEffect(() => {
        if (id_lantai) {
            setFormData((prev) => ({
                ...prev,
                id_lantai : parseInt(id_lantai, 10),
            }));
        }
    }, [id_lantai]);

    const breadcrumbPaths = [
        { label: "Monitoring", href: "/monitoring" },
        { label: "Kandang", href: "/monitoring/kandang" },
        { label: "Detail", href: `/monitoring/kandang/detail/${id_kandang}` },
        { label: id_ovk ? "Ubah OVK" : "Tambah OVK", href: `/monitoring/form/FormOvk?id_kandang=${id_kandang}&id_lantai=${id_lantai}${id_ovk ? `&id_ovk=${id_ovk}` : ""}` },
    ];

    const handleInputChange = (e) => {
        const { id, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [id]:
                id === "id_lantai" === "dosis"
                    ? parseInt(value, 10)
                    : value,
        }));
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem("token");
            if (id_ovk) {
                // Update
                await axios.put(
                    `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/ovk/${id_lantai}/${id_ovk}`,
                    formData,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                router.push(`/monitoring/kandang/detail/${id_kandang}/?success=editovk`);
            } else {
                // Tambah
                await axios.post(
                    `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/ovk/${id_lantai}`,
                    formData,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                router.push(`/monitoring/kandang/detail/${id_kandang}/?success=tambahovk`);
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
                    {id_ovk ? "Ubah OVK" : "Tambah OVK"}
                </h1>
                    <div className="mb-4">
                        <label className="block text-sm font-medium">Nama OVK</label>
                        <input
                            type="text"
                            id="nama"
                            value={formData.nama}
                            onChange={handleInputChange}
                            className="border rounded p-2 w-full"
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm font-medium">Jenis OVK</label>
                        <select
                            type="text"
                            id="jenis"
                            value={formData.jenis}
                            onChange={handleInputChange}
                            className="border rounded p-2 w-full"
                        >
                            <option value="">Pilih Jenis OVK</option>
                            <option value="Vaksin">Vaksin</option>
                            <option value="Obat">Obat</option>
                            <option value="Vitamin">Vitamin</option>
                        </select>
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm font-medium">Dosis</label>
                        <input
                            type="number"
                            id="dosis"
                            value={formData.dosis}
                            onChange={handleInputChange}
                            className="border rounded p-2 w-full"
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm font-medium">Satuan</label>
                        <input
                            type="text"
                            id="jenis_dosis"
                            value={formData.jenis_dosis}
                            onChange={handleInputChange}
                            className="border rounded p-2 w-full"
                        />
                    </div>
                    <div className="mb-4 hidden">
                        <label className="block text-sm font-medium">ID Lantai</label>
                        <input
                            type="number"
                            id="id_lantai"
                            value={formData.id_lantai}
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
        