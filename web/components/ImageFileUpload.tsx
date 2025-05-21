import { stringify } from 'querystring';
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { Copy, Trash2 } from "lucide-react";
import { Button } from './ui/button';

export default function ImageFileUpload(props:{fileUrl:string, setFileUrl: (url :string)=>void}) {
  const [inputType, setInputType] = useState('file');
  const [file, setFile] = useState(null);
  const [imageUrl, setImageUrl] = useState('');
  ///const [preview, setPreview] = useState('');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  ///const [fileUrl ,setLogUrl] = useState('');
  const [isOpen,setIsOpen] = useState(false)
  const [imageDataUrl, setImageDataUrl] = useState('');

  const handlePreviewUrl = async (url:string) => {
    try {
        const response = await fetch(url);
        const blob = await response.blob();
        const reader = new FileReader();
        reader.onloadend = () => {
            setImageDataUrl(reader.result as string);
        };
        reader.readAsDataURL(blob);
    } catch (error) {
        console.error('Error fetching image:', error);
    }
};




  const handleInputTypeChange = (type:'file'|'url') => {
    setInputType(type);
    setFile(null);
    setImageUrl('');
    //setPreview('');
  };

  const handleFileChange = (event:any) => {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      //setPreview(URL.createObjectURL(selectedFile));
    }
  };

  const handleUrlChange = (event:any) => {
    const url = event.target.value;
    
    setImageUrl(url);
    handlePreviewUrl(url);
    //setPreview(url);
  };

  async function getBuffer(imageUrl:string) {
    console.log("get buffer");
    const response = await fetch(imageUrl);
    const arrayBuffer = await response.arrayBuffer();
    // 将 ArrayBuffer 转换为 Uint8Array
    const uint8Array = new Uint8Array(arrayBuffer);
    return uint8Array;
  }

  async function uploadFile(type:'file'|'buffer',file :File|string) :Promise<string | null>{
    try {
        setUploading(true);
        const formData = new FormData();
        formData.append('file', file);
        const uploadUrl = '/api/uploadFile';
        console.log("uploadFile:",uploadUrl);
        const response = await fetch(uploadUrl, {
          method: 'POST',
          body: formData,
        });
  
        if (!response.ok) {
          console.log("upload failed ,!response.ok" ,response.ok,response.text());
          throw new Error('upload failed,!response.ok');
        }
  
        const result = await response.json();
        console.log('upload success, result =', result);
        return result.url;
      } catch (err) {
        console.log("catch error : ",err);
        setError(err instanceof Error ? err.message : 'upload failed,catch err');
      } finally {
        setUploading(false);
      }
      return null;
  }



  const handleSubmit = async () => {
    let arg : File | string;
    let url = '';
    if (inputType === 'file' && file) {
      console.log('upload file name:', file);
      arg = file;
      url = (await uploadFile('file',arg) ) || '';
      
    } else if (inputType === 'url' && imageUrl) {
      console.log('handle image url:', imageUrl);
      arg = imageUrl;
      let buffer = await getBuffer(imageUrl)
      url = (await uploadFile('buffer',arg) ) || '';
    } else {
      alert('sect a local Image or input a image url');
      return;
    }

    props.setFileUrl(url);
    if(url){
      setFile(null);
      setImageUrl('');
      setIsOpen(false)
    }

  };

  function saveUrl(){
    props.setFileUrl(imageUrl)
    setFile(null);
    setImageUrl('');
    setIsOpen(false)

  }

  return (
    <div >
    <input type="text" disabled={false} placeholder='input image url' value={props.fileUrl} onChange={(e)=>props.setFileUrl(e.target.value)}  
    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
     /> 
    { error && <p>{error}</p>}
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
    <DialogTrigger onClick={() => setIsOpen(true)}>
    <div><p className="bg-primary/80 text-primary-foreground hover:bg-primary/60 border border-input px-4 py-2 rounded-2xl max-w-800 ">
    Upload Image
    </p></div>
    </DialogTrigger>
      <DialogContent >
        <DialogHeader>
          <DialogTitle >Upload Image</DialogTitle>
          <DialogDescription>
          Select the local image to upload, or enter the image URL
          </DialogDescription>
        </DialogHeader>
        <div className="mb-6">
        <label className="mr-4">
          <input
            type="radio"
            value="file"
            checked={inputType === 'file'}
            onChange={() => handleInputTypeChange('file')}
            className="mr-2"
          />
          Select Local Image
        </label>
        <label>
          <input
            type="radio"
            value="url"
            checked={inputType === 'url'}
            onChange={() => handleInputTypeChange('url')}
            className="mr-2"
          />
          Input Image Url
        </label>
      </div>

      {inputType === 'file' && (
        <div className="mb-6">
          <input type="file" accept="image/*" onChange={handleFileChange} className="overflow-auto" />
        </div>
      )}

      {inputType === 'url' && (
        <div className="mb-6">
          <input
            type="text"
            placeholder={'Please enter the image URL'}
            value = {imageUrl}
            onChange={handleUrlChange}
            className="w-full p-2 border rounded"
          />
        </div>
      )}

      {imageDataUrl && (
        <div className="mb-6">
          <img src={imageDataUrl} alt="Preview" className="w-full rounded-lg wx-400 wh-400 overflow-auto" />
        </div>
      )}
      <div className='gird grid-cols-2 gap-4'>
      <Button
        onClick={handleSubmit}
        className='mx-4'
      >
         {uploading ? 'Uploading...' : 'Upload'}
      </Button>
      <Button onClick={saveUrl} disabled={inputType != 'url' || !imageUrl }
      className='mx-4'
      >Save Url</Button>
      </div>
        <DialogClose />
      </DialogContent>
    </Dialog>


      
    </div>
  );
}