"use client";
import BookShortcut from "@/components/Bookshortcut";
import Loading from "@/components/Loading";
import { useEffect, useState } from "react";

export default function Homepage() {
    const [user, setUser] = useState<userType | null>(null); // User state
    const [books, setBooks] = useState<bookType[]>([]);

    const refreshAccessToken = async () => {
        try {
            if (sessionStorage.getItem("token")) {
                return sessionStorage.getItem("token");
            }

            const response = await fetch("/api/user/refreshToken", {
                method: "POST",
                credentials: "include", // Ensure cookies are sent
            });

            if (!response.ok) {
                return window.location.href = "/login"
            }

            const data = await response.json();
            if (!data.token) window.location.href = "/login"
            sessionStorage.setItem("token", data.token);
            return data.token;
        } catch (error) {
            console.error("Error refreshing access token:", error);
            return null;
        }
    };

    useEffect(() => {
        async function fetchUserData() {
            try {
                const tokenTemp = await refreshAccessToken();
                if (!tokenTemp) {
                    console.warn("No token available");
                    return;
                }

                const response = await fetch(`/api/user/check`, {
                    method: "POST",
                    headers: { Authorization: `Bearer ${tokenTemp}` },
                });

                if (!response.ok) {
                    console.error("Failed to fetch user data");
                    throw new Error("Unauthorized");
                }

                const check = await response.json();
                setUser(check);

                if (check._id && check._id !== "system") {
                    const fetchBook = await fetch(`/api/book/get/userId/${check._id}`, {
                        headers: { Authorization: `Bearer ${tokenTemp}` },
                    });

                    if (!fetchBook.ok) {
                        console.error("Error Fetching Book");
                        throw new Error("Error");
                    }
                    const booksFetch = await fetchBook.json();
                    setBooks(booksFetch);
                }
            } catch (error) {
                console.error("Error fetching user data:", error);
                setUser(null);
            }
        }

        // Only fetch data if user is null
        if (user === null) {
            fetchUserData();
        }
    }, [user]);

    // Fallback while loading user
    if (user === null) {
        return <Loading />;
    }

    return (
        <>
            <div className="container py-3">
                <div className="text-center">
                    <div style={{ position: 'relative' }}>
                        <img
                            className="pfp-home"
                            src={user?.pp || ''}
                            alt={`profile picture from ${user.username}`}
                            style={{
                                position: 'absolute',
                                zIndex: 1,
                            }}
                        />
                        <img
                            className="pfp-home-blur"
                            src={user?.pp || ''}
                            alt={`profile picture from ${user.username}`}
                        />
                    </div>
                    <h1 className="mt-3 mb-0">{user?.name || user?.username}</h1>
                    <p className="secondary-text">{user?.desc || "No Description"}</p>
                    <div className="d-flex gap-2 justify-content-center">
                        <a href="/book/add" className="btn primary-btn">Have some idea ?</a>
                        <a href="/edit" className="btn secondary-btn">Edit Profile</a>
                    </div>
                </div>
                <div className="mt-5 d-flex flex-column align-items-center w-100">
                    <h3 className="button-container text-left">Recent Stories</h3> {/* Teks rata kiri, lebar 100% */}
                    {books.length > 0 ? (
                        <div>
                            {books.map((book, index) => (
                                <BookShortcut key={book._id} book={book} refreshAccessToken={refreshAccessToken}/>
                            ))}
                        </div>
                    ) : (
                        <p>Tidak ada buku untuk ditampilkan.</p>
                    )}
                </div>
            </div>
        </>
    );
}
