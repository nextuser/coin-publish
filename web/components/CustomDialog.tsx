import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { Copy, Trash2 } from "lucide-react";

const CustomDialog = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [textToCopy, setTextToCopy] = useState("这是要拷贝的文本");

  const handleCopy = () => {
    navigator.clipboard.writeText(textToCopy).then(() => {
      alert("已拷贝到剪贴板");
    }).catch((err) => {
      console.error("拷贝失败: ", err);
    });
  };

  const handleClear = () => {
    setTextToCopy("");
  };

  return (
    <div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger onClick={() => setIsOpen(true)}>
        打开对话框
      </DialogTrigger>
        <DialogContent className="relative">
          <DialogHeader>
            <DialogTitle>示例对话框</DialogTitle>
            <DialogDescription>
              这里是对话框的描述信息。
            </DialogDescription>
          </DialogHeader>
          <div className="p-4">
            <p>{textToCopy}</p>
          </div>
          <div className="absolute top-2 right-2 flex space-x-2">
            <button onClick={handleCopy} className="text-gray-500 hover:text-gray-700">
              <Copy size={20} />
            </button>
            <button onClick={handleClear} className="text-gray-500 hover:text-gray-700">
              <Trash2 size={20} />
            </button>
          </div>
          <DialogClose />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CustomDialog;    