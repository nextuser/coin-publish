import axios from 'axios';
import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
async function POST(request: Request) {
    console.log("upload/route.ts :post");
    try {
      const formData = await request.formData();
      const file = formData.get('file') as File;
  
      if (!file) {
        return NextResponse.json({ message: '未找到文件' }, { status: 400 });
      }
  
      // 将文件转换为 Buffer
      const buffer = Buffer.from(await file.arrayBuffer());
  
      // 保存文件到本地（示例路径：public/uploads）
      const uploadDir = path.join(process.cwd(), 'public', 'uploads');
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
  
      console.log("uploadDir:", uploadDir);
  
      const fileName = `image-${Date.now()}.${file.name.split('.').pop()}`; // 生成唯一文件名
      const filePath = path.join(uploadDir, fileName);
      fs.writeFileSync(filePath, buffer);
  
      // 返回文件 URL
      const fileUrl = `/uploads/${fileName}`;
      return NextResponse.json({ url: fileUrl }, { status: 200 });
    } catch (error) {
      console.error('上传失败:', error);
      return NextResponse.json({ message: '上传失败' }, { status: 500 });
    }
  }