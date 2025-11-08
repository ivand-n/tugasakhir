import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import axios from 'axios';
import Sidebar from "@/components/Monitoring/sidebar";
import Breadcrumb from "@/components/CompanyProfile/Breadcrumbs";
import Link from 'next/link';
import { Line } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

export default function DetailKandang() {
    const router = useRouter();
    const { id } = router.query;
    const [kandangData, setKandangData] = useState(null);
    const [showAlertMonit, setShowAlertMonit] = useState(false);
    const [showAlertLantai, setShowAlertLantai] = useState(false);
    const [showAlertEditLantai, setShowAlertEditLantai] = useState(false);
    const [showAlertLantaiDelete, setShowAlertLantaiDelete] = useState(false);
    const [showAlertOVK, setShowAlertOVK] = useState(false);
    const [showAlertOVKDelete, setShowAlertOVKDelete] = useState(false);
    const [showAlertOVKEdit, setShowAlertOVKEdit] = useState(false);
    const [showAlertEdit, setShowAlertEdit] = useState(false);
    const [showAlertDelete, setShowAlertDelete] = useState(false);
    const [userInfo, setUserInfo] = useState({
        username: "",
        email: "",
    });

    const breadcrumbPaths = [
        { label: "Home", href: "/" },
        { label: "Kandang", href: "/monitoring/kandang" },
        { label: "Detail", href: `/monitoring/kandang/detail/${id}` },
    ];

    useEffect(() => {
        if (!id) return;

        const token = localStorage.getItem("token");
        const storedUsername = localStorage.getItem("name") || "";
        const storedEmail = localStorage.getItem("email") || "";

        setUserInfo({
            username: storedUsername,
            email: storedEmail,
        });

        const tokenExpiration = localStorage.getItem("token_expiration");

        if (!token || !tokenExpiration || Date.now() > parseInt(tokenExpiration, 10)) {
            localStorage.removeItem("token");
            localStorage.removeItem("name");
            localStorage.removeItem("email");
            localStorage.removeItem("picture");
            localStorage.removeItem("token_expiration");
            router.push("/monitoring/login");
        }

        axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/kandang/${id}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        })
        .then(response => {
            setKandangData(response.data);
        })
        .catch(error => {
            console.error('Error fetching kandang details:', error);
        });

        // Alert untuk monitoring
        if (router.query.success === "tambah") {
            setShowAlertMonit(true);
            setTimeout(() => setShowAlertMonit(false), 3000);
        }
        // Alert untuk edit monitoring
        if (router.query.success === "ubah") {
            setShowAlertEdit(true);
            setTimeout(() => setShowAlertEdit(false), 3000);
        }
        // Alert untuk delete monitoring
        if (router.query.success === "hapus") {
            setShowAlertDelete(true);
            setTimeout(() => setShowAlertDelete(false), 3000);
        }
        // Alert untuk lantai tambah
        if (router.query.success === "tambahlantai") {
            setShowAlertLantai(true);
            setTimeout(() => setShowAlertLantai(false), 3000);
        }
        if (router.query.success === "editlantai") {
            setShowAlertEditLantai(true);
            setTimeout(() => setShowAlertEditLantai(false), 3000);
        }
        if (router.query.success === "hapuslantai") {
            setShowAlertLantaiDelete(true);
            setTimeout(() => setShowAlertLantaiDelete(false), 3000);
        }
        // Alert untuk OVK tambah
        if (router.query.success === "tambahovk") {
            setShowAlertOVK(true);
            setTimeout(() => setShowAlertOVK(false), 3000);
        }
        if (router.query.success === "hapusovk") {
            setShowAlertOVKDelete(true);
            setTimeout(() => setShowAlertOVKDelete(false), 3000);
        }
        if (router.query.success === "editovk") {
            setShowAlertOVKEdit(true);
            setTimeout(() => setShowAlertOVKEdit(false), 3000);
        }

    }, [id, router, router.query.success]);

    const handleDeleteKandang = async (id_kandang) => {
        if (confirm("Yakin ingin menghapus kandang ini? Semua data lantai dan monitoring juga akan terhapus!")) {
            try {
                const token = localStorage.getItem("token");
                await axios.delete(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/kandang/${id_kandang}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                // Redirect ke halaman daftar kandang dengan alert sukses
                router.push("/monitoring/kandang?success=hapuskandang");
            } catch (err) {
                alert("Gagal menghapus kandang!");
            }
        }
    };

    const handleDeleteLantai = async (id_lantai) => {
        if (confirm("Yakin ingin menghapus lantai ini? Semua data monitoring pada lantai ini juga akan terhapus!")) {
            try {
                const token = localStorage.getItem("token");
                await axios.delete(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/lantai/${kandangData.id}/${id_lantai}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                // Refresh data dan tampilkan alert sukses hapus lantai
                router.push(`/monitoring/kandang/detail/${kandangData.id}/?success=hapuslantai`);
            } catch (err) {
                alert("Gagal menghapus lantai!");
            }
        }
    };

    const HandleDeleteOVK = async (id_kandang, id_ovk) => {
        if (confirm("Yakin ingin menghapus data OVK ini?")) {
            try {
                const token = localStorage.getItem("token");
                await axios.delete(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/ovk/${id_kandang}/${id_ovk}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                // Redirect dengan alert sukses hapus
                router.push(`/monitoring/kandang/detail/${id_kandang}/?success=hapusovk`);
            } catch (err) {
                alert("Gagal menghapus data OVK!");
            }
        }
    };

    const handleDeleteMonit = async (id_kandang, id_lantai, id_monit) => {
        if (confirm("Yakin ingin menghapus data monitoring ini?")) {
            try {
                const token = localStorage.getItem("token");
                await axios.delete(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/data/${id_lantai}/${id_monit}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                // Redirect dengan alert sukses hapus
                router.push(`/monitoring/kandang/detail/${id_kandang}/?success=hapus`);
            } catch (err) {
                alert("Gagal menghapus data monitoring!");
            }
        }
    };

    const handlePanenKandang = async (id_kandang) => {
        if (confirm("Yakin ingin melakukan panen pada kandang ini? Kandang akan ditandai sebagai panen dan tidak bisa diubah lagi!")) {
            try {
                const token = localStorage.getItem("token");
                const url = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/csv/${id_kandang}?token=${token}`;
                window.open(url, "_blank", "noopener,noreferrer");
            } catch (err) {
                alert("Gagal melakukan panen!");
            }
        }
    }
    const handlePanenLantai = async (id_lantai) => {
        if (confirm("Yakin ingin melakukan panen pada lantai ini?")) {
            try {
                const token = localStorage.getItem("token");
                const url = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/csv/${kandangData.id}/${id_lantai}?token=${token}`;
                window.open(url, "_blank", "noopener,noreferrer");
            } catch (err) {
                alert("Gagal melakukan panen!");
            }
        }
    }

    const [selectedColumn, setSelectedColumn] = useState('deplesi');
    const monitoringColumns = [
        { value: 'mati', label: 'Mati' },
        { value: 'culing', label: 'Culing' },
        { value: 'sisa_ayam', label: 'Sisa Ayam' },
        { value: 'deplesi', label: 'Deplesi' },
        { value: 'deplesi_persen', label: 'Deplesi %' },
        { value: 'dh', label: 'Daya Hidup' },
        { value: 'konsumsi', label: 'Konsumsi' },
        { value: 'gr_ekor_hari', label: 'gr / Ekor / Hari' },
        { value: 'cum_pakan', label: 'Cum Pakan' },
        { value: 'cum_kons_pakan', label: 'Cum Konsumsi Pakan' },
        { value: 'karung', label: 'Karung' },
        { value: 'bb_ekor', label: 'BB/Ekor' },
        { value: 'adg_pbbh', label: 'ADG / PBBH' },
        { value: 'fcr', label: 'FCR' },
        { value: 'ip', label: 'IP' },
        // Tambahkan kolom lain sesuai kebutuhan
    ];
    // Ambil semua umur unik dari semua lantai
    // Ambil semua umur unik dari semua lantai
    const allUmur = kandangData && kandangData.lantai
        ? Array.from(new Set(
            kandangData.lantai.flatMap(l => (l.monit || []).map(m => m.umur))
        )).sort((a, b) => a - b)
        : [];

    // Siapkan datasets per lantai
    const datasets = kandangData && kandangData.lantai
        ? kandangData.lantai
            .filter(lantai => lantai.monit && lantai.monit.length > 0)
            .map((lantai, idx) => ({
                label: `Lantai ${lantai.no_lantai}`,
                data: allUmur.map(umur => {
                    const m = (lantai.monit || []).find(monit => monit.umur === umur);
                    return m ? Number(m[selectedColumn]) : null;
                }),
                borderColor: `hsl(${idx * 60}, 70%, 50%)`,
                backgroundColor: `hsl(${idx * 60}, 70%, 80%)`,
                tension: 0.3,
                spanGaps: true,
            }))
        : [];

    const lineChartData = {
        labels: allUmur,
        datasets,
    };

    if (!kandangData) {
        return <p>Loading...</p>;
    }



    return (
        <div className="flex flex-col md:flex-row bg-white h-auto min-h-svh">
            <Sidebar />
            <div className="md:ml-64 mt-10 container p-4 bg-white text-black">

                {/* Alert Monitoring */}
                {showAlertMonit && (
                    <div className="fixed top-5 left-1/2 transform -translate-x-1/2 bg-blue-500 text-white px-4 py-2 rounded shadow-lg z-50">
                        Data Monitoring berhasil ditambahkan!
                    </div>
                )}
                {/* Alert Edit */}
                {showAlertEdit && (
                    <div className="fixed top-5 left-1/2 transform -translate-x-1/2 bg-yellow-500 text-white px-4 py-2 rounded shadow-lg z-50">
                        Data Monitoring berhasil diubah!
                    </div>
                )}
                {/* Alert Delete */}
                {showAlertDelete && (
                    <div className="fixed top-5 left-1/2 transform -translate-x-1/2 bg-red-500 text-white px-4 py-2 rounded shadow-lg z-50">
                        Data Monitoring berhasil dihapus!
                    </div>
                )}
                {/* Alert Lantai */}
                {showAlertLantai && (
                    <div className="fixed top-5 left-1/2 transform -translate-x-1/2 bg-blue-500 text-white px-4 py-2 rounded shadow-lg z-50">
                        Data Lantai berhasil ditambahkan!
                    </div>
                )}
                {showAlertEditLantai && (
                    <div className="fixed top-5 left-1/2 transform -translate-x-1/2 bg-yellow-500 text-white px-4 py-2 rounded shadow-lg z-50">
                        Data Lantai berhasil diubah!
                    </div>
                )}
                {showAlertLantaiDelete && (
                    <div className="fixed top-5 left-1/2 transform -translate-x-1/2 bg-red-500 text-white px-4 py-2 rounded shadow-lg z-50">
                        Data Lantai berhasil dihapus!
                    </div>
                )}
                {showAlertOVK && (
                    <div className="fixed top-5 left-1/2 transform -translate-x-1/2 bg-blue-500 text-white px-4 py-2 rounded shadow-lg z-50">
                        Data OVK berhasil ditambahkan!
                    </div>
                )}
                {showAlertOVKDelete && (
                    <div className="fixed top-5 left-1/2 transform -translate-x-1/2 bg-red-500 text-white px-4 py-2 rounded shadow-lg z-50">
                        Data OVK berhasil dihapus!
                    </div>
                )}
                {showAlertOVKEdit && (
                    <div className="fixed top-5 left-1/2 transform -translate-x-1/2 bg-yellow-500 text-white px-4 py-2 rounded shadow-lg z-50">
                        Data OVK berhasil diubah!
                    </div>
                )}

                <h1 className="text-2xl font-bold">Detail Kandang</h1>
                <div className="flex items-center mt-4">
                    <div>
                        <h2 className="text-lg font-semibold">
                            Selamat Datang, {userInfo.username}!
                        </h2>
                    </div>
                </div>
                <Breadcrumb paths={breadcrumbPaths} />
                <div className="w-auto max-w-7xl mt-4 bg-white p-4 rounded-lg shadow">
                    <h2 className="text-xl font-bold mb-4">Kandang {kandangData.nama}</h2>
                    {kandangData.status == 0 && (
                    <div className="flex flex-row mb-4 gap-2">
                        <Link href={`/monitoring/form/FormLantai?id_kandang=${kandangData.id}`} 
                            className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-2  focus:outline-none  cursor-pointer">
                            Tambah Lantai
                        </Link>
                        {/* Ubah Kandang */}
                        <Link
                            href={`/monitoring/form/FormKandang?id_kandang=${kandangData.id}`}
                            className="text-white bg-yellow-500 hover:bg-yellow-600 focus:ring-4 focus:ring-yellow-300 font-medium rounded-lg text-sm px-4 py-2 focus:outline-none "
                            >
                            Ubah Kandang
                        </Link>
                        {/* Hapus Lantai */}
                        <button
                            className="text-white bg-red-600 hover:bg-red-700 focus:ring-4 focus:ring-red-300 font-medium rounded-lg text-sm px-4 py-2 focus:outline-none cursor-pointer"
                            onClick={() => handleDeleteKandang(kandangData.id)}
                            >
                            Hapus Kandang
                        </button>
                    </div>
                    )}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <p className="font-semibold">Tingkat:</p>
                            <p>{kandangData.tingkat}</p>
                        </div>
                        <div>
                            <p className="font-semibold">Alamat:</p>
                            <p>{kandangData.alamat}</p>
                        </div>
                        <div className='font-semibold'>
                            <p >Status:</p>
                            <p className={`${
                                kandangData.status == 0 ? "text-green-500" : 
                                kandangData.status == 1 ? "text-amber-500" : ""
                            }`}>
                                {kandangData.status == 0 ? "Aktif" : 
                                 kandangData.status == 1 ? "Panen" : ""}
                            </p>
                        </div>
                    </div>
                    <div className="flex justify-end mb-4 ">
                        <button
                            className="cursor-pointer bg-green-600 hover:bg-green-700 text-white font-semibold px-4 py-2 rounded shadow"
                            onClick={() => handlePanenKandang(kandangData.id)}
                        >
                            Panen Kandang
                        </button>
                    </div>
                </div>
                <div className="w-auto max-w-7xl mt-8 mb-8 bg-white p-4 rounded-lg shadow">
                    <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">
                        <label htmlFor="monitoring-column" className="font-semibold">Bandingkan Monitoring:</label>
                        <select
                            id="monitoring-column"
                            value={selectedColumn}
                            onChange={e => setSelectedColumn(e.target.value)}
                            className="border rounded p-2"
                        >
                            {monitoringColumns.map(col => (
                                <option key={col.value} value={col.value}>{col.label}</option>
                            ))}
                        </select>
                    </div>
                    <Line
                        data={lineChartData}
                        options={{
                            responsive: true,
                            plugins: {
                                legend: { position: 'top' },
                                title: { display: true, text: `Perbandingan ${monitoringColumns.find(c => c.value === selectedColumn)?.label} Tiap Lantai` },
                            },
                            scales: {
                                x: { title: { display: true, text: 'Umur' } },
                                y: { beginAtZero: true, title: { display: true, text: monitoringColumns.find(c => c.value === selectedColumn)?.label } }
                            }
                        }}
                    />
                </div>
                <div className="mt-8 w-auto max-w-7xl">
                    <h2 className="text-lg font-bold mb-2">Data Lantai</h2>
                    {kandangData.lantai && kandangData.lantai.length > 0 ? (
                        kandangData.lantai.map((lantai, idx) => (
                            <div key={lantai.id || idx} className="mb-6 p-4 border rounded bg-gray-50">
                            {kandangData.status == 0 && (
                                <div className="flex flex-row gap-2 mb-4">
                                {/* Tambah Monitoring */}
                                <Link
                                    href={`/monitoring/form/FormMonit?id_kandang=${kandangData.id}&id_lantai=${lantai.id}`}
                                    className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-2   focus:outline-none"
                                    >
                                    Tambah Monitoring
                                </Link>
                                {/* Ubah Lantai */}
                                <Link
                                    href={`/monitoring/form/FormLantai?id_kandang=${kandangData.id}&id_lantai=${lantai.id}`}
                                    className="text-white bg-yellow-500 hover:bg-yellow-600 focus:ring-4 focus:ring-yellow-300 font-medium rounded-lg text-sm px-4 py-2   focus:outline-none"
                                    >
                                    Ubah Lantai
                                </Link>
                                {/* Hapus Lantai */}
                                <button
                                    className="text-white bg-red-600 hover:bg-red-700 focus:ring-4 focus:ring-red-300 font-medium rounded-lg text-sm px-4 py-2   focus:outline-none cursor-pointer"
                                    onClick={() => handleDeleteLantai(lantai.id)}
                                    >
                                    Hapus Lantai
                                </button>
                                {/* Tambah Obat, Vaksin dan Kimia */}
                                <Link
                                    href={`/monitoring/form/FormOvk?id_kandang=${kandangData.id}&id_lantai=${lantai.id}`}
                                    className="text-white bg-green-700 hover:bg-green-800 focus:ring-4 focus:ring-green-300 font-medium rounded-lg text-sm px-4 py-2   focus:outline-none"
                                    >
                                    Tambah OVK
                                </Link>
                                </div>
                            )}
                                <h3 className="font-semibold mb-4">Lantai {lantai.no_lantai}</h3>
                                <div className="grid grid-cols-2 gap-2 mb-2">
                                    <div>Jenis DOC: <span className="font-semibold">{lantai.jenis_doc}</span></div>
                                    <div>Kapasitas Maks: <span className="font-semibold">{lantai.populasi}</span></div>
                                    <div>Sisa Ayam Terbaru: <span className="font-semibold">
                                    {lantai.monit && lantai.monit.length > 0 ? lantai.monit[lantai.monit.length - 1]?.sisa_ayam : "-"}
                                    </span></div>
                                    <div>Tanggal Masuk: <span className="font-semibold">{lantai.tgl_masuk ? new Date(lantai.tgl_masuk).toLocaleDateString("id-ID") : "-"}</span></div>
                                </div>
                                <div className="mt-8 relative w-full">
                                <h2 className="text-lg font-bold mb-2">Data OVK</h2>
                                {lantai.ovk && lantai.ovk.length > 0 ? (
                                    <div className="overflow-x-auto mb-8">
                                        <table className="text-sm border w-full">
                                            <thead>
                                                <tr>
                                                    <th className="border px-2">Tanggal</th>
                                                    <th className="border px-2">Nama</th>
                                                    <th className="border px-2">Jenis</th>
                                                    <th className="border px-2">Dosis</th>
                                                    <th className="border px-2">Lantai</th>
                                                    {kandangData.status == 0 && (
                                                    <th className="border px-2">Aksi</th>
                                                    )}
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {lantai.ovk.map((ovk, idx) => (
                                                    <tr key={ovk.id || idx}>
                                                        <td className="border px-2">
                                                        {ovk.date
                                                            ? new Intl.DateTimeFormat("id-ID", {
                                                                dateStyle: "medium",
                                                                timeStyle: "short",
                                                                timeZone: "Asia/Jakarta",
                                                            }).format(
                                                                // Add 7-hour offset if date is without offset
                                                                new Date(ovk.date)
                                                            )
                                                            : "-"}
                                                        </td>
                                                        <td className="border px-2">{ovk.nama}</td>
                                                        <td className="border px-2">{ovk.jenis}</td>
                                                        <td className="border px-2">{ovk.dosis} {ovk.jenis_dosis}</td>
                                                        <td className="border px-2">Lantai {lantai.no_lantai}</td>
                                                        {kandangData.status == 0 && (
                                                        <td className="px-2 flex space-x-1 justify-between items-center">
                                                            <Link className='text-blue-500 hover:underline'
                                                            href={`/monitoring/form/FormOvk?id_kandang=${kandangData.id}&id_lantai=${lantai.id}&id_ovk=${ovk.id}`}
                                                            >
                                                            Ubah
                                                        </Link>
                                                        <button className='text-red-500 hover:underline'
                                                        onClick={() => HandleDeleteOVK(kandangData.id, ovk.id)}
                                                        >
                                                            Hapus
                                                        </button>
                                                        </td>
                                                        )}
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <p className="text-gray-500 mb-8">Belum ada data OVK.</p>
                                )}
                                </div>
                                <div>
                                    <div>
                                        <h4 className="font-semibold mt-5 mb-1">Data Penjarangan</h4>
                                        <table>
                                            <thead>
                                                <tr>
                                                    <th className="border px-2">No</th>
                                                    <th className="border px-2">Tanggal</th>
                                                    <th className="border px-2">No DO</th>
                                                    <th className="border px-2">Nama Pembeli</th>
                                                    <th className="border px-2">Ekor</th>
                                                    <th className="border px-2">Kg</th>
                                                    <th className="border px-2">BW</th>
                                                    <th className="border px-2">Umur</th>
                                                    <th className="border px-2">Rata rata Umur</th>
                                                    <th className="border px-2">Aksi</th>
                                                </tr>
                                            </thead>
                                        {lantai.penjarangan && lantai.penjarangan.length > 0 ? (
                                            (() => {
                                                // Cari umur monit terbaru pada lantai ini
                                                const umurMonitTerbaru = lantai.monit && lantai.monit.length > 0
                                                    ? lantai.monit[lantai.monit.length - 1].umur
                                                    : null;

                                                return lantai.penjarangan.map((penjarangan, pIdx) => {
                                                    const isLastPenjarangan = penjarangan.umur === umurMonitTerbaru;
                                                    return (
                                                        <tbody key={penjarangan.id || pIdx}>
                                                            <tr>
                                                                <td className="border px-2">{pIdx + 1}</td>
                                                                <td className="border px-2">
                                                                    {penjarangan.date
                                                                        ? new Intl.DateTimeFormat("id-ID", {
                                                                            dateStyle: "medium",
                                                                            timeStyle: "short",
                                                                            timeZone: "Asia/Jakarta",
                                                                        }).format(new Date(penjarangan.date))
                                                                        : "-"}
                                                                </td>
                                                                <td className="border px-2">{penjarangan.no}</td>
                                                                <td className="border px-2">{penjarangan.nama}</td>
                                                                <td className="border px-2">{penjarangan.ekor}</td>
                                                                <td className="border px-2">{penjarangan.kg}</td>
                                                                <td className="border px-2">{penjarangan.bw}</td>
                                                                <td className="border px-2">{penjarangan.umur}</td>
                                                                <td className="border px-2">{penjarangan.rerata}</td>
                                                                <td className="border px-2">
                                                                    <div className="flex space-x-2">
                                                                        {isLastPenjarangan && (
                                                                            <button
                                                                                className="text-red-500 hover:underline"
                                                                                onClick={() => {
                                                                                    if (confirm("Yakin ingin menghapus data penjarangan ini?")) {
                                                                                        axios.delete(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/penjarangan/${lantai.id}/${penjarangan.id}`, {
                                                                                            headers: {
                                                                                                Authorization: `Bearer ${localStorage.getItem("token")}`,
                                                                                            },
                                                                                        })
                                                                                        .then(() => {
                                                                                            router.push(`/monitoring/kandang/detail/${kandangData.id}/?success=hapuspenjarangan`);
                                                                                        })
                                                                                        .catch(err => {
                                                                                            alert("Gagal menghapus data penjarangan!");
                                                                                        });
                                                                                    }
                                                                                }}
                                                                            >
                                                                                Hapus
                                                                            </button>
                                                                        )}
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                        </tbody>
                                                    );
                                                })
                                            })()
                                        ) : (
                                          <p className="text-gray-500">Belum ada data penjarangan.</p>
                                        )}
                                        </table>
                                    </div>
                                    <h4 className="font-semibold mt-5 mb-1">Data Monitoring</h4>
                                    <div className="overflow-x-auto">
                                    {lantai.monit && lantai.monit.length > 0 ? (
                                        <table className="text-sm border min-w-11/12">
                                            <thead>
                                                <tr>
                                                    <th className="border px-2">Umur</th>
                                                    <th className="border px-2">Tanggal</th>
                                                    <th className="border px-2">Mati</th>
                                                    <th className="border px-2">Culing</th>
                                                    <th className="border px-2">Deplesi</th>
                                                    <th className="border px-2">Sisa Ayam</th>
                                                    <th className="border px-2">Deplesi (%)</th>
                                                    <th className="border px-2">Daya Hidup (%)</th>
                                                    <th className="border px-2">Konsumsi (Kg)</th>
                                                    <th className="border px-2">Cum Pakan</th>
                                                    <th className="border px-2">gr / ekor / hari</th>
                                                    <th className="border px-2">Cums Konsumsi Pakan</th>
                                                    <th className="border px-2">Karung</th>
                                                    <th className="border px-2">BB/Ekor (Gr)</th>
                                                    <th className="border px-2">DG (Gr)</th>
                                                    <th className="border px-2">ADG / PBBH</th>
                                                    <th className="border px-2">Tonase (Kg)</th>
                                                    <th className="border px-2">FCR</th>
                                                    <th className="border px-2">IP</th>
                                                    <th className="border px-2">EP (%)</th>
                                                {kandangData.status == 0 && (

                                                    <th className="border px-2">Aksi</th>
                                                )}
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {lantai.monit.map((monit, mIdx) => {
                                                    const isFirstMonit = mIdx === 0;
                                                    const isLatestMonit = mIdx === lantai.monit.length - 1;
                                                    return (
                                                        <tr key={monit.id_monit || mIdx}>
                                                            <td className="border px-2">{monit.umur}</td>
                                                            <td className="border px-2">{monit.date
                                                            ? new Intl.DateTimeFormat("id-ID", {
                                                                dateStyle: "medium",
                                                                timeStyle: "short",
                                                                timeZone: "Asia/Jakarta",
                                                            }).format(new Date(monit.date))
                                                            : "-"}</td>
                                                            <td className="border px-2">{monit.mati}</td>
                                                            <td className="border px-2">{monit.culing}</td>
                                                            <td className="border px-2">{monit.deplesi}</td>
                                                            <td className="border px-2">{monit.sisa_ayam}</td>
                                                            <td className="border px-2">{Number(monit.deplesi_persen).toFixed(2)}</td>
                                                            <td className="border px-2">{Number(monit.dh).toFixed(2)}</td>
                                                            <td className="border px-2">{monit.konsumsi}</td>
                                                            <td className="border px-2">{monit.cum_pakan}</td>
                                                            <td className="border px-2">{Number(monit.gr_ekor_hari).toFixed(2)}</td>
                                                            <td className="border px-2">{Number(monit.cum_kons_pakan).toFixed(2)}</td>
                                                            <td className="border px-2">{monit.karung}</td>
                                                            <td className="border px-2">{monit.bb_ekor}</td>
                                                            <td className="border px-2">{monit.dg}</td>
                                                            <td className="border px-2">{monit.adg_pbbh}</td>
                                                            <td className="border px-2">{Number(monit.tonase).toFixed(2)}</td>
                                                            <td className="border px-2">{Number(monit.fcr).toFixed(2)}</td>
                                                            <td className="border px-2">{Number(monit.ip).toFixed(2)}</td>
                                                            <td className="border px-2">{Number(monit.ep).toFixed(2)}</td>
                                                            {kandangData.status == 0 && (

                                                                <td className="px-2 inline-flex space-x-2">
                                                                {isLatestMonit && !isFirstMonit &&(
                                                                    <>
                                                                        {/* <Link 
                                                                            href={`/monitoring/form/FormMonit?id_kandang=${kandangData.id}&id_lantai=${lantai.id}&id_monit=${monit.id}`}
                                                                            className="text-yellow-500 hover:underline"
                                                                            >
                                                                            Ubah
                                                                        </Link> */}
                                                                        <button 
                                                                            className="text-red-500 hover:underline"
                                                                            onClick={() => handleDeleteMonit(kandangData.id, lantai.id, monit.id)}
                                                                            >
                                                                            Hapus
                                                                        </button>
                                                                        <Link
                                                                            href={`/monitoring/form/FormPenjarangan?id_kandang=${kandangData.id}&id_lantai=${lantai.id}&id_monit=${monit.id}&umur=${monit.umur}&bbekor=${monit.bb_ekor}`}
                                                                            className="text-blue-500 hover:underline"
                                                                            >
                                                                            Penjarangan
                                                                        </Link>
                                                                    </>
                                                                )}
                                                            </td>
                                                            )}
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    ) : (
                                        <p className="text-gray-500">Belum ada data monitoring.</p>
                                    )}
                                </div>
                                </div>
                            <div className="flex justify-end mt-4">
                                <button
                                    className="cursor-pointer bg-green-600 hover:bg-green-700 text-white font-semibold px-4 py-2 rounded shadow"
                                    onClick={() => handlePanenLantai(lantai.id)}
                                >
                                    Panen
                                </button>
                            </div>
                            </div>
                        ))
                    ) : (
                        <p className="text-gray-500">Belum ada data lantai.</p>
                    )}
                </div>
            </div>
        </div>
    );
}