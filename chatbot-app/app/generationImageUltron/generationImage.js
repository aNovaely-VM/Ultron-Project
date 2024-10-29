import { useEffect, useState } from 'react';
import Image from 'next/image';

export default function ImageUltron() {
    const images = [
        '/ImageBlablaUltron2d/Ultron_A.png',
        '/ImageBlablaUltron2d/ultron_consonne.png',
        '/ImageBlablaUltron2d/Ultron_I.png',
        '/ImageBlablaUltron2d/Ultron_neutre.png',
        '/ImageBlablaUltron2d/Ultron_O.png',
        '/ImageBlablaUltron2d/Ultron_vide.png',
    ];

    const [imageIndex, setImageIndex] = useState(0);

    useEffect(() => {
        const intervalId = setInterval(() => {
            setImageIndex((prevIndex) => (prevIndex + 1) % images.length);
        }, 500); // Changer d'image toutes les 0.1 secondes

        return () => clearInterval(intervalId); // Nettoyage à la désinstallation
    }, []);

    return (
        <div style={{paddingTop: '10%', display:'flex'}}>
            {images[imageIndex] && (
                <Image
                    src={images[imageIndex]}
                    alt="Image changeante"
                    width={180}
                    height={140}
                    onError={() => setImageIndex((prevIndex) => (prevIndex + 1) % images.length)}// Passer à l'image suivante si erreur
                />
            )}
        </div>
    );
}
