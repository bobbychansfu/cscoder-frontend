"use client"

import localFont from "next/font/local";
import "./globals.css";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import React from "react";

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
    return (
        <header className="flex justify-between items-center mb-8">
            <Link href="/">
                <div className="text-3xl font-bold text-red-700 cursor-pointer">CODER</div>
            </Link>
            <Link href={`/user`}>
                <Button
                    className="bg-white hover:bg-gray-200 text-red-700 px-8 py-3 rounded-lg text-lg font-semibold transition-colors duration-300">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
                         stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                         className="lucide lucide-user-icon lucide-user">
                        <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/>
                        <circle cx="12" cy="7" r="4"/>
                    </svg>
                    Profile
                </Button>
            </Link>
        </header>
    );
}

import { SubmissionsProvider } from "@/lib/SubmissionsContext";

export default function RootLayout({children}: Readonly<{ children: React.ReactNode; }>) {
    return (
        <html lang="en">
        <body
            className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-100 p-4`}
        >
        <SubmissionsProvider>
            <Header />
            {children}
        </SubmissionsProvider>
        </body>
        </html>
    );
}
