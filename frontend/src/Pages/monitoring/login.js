import { React, useEffect } from 'react';
import { useRouter } from 'next/router';
import Navbar from '@/components/CompanyProfile/navbar';
import Footer from '@/components/CompanyProfile/footer';
import Breadcrumb from '@/components/CompanyProfile/Breadcrumbs';

export default function Login() {
    const router = useRouter();
    
    const breadcrumbPaths = [
        { label: 'Home', href: '/' },
        { label: 'Monitoring', href: '/monitoring' }, // Current page
    ];
    const handleLogin = () => {
        window.location.href = `${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/login`;
    };

    useEffect(() => {
        // Periksa apakah token ada di localStorage
        const token = localStorage.getItem("token");
        if (token) {
            // Jika token ditemukan, arahkan ke halaman dashboard
            router.push("/monitoring");
        }
    }, [router]);

    return (
        <>
            <Navbar />
            <div className='w-full h-screen bg-[#EBE1E1]'>
                <div className="pt-16 container mx-auto p-4 items-center justify-center">
                    <Breadcrumb paths={breadcrumbPaths} />
                    <h1 className="text-3xl font-bold mb-4 uppercase text-black text-center">Login Monitoring Chick-A</h1>
                    <button 
                    onClick={handleLogin}
                    className="w-full flex items-center justify-center text-white bg-[#4285F4] hover:bg-[#357ae8] focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">
                        <svg className="w-4 h-4 me-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"></path>
                            <path d="M15.5 12H12v3.5h3.5V12z"></path>
                        </svg>
                        Login dengan Google
                    </button>
                </div>
            </div>
            <Footer />
        </>
    );
}