import React, { useState, useEffect } from "react";
import Link from "next/link";
import axios from "axios";

export default function Sidebar() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isMonitoringDropdownOpen, setIsMonitoringDropdownOpen] = useState(false);
    const [userInfo, setUserInfo] = useState({ email: "" });

    useEffect(() => {
        // Fetch user info from local storage or an API
        const storedEmail = localStorage.getItem("email") || "";
        setUserInfo({ email: storedEmail });
    }, []);

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen); 
    };

    const toggleMonitoringDropdown = () => {
        setIsMonitoringDropdownOpen(!isMonitoringDropdownOpen);
    };

    const handleLogout = async () => {
        try {
            await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/logout`);
        } catch (error) {
            // Optional: tampilkan pesan error
        } finally {
            localStorage.removeItem("token");
            localStorage.removeItem("username");
            window.location.href = "/monitoring/login";
        }
    };

    return (
        <div className="relative">
            <button
                onClick={toggleSidebar}
                className="fixed top-4 left-4 z-30 p-2 text-white bg-[#d56e00] rounded-lg shadow-lg focus:outline-none focus:ring-2 focus:ring-gray-200 md:hidden"
            >
                <span className="sr-only">Toggle Sidebar</span>
                <svg
                    className="w-6 h-6"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M4 6h16M4 12h16m-7 6h7"
                    />
                </svg>
            </button>

            <div
                className={`fixed top-0 left-0 z-20 h-full w-64 bg-[#d56e00] text-white shadow-lg transform ${
                    isSidebarOpen ? "translate-x-0" : "-translate-x-full"
                } transition-transform duration-300 md:translate-x-0`}
            >
                <div className="p-4">
                    <h2 className="text-2xl font-semibold mb-6 ml-14">Chick-A</h2>
                    <hr></hr>
                    <ul className="space-y-4 mt-6">
                        <li>
                            <Link
                                href="/monitoring"
                                className="block py-2 px-3 hover:bg-white hover:text-[#d56e00] rounded-md"
                            >
                                Dashboard
                            </Link>
                        </li>
                        <li>
                            <Link
                                href="/monitoring/kandang"
                                className="block py-2 px-3 hover:bg-white hover:text-[#d56e00] rounded-md"
                            >
                                Kandang
                            </Link>
                        </li>
                        <li>
                            <Link
                                href="/monitoring/arsip"
                                className="block py-2 px-3 hover:bg-white hover:text-[#d56e00] rounded-md"
                            >
                                Arsip Data
                            </Link>
                        </li>
                        <li>
                            <button
                                onClick={toggleMonitoringDropdown}
                                className="w-full flex justify-between items-center py-2 px-3 hover:bg-white hover:text-[#d56e00] rounded-md focus:outline-none"
                            >
                                Monitoring
                                <svg
                                    className={`w-4 h-4 ml-2 transition-transform ${isMonitoringDropdownOpen ? "rotate-180" : ""}`}
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>
                            {isMonitoringDropdownOpen && (
                                <div className="ml-4 mt-2 space-y-2">
                                    <Link
                                        target="_blank"
                                        href="https://cloud.haiwell.com/#/index/?listType=list&language=en"
                                        className="block py-2 px-3 hover:bg-white hover:text-[#d56e00] rounded-md"
                                    >
                                        HMI
                                    </Link>
                                </div>
                            )}
                        </li>
                        {userInfo.email === "divan4621@gmail.com" && (
                            <li>
                                <Link
                                    href="/monitoring/article"
                                    className="block py-2 px-3 hover:bg-white hover:text-[#d56e00] rounded-md"
                                >
                                    Artikel
                                </Link>
                            </li>
                        )}
                        <li>
                            <Link
                                href="/monitoring/tanya"
                                className="block py-2 px-3 hover:bg-white hover:text-[#d56e00] rounded-md"
                            >
                                Tanya Dokter
                            </Link>
                        </li>
                        <li>
                            <Link
                                href="/monitoring/profile"
                                className="block py-2 px-3 hover:bg-white hover:text-[#d56e00] rounded-md"
                            >
                                Profil
                            </Link>
                        </li>
                        <li>
                            <div
                            className="block py-2 px-3 hover:bg-red-500 hover:text-white rounded-md">
                            <button onClick={handleLogout}>
                                Logout
                            </button>
                            </div>
                        </li>
                    </ul>
                </div>
            </div>

            {isSidebarOpen && (
                <div
                    onClick={toggleSidebar}
                    className="fixed inset-0 z-10 bg-black opacity-50 pointer-events-auto md:hidden"
                ></div>
            )}
        </div>
    );
}