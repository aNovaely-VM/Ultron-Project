import { useEffect, useState } from 'react';
import Image from 'next/image';
import { letterToImageMap, randomImages, defaultImage } from '@/utils/letterToImageMap';

export default function ImageUltron({ isSpeaking, currentLetter }) {
    const [currentImage, setCurrentImage] = useState(defaultImage);

    useEffect(() => {
        const letter = currentLetter ? currentLetter.toUpperCase() : '';
        if (!isSpeaking) {
            setCurrentImage(defaultImage);
        } else if (letter && letterToImageMap[letter]) {
            setCurrentImage(letterToImageMap[letter]);
        } else {
            const randomIndex = Math.floor(Math.random() * randomImages.length);
            setCurrentImage(randomImages[randomIndex]);
        }
    }, [isSpeaking, currentLetter]);

    return (
        <div className="image-container">
            <Image
                src={currentImage}
                alt="Image synchronisée"
                width={240}
                height={200}
                className="image"
            />
        </div>
    );
}
