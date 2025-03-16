import { stringify } from 'querystring';
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { Copy, Trash2 } from "lucide-react";

export default function ImageUpload(props:{fileUrl:string, setFileUrl: (url :string)=>void}) {
  const [inputType, setInputType] = useState('file');
  const [file, setFile] = useState(null);
  const [imageUrl, setImageUrl] = useState('');
  const [preview, setPreview] = useState('');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  ///const [fileUrl ,setLogUrl] = useState('');
  const [isOpen,setIsOpen] = useState(false)

  const handleInputTypeChange = (type:'file'|'url') => {
    setInputType(type);
    setFile(null);
    setImageUrl('');
    setPreview('');
  };

  const handleFileChange = (event:any) => {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
    }
  };

  const handleUrlChange = (event:any) => {
    const url = event.target.value;
    setImageUrl(url);
    setPreview(url);
  };

  async function uploadFile(file :File|string) :Promise<string | null>{
    try {
        setUploading(true);
        const formData = new FormData();
        formData.append('file', file);
        const uploadUrl = '/api/upload';
        console.log("uploadFile:",uploadUrl);
        const response = await fetch(uploadUrl, {
          method: 'POST',
          body: formData,
        });
  
        if (!response.ok) {
          throw new Error('上传失败');
        }
  
        const result = await response.json();
        console.log('上传成功: result', result);
        return result.url;
      } catch (err) {
        setError(err instanceof Error ? err.message : '上传失败');
      } finally {
        setUploading(false);
      }
      return null;
  }

  const handleSubmit = async () => {
    let arg : File | string;
    if (inputType === 'file' && file) {
      console.log('上传文件:', file);
      arg = file;
    } else if (inputType === 'url' && imageUrl) {
      console.log('输入 URL:', imageUrl);
      arg = imageUrl;
    } else {
      alert('请选择图片或输入 URL');
      return;
    }
    let url = (await uploadFile(arg) ) || '';
    props.setFileUrl(url);
    if(url){
      setFile(null);
      setImageUrl('');
      setIsOpen(false)
    }

  };

  return (
    <div >
    <input type="text" disabled={true} value={props.fileUrl}  className='w-full' /> 
    { error && <p>{error}</p>}
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
    <DialogTrigger onClick={() => setIsOpen(true)}>
    <p>上传图片</p>
    </DialogTrigger>
      <DialogContent className="absolute m-auto max-w-md top-1/2 -translate-y-1/2">
        <DialogHeader>
          <DialogTitle>上传图片</DialogTitle>
          <DialogDescription>
            选择本地图片上传,或输入图片URL
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
          选择本地图片
        </label>
        <label>
          <input
            type="radio"
            value="url"
            checked={inputType === 'url'}
            onChange={() => handleInputTypeChange('url')}
            className="mr-2"
          />
          输入图片 URL
        </label>
      </div>

      {inputType === 'file' && (
        <div className="mb-6">
          <input type="file" accept="image/*" onChange={handleFileChange} className="w-full" />
        </div>
      )}

      {inputType === 'url' && (
        <div className="mb-6">
          <input
            type="text"
            placeholder="请输入图片 URL"
            value={imageUrl}
            onChange={handleUrlChange}
            className="w-full p-2 border rounded"
          />
        </div>
      )}

      {preview && (
        <div className="mb-6">
          <img src={preview} alt="预览" className="w-full rounded-lg" />
        </div>
      )}

      <button
        onClick={handleSubmit}
        className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
      >
         {uploading ? '上传中...' : '上传'}
      </button>
        <DialogClose />
      </DialogContent>
    </Dialog>


      
    </div>
  );
}