import { useEffect } from "react";
import { useRouter } from "next/router";

export default function Callback() {
    const router = useRouter();

    useEffect(() => {
        const query = new URLSearchParams(window.location.search);
        const token = query.get("token");
        const name = query.get("name");
        const email = query.get("email");
        const picture = query.get("picture");

        if (token) {
            // Simpan token dan waktu kedaluwarsa di localStorage
            const expirationTime = Date.now() + 6 * 60 * 60 * 1000; // 6 jam dari sekarang
            localStorage.setItem("token", token);
            localStorage.setItem("name", name);
            localStorage.setItem("email", email);
            localStorage.setItem("picture", picture);
            localStorage.setItem("token_expiration", expirationTime);

            // Arahkan pengguna ke halaman monitoring
            router.push("/monitoring");
        } else {
            console.error("Token not found in query parameters");
        }
    }, [router]);

    return <p>Processing login...</p>;
}