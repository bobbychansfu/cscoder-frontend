"use client";

import React, { useEffect } from 'react';
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import Link from 'next/link';


export default function MainPage() {
    const router = useRouter();
    const searchParams = useSearchParams();

    useEffect(() => {

        let ticket = "";

        if (process.env.LOCAL_DEVELOPMENT === "true"){
            ticket = process.env.FAKE_CAS_RESPONSE;
        } else {
            ticket = searchParams.get('ticket');
        }

        if (ticket) {
            fetch(`/api/login?ticket=${ticket}`)
                .then((res) => {
                    if (res.ok) {
                        return res.json();
                    }
                    throw new Error('Login with ticket failed.');
                })
                .then(data => {
                    console.log(data);
                    if (data && data.userName) {
                        router.push('/contests');
                    } else {
                        console.error('User ID not found in login response.');
                    }
                })
                .catch(err => {
                    console.error('Fetch error:', err);
                });
        }
    }, [searchParams, router]);

    const casLoginUrl = "https://cas.sfu.ca/cas/login?service=http%3A%2F%2Fcoder.cmpt.sfu.ca%2F";

    return (
        <div
            className="min-h-screen w-full bg-gray-100 flex flex-col items-center justify-center px-4"
            style={{
                backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0) 70%)',
                backgroundSize: '100% 100%',
                transition: 'background-position 0.3s ease-out'
            }}
        >
            <h1 className="md:text-7xl text-3xl lg:text-9xl font-bold text-center text-red-700 relative z-20">
                CODER
            </h1>
            <div className="w-[40rem] h-10 relative">
                <div
                    className="absolute inset-x-20 top-0 bg-gradient-to-r from-transparent via-red-600 to-transparent h-[2px] w-3/4 blur-sm"/>
                <div
                    className="absolute inset-x-20 top-0 bg-gradient-to-r from-transparent via-red-500 to-transparent h-px w-3/4"/>
                <div
                    className="absolute inset-x-60 top-0 bg-gradient-to-r from-transparent via-red-300 to-transparent h-[5px] w-1/4 blur-sm"/>
                <div
                    className="absolute inset-x-60 top-0 bg-gradient-to-r from-transparent via-red-400 to-transparent h-px w-1/4"/>
            </div>
            <p className="text-xl text-gray-700 mb-12 text-center max-w-2xl">
                Your ultimate platform for coding contests and challenges by SFU!
            </p>
            <div className="space-y-6 flex flex-col items-center">
                <Button asChild
                        className="bg-red-700 hover:bg-red-800 text-white px-12 py-6 rounded-lg text-2xl font-semibold transition-colors duration-300">
                    <Link href={casLoginUrl}>
                        Log In with SFU
                    </Link>
                </Button>
            </div>
        </div>
    )
}
