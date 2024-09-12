'use client';

import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { MdDelete } from "react-icons/md";
import { MdFavorite } from "react-icons/md";
import { FaCamera } from "react-icons/fa";
import { IoCloudUploadSharp } from "react-icons/io5";


interface Photo {
  id: string;
  name: string;
}

const Photos = () => {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [capturing, setCapturing] = useState<boolean>(false);
  const [photo, setPhoto] = useState<string | null>(null); // Captured photo
  const [capturedFile, setCapturedFile] = useState<File | null>(null); // File for the captured image
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [startCapturing, setStartCapturing] = useState(false)
  const router = useRouter();

  const fetchUser = async () => {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (!error && user) {
      setUserName(user.user_metadata.name);
    }
  };

  const fetchPhotos = async () => {
    const { data, error } = await supabase.storage.from('photos').list();
    if (!error && data) {
      // Filter out the '.emptyFolderPlaceholder' file
      const validPhotos = data.filter((photo: any) => photo.name !== '.emptyFolderPlaceholder');
      setPhotos(validPhotos as Photo[]);
    }
  };

  const uploadPhoto = async (fileToUpload: File) => {
    // Generate a unique filename using timestamp and file extension
    const uniqueFileName = `${Date.now()}.${fileToUpload.name.split('.').pop()}`;
    const { error } = await supabase.storage.from('photos').upload(uniqueFileName, fileToUpload);

    if (error) {
      console.error('Error uploading file:', error.message);
    } else {
      console.log('File uploaded successfully');
      fetchPhotos();
      setCapturedFile(null);
    }
  };

  const handleCapture = async () => {
    if (!videoRef.current) return;

    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext('2d');
    setStartCapturing(false)

    if (ctx) {
      // Capture the image from the video stream and convert it to a data URL
      ctx.drawImage(videoRef.current, 0, 0);
      const dataUrl = canvas.toDataURL('image/png');
      setPhoto(dataUrl); // Set the captured photo for display

      // Convert the data URL to a File object
      const fileToUpload = dataURLToFile(dataUrl, 'captured-photo.png');
      setCapturedFile(fileToUpload); // Save the file for possible future use

      setCapturing(false); // Stop capturing mode

      // Upload the captured photo to Supabase
      await uploadPhoto(fileToUpload);

      // Ensure the videoRef is still valid before trying to stop the stream
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        

        if (stream) {
          const tracks = stream.getTracks();

          // Stop each track of the stream
          tracks.forEach(track => track.stop());
        }

        // Clear the video element's srcObject
        videoRef.current.srcObject = null;
      }
    }
  };



  const startCapture = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setCapturing(true); // Start capturing
      setStartCapturing(true);
    } catch (error) {
      console.error('Error accessing camera:', error);
      setCapturing(false);
    }
  };


  const dataURLToFile = (dataUrl: string, filename: string): File => {
    const arr = dataUrl.split(',');
    const mime = arr[0].match(/:(.*?);/)?.[1] || '';
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
  };

  useEffect(() => {
    fetchUser();
    fetchPhotos();
  }, []);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      await uploadPhoto(selectedFile); // Automatically upload the file
    }
  };

  const handleFileInputClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click(); // Trigger file input click
    }
  };

  // Function to delete a photo
const deletePhoto = async (photoName: string) => {
  // const { data: { user } } = await supabase.auth.getUser();
  // if (!user) return; // Ensure user is logged in

  // const userId = user.id;

  const { error } = await supabase.storage
    .from('photos')
    .remove([`${photoName}`]);

  if (error) {
    console.error('Error deleting photo:', error.message);
  } else {
    console.log('Photo deleted successfully');
    fetchPhotos(); // Refresh the list of photos
  }
};

  return (
    <div>
      {userName && <h1>Welcome, {userName}!</h1>}
      <input type="file"
        ref={fileInputRef}
        style={{ display: 'none' }}
        onChange={handleFileChange} // Automatically upload when file is chosen
      />
      <div className='flex gap-5 justify-center p-5'>
        <button onClick={handleFileInputClick} disabled={capturing} className='bg-orange-500 p-2 text-white flex items-center rounded'>
          Upload
          <IoCloudUploadSharp className='ml-2' />
        </button>
        <div>
          <button onClick={startCapture} className='bg-orange-500 p-2 text-white flex items-center rounded'>Take picture <FaCamera className='ml-2' /></button>
        </div>
      </div>
      <div className='relative flex justify-center'>
        {capturing && <video ref={videoRef} style={{ width: '20%', height: 'auto' }}/>}
        {startCapturing && <button onClick={handleCapture}><FaCamera className='text-orange-500 absolute bottom-3 right-[49%] size-10' /></button>}
      </div>

      <div className="grid grid-cols-auto-fill min-w-[200px] max-w-[1146px] md:px-[32px] p-[24px] m-auto gap-[30px]">
        {photos.map((photo) => {
          const { data } = supabase.storage.from('photos').getPublicUrl(photo.name);
          const publicUrl = data?.publicUrl;
          return (
            <div className='shadow-lg p-[2px] rounded'>
              <Image
                key={photo.name} // use unique name or id
                src={publicUrl || '/placeholder.png'} // use publicUrl
                alt={photo.name}
                width={400}
                height={100}
                className='h-[250px] object-cover rounded'
              />
              <div className='flex justify-end py-2 pr-2'>
                <button onClick={() => deletePhoto(photo.name)}><MdDelete className='text-orange-500 size-5' /></button>
                <button><MdFavorite className='text-orange-500 size-5' /></button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Photos;
