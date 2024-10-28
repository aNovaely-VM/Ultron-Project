import { useEffect, useState } from 'react';
import Image from 'next/image';

export default function ImageUltron() {
  const images = [
    '/Ultron_A.png',
    '/ultron_consonne.png',
    '/Ultron_I.png',
    '/Ultron_neutre.png',
    '/Ultron_O.png',
    '/Ultron_vide.png',
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
          alt="Image changeante"
          width={500}
          height={300}
        />
      )}
    </div>
  );
}
