import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";

export default NextAuth({
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            authorization: {
                url: `${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/login`,
                params: {
                    scope: "openid email profile",
                },
            },
            token: `${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/callback`, // Pastikan endpoint ini mendukung POST
            userinfo: `${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/callback`, // Endpoint untuk mendapatkan data pengguna
            profile(profile) {
                return {
                    id: profile.id,
                    name: profile.name,
                    email: profile.email,
                    image: profile.profile_picture,
                };
            },
        }),
    ],
    callbacks: {
        async jwt(token, user) {
            if (user) {
                token.id = user.id;
                token.name = user.name;
                token.email = user.email;
                token.image = user.image;
            }
            return token;
        },
        async session(session, token) {
            session.user.id = token.id;
            session.user.name = token.name;
            session.user.email = token.email;
            session.user.image = token.image;
            return session;
        },
    },
    pages: {
        signIn: "/auth/login", // Halaman login
        error: "/auth/error", // Halaman error
    },
    secret: process.env.NEXTAUTH_SECRET,
});