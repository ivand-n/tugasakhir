import { React, use } from 'react';
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Sidebar from "@/components/Monitoring/sidebar";
import Breadcrumb from "@/components/CompanyProfile/Breadcrumbs";
import axios from "axios";

export default function Inisiasi() {
    const router = useRouter();
    const [userInfo, setUserInfo] = useState({
        username: "",
        email: "",
    });

    const [formData, setFormData] = useState({
        kandang: {
            nama: "",
            tingkat: null,
            kapasitas: null,
            alamat: "",
            pemilik: "",
        },
        lantai: [
            {
                no_lantai: 1,
                jenisDOC: "",
                populasi: null,
                tgl_masuk: "",
                monit: [
                    {
                        umur: 0,
                        mati: null,
                        culing: null,
                        konsumsi: null,
                        bb_ekor: null,
                    },
                ],
            },
        ],
    });

    const breadcrumbPaths = [
        { label: "Monitoring", href: "/monitoring" },
        { label: "Kandang", href: "/monitoring/kandang" },
        { label: "Inisiasi", href: "/monitoring/form/inisiasi" }, // Current page
    ];

    useEffect(() => {
        const storedUsername = localStorage.getItem("name") || "";
        const storedEmail = localStorage.getItem("email") || "";

        setUserInfo({
            username: storedUsername,
            email: storedEmail,
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

    const handleKandangChange = (e) => {
        const { id, value } = e.target;
        let processedValue = value;
    
        if (id === "tingkat") {
            // Batasi input tingkat antara 1-5
            const tingkat = parseInt(value, 10);
            if (tingkat > 5) {
                alert("Maksimal tingkat adalah 5!");
                processedValue = "5";
            } else if (tingkat < 1) {
                processedValue = "1";
            }
    
            // Update jumlah lantai berdasarkan tingkat
            const currentLantaiCount = formData.lantai.length;
            const targetLantaiCount = parseInt(processedValue, 10) || 1;
    
            if (targetLantaiCount > currentLantaiCount) {
                // Tambah lantai
                const newLantai = [...formData.lantai];
                for (let i = currentLantaiCount + 1; i <= targetLantaiCount; i++) {
                    newLantai.push({
                        no_lantai: i,
                        jenisDOC: "",
                        populasi: null,
                        tgl_masuk: "",
                        monit: [
                            {
                                umur: 1,
                                bb_ekor: null,
                            },
                        ],
                    });
                }
                setFormData(prevData => ({
                    ...prevData,
                    lantai: newLantai
                }));
            } else if (targetLantaiCount < currentLantaiCount) {
                // Kurangi lantai
                setFormData(prevData => ({
                    ...prevData,
                    lantai: prevData.lantai.slice(0, targetLantaiCount)
                }));
            }
        }
    
        setFormData((prevData) => ({
            ...prevData,
            kandang: {
                ...prevData.kandang,
                pemilik: userInfo.email,
                [id]: id === "tingkat" || id === "kapasitas" 
                    ? parseInt(processedValue, 10) || null 
                    : processedValue,
            },
        }));
    };
    const handleLantaiChange = (index, e) => {
        const { id, value } = e.target;
        const updatedLantai = [...formData.lantai];
        updatedLantai[index][id] = id === "populasi" ? parseInt(value, 10) || null : value; // Konversi ke integer jika id adalah "populasi"
        setFormData((prevData) => ({
            ...prevData,
            lantai: updatedLantai,
        }));
    };
    const handleMonitChange = (lantaiIndex, monitIndex, e) => {
        const { id, value } = e.target;
        const updatedLantai = [...formData.lantai];
        updatedLantai[lantaiIndex].monit[monitIndex][id] = 
        id === "bb_ekor" 
            ? parseFloat(value) || null
            : id === "umur" || id === "mati" || id === "culing" || id === "konsumsi"
                ? parseInt(value, 10) || null // Konversi ke integer jika id adalah salah satu field numerik
                : value;
        setFormData((prevData) => ({
            ...prevData,
            lantai: updatedLantai,
        }));
    };
    const addLantai = () => {
        setFormData((prevData) => ({
            ...prevData,
            lantai: [
                ...prevData.lantai,
                {
                    no_lantai: prevData.lantai.length + 1,
                    jenisDOC: "",
                    populasi: "",
                    tgl_masuk: "",
                    monit: [
                        {
                            umur: "",
                            bb_ekor: "",
                        },
                    ],
                },
            ],
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem("token");
            await axios.post(
                `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/inisiasi`,
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            alert("Data berhasil disimpan!");
            router.push("/monitoring/kandang?success=true");
        } catch (error) {
            console.error("Error submitting form:", error);
            alert("Terjadi kesalahan saat menyimpan data.");
        }
    };

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
                        <h3 className="text-black">Form Tambah Kandang</h3>
                    </div>
                </div>
                <Breadcrumb paths={breadcrumbPaths} />
                <div className="mt-4 shadow-lg rounded-lg bg-white p-4 text-black">
                <form onSubmit={handleSubmit} className="p-4 ">
                    <h1 className="text-2xl font-bold mb-4">Tambah Kandang</h1>
                    {/* Form Kandang */}
                    <div className="mb-4">
                        <label className="block text-sm font-medium">Nama Kandang</label>
                        <input
                            type="text"
                            id="nama"
                            value={formData.kandang.nama}
                            onChange={handleKandangChange}
                            className="border rounded p-2 w-full"
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm font-medium">Tingkat</label>
                        <input
                            type="number"
                            id="tingkat"
                            value={formData.kandang.tingkat}
                            onChange={handleKandangChange}
                            className="border rounded p-2 w-full"
                            min="1"
                            max="5"
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm font-medium">Alamat</label>
                        <textarea
                            id="alamat"
                            value={formData.kandang.alamat}
                            onChange={handleKandangChange}
                            className="border rounded p-2 w-full"
                        ></textarea>
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm font-medium">Pemilik</label>
                        <input
                            type="text"
                            id="pemilik"
                            value={userInfo.email}
                            onChange={handleKandangChange}
                            className="border rounded p-2 w-full"
                            disabled
                        />
                    </div>

                    {/* Form Lantai */}
                    <h2 className="text-lg font-semibold mt-6">Lantai</h2>
                    {formData.lantai.map((lantai, index) => (
                        <div key={index} className="border p-4 rounded mb-4">
                            <h3 className="font-semibold">Lantai {lantai.no_lantai}</h3>
                            <label className="block text-sm font-medium">Jenis DOC</label>
                            <input
                                type="text"
                                id="jenisDOC"
                                value={lantai.jenisDOC}
                                onChange={(e) => handleLantaiChange(index, e)}
                                className="border rounded p-2 w-full"
                            />
                            <label className="block text-sm font-medium">Populasi</label>
                            <input
                                type="number"
                                id="populasi"
                                value={lantai.populasi}
                                onChange={(e) => handleLantaiChange(index, e)}
                                className="border rounded p-2 w-full"
                            />
                            <label className="block text-sm font-medium">Tanggal Masuk</label>
                            <input
                                type="date"
                                id="tgl_masuk"
                                value={lantai.tgl_masuk}
                                onChange={(e) => handleLantaiChange(index, e)}
                                className="border rounded p-2 w-full"
                            />

                            {/* Form Monit */}
                            <h4 className="font-semibold mt-4">Monitoring</h4>
                            {lantai.monit.map((monit, monitIndex) => (
                                <div key={monitIndex} className="mb-4">
                                    <label className="block text-sm font-medium">bb / ekor</label>
                                    <input
                                        type="number"
                                        id="bb_ekor"
                                        value={monit.bb_ekor}
                                        onChange={(e) => handleMonitChange(index, monitIndex, e)}
                                        className="border rounded p-2 w-full"
                                        step="0.01"
                                    />
                                </div>
                            ))}
                        </div>
                    ))}
                    <button
                        type="button"
                        onClick={addLantai}
                        className="bg-blue-500 text-white px-4 py-2 rounded"
                    >
                        Tambah Lantai
                    </button>

                    <button type="submit" className="bg-green-500 text-white px-4 py-2 rounded mt-4">
                        Simpan
                    </button>
                </form>
                </div>
            </div>
        </div>
    );
}