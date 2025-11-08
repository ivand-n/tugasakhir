import axios from "axios";
import Sidebar from "@/components/Monitoring/sidebar";
import Breadcrumb from "@/components/CompanyProfile/Breadcrumbs";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { Line } from "react-chartjs-2"; // Import komponen grafik
import "chart.js/auto";

export default function MonitoringPage() {
    const router = useRouter();
    const [data, setData] = useState([]); // Data dari backend
    const [userInfo, setUserInfo] = useState({
        username: "",
        email: "",
        picture: "",
    });

    const breadcrumbPaths = [
        { label: "Monitoring", href: "/monitoring" }, // Current page
    ];

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalData, setModalData] = useState([]);
    const [isDeplesiModalOpen, setIsDeplesiModalOpen] = useState(false);
    const [deplesiModalData, setDeplesiModalData] = useState([]);
    const [isPersentaseModalOpen, setIsPersentaseModalOpen] = useState(false);
    const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);

    const [selectedLantai, setSelectedLantai] = useState(null);
    const [selectedMonit, setSelectedMonit] = useState(null); // Data monit terbaru
    const [selectedKandang, setSelectedKandang] = useState(null);

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
                .get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/index?email=${storedEmail}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                })
                .then((response) => {
                    setData(response.data); // Simpan data dari backend ke state
                })
                .catch((error) => {
                    console.error("Error fetching monitoring data:", error);
                });
        } else {
            console.error("No token found");
        }
    }, [router]);

    // Fungsi untuk menghitung total sisa ayam terbaru
    const getTotalSisaAyam = (data) => {
        return data.reduce((total, kandang) => {
            // Periksa apakah lantai ada dan tidak kosong
            if (!kandang.lantai || kandang.lantai.length == 0) {
                return total; // Lewati kandang ini jika tidak ada lantai
            }
    
            const totalPerKandang = kandang.lantai.reduce((lantaiTotal, lantai) => {
                // Periksa apakah monit ada dan tidak kosong
                if (!lantai.monit || lantai.monit.length === 0) {
                    return lantaiTotal + lantai.populasi; // Lewati lantai ini jika monit kosong
                }
    
                // Cari data monit dengan umur tertinggi
                const latestMonit = lantai.monit.reduce((latest, current) =>
                    current.umur.Int64 > (latest?.umur.Int64 || 0) ? current : latest,
                    null
                );
    
                // Tambahkan sisa ayam dari monit terbaru jika valid
                return lantaiTotal + (latestMonit?.sisa_ayam.Valid ? latestMonit.sisa_ayam.Int64 : 0);
            }, 0);
    
            return total + totalPerKandang;
        }, 0);
    };
    
    // Hitung total sisa ayam
    const totalSisaAyam = getTotalSisaAyam(data);
    console.log("Total Sisa Ayam:", totalSisaAyam);

    // Fungsi untuk menghitung total deplesi terbaru
    const getTotalDeplesi = (data) => {
        return data.reduce((total, kandang) => {
            // Periksa apakah lantai ada dan tidak kosong
            if (!kandang.lantai || kandang.lantai.length === 0) {
                return total; // Lewati kandang ini jika tidak ada lantai
            }

            const totalPerKandang = kandang.lantai.reduce((lantaiTotal, lantai) => {
                // Periksa apakah monit ada dan tidak kosong
                if (!lantai.monit || lantai.monit.length === 0) {
                    return lantaiTotal; // Lewati lantai ini jika monit kosong
                }

                // Cari data monit dengan umur tertinggi
                const latestMonit = lantai.monit.reduce((latest, current) =>
                    current.umur.Int64 > (latest?.umur.Int64 || 0) ? current : latest,
                    null
                );

                // Tambahkan deplesi dari monit terbaru jika valid
                return lantaiTotal + (latestMonit?.deplesi.Valid ? latestMonit.deplesi.Int64 : 0);
            }, 0);

            return total + totalPerKandang;
        }, 0);
    };

    // Hitung total deplesi
    const totalDeplesi = getTotalDeplesi(data);
    console.log("Total Deplesi:", totalDeplesi);

    // hitung % deplesi
    const getTotalPopulasiAwal = (data) => {
        return data.reduce((total, kandang) => {
            // Periksa apakah lantai ada dan tidak kosong
            if (!kandang.lantai || kandang.lantai.length == 0) {
                return total; // Lewati kandang ini jika tidak ada lantai
            }
    
            const totalPerKandang = kandang.lantai.reduce((lantaiTotal, lantai) => {
                // Tambahkan populasi awal jika valid
                return lantaiTotal + (lantai.populasi.Valid ? lantai.populasi.Int64 : 0);
            }, 0);
    
            return total + totalPerKandang;
        }, 0);
    };
    // Hitung total populasi awal
    const totalPopulasiAwal = getTotalPopulasiAwal(data);

    // Hitung persentase sisa ayam hidup
    const persenSisaAyamHidup = totalPopulasiAwal > 0 ? (totalSisaAyam / totalPopulasiAwal) * 100 : 0;
    console.log("Persentase Sisa Ayam Hidup:", persenSisaAyamHidup.toFixed(2) + "%");

    const getBackgroundColor = (percentage) => {
        if (percentage <= 0) return "hsl(0, 100%, 50%)"; // Merah
        if (percentage >= 100) return "hsl(120, 100%, 50%)"; // Hijau
    
        // Gradasi warna (merah ke hijau)
        const roundedPercentage = Math.round(percentage);
        return `hsl(${roundedPercentage},100%,50%)`; // HSL untuk gradasi
    };
    console.log("Persentase Sisa Ayam Hidup:", persenSisaAyamHidup);
    console.log("Background Color:", getBackgroundColor(persenSisaAyamHidup));

    const filteredData = selectedKandang
        ? data.filter((kandang) => kandang.id === selectedKandang)
        : data;

    // Data untuk grafik Sisa Ayam
    const sisaAyamChartData = {
        labels: Array.from(new Set(filteredData.flatMap((kandang) =>
            kandang.lantai.flatMap((lantai) =>
                lantai.monit.map((monit) => `Umur ${monit.umur.Int64}`)
            )
        ))).sort((a, b) => parseInt(a.split(' ')[1]) - parseInt(b.split(' ')[1])),
        datasets: filteredData.flatMap((kandang) =>
            kandang.lantai.map((lantai) => ({
                label: `Lantai ${lantai.no_lantai.Int64} - ${kandang.nama}`,
                data: lantai.monit
                    .sort((a, b) => a.umur.Int64 - b.umur.Int64)
                    .map((monit) => monit.sisa_ayam.Int64),
                borderColor: `rgba(${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, 1)`,
                backgroundColor: `rgba(${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, 0.2)`,
                fill: false,
            }))
        ),
    };

    // Data untuk grafik Deplesi
    const DeplesiChartData = {
        labels: Array.from(new Set(filteredData.flatMap((kandang) =>
            kandang.lantai.flatMap((lantai) =>
                lantai.monit.map((monit) => `Umur ${monit.umur.Int64}`)
            )
        ))).sort((a, b) => parseInt(a.split(' ')[1]) - parseInt(b.split(' ')[1])),
        datasets: filteredData.flatMap((kandang) =>
            kandang.lantai.map((lantai) => ({
                label: `Lantai ${lantai.no_lantai.Int64} - ${kandang.nama}`,
                data: lantai.monit
                    .sort((a, b) => a.umur.Int64 - b.umur.Int64)
                    .map((monit) => monit.deplesi.Int64),
                borderColor: `rgba(${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, 1)`,
                backgroundColor: `rgba(${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, 0.2)`,
                fill: false,
            }))
        ),
    };

    const chartOptions = {
        responsive: true, // Pastikan grafik responsif
        maintainAspectRatio: false, // Nonaktifkan rasio aspek default
    };

    const handleOpenModal = () => {
        // Ambil data sisa ayam per lantai
        const sisaAyamPerLantai = filteredData.flatMap((kandang) =>
            kandang.lantai.map((lantai) => ({
                nama : kandang.nama,
                lantai: lantai.no_lantai.Valid ? lantai.no_lantai.Int64 : "Tidak diketahui",
                sisaAyam: lantai.monit.length > 0
                    ? lantai.monit.reduce((latest, current) =>
                          current.umur.Int64 > (latest?.umur.Int64 || 0) ? current : latest,
                      null
                      )?.sisa_ayam.Int64 || 0
                    : lantai.populasi.Valid ? lantai.populasi.Int64 : 0,
            }))
        );
    
        setModalData(sisaAyamPerLantai);
        setIsModalOpen(true);
    };
    console.log("Sisa Ayam Per Lantai:", modalData);

    const handleCloseModal = () => {
        setIsModalOpen(false);
    };

    const handleOpenDeplesiModal = () => {
        // Ambil data deplesi per lantai
        const deplesiPerLantai = filteredData.flatMap((kandang) =>
            kandang.lantai.map((lantai) => ({
                nama : kandang.nama,
                lantai: lantai.no_lantai.Valid ? lantai.no_lantai.Int64 : "Tidak diketahui",
                deplesi: lantai.monit.length > 0
                    ? lantai.monit.reduce((latest, current) =>
                          current.umur.Int64 > (latest?.umur.Int64 || 0) ? current : latest,
                      null
                      )?.deplesi.Int64 || 0
                    : 0,
            }))
        );
    
        setDeplesiModalData(deplesiPerLantai);
        setIsDeplesiModalOpen(true);
    };
    const handleCloseDeplesiModal = () => {
        setIsDeplesiModalOpen(false);
    };
    const handleOpenPersentaseModal = () => {
        setIsPersentaseModalOpen(true);
    };
    const handleClosePersentaseModal = () => {
        setIsPersentaseModalOpen(false);    
    };
    const handleOpenInfoModal = () => {
        setIsInfoModalOpen(true);
    };
    const handleCloseInfoModal = () => {
        setIsInfoModalOpen(false);
    };
    const handleLantaiChange = (event) => {
        const lantaiId = parseInt(event.target.value, 10); // Ambil ID lantai dari dropdown
        setSelectedLantai(lantaiId);

        // Cari data lantai berdasarkan ID
        const lantai = data.flatMap((kandang) => kandang.lantai).find((lantai) => lantai.id.Int64 === lantaiId);

        if (lantai && lantai.monit.length > 0) {
            // Ambil data monit terbaru berdasarkan umur tertinggi
            const latestMonit = lantai.monit.reduce((latest, current) =>
                current.umur.Int64 > (latest?.umur.Int64 || 0) ? current : latest,
                null
            );
            setSelectedMonit(latestMonit); // Simpan data monit terbaru
            console.log("Data Monit Terbaru:", latestMonit);
        } else {
            setSelectedMonit(null); // Jika tidak ada data monit
        }
    };

    const handleKandangChange = (event) => {
        const kandangId = parseInt(event.target.value, 10);
        setSelectedKandang(kandangId);
    };

    if (!data || data.length === 0) {
        return (
            <div className="flex flex-col md:flex-row bg-white h-auto min-h-svh">
                <Sidebar />
                <div className="flex-row flex md:ml-64 mt-10 container justify-center items-center mx-auto p-4">
                <div className="justify-center items-center bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
                    <p className="mb-4 text-lg text-gray-700">Belum ada data kandang.</p>
                    <button
                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                        onClick={() => router.push('/monitoring/form/Inisiasi')}
                    >
                        Inisiasi Kandang
                    </button>
                </div>
                </div>
            </div>
        );
    }
    
    return (
        <div className="flex flex-col md:flex-row bg-white h-auto min-h-svh">
            <Sidebar />
            <div className="md:ml-64 mt-10 container mx-auto p-4">
                <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-black">Monitoring Chick-A</h1>
                <svg className="text-blue-400 ml-2 w-7 h-7 cursor-pointer hover:text-blue-700" onClick={handleOpenInfoModal} aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 11V6m0 8h.01M19 10a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"/>
                </svg>
                </div>
                <div className="flex items-center mt-4">
                    <div>
                        <h2 className="text-lg font-semibold text-black">
                            Selamat Datang, {userInfo.username}!
                        </h2>
                    </div>
                </div>
                <Breadcrumb paths={breadcrumbPaths} />
                <div className="mt-8">
                    <form className="max-w-sm mx-auto mb-4">
                        <label htmlFor="kandang" className="block mb-2 text-sm font-semibold text-gray-900">Pilih Kandang</label>
                        <select id="kandang" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                            onChange={handleKandangChange}>
                            <option value="">Semua Kandang</option>
                            {data.map((kandang) => (
                                <option key={kandang.id} value={kandang.id}>
                                    {kandang.nama}
                                </option>
                            ))}
                        </select>
                    </form>
                    <div className="grid grid-cols-4 gap-4 mb-8">
                        <div className="bg-[#ebe1e1] p-4 rounded-lg shadow-md">
                            <p className="text-xl md:text-2xl font-bold text-black">
                                {filteredData.length} Kandang
                            </p>
                        </div>
                        <div className="bg-green-500 p-4 rounded-lg shadow-md cursor-pointer"
                            onClick={handleOpenModal}>
                            <h3 className="text-md md:text-lg font-semibold text-black">Sisa Ayam</h3>
                            <p className="text-xl md:text-2xl font-bold text-black">
                                {getTotalSisaAyam(filteredData)} Ekor
                            </p>
                        </div>
                        <div className="bg-red-500 p-4 rounded-lg shadow-md cursor-pointer"
                            onClick={handleOpenDeplesiModal}>
                            <h3 className="text-md md:text-lg font-semibold text-black">Deplesi</h3>
                            <p className="text-xl md:text-2xl font-bold text-black">
                                {getTotalDeplesi(filteredData)} Ekor
                            </p>
                        </div>
                        <div className={`p-4 rounded-lg shadow-md cursor-pointer`}
                            style={{ backgroundColor: getBackgroundColor(persenSisaAyamHidup) }}
                            onClick={handleOpenPersentaseModal}>
                            {/* Ganti warna latar belakang berdasarkan persentase */}
                            <h3 className="text-md md:text-lg font-semibold text-black">Presentase Ayam Hidup</h3>
                            <p className="text-xl md:text-2xl font-bold text-black">
                                {persenSisaAyamHidup.toFixed(2)}%
                            </p>
                        </div>

                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <h2 className="text-xl font-bold text-black mb-4">Grafik Sisa Ayam</h2>
                        <h2 className="text-xl font-bold text-black mb-4">Grafik Deplesi</h2>
                        <div className="bg-[#ebe1e1] p-4 rounded-lg shadow-md mb-8">
                        <Line data={sisaAyamChartData} options={chartOptions} />
                        </div>
                        <div className="bg-[#ebe1e1] p-4 rounded-lg shadow-md mb-8">
                        <Line data={DeplesiChartData} options={chartOptions}/>
                        </div>
                    </div>
                    <form className="max-w-sm mx-auto">
                    <label htmlFor="lantai" className="block mb-2 text-sm font-semibold text-gray-900">Pilih Lantai untuk di pantau</label>
                    <select id="lantai" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                        onChange={handleLantaiChange}>
                        <option selected>Pilih Lantai</option>
                        {data.map((kandang) =>
                            kandang.lantai.map((lantai) => (
                                <option key={lantai.id.Int64} value={lantai.id.Int64}>
                                    Lantai {lantai.no_lantai.Int64}, kandang {kandang.nama}
                                </option>
                            ))
                        )}
                    </select>
                    </form>
                    {selectedMonit ? (
                        <div className="container mx-auto mt-4 shadow-md rounded-lg p-4 bg-white">
                            <div className="flex items-center  text-lg font-semibold text-black mb-4">Spotlight Lantai
                            <svg className="text-blue-400 ml-2 w-5 h-5 cursor-pointer hover:text-blue-700" onClick={handleOpenInfoModal} aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 11V6m0 8h.01M19 10a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"/>
                            </svg>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 justify-center">
                                <div className="text-black">
                                    <h3 className="text-md font-semibold">IP</h3>
                                    <p className="text-sm">{selectedMonit.ip.Float64}</p>
                                </div>
                                <div className="text-black">
                                    <h3 className="text-md font-semibold">FCR</h3>
                                    <p className="text-sm">{selectedMonit.fcr.Float64}</p>
                                </div>
                                <div className="text-black">
                                    <h3 className="text-md font-semibold">ADG/PBBH</h3>
                                    <p className="text-sm">{selectedMonit.adg_pbbh.Float64}</p>
                                </div>
                                <div className="text-black">
                                    <h3 className="text-md font-semibold">Deplesi</h3>
                                    <p className="text-sm">{selectedMonit.deplesi_persen.Float64}%</p>
                                </div>
                                <div className="text-black">
                                    <h3 className="text-md font-semibold">Komsumsi / Ekor / Hari</h3>
                                    <p className="text-sm">{selectedMonit.gr_ekor_hari.Float64}</p>
                                </div>
                                <div className="text-black">
                                    <h3 className="text-md font-semibold">Total Komsumsi rata rata</h3>
                                    <p className="text-sm">{selectedMonit.cum_kons_pakan.Float64}</p>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <p className="mt-4 text-gray-500">Pilih lantai untuk melihat data monit terbaru.</p>
                    )}
                </div>
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 bg-transparent bg-opacity-50 flex justify-center items-center z-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg w-96">
                        <h2 className="text-lg text-black font-bold mb-4">Detail Sisa Ayam per Lantai</h2>
                        <ul className="space-y-2">
                            {modalData.map((item, index) => (
                                <li key={index} className="flex justify-between text-black">
                                    <span>Lantai {item.lantai} {item.nama}</span>
                                    <span>{item.sisaAyam} Ekor</span>
                                </li>
                            ))}
                        </ul>
                        <button
                            onClick={handleCloseModal}
                            className="mt-4 bg-red-500 text-white px-4 py-2 rounded-lg cursor-pointer"
                        >
                            Tutup
                        </button>
                    </div>
                </div>
            )}
            {isDeplesiModalOpen && (
                <div className="fixed inset-0 bg-transparent bg-opacity-50 flex justify-center items-center z-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg w-96">
                        <h2 className="text-lg text-black font-bold mb-4">Detail Deplesi per Lantai</h2>
                        <ul className="space-y-2">
                            {deplesiModalData.map((item, index) => (
                                <li key={index} className="flex text-black justify-between">
                                    <span>Lantai {item.lantai} {item.nama}</span>
                                    <span>{item.deplesi} Ekor</span>
                                </li>
                            ))}
                        </ul>
                        <button
                            onClick={handleCloseDeplesiModal}
                            className="mt-4 bg-red-500 text-white px-4 py-2 rounded-lg"
                        >
                            Tutup
                        </button>
                    </div>
                </div>
            )}
            {isPersentaseModalOpen && (
                <div className="fixed inset-0 bg-transparent bg-opacity-50 flex justify-center items-center z-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg w-96">
                        <h2 className="text-lg text-black font-bold mb-4">Persentase Ayam Hidup</h2>
                        <div className="grid grid-cols-2 gap-2">
                            <p className="text-xl text-black font-bold">
                                90% 
                            </p>
                            <div className="w-40 h-12 rounded-md shadow-md bg-[hsl(90,100%,50%)]"></div>
                            <p className="text-xl text-black font-bold">
                                70% 
                            </p>
                            <div className="w-40 h-12 rounded-md shadow-md bg-[hsl(70,100%,50%)]"></div>
                            <p className="text-xl text-black font-bold">
                                50% 
                            </p>
                            <div className="w-40 h-12 rounded-md shadow-md bg-[hsl(50,100%,50%)]"></div>
                        </div>
                        <p className="text-xl text-black font-normal">
                            Pertahankan kesehatan ayam kalian yaa
                        </p>
                        <button
                            onClick={handleClosePersentaseModal}
                            className="mt-4 bg-red-500 text-white px-4 py-2 rounded-lg"
                        >
                            Tutup
                        </button>
                    </div>
                </div>
            )}


            {isInfoModalOpen && (
                <div className="fixed inset-16 left1/4 md:left-1/3 max-h-3/4 overflow-y-auto bg-transparent bg-opacity-50 justify-center items-center z-50">
                    <div className="bg-white inset-16 p-4 md:p-6 rounded-lg shadow-lg w-full max-w-md md:max-w-lg">
                        <h2 className="text-lg text-black font-bold mb-4">Keterangan</h2>
                        <div className="grid grid-cols-2 gap-2">
                            <p className="text-sm md:text-md text-black font-semibold">
                                Deplesi 
                            </p>
                            <p className="text-xs md:text-sm text-justify text-black font-normal">
                                Deplesi ayam merujuk pada penyusutan jumlah populasi ayam yang terjadi selama periode pemeliharaan. <br></br>Penyusutan ini dapat disebabkan oleh dua faktor utama: kematian ayam dan culling (pengeluaran ayam yang tidak memenuhi standar produksi). 
                            </p>
                            <p className="text-sm md:text-md text-black font-semibold">
                                FCR (Feed Conversion Ratio) 
                            </p>
                            <p className="text-xs md:text-sm text-justify text-black font-normal">
                                FCR adalah rasio antara jumlah pakan yang diberikan kepada ayam dengan berat badan ayam yang dihasilkan. <br></br>Rasio ini digunakan untuk mengukur efisiensi konversi pakan menjadi daging ayam. Semakin rendah nilai FCR, semakin efisien proses pemeliharaan ayam.
                            </p>
                            <p className="text-sm md:text-md text-black font-semibold">
                                IP (Indeks Performance) 
                            </p>
                            <p className="text-xs md:text-sm text-justify text-black font-normal">
                                Ukuran yang digunakan untuk menilai kinerja produksi ayam broiler dalam satu periode pemeliharaan. IP mencerminkan efisiensi penggunaan pakan, bobot panen, tingkat kematian, dan umur panen. Semakin tinggi nilai IP, semakin baik performa pemeliharaan ayam broiler dan semakin menguntungkan usaha peternakan. Nilai IP optimal berkisar antara 300 hingga 350. <br></br>Jika nilai IP di bawah 300, kinerja produksi dianggap kurang baik. Nilai di atas 350 menunjukkan kinerja yang sangat baik dan efisien dalam pemeliharaan ayam broiler.
                            </p>
                            <p className="text-sm md:text-md text-black font-semibold">
                                ADG (Average Daily Gain) PBBH (Pertambahan Berat Badan Harian) 
                            </p>
                            <p className="text-xs md:text-sm text-justify text-black font-normal">
                                ADG adalah ukuran pertambahan berat badan rata-rata ayam dalam satu hari. <br></br>ADG dihitung dengan membagi total berat badan ayam dengan jumlah hari pemeliharaan. <br></br>ADG yang baik menunjukkan pertumbuhan yang optimal dan efisien dalam pemeliharaan ayam broiler.
                            </p>
                        </div>                
                        <button
                            onClick={handleCloseInfoModal}
                            className="mt-4 bg-red-500 text-white px-4 py-2 rounded-lg"
                        >
                            Tutup
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}