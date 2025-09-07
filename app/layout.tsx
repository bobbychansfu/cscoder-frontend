"use client"

import localFont from "next/font/local";
import "./globals.css";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import React, { useState, useEffect } from "react";

const geistSans = localFont({
    src: "./fonts/GeistVF.woff",
    variable: "--font-geist-sans",
    weight: "100 900",
});
const geistMono = localFont({
    src: "./fonts/GeistMonoVF.woff",
    variable: "--font-geist-mono",
    weight: "100 900",
});

function Header() {
    "use client";
    const [userLoggedIn, setUserLoggedIn] = useState(false);
    const [userId, setUserId] = useState<string | null>(null);

    useEffect(() => {
        fetch('/api/contests', { credentials: 'include' })
            .then(res => {
                if (res.ok) {
                    return res.json();
                }
                return null;
            })
            .then(data => {
                if (data && data.computingId) {
                    setUserLoggedIn(true);
                    setUserId(data.computingId);
                }
            });
    }, []);

    const casLoginUrl = process.env.NEXT_PUBLIC_CAS_LOGIN_URL || "https://cas.sfu.ca/cas/login?service=http%3A%2F%2Fcoder.cmpt.sfu.ca%2F";

    return (
        <header className="flex justify-between items-center mb-8">
            <Link href="/">
                <div className="text-3xl font-bold text-red-700 cursor-pointer">CODER</div>
            </Link>
            <Link href={userLoggedIn && userId ? `/user/${userId}` : casLoginUrl}>
                <Button
                    className="bg-white hover:bg-gray-200 text-red-700 px-8 py-3 rounded-lg text-lg font-semibold transition-colors duration-300">
                    {userLoggedIn ? "Profile" : "Log In"}
                </Button>
            </Link>
        </header>
    );
}

export default function RootLayout({children}: Readonly<{ children: React.ReactNode; }>) {
    return (
        <html lang="en">
        <body
            className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-100 p-4`}
        >
        <Header />
        {children}
        </body>
        </html>
    );
}
