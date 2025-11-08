import Link from 'next/link';
import axios from 'axios';
import Navbar from '@/components/CompanyProfile/navbar';
import Footer from '@/components/CompanyProfile/footer';
import Breadcrumb from '@/components/CompanyProfile/Breadcrumbs';
import Image from 'next/image';

export default function ArticlesPage({ articles }) {
    if (!articles || articles.length === 0) {
        return <p>No articles found</p>;
    }
    const breadcrumbPaths = [
        { label: 'Home', href: '/' },
        { label: 'Articles', href: '/articles' }, // Current page
    ];

    return (
        <>
        <Navbar />
        <div className="w-full pt-16 bg-white">
            <div className="container mx-auto h-auto min-h-svh p-4">
                <Breadcrumb paths={breadcrumbPaths} />
                <h1 className="text-3xl font-bold mb-6 text-black">Articles Chick-A</h1>
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
                                                                // Add 7-hour offset if date is without offset
                                                                new Date(article.created_at).getTime() + (7 * 60 * 60 * 1000) // 7 hours in milliseconds
                                                            )
                                                            : "-"}
                            </p>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
        <Footer />
        </>
    );
}

export async function getServerSideProps() {
    try {
        const response = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/`); // Ganti URL sesuai endpoint backend Anda
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