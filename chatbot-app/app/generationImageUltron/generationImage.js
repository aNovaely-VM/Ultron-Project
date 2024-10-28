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

    const [imageSrc, setImageSrc] = useState(images[0]);

    useEffect(() => {
        const updateImage = () => {
            const currentSeconds = new Date().getSeconds();
            const index = Math.floor(currentSeconds / 3) % images.length;
            setImageSrc(images[index]);
        };

        updateImage(); // Appel initial
        const intervalId = setInterval(updateImage, 3000); // Mettre à jour toutes les 3 secondes

        return () => clearInterval(intervalId); // Nettoyage à la désinstallation
    }, []);

    return (
        <div>
            <h1>Image qui change toutes les 3 secondes</h1>
            {imageSrc && (
                <Image
                    src={imageSrc}
                    // src= '/ImageBlablaUltron2d/Ultron_A.png'
                    alt="Image changeante"
                    width={500}
                    height={300}
                />
            )}
        </div>
    );
}
