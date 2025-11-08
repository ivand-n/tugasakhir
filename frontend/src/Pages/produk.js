import { React } from 'react';
import Navbar from '@/components/CompanyProfile/navbar';
import Footer from '@/components/CompanyProfile/footer';
import Breadcrumb from '@/components/CompanyProfile/Breadcrumbs';
import Image from 'next/image';

export default function Produk() {
    const breadcrumbPaths = [
        { label: 'Home', href: '/' },
        { label: 'Produk', href: '/produk' }, // Current page
    ];

    return (
        <>
            <Navbar />
            <div className='w-full bg-[#EBE1E1]'>
                <div className="pt-16 container mx-auto p-4">
                    <Breadcrumb paths={breadcrumbPaths} />
                    <h1 className="text-3xl font-bold mb-4 uppercase text-black text-center">Produk Chick-A</h1>
                    <div className="text-black text-lg text-justify flex grid-cols-2 gap-10 items-center justify-center">
                        <div className="flex flex-col items-center bg-white rounded-lg shadow-md p-4 w-64 h-64 md:w-80 md:h-80">
                            <Image src="/produk1.png" alt="Produk 1" fill className="w-full h-auto mb-4" />
                            <h2 className="text-xl font-semibold">Chick-A</h2>
                            <p className="text-gray-700">Deskripsi produk 1.</p>
                        </div>
                        <div className="flex flex-col items-center bg-white rounded-lg shadow-md p-4 w-64 h-64 md:w-80 md:h-80">
                            <Image src="/produk2.png" alt="Produk 2" fill className="w-full h-auto mb-4" />
                            <h2 className="text-xl font-semibold">Chick-A PRO</h2>
                            <p className="text-gray-700">Deskripsi produk 2.</p>
                        </div>
                    </div>
                    <div className="mt-10 bg-[#d56e00] rounded-xl p-6">
                        <h2 className="text-2xl font-bold text-white text-center mb-6">Perbandingan Chick-A dan Chick-A PRO</h2>
                        <div className="overflow-x-auto">
                            <table className="table-auto border-collapse w-full text-left text-white">
                                <thead>
                                    <tr className="bg-[#b45a00]">
                                        <th className="border border-[#b45a00] px-4 py-2 text-center">No</th>
                                        <th className="border border-[#b45a00] px-4 py-2">Fitur</th>
                                        <th className="border border-[#b45a00] px-4 py-2 text-center">Chick-A</th>
                                        <th className="border border-[#b45a00] px-4 py-2 text-center">Chick-A PRO</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {[
                                        { no: 1, fitur: 'Daily monitoring', chickA: true, chickAPro: true },
                                        { no: 2, fitur: 'Otomatisasi Data', chickA: true, chickAPro: true },
                                        { no: 3, fitur: 'Kalkulasi hingga panen', chickA: true, chickAPro: true },
                                        { no: 4, fitur: 'Export data ke CSV', chickA: true, chickAPro: true },
                                        { no: 5, fitur: 'Integrasi Sapronak', chickA: true, chickAPro: true },
                                        { no: 6, fitur: 'Monitoring kandang via website', chickA: false, chickAPro: true },
                                        { no: 7, fitur: 'Konsultasikan ayam dengan dokter', chickA: false, chickAPro: true },
                                    ].map((row, index) => (
                                        <tr key={index} className={'bg-[#d56e00] hover:bg-[#b45e00]'}> 
                                            <td className=" border-[#b45a00] px-4 py-2 text-center">{row.no}</td>
                                            <td className=" border-[#b45a00] px-4 py-2">{row.fitur}</td>
                                            <td className=" border-[#b45a00] px-4 py-2 text-center">
                                                {row.chickA ? (
                                                    <span className="text-green-500 font-bold text-xl">✔</span>
                                                ) : (
                                                    <span className="text-red-500 font-bold text-xl">✘</span>
                                                )}
                                            </td>
                                            <td className=" border-[#b45a00] px-4 py-2 text-center">
                                                {row.chickAPro ? (
                                                    <span className="text-green-500 font-bold text-xl">✔</span>
                                                ) : (
                                                    <span className="text-red-500 font-bold text-xl">✘</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </>
    );
}