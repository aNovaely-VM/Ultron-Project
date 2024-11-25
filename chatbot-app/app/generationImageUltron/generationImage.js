import { useEffect, useState } from 'react';
import Image from 'next/image';

export default function ImageUltron({ isSpeaking }) {
    const images = [
        '/ImageBlablaUltron2d/Ultron_A.png',
        '/ImageBlablaUltron2d/ultron_consonne.png',
        '/ImageBlablaUltron2d/Ultron_I.png',
        '/ImageBlablaUltron2d/Ultron_neutre.png',
        '/ImageBlablaUltron2d/Ultron_O.png',
        '/ImageBlablaUltron2d/Ultron_vide.png',
    ];

    const defaultImage = '/ImageBlablaUltron2d/Ultron_vide.png'; // Image fixe par défaut
    const [imageIndex, setImageIndex] = useState(0);

    useEffect(() => {
        let intervalId;

        if (isSpeaking) {
            intervalId = setInterval(() => {
                setImageIndex((prevIndex) => (prevIndex + 1) % images.length);
            }, 500);
        } else {
            setImageIndex(0); // Réinitialise à l'image par défaut si nécessaire
        }

        return () => clearInterval(intervalId);
    }, [isSpeaking]);

    return (
        <div
            style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '140px',
                marginTop: '10px',
            }}
        >
            {isSpeaking ? (
                <Image
                    src={images[imageIndex]}
                    alt="Image changeante"
                    width={180}
                    height={140}
                    style={{ objectFit: 'contain', marginBottom: '10px' }}
                    onError={() => setImageIndex((prevIndex) => (prevIndex + 1) % images.length)}
                />
            ) : (
                <Image
                    src={defaultImage}
                    alt="Image fixe"
                    width={180}
                    height={140}
                    style={{ objectFit: 'contain', marginBottom: '10px' }}
                />
            )}
        </div>
    );
}
