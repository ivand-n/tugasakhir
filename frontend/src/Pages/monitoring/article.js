import Link from 'next/link';
import axios from 'axios';
import Sidebar from '@/components/Monitoring/sidebar';
import Breadcrumb from '@/components/CompanyProfile/Breadcrumbs';
import Image from 'next/image';
import { useRouter } from 'next/router';

export default function ArticlesPage({ articles }) {
    const router = useRouter();

    const handleDelete = async (slug) => {
        if (confirm("Are you sure you want to delete this article?")) {
            try {
                const token = localStorage.getItem("token");
                await axios.delete(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/article/${slug}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                router.replace(router.asPath); // Refresh the page
            } catch (error) {
                console.error("Error deleting article:", error);
                alert("Failed to delete the article.");
            }
        }
    };

    const breadcrumbPaths = [
        { label: 'Monitoring', href: '/monitoring' },
        { label: 'Articles', href: '/monitoring/article' }, // Current page
    ];

    return (
        <div className='flex flex-col md:flex-row bg-white h-auto min-h-svh'>
        <Sidebar />
        <div className="w-full pt-16 bg-white h-auto min-h-svh">
            <div className="md:ml-64 mt-10 container mx-auto p-4">
                <Breadcrumb paths={breadcrumbPaths} />
                <h1 className="text-3xl font-bold mb-6 text-black">Manajemen Artikel</h1>
                <Link href="form/FormArticle" className="bg-green-500 text-white px-4 py-2 rounded mb-4 inline-block">
                    Tambah Artikel
                </Link>
                <ul className="space-y-4">
                    {articles.map((article) => (
                        <li key={article.slug} className="border-b pb-4">
                            <Link href={`/articles/${article.slug}`}>
                                <div className="text-blue-500 hover:underline text-xl font-semibold">
                                    {article.title}
                                </div>
                            </Link>
                            <div className="text-gray-700 mb-2">
                                {article.body.length > 100 ? `${article.body.substring(0, 100)}...` : article.body}
                            </div>
                            <div className="text-center mb-4">
                                <Image src="/1.jpeg"
                                width={300} 
                                height={200}
                                className="w-[300px] h-auto" />
                            </div>
                            <p className="text-gray-600 text-sm">
                                By: {article.author} | Published: {article.created_at
                                    ? new Intl.DateTimeFormat("id-ID", {
                                        dateStyle: "medium",
                                        timeStyle: "short",
                                        timeZone: "Asia/Jakarta",
                                    }).format(
                                        new Date(article.created_at).getTime() + (7 * 60 * 60 * 1000)
                                    )
                                    : "-"}
                            </p>
                            <div className="flex space-x-2 mt-2">
                                <Link href={`form/FormArticle?slug=${article.slug}`} className="bg-yellow-500 text-white px-3 py-1 rounded">
                                    Edit
                                </Link>
                                <button onClick={() => handleDelete(article.slug)} className="bg-red-500 text-white px-3 py-1 rounded">
                                    Delete
                                </button>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
        </div>
    );
}

export async function getServerSideProps() {
    try {
        const response = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/`); // Adjust the endpoint as needed
        return {
            props: {
                articles: response.data,
            },
        };
    } catch (error) {
        console.error('Error fetching articles:', error);
        return {
            props: {
                articles: [],
            },
        };
    }
}