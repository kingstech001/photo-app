'use client';

import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';

interface Photo {
  id: string;
  name: string;
}

const Photos = () => {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [capturing, setCapturing] = useState<boolean>(false);
  const [photo, setPhoto] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const router = useRouter();

  const fetchUser = async () => {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (!error && user) {
      setUserName(user.user_metadata.name);
    } else {
      router.push('/login');
    }
  };

  const fetchPhotos = async () => {
    const { data, error } = await supabase.storage.from('photos').list();
    if (!error && data) {
      setPhotos(data as Photo[]);
    }
  };

  const uploadPhoto = async (fileToUpload: File) => {
    const filePath = `photos/${fileToUpload.name}`; // Path in the bucket
    const { error } = await supabase.storage.from('photos').upload(filePath, fileToUpload);
  
    if (error) {
      console.error('Error uploading file:', error.message);
    } else {
      console.log('File uploaded successfully');
      fetchPhotos(); // Refresh the list of photos
    }
  };
  

  const handleCapture = async () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0);
      const dataUrl = canvas.toDataURL('image/png');
      setPhoto(dataUrl);
      const fileToUpload = dataURLToFile(dataUrl, 'captured-photo.png');
      uploadPhoto(fileToUpload);
      setCapturing(false);
    }
  };

  const startCapture = async () => {
    setCapturing(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      setCapturing(false);
    }
  };

  const dataURLToFile = (dataUrl: string, filename: string): File => {
    const arr = dataUrl.split(',');
    const mime = arr[0].match(/:(.*?);/)?.[1] || '';
    const bstr = atob(arr[1]);
    const n = bstr.length;
    const u8arr = new Uint8Array(n);
    for (let i = 0; i < n; i++) {
      u8arr[i] = bstr.charCodeAt(i);
    }
    return new File([u8arr], filename, { type: mime });
  };

  useEffect(() => {
    fetchUser();
    fetchPhotos();
  }, []);

  return (
    <div>
      {userName && <h1>Welcome, {userName}!</h1>}
      <input type="file" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
      <button onClick={() => file && uploadPhoto(file)} disabled={!file}>Upload</button>

      <div>
        <button onClick={startCapture}>Capture Photo</button>
        {capturing && <video ref={videoRef} style={{ width: '100%', height: 'auto' }} />}
        {photo && <img src={photo} alt="Captured" style={{ maxWidth: '100%', height: 'auto' }} />}
        {photo && <button onClick={handleCapture}>Upload Capture</button>}
      </div>

      <div>
        {photos.map((photo) => {
          const { data } = supabase.storage.from('photos').getPublicUrl(photo.name);
          const publicUrl = data?.publicUrl;

          return (
            <img
              key={photo.id}
              src={publicUrl || '/placeholder.png'}
              alt={photo.name}
              style={{ maxWidth: '100%', height: 'auto' }}
            />
          );
        })}
      </div>
    </div>
  );
};

export default Photos;
