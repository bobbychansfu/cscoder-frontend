import localFont from "next/font/local";
import "./globals.css";
import {Button} from "@/components/ui/button";
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

export default function RootLayout({children}: Readonly<{ children: React.ReactNode; }>) {
    return (
        <html lang="en">
        <body
            className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-100 p-4`}
        >
        <header className="flex justify-between items-center mb-8">
            <Link href="/">
                <div className="text-3xl font-bold text-red-700 cursor-pointer">CS-CODER</div>
            </Link>
            <Link
                href="/user">
                <Button
                    className="bg-white hover:bg-gray-200 text-red-700 px-8 py-3 rounded-lg text-lg font-semibold transition-colors duration-300">
                    {"Log In"}
                </Button>
            </Link>
        </header>
        {children}
        </body>
        </html>
    );
}
