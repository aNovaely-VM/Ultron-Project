// import { useEffect, useState } from 'react';
// import Image from 'next/image';

// export default function ImageUltron({ isSpeaking }) {
//     const images = [
//         '/ImageBlablaUltron2d/Ultron_A.png',
//         '/ImageBlablaUltron2d/ultron_consonne.png',
//         '/ImageBlablaUltron2d/Ultron_I.png',
//         '/ImageBlablaUltron2d/Ultron_neutre.png',
//         '/ImageBlablaUltron2d/Ultron_O.png',
//         '/ImageBlablaUltron2d/Ultron_vide.png',
//     ];

//     const defaultImage = '/ImageBlablaUltron2d/Ultron_vide.png'; // Image fixe par défaut
//     const [imageIndex, setImageIndex] = useState(0);

//     useEffect(() => {
//         let intervalId;

//         if (isSpeaking) {
//             intervalId = setInterval(() => {
//                 setImageIndex((prevIndex) => (prevIndex + 1) % images.length);
//             }, 500);
//         } else {
//             setImageIndex(0); // Réinitialise à l'image par défaut si nécessaire
//         }

//         return () => clearInterval(intervalId);
//     }, [isSpeaking]);

//     return (
//         <div
//             style={{
//                 display: 'flex',
//                 justifyContent: 'center',
//                 alignItems: 'center',
//                 height: '140px',
//                 marginTop: '10px',
//             }}
//         >
//             {isSpeaking ? (
//                 <Image
//                     src={images[imageIndex]}
//                     alt="Image changeante"
//                     width={180}
//                     height={140}
//                     style={{ objectFit: 'contain', marginBottom: '10px' }}
//                     onError={() => setImageIndex((prevIndex) => (prevIndex + 1) % images.length)}
//                 />
//             ) : (
//                 <Image
//                     src={defaultImage}
//                     alt="Image fixe"
//                     width={180}
//                     height={140}
//                     style={{ objectFit: 'contain', marginBottom: '10px' }}
//                 />
//             )}
//         </div>
//     );
// }

import { useEffect, useState } from 'react';
import Image from 'next/image';

export default function ImageUltron({ isSpeaking, currentLetter }) {
    const letterToImageMap = {
        A: '/ImageBlablaUltron2d/Ultron_A,E,I.png',
        B: '/ImageBlablaUltron2d/Ultron_B;M;P.png',
        M: '/ImageBlablaUltron2d/Ultron_B;M;P.png',
        P: '/ImageBlablaUltron2d/Ultron_B;M;P.png',
        F: '/ImageBlablaUltron2d/Ultron_f,v.png',
        V: '/ImageBlablaUltron2d/Ultron_f,v.png',
        L: '/ImageBlablaUltron2d/Ultron_L.png',
        R: '/ImageBlablaUltron2d/Ultron_r.png',
        W: '/ImageBlablaUltron2d/w,q.png',
        Q: '/ImageBlablaUltron2d/w,q.png',
        J: '/ImageBlablaUltron2d/Ultron_ch,j,sh.png',
        E: '/ImageBlablaUltron2d/Ultron_A,E,I.png',
        I: '/ImageBlablaUltron2d/Ultron_A,E,I.png',
        O: '/ImageBlablaUltron2d/Ultron_O.png',
        U: '/ImageBlablaUltron2d/Ultron_U.png',
    };

    const randomImages = [
        '/ImageBlablaUltron2d/ultron_consonne.png',
        '/ImageBlablaUltron2d/Ultron_neutre.png',
        '/ImageBlablaUltron2d/Ultron_vide.png',
    ];

    const defaultImage = '/ImageBlablaUltron2d/Ultron_defaut.png'; // Image par défaut
    const [currentImage, setCurrentImage] = useState(defaultImage);

    useEffect(() => {
        console.log('currentLetter:', currentLetter); // Affiche la lettre courante
        const letter = currentLetter ? currentLetter.toUpperCase() : '';
        if (!isSpeaking) {
            // Si le bot ne parle pas, on revient à l'image par défaut
            setCurrentImage(defaultImage);
            console.log("defaut");
        } else if (letter && letterToImageMap[letter]) {
            // Si le bot parle et une lettre mappée est détectée
            setCurrentImage(letterToImageMap[letter]);
            console.log("voyelle");
        } else {
            // Si le bot parle et une lettre non mappée est détectée
            const randomIndex = Math.floor(Math.random() * randomImages.length);
            setCurrentImage(randomImages[randomIndex]);
            console.log("consonne");
        }
    }, [isSpeaking, currentLetter]);
    

    return (
        <div
            style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '140px',
                marginTop: '10px',
                // borderRadius : '10%'
            }}
        >
            <Image
                src={currentImage}
                alt="Image synchronisée"
                width={180}
                height={140}
                style={{ objectFit: 'contain', marginBottom: '10px' , borderRadius : '30%'}}
            />
        </div>
    );
}
