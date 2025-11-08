// filepath: /pages/articles/[slug].js
import axios from 'axios';
import Navbar from '@/components/CompanyProfile/navbar';
import Footer from '@/components/CompanyProfile/footer';
import Breadcrumb from '@/components/CompanyProfile/Breadcrumbs';
import { format, parse } from 'date-fns';
import { useRouter } from 'next/router';
import Image from 'next/image';

export default function ArticlePage({ article }) {
    const router = useRouter();
    if (!article) {
        return <p>Article not found</p>;
    }

    const breadcrumbPaths = [
        { label: 'Home', href: '/' },
        { label: 'Articles', href: '/articles' },
        { label: article.title, href: `articles/fullArticle?slug=${article.slug}` }, // Current page
    ];

    return (
        <>
        <Navbar />
        <div className='w-full bg-[#EBE1E1]'>
            <div className="pt-16 container mx-auto p-4">
                <Breadcrumb paths={breadcrumbPaths} />
                <button
                    onClick={() => router.back()} // Fungsi untuk kembali ke halaman sebelumnya
                    className="mb-4 px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                >
                    Back
                </button>
                <h1 className="text-3xl font-bold mb-4 uppercase text-black">{article.title}</h1>
                <p className="text-gray-700 mb-2">
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
                <div className="text-center mb-4">
                    <Image src="/1.jpeg" width={200} height={200} alt={article.title} className="w-[1000x] h-auto" />
                </div>
                <div className="text-black text-lg text-justify space-y-4">
                    {article.body.split('\n').map((paragraph, index) => (
                        <p key={index} className="mb-4">{paragraph}</p>
                    ))}
                </div>
            </div>
        </div>
        <Footer />
        </>
    );
}

export async function getServerSideProps(context) {
    const { slug } = context.params;

    try {
        const response = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/article/${slug}`);
        return {
            props: {
                article: response.data,
            },
        };
    } catch (error) {
        console.error('Error fetching article:', error);
        return {
            props: {
                article: null,
            },
        };
    }
}