import React, { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogTrigger,
    DialogClose
} from '@/components/ui/dialog';

const CenteredDialog = () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div>
           
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogTrigger onClick={() => setIsOpen(true)}>
                    打开对话框
                </DialogTrigger>
                {/* 使用 Tailwind CSS 类使对话框居中 */}
                <DialogContent className="absolute m-auto max-w-md top-1/2 -translate-y-1/2">
                    <DialogHeader>
                        <DialogTitle>居中对话框</DialogTitle>
                        <DialogDescription>
                            这是一个居中显示的对话框。
                        </DialogDescription>
                    </DialogHeader>
                    <DialogClose />
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default CenteredDialog;    