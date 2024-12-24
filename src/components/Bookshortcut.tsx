import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faShare, faTrash } from "@fortawesome/free-solid-svg-icons";

export default function BookShortcut({ book, refreshAccessToken }: any) {
    const handleShare = async () => {
        const currentWeb = window.location.origin; // Get the base URL (origin)
        const currentUrl = `${currentWeb}/book/${book._id}`;
        if (navigator.share) {
            try {
                await navigator.share({
                    title: "Story Book",
                    text: "Where Your Story Begins",
                    url: currentUrl,
                });
                console.log("Successful share");
            } catch (error) {
                console.error("Error sharing", error);
            }
        } else if (navigator.clipboard) {
            try {
                await navigator.clipboard.writeText(currentUrl);
                alert("Link copied to clipboard. Share it with your friends!");
            } catch (error) {
                console.error("Clipboard write error", error);
                alert("Failed to copy link.");
            }
        } else {
            alert("Sharing is not supported on this browser.");
        }
    };

    const handleDelete = async () => {
        if (confirm("Are you sure you want to delete this book?")) {
            try {
                const tokenTemp = await refreshAccessToken();
                if (!tokenTemp) {
                    console.warn("No token available");
                    return;
                }
                console.log(tokenTemp)
                const response = await fetch(`/api/book/delete/${book._id}`, {
                    method: "DELETE",
                    headers: {
                        Authorization: `Bearer ${tokenTemp}`,
                    },
                });

                if (!response.ok) {
                    throw new Error("Failed to delete book");
                }

                alert("Book deleted successfully!");
                // Optionally, refresh the page or update the UI to remove the deleted book
                window.location.reload(); // Refresh page (or implement state update for better UX)
            } catch (error) {
                console.error("Error deleting book:", error);
                alert("Failed to delete book.");
            }
        }
    };

    return (
        <>
            <div className='d-flex flex-column align-items-center w-100 mb-3'>
                <a href={`/book/${book._id}`} className='text-center'>
                    <img className={window.location.pathname === '/book/publish' ? 'img-bs-publish' : 'img-bs'} src={book.cover || "https://4kwallpapers.com/images/walls/thumbs_3t/18164.jpg"} alt={book.title} />
                </a>
                <div className='mt-2 d-flex justify-content-between w-100'>
                    <a href={`/book/${book._id}`}>
                        <h3 className='mt-1'>{book.title}</h3>
                    </a>
                    <div className='d-flex'>
                        {/* Share Button */}
                        <button className='btn btn-transparent text-white btn-lg p-0 px-2 me-1' onClick={handleShare}>
                            <FontAwesomeIcon icon={faShare} />
                        </button>
                        {/* Delete Button */}
                        {window.location.pathname === '/home' && (
                            <button
                                className="btn btn-transparent danger-text btn-lg p-0"
                                onClick={handleDelete}
                            >
                                <FontAwesomeIcon icon={faTrash} />
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}
