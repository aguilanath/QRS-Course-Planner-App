"use client"
import { useState } from "react";

const MediaCarousel = ({ media }) => {
    const [currentIndex, setCurrentIndex] = useState(0);

    const goLeft = () => {
        setCurrentIndex((prevIndex) => (prevIndex === 0 ? media.length - 1 : prevIndex - 1));
    };

    const goRight = () => {
        setCurrentIndex((prevIndex) => (prevIndex === media.length - 1 ? 0 : prevIndex + 1));
    };

    const getYouTubeEmbedUrl = (url) => {
        const videoId = url.split("v=")[1]?.split("&")[0] || url.split("youtu.be/")[1];
        return `https://www.youtube.com/embed/${videoId}`;
    };

    return (
        <div className="carousel">
            <button onClick={goLeft} className="carousel-button cleft">❮</button>
            
            <div className="carousel-content">
                {media[currentIndex]["type"] == "image" && <img src={media[currentIndex]["item"].src} alt={`Slide ${currentIndex}`} />}
                {media[currentIndex]["type"] == "youtube" && (
                    <iframe 
                        width="540" 
                        height="200" 
                        src={getYouTubeEmbedUrl(media[currentIndex]["item"])} 
                        title="YouTube video player"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                        allowFullScreen
                    ></iframe>
                )}
            </div>

            <button onClick={goRight} className="carousel-button cright">❯</button>
        </div>
    );
}

export default MediaCarousel