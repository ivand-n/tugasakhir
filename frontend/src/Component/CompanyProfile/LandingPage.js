import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Link from 'next/link';
import Navbar from '@/components/CompanyProfile/navbar';
import Footer from '@/components/CompanyProfile/footer';
import Breadcrumb from '@/components/CompanyProfile/Breadcrumbs';
import { href } from 'react-router-dom';
import Image from 'next/image';

export default function LandingPage() {

    const breadcrumbPaths = [
        { label: 'Home', href: '/' } // Current page
    ];

    const [currentSlide, setCurrentSlide] = useState(0);
    const [articles, setArticles] = useState([]);

    const handlePrevious = () => {
        setCurrentSlide((prev) => (prev === 0 ? articles.length - 1 : prev - 1));
    };

    const handleNext = () => {
        setCurrentSlide((prev) => (prev === articles.length - 1 ? 0 : prev + 1));
    };

    // Fungsi untuk membatasi jumlah kata
    const truncateText = (text, wordLimit) => {
        const words = text.split(' ');
        if (words.length > wordLimit) {
            return words.slice(0, wordLimit).join(' ') + '...';
        }
        return text;
    };

    useEffect(() => {
        const fetchArticles = async () => {
            try {
                const response = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/`); // Ganti URL sesuai endpoint backend Anda
                const formattedArticles = response.data.map((article) => ({
                    title: article.title,
                    content: article.body,
                    author: article.author,
                    slug: article.slug,
                    picture: article.picture,
                    createdAt: new Date(article.created_at).toLocaleDateString(), // Format tanggal
                }));
                setArticles(formattedArticles);
            } catch (error) {
                console.error('Error fetching articles:', error);
            }
        };

        fetchArticles();
    }, []);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentSlide((prev) => (prev === articles.length - 1 ? 0 : prev + 1));
        }, 6000);

        return () => clearInterval(interval);
    }, [articles, currentSlide]);

    return (
        <div className="flex flex-col min-h-screen font-rubik">
            <Navbar />
            <main className="pt-16 flex-1 bg-white">
                <div className="ml-5 container">
                    <Breadcrumb paths={breadcrumbPaths} className="container" />
                </div>
                <div className="w-full h-[450px] md:h-[800px] relative rounded-b-4xl overflow-hidden bg-cover bg-center flex items-center justify-center"
                >
                    <Image src="/1.jpeg"
                    fill
                    alt='bg'/>
                    <div className="text-center space-y-4 top z-50">
                        <div className="text-white text-[24px] md:text-[32px] font-semibold ">
                            Solusi Kemudahan Beternak
                        </div>
                        <div className="text-white text-[20px] md:text-[28px] font-semibold ">
                            #PeternakKeren
                        </div>
                    </div>
                </div>
                <div className="bg-[#ebe0e0] w-full h-auto py-10 rounded-4xl">
                    <div className="text-center mb-8 text-black font-semibold text-3xl">
                        Why Chick-A?
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 px-4 md:px-16">
                        <div className="flex flex-col items-center w-full max-w-3xs mx-auto aspect-square bg-white rounded-xl shadow-md bg-cover">
                            <Image 
                            src="/easy.png"
                            width={220}
                            height={220}
                            alt='easy'/>
                            <div className='flex-1'></div>
                            <p className='text-black font-semibold text-xl mb-4'>Easy</p>
                        </div>
                        <div className="flex flex-col items-center w-full max-w-3xs mx-auto aspect-square bg-white rounded-xl shadow-md bg-cover">
                            <Image 
                            src="/accurate.png"
                            width={220}
                            height={220}
                            alt='accurate'/>
                            <div className='flex-1'></div>
                            <p className='text-black font-semibold text-xl mb-4'>Accurate</p>
                        </div>
                        <div className="flex flex-col items-center w-full max-w-3xs mx-auto aspect-square bg-white rounded-xl shadow-md bg-cover">
                            <Image 
                            src="/visualization.png"
                            width={220}
                            height={220}
                            alt='visualization'/>
                            <div className='flex-1'></div>
                            <p className='text-black font-semibold text-xl mb-4'>Visualization</p>
                        </div>
                    </div>
                </div>
                <div className='bg-[#d56e00] w-full h-96 rounded-4xl'>
                    <div className="grid grid-cols-5 w-full h-full">
                        {/* Bagian 1/4 */}
                        <div className="col-span-2 flex items-center justify-center bg-[#f5a623]">
                            <div className="text-center">
                                <h1 className="text-white text-4xl font-bold">Artikel</h1>
                                <h2 className="text-white text-2xl font-semibold">Chick-A</h2>
                            </div>
                        </div>
                        {/* Bagian 3/4 */}
                        <div className="col-span-3 flex flex-col items-center justify-center">
                            <div className="relative w-full h-full flex items-center justify-center">
                                {/* Artikel */}
                                {articles.length > 0 ? (
                                    <div className="w-full h-full bg-white shadow-md p-4 flex flex-col">
                                        {/* Bagian Atas: Gambar Artikel */}
                                        <div className="relative w-full h-2/6 flex items-center justify-center bg-gray-200 rounded-t-xl overflow-hidden">
                                            <Image src="/1.jpeg"
                                                width={100}
                                                height={100}
                                                alt={articles[currentSlide].title}                                                
                                                className="max-w-fit max-h-fit bg-cover object-contain"
                                            />
                                        </div>
                                        {/* Bagian Bawah: Keterangan Artikel */}
                                        <div className="w-full h-2/5 flex flex-col items-start justify-start space-y-2">
                                            <h3 className="text-2xl font-bold text-black">{articles[currentSlide].title}</h3>
                                            <div className="text-gray-600 text-sm">
                                                By: {articles[currentSlide].author} | Published: {articles[currentSlide].createdAt}  ||  <Link href={`/articles/${articles[currentSlide].slug}`}><div className="text-blue-500 hover:underline">Read More</div></Link>
                                            </div>
                                            <p className="text-black text-lg">{truncateText(articles[currentSlide].content, 20)}</p>
                                        </div>
                                    </div>
                                ) : (
                                    <p className="text-white">Loading...</p>
                                )}
                                {/* Tombol Panah Kiri */}
                                <button
                                    onClick={handlePrevious}
                                    className="absolute left-0 bg-[#f5a623] text-white p-2 rounded-full shadow-md hover:bg-[#d56e00] transition"
                                >
                                    &#8592; {/* Panah kiri */}
                                </button>
                                {/* Tombol Panah Kanan */}
                                <button
                                    onClick={handleNext}
                                    className="absolute right-0 bg-[#f5a623] text-white p-2 rounded-full shadow-md hover:bg-[#d56e00] transition"
                                >
                                    &#8594; {/* Panah kanan */}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}