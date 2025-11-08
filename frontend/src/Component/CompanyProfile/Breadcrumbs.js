import Link from 'next/link';

export default function Breadcrumb({ paths, className }) {
    return (
        <nav className={`text-gray-700 text-sm mb-4 mt-4 ${className}`}>
            <ul className="flex items-center space-x-2">
                {paths.map((path, index) => (
                    <li key={index} className="flex items-center">
                        {path.href ? (
                            <Link href={path.href}>
                                <div className="text-blue-500 hover:underline">{path.label}</div>
                            </Link>
                        ) : (
                            <span className="text-gray-500">{path.label}</span>
                        )}
                        {index < paths.length - 1 && (
                            <span className="mx-2 text-gray-400">/</span>
                        )}
                    </li>
                ))}
            </ul>
        </nav>
    );
}