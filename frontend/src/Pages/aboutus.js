import Link from "next/link";
import Navbar from '@/components/CompanyProfile/navbar';
import Footer from '@/components/CompanyProfile/footer';
import Breadcrumb from '@/components/CompanyProfile/Breadcrumbs';
import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react"; 

// Impor CSS Leaflet
import "leaflet/dist/leaflet.css";

// Atur ikon default Leaflet
if (typeof window !== "undefined") {
    const L = require("leaflet");
    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
        iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
        shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
    });
}

const MapContainer = dynamic(() => import("react-leaflet").then((mod) => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import("react-leaflet").then((mod) => mod.TileLayer), { ssr: false });
const Marker = dynamic(() => import("react-leaflet").then((mod) => mod.Marker), { ssr: false });
const Popup = dynamic(() => import("react-leaflet").then((mod) => mod.Popup), { ssr: false });

export default function AboutUs() {
    const breadcrumbPaths = [
        { label: "Home", href: "/" },
        { label: "About Us", href: "/aboutus" }, // Current page
    ];

    const markerRef = useRef();
    const [mapElement, setMapElement] = useState(null);

    useEffect(() => {
        const map = (
            <MapContainer
                center={[-7.4106006, 109.2548063]} // Koordinat Universitas Jenderal Soedirman
                zoom={16}
                style={{ height: "100%", width: "100%" }}
            >
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                <Marker position={[-7.4106006, 109.2548063]} ref={markerRef}>
                    <Popup>
                        Universitas Jenderal Soedirman <br /> Lokasi Chick-A.
                    </Popup>
                </Marker>
            </MapContainer>
        );

        setMapElement(map);
    }, []);

    useEffect(() => {;
    }, [mapElement]);
    return (
        <>
            <Navbar />
            <div className="w-full bg-[#EBE1E1]">
                <div className="pt-16 container mx-auto p-4 h-[700px]">
                    <Breadcrumb paths={breadcrumbPaths} />
                    <h1 className="text-3xl font-bold mb-4 uppercase text-black">Tentang Chick-A</h1>
                    <p className="text-black text-lg text-justify space-y-4">
                    Chick-A adalah solusi teknologi terdepan yang dirancang untuk meningkatkan efisiensi dan produktivitas peternakan Anda. Dengan memanfaatkan teknologi Internet of Things (IoT), kami menyediakan platform komprehensif untuk memantau dan mengelola berbagai aspek peternakan Anda secara real-time. Mulai dari pemantauan suhu dan kelembaban kandang, hingga pengelolaan data produksi, Chick-A membantu Anda mengambil keputusan yang lebih baik dan mengoptimalkan hasil panen.
                    </p>
                </div>
                <div className="mx-auto p-4 h-[400px] bg-[#d56e00] rounded-xl">
                    <div className="flex flex-col items-center justify-center h-full">
                        <h1 className="text-white text-4xl font-bold">Inovasi Oleh</h1>
                        <h1 className="text-white text-5xl font-bold mt-2">Tim Inovasi Teknologi Peternakan</h1>
                        <h1 className="text-white text-4xl font-bold mt-2">Universitas Jenderal Soedirman</h1>
                    </div>
                </div>
                <div className="h-24 mx-auto bg-[#ebe1e1] rounded-t-xl flex items-center justify-center">
                    <h1 className="text-black text-3xl font-bold">Lokasi Chick-A</h1>
                </div>
                <div className="mx-auto p-4 h-[400px] bg-[#ebe1e1] rounded-xl">
                    <div className="grid grid-cols-2 gap-4 h-92">
                        <div className="flex flex-col items-center justify-center h-full bg-white rounded-xl">
                            {mapElement}
                        </div>
                        <div className="flex flex-col items-center justify-center h-full bg-white rounded-xl p-4">
                            <h1 className="text-black text-3xl font-bold">Chick-A Farm House</h1>
                            <p className="text-black text-lg text-justify mt-2">
                                Chick-A Farm House Fakultas Peternakan Universitas Jenderal Soedirman
                            </p>
                            <p className="text-black text-lg text-justify mt-2">
                                Jl. Raya Jendral Sudirman No.KM 5, Karangwangkal, Kec. Purwokerto Utara, Kabupaten Banyumas, Jawa Tengah 53122
                            </p>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </>
    );
}