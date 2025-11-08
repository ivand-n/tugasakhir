import React, { useState } from 'react';
import Link from 'next/link'; // Import Link dari Next.js

export default function Navbar() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    return (
        <>
            <nav className="fixed w-full h-16 z-20 bg-[#d56e00] border-gray-200">
                <div className="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-4">
                    <Link href="https://chickabroiler.cloud/" className="flex items-center space-x-3 rtl:space-x-reverse">
                        <span className="self-center text-2xl font-semibold whitespace-nowrap dark:text-white">Chick-A</span>
                    </Link>
                    <button
                        onClick={toggleMenu}
                        type="button"
                        className="inline-flex items-center p-2 w-10 h-10 justify-center text-sm text-white rounded-lg md:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200"
                        aria-controls="navbar-default"
                        aria-expanded={isMenuOpen}
                    >
                        <span className="sr-only">Open main menu</span>
                        <svg
                            className="w-5 h-5"
                            aria-hidden="true"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 17 14"
                        >
                            <path
                                stroke="currentColor"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M1 1h15M1 7h15M1 13h15"
                            />
                        </svg>
                    </button>
                    <div
                        className={`${
                            isMenuOpen ? 'block' : 'hidden'
                        } w-full md:block md:w-auto`}
                        id="navbar-default"
                    >
                        <ul className="font-medium flex bg-white md:bg-transparent flex-col p-4 md:p-0 mt-4 border rounded-lg md:flex-row md:space-x-8 rtl:space-x-reverse md:mt-0 md:border-0">
                            <li>
                                <Link
                                    href="/"
                                    className="block py-2 px-3 md:text-white text-[#d56e00] hover:text-white hover:bg-[#d56e00] rounded-sm md:hover:underline md:border-0 md:p-0"
                                >
                                    Home
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/produk"
                                    className="block py-2 px-3 md:text-white text-[#d56e00] hover:text-white hover:bg-[#d56e00] rounded-sm md:hover:underline md:border-0 md:p-0"
                                >
                                    Produk
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/aboutus"
                                    className="block py-2 px-3 md:text-white text-[#d56e00] hover:text-white hover:bg-[#d56e00] rounded-sm md:hover:underline md:border-0 md:p-0"
                                >
                                    Tentang Kami
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/articles"
                                    className="block py-2 px-3 md:text-white text-[#d56e00] hover:text-white hover:bg-[#d56e00] rounded-sm md:hover:underline md:border-0 md:p-0"
                                >
                                    Artikel
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/monitoring/login"
                                    className="block py-2 px-3 md:text-white text-[#d56e00] hover:text-white hover:bg-[#d56e00] rounded-sm md:hover:underline md:border-0 md:p-0"
                                >
                                    Monitoring
                                </Link>
                            </li>
                        </ul>
                    </div>
                </div>
            </nav>
        </>
    );
}