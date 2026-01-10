import { useEffect, useState } from "react";

function useImages() {
    const [heroImage, setHeroImage] = useState('');
    const [imageLoading, setImageLoading] = useState(true);

    useEffect(() => {
        const fetchPexelsImage = async () => {
          try {
            const apiKey = import.meta.env.VITE_PEXELS_API_KEY;
            
            if (!apiKey) {
              console.error('API key topilmadi! .env faylni tekshiring');
              return;
            }
            
            const queries = [
              'money', 
              'cash', 
              'coins',
              'piggy bank',
              'banknotes',
              'savings'
            ];
            const randomQuery = queries[Math.floor(Math.random() * queries.length)];
            
            const response = await fetch(
              `https://api.pexels.com/v1/search?query=${randomQuery}&per_page=15&orientation=portrait`,
              {
                headers: {
                  Authorization: apiKey
                }
              }
            );
            
            // console.log('Response status:', response.status);
            
            if (!response.ok) {
              console.error('API Error:', response.status, response.statusText);
              return;
            }
            
            const data = await response.json();
            // console.log('Pexels query:', randomQuery, 'Results:', data.photos?.length);
            
            if (data.photos && data.photos.length > 0) {
              const randomIndex = Math.floor(Math.random() * data.photos.length);
              setHeroImage(data.photos[randomIndex].src.large2x);

            }
          } catch (error) {
            console.error('Failed to load image:', error);
          } finally {
            setImageLoading(false);
          }
        };
        
        fetchPexelsImage();
    }, []);
      
    return { heroImage, imageLoading };
}

export default useImages;
