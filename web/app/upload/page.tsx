// app/upload/page.tsx
'use client'; // 标记为客户端组件

import { useState } from 'react';
import { useUploadBlob } from "@/lib/useUploadBlob"
export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [fileUrl,setFileUrl] = useState<string>("")
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 处理文件选择
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      ///setPreviewUrl(URL.createObjectURL(selectedFile));
    }
  };

  const  handleUrlChange = (event: React.ChangeEvent<HTMLInputElement>)=>{
     setFileUrl(event.target.value);
     console.log("file url:", fileUrl);
  }
  const { storeBlob ,aggregatorUrl} = useUploadBlob()

  const storeFile = async function (file:File | string) : Promise<string>{
    
     // 1. 上传到 Walrus
     const blobInfo = await storeBlob(file)
     const url = `${aggregatorUrl}/v1/blobs/${blobInfo.blobId}`
     console.log("store file ,url=",url);
     return url;
  }

  async function uploadFile(file :File|string) :Promise<string | null>{
    try {

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

  // 处理文件上传
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!file && !fileUrl) {
      setError('请选择一个文件或输入一个图片Url');
      return;
    }

    setUploading(true);
    setError(null);

    let url = await uploadFile(file ? file : fileUrl);
    if(url) setPreviewUrl(url)
    
    // console.log("call api upload");
    // let arg = file != null ? file : fileUrl;
    // let url = await storeFile(arg);
    // if(url) {
    //     setPreviewUrl(url)
    //     setUploading(false);
    // }
    
  };




  return (
    <div style={{ padding: '20px' }}>
      
      <h1>上传图片</h1>
      <form onSubmit={handleSubmit}>
        <div><input type="file" accept="image/*"  onChange={handleFileChange} />  Or
        <input type="text" name="url" value={fileUrl} onChange={handleUrlChange}  placeholder='请输入连接'  />      
        <button type="submit" disabled={uploading} style={{ marginTop: '20px' }}>
          {uploading ? '上传中...' : '上传'}
        </button></div>
        <button type="reset"  >重置</button>
        {previewUrl && (
          <div style={{ marginTop: '20px' }}>
            <img
              src={previewUrl}
              alt="预览"
              style={{ maxWidth: '100%', height: 'auto' }}
            />
          </div>
        )}

        {error && <p style={{ color: 'red' }}>{error}</p>}
      </form>
    </div>
  );
}