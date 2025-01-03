"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import dynamic from "next/dynamic";
import "react-quill/dist/quill.snow.css"; // Import Quill styles
import Loading from "@/components/Loading";

const ReactQuill = dynamic(() => import("react-quill-new"), { ssr: false });

export default function EditBook() {
    const params = useParams();
    const id = params?.id; // Extract the 'id' from the dynamic route
    const [title, setTitle] = useState("");
    const [notes, setNotes] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState("");
    const [token, setToken] = useState("");
    const [image, setImage] = useState<File | null | string | any>("");
    const [imagee, setImagee] = useState<File | null | string | any>("");


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
                console.error("Failed to refresh token");
                return undefined;
            }

            const data = await response.json();
            sessionStorage.setItem("token", data.token);
            return data.token;
        } catch (error) {
            console.error("Error refreshing access token:", error);
            return undefined;
        }
    };

    useEffect(() => {
        if (!id) return; // Wait for 'id' to be available

        const fetchBook = async () => {
            try {
                setLoading(true);
                setError(null);

                const tokenAwal = await refreshAccessToken();
                if (!tokenAwal) throw new Error("Unable to retrieve access token");
                setToken(tokenAwal);

                const response = await fetch(`/api/book/get/${id}`, {
                    headers: {
                        Authorization: `Bearer ${tokenAwal}`,
                    },
                });

                if (!response.ok) {
                    throw new Error("Failed to fetch book details");
                }

                const data: bookType = await response.json();
                setTitle(data.title);
                setNotes(data.notes);
                setImagee(data.cover)
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchBook();
    }, [id]); // Fetch book whenever 'id' changes

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setSuccessMessage("");

        const formData = new FormData();
        formData.append("title", title);
        formData.append("notes", notes);
        if (image) {
            formData.append("image", image);
        }

        try {
            const response = await fetch(`/api/book/edit/${id}`, {
                method: "PATCH",
                headers: {
                    Authorization: `Bearer ${token}`, // Use the token correctly
                },
                body: formData,
            });

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.error || "Something went wrong");
            }

            setSuccessMessage("Book added successfully!");
        } catch (error: any) {
            alert(error.message);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <Loading />;
    if (error) return <p className='text-red-500'>Error: {error}</p>;
    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setImage(e.target.files[0]);
            setImagee(URL.createObjectURL(e.target.files[0]))
        }
    };

    return (
        <div className='container'>
            <div className='content'>
                <div className='space-y-4'>
                    <h1 className='bookTitle'>Edit Book</h1>
                    {imagee && (
                        <div>
                            <img src={imagee} alt='Book cover' className='mt-2 rounded shadow bookCover' />
                        </div>
                    )}
                    <form onSubmit={handleSubmit} className='space-y-4'>
                        <div className='mt-2'>
                            <label htmlFor='title' className='block font-semibold mb-1 h5'>
                                Title
                            </label>
                            <input
                                type='text'
                                id='title'
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className='form-control background-dark text-white border-2 border-secondary rounded p-2'
                                placeholder='Enter book title...'
                                required
                            />
                        </div>

                        <div className='mt-2'>
                            <label htmlFor='notes' className='block font-semibold mb-1 h5'>
                                Notes
                            </label>
                            <ReactQuill value={notes} onChange={setNotes} className='background-dark text-white border-2 border-secondary rounded quill-custom' />
                        </div>

                        <div className='mt-2'>
                            <label htmlFor='image' className='block font-semibold mb-1 h5'>
                                Cover Image (optional)
                            </label>
                            <input
                                type='file'
                                id='image'
                                accept='image/*'
                                onChange={handleImageChange}
                                name='image'
                                className='form-control background-dark text-white border-2 border-secondary rounded p-2'
                            />
                        </div>

                        <div className='text-end mt-2'>
                            <button type='submit' className='btn btn-sm primary-btn rounded-pill px-4 py-1' disabled={loading}>
                                {loading ? "Submitting..." : "Edit Book"}
                            </button>
                        </div>

                        {successMessage && <p className='text-green-500 font-semibold mt-2'>{successMessage}</p>}
                    </form>
                </div>
            </div>
        </div>
    );
}
