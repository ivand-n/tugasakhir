import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import axios from "axios";
import Sidebar from "@/components/Monitoring/sidebar";
import Breadcrumb from "@/components/CompanyProfile/Breadcrumbs";

export default function FormOvk() {
    const router = useRouter();
    const { id_kandang, id_lantai, id_monit, umur, bbekor, id } = router.query;

    const [userInfo, setUserInfo] = useState({
        username: "",
        email: "",
        picture: "",
    });

    const [formData, setFormData] = useState({
        id : null,
        no : null,
        nama : "",
        ekor : null,
        bw : bbekor/1000 ? parseFloat(bbekor/1000) : null,
        umur : umur ? parseInt(umur, 10) : null,
        id_lantai : id_lantai ? parseInt(id_lantai, 10) : null,
    });
    const [datalantai, setDatalantai] = useState([]);

    useEffect(() => {
        if (id) {
            const token = localStorage.getItem("token");
            axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/penjarangan/${id_lantai}/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            })
            .then(res => {
                setFormData(res.data);
            })
            .catch(() => {
                alert("Gagal mengambil data Penjarangan");
            });
        }
        
    }, [id_lantai, id]);

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
        { label: id ? "Ubah Penjarangan" : "Tambah Penjarangan", href: `/monitoring/form/FormPenjarangan?id_kandang=${id_kandang}&id_lantai=${id_lantai}${id ? `&id=${id}` : ""}` },
    ];

    const handleInputChange = (e) => {
        const { id, value, type } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [id]: type === "number" ? (value === "" ? null : Number(value)) : value,
        }));
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        const dataToSend = {
        ...formData,
            no: formData.no !== null ? Number(formData.no) : null,
            ekor: formData.ekor !== null ? Number(formData.ekor) : null,
            bw: formData.bw !== null ? Number(formData.bw) : null,
            umur: formData.umur !== null ? Number(formData.umur) : null,
            id_lantai: formData.id_lantai !== null ? Number(formData.id_lantai) : null,
        };
        try {
            const token = localStorage.getItem("token");
            if (id) {
                // Update
                await axios.put(
                    `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/penjarangan/${id_lantai}/${id}`,
                    dataToSend,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                router.push(`/monitoring/kandang/detail/${id_kandang}/?success=editpenjarangan`);
            } else {
                // Tambah
                console.log(dataToSend);
                await axios.post(
                    `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/penjarangan/${id_lantai}`,
                    dataToSend,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                router.push(`/monitoring/kandang/detail/${id_kandang}/?success=tambahpenjarangan`);
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
                    {id ? "Ubah Penjarangan" : "Tambah Penjarangan"}
                </h1>
                    <div className="mb-4">
                        <label className="block text-sm font-medium">No DO</label>
                        <input
                            type="number"
                            id="no"
                            value={formData.no}
                            onChange={handleInputChange}
                            className="border rounded p-2 w-full"
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm font-medium">Nama Pembeli</label>
                        <input
                            type="text"
                            id="nama"
                            value={formData.nama}
                            onChange={handleInputChange}
                            className="border rounded p-2 w-full"
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm font-medium">Total Ekor</label>
                        <input
                            type="number"
                            id="ekor"
                            value={formData.ekor}
                            onChange={handleInputChange}
                            className="border rounded p-2 w-full"
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm font-medium">BW</label>
                        <input
                            type="number"
                            id="bw"
                            value={formData.bw}
                            onChange={handleInputChange}
                            className="border rounded p-2 w-full"
                            disabled
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm font-medium">Umur</label>
                        <input
                            type="number"
                            id="umur"
                            value={formData.umur}
                            onChange={handleInputChange}
                            className="border rounded p-2 w-full"
                            disabled
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
        