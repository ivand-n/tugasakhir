import { NextResponse } from "next/server";

export function middleware(req) {
    const token = req.cookies.get("token") || req.headers.get("Authorization");

    if (!token) {
        return NextResponse.redirect(new URL("/monitoring/login", req.url));
    }

    return NextResponse.next();
}