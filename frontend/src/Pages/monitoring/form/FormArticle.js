import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import axios from "axios";
import Sidebar from "@/components/Monitoring/sidebar";
import Breadcrumb from "@/components/CompanyProfile/Breadcrumbs";

export default function FormKandang() {
    const router = useRouter();
    const { slug } = router.query;

    const [userInfo, setUserInfo] = useState({
        username: "",
        email: "",
        picture: "",
    });

    const [formData, setFormData] = useState({
        title: "",
        author: "",
        slug: "",
        body: "",
    });

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
            localStorage.removeItem("token");
            localStorage.removeItem("name");
            localStorage.removeItem("email");
            localStorage.removeItem("picture");
            localStorage.removeItem("token_expiration");
            router.push("/monitoring/login");
        }
    }, [router]);

    // Update formData when userInfo changes
    useEffect(() => {
        setFormData((prevData) => ({
            ...prevData,
            author: userInfo.email,
        }));
    }, [userInfo]);

    useEffect(() => {
        if (slug) {
            const token = localStorage.getItem("token");
            axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/article/${slug}`, {
                headers: { Authorization: `Bearer ${token}` }
            })
            .then(res => {
                setFormData({
                    title: res.data.title,
                    author: res.data.author,
                    slug: res.data.slug,
                    body: res.data.body,
                });
            })
            .catch(() => {
                alert("Gagal mengambil data Artikel");
            });
        }
    }, [slug]);

    const breadcrumbPaths = [
        { label: "Monitoring", href: "/monitoring" },
        { label: "Article", href: "/monitoring/article" },
        { label: slug ? "Ubah Artikel" : "Tambah Artikel", href: `/monitoring/form/FormArticle?${slug ? `slug=${slug}` : ""}` },
    ];

    const handleInputChange = (e) => {
        const { id, value } = e.target;
        setFormData((prevData) => {
            const newFormData = { ...prevData, [id]: value };

            // Automatically update the slug when the title changes
            if (id === "title") {
                newFormData.slug = value
                    .toLowerCase()
                    .replace(/ /g, '-') // Replace spaces with hyphens
                    .replace(/[^\w-]+/g, ''); // Remove all non-word characters except hyphens
            }

            return newFormData;
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log("Submitting form with data:", formData);
        try {
            const token = localStorage.getItem("token");
            if (slug) {
                await axios.put(
                    `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/article/${slug}`,
                    formData,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                router.push(`/monitoring/article/?success=editarticle`);
            } else {
                await axios.post(
                    `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/article`,
                    formData,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                router.push(`/monitoring/article/?success=addarticle`);
            }
        } catch (error) {
            alert("Terjadi kesalahan saat menyimpan data.");
        }
    };

    return (
        <div className="flex flex-col md:flex-row bg-white h-auto min-h-svh">
            <Sidebar/>
            <div className="md:ml-64 mt-10 container mx-auto p-4 text-black">
                <div className="flex items-center mt-4">
                    <div>
                        <h2 className="text-lg font-semibold">
                            Selamat Datang, Admin {userInfo.username}!
                        </h2>
                    </div>
                </div>
                <Breadcrumb paths={breadcrumbPaths} />
                <form onSubmit={handleSubmit} className="p-4">
                    <h1 className="text-2xl font-bold mb-4">Tambah Artikel</h1>
                    <div className="mb-4">
                        <label className="block text-sm font-medium">Judul</label>
                        <input
                            type="text"
                            id="title"
                            value={formData.title}
                            onChange={handleInputChange}
                            className="border rounded p-2 w-full"
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm font-medium">Author</label>
                        <input
                            type="text"
                            id="author"
                            value={formData.author}
                            onChange={handleInputChange}
                            className="border rounded p-2 w-full"
                            disabled
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm font-medium">Slug</label>
                        <input
                            type="text"
                            id="slug"
                            value={formData.slug}
                            onChange={handleInputChange}
                            className="border rounded p-2 w-full"
                        />
                    </div>
                    <div className="mb-4">                        
                        <label htmlFor="body" className="block text-sm font-medium">Body</label>
                        <textarea
                            id="body"
                            value={formData.body}
                            onChange={handleInputChange}
                            rows="4"
                            className="block border rounded p-2 w-full"
                            placeholder="Tulis artikel kamu disini"
                        ></textarea>
                    </div>
                    <button type="submit" className="bg-green-500 text-white px-4 py-2 rounded">
                        Simpan Perubahan
                    </button>
                </form>
            </div>
        </div>
    );
}