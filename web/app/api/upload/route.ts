// app/api/upload/route.ts
'use server'
import axios from 'axios';
import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { stringify } from 'querystring';

export interface UploadedBlobInfo {
    blobId: string;
    endEpoch: number;
    suiRef: string;
    status: string;
}

export interface UploadBlobConfig {
    initialEpochs?: string;
    initialPublisherUrl?: string;
    initialAggregatorUrl?: string;
    proxyUrl?: string;
}

const DEFAULT_CONFIG: Required<UploadBlobConfig> = {
    initialEpochs: process.env.NEXT_PUBLIC_INITIAL_EPOCHS || '1',
    initialPublisherUrl: process.env.NEXT_PUBLIC_PUBLISHER_URL || 'https://publisher.walrus-testnet.walrus.space',
    initialAggregatorUrl: process.env.NEXT_PUBLIC_AGGREGATOR_URL || 'https://aggregator.walrus-testnet.walrus.space',
    proxyUrl: process.env.NEXT_PUBLIC_PROXY_URL || ''
};


async function downloadImage(imageUrl: string): Promise<Buffer> {
  console.log("downloadImage:",imageUrl);
  const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
  return Buffer.from(response.data, 'binary');
}

async function storeBlob(fileOrUrl: File | string)  {
    try {
        let body: File | Buffer;
        if (typeof fileOrUrl === 'string') {
            // const response = await fetch(finalConfig.proxyUrl, {
            //     method: 'POST',
            //     headers: { 'Content-Type': 'application/json' },
            //     body: JSON.stringify({ url: fileOrUrl }),
            // });
            // if (!response.ok) {
            //     throw new Error(`HTTP error! status: ${response.status}`);
            // }
            // body = await response.blob();
            console.log("download url:",fileOrUrl);
            body = await downloadImage(fileOrUrl);
        } else {
            body = fileOrUrl;
        }

        const publisherUrl = DEFAULT_CONFIG.initialPublisherUrl;
        const epochs = DEFAULT_CONFIG.initialEpochs;
        const uploadUrl = `${publisherUrl}/v1/blobs?epochs=${epochs}`;
        console.log("upload url:",uploadUrl);
        const response = await fetch(uploadUrl, {
            method: 'PUT',
            body: body,
        });

        if (!response.ok) {
            console.log("storeBlob: fail to call upload url:",uploadUrl);
            throw new Error('Something went wrong when storing the blob!');
        }

        const info = await response.json();
        console.log("upload info : ",info);
        let blobInfo: UploadedBlobInfo;

        if ('alreadyCertified' in info) {
            blobInfo = {
                status: 'Already certified',
                blobId: info.alreadyCertified.blobId,
                endEpoch: info.alreadyCertified.endEpoch,
                suiRef: info.alreadyCertified.event.txDigest,
            };
        } else if ('newlyCreated' in info) {
            blobInfo = {
                status: 'Newly created',
                blobId: info.newlyCreated.blobObject.blobId,
                endEpoch: info.newlyCreated.blobObject.storage.endEpoch,
                suiRef: info.newlyCreated.blobObject.id,
            };
        } else {
            throw new Error('Unexpected response format');
        }

        return blobInfo;
    } catch (error) {
        console.error('Error in storeBlob:', error);
        throw error;
    } finally {
    }
    return null;
};
function getBlobUrl(blobInfo:UploadedBlobInfo) : string{
    const aggregatorUrl : string = DEFAULT_CONFIG.initialAggregatorUrl!;
    // 1. 上传到 Walrus
    const url = `${aggregatorUrl}/v1/blobs/${blobInfo.blobId}`
    console.log("getBlobUrl=",url);
    return url;
 }


 export async function POST(request: Request) {
  console.log("upload/route.ts :post");
  try {
    const formData = await request.formData();
    const fileOrUrl = formData.get('file');

    if (!fileOrUrl) {
      return NextResponse.json({ message: 'Invalid arg' }, { status: 400 });
    }
    let blobInfo = await storeBlob(fileOrUrl);

    if (!blobInfo) {
      return NextResponse.json({ message: 'storeBlob fail' }, { status: 400 });
    }

    let fileUrl = getBlobUrl(blobInfo);
    return NextResponse.json({ url: fileUrl }, { status: 200 });
  } catch (error) {
    console.error('upload.ts POST fail:', error);
    return NextResponse.json({ message: `upload failed catched error:{error}`  }, { status: 500 });
  }
}

