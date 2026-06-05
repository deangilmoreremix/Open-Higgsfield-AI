export const config = {
  runtime: 'nodejs',
};

import { NextResponse } from 'next/server';
import { vadooAPI } from '../../../lib/vadoo';
import formidable from 'formidable';
import fs from 'fs';

export async function POST(request) {
  try {
    const form = formidable({ multiples: false, maxFileSize: 100 * 1024 * 1024 });
    
    const { fields, files } = await new Promise((resolve, reject) => {
      form.parse(request, (err, fields, files) => {
        if (err) reject(err);
        else resolve({ fields, files });
      });
    });

    const prompt = Array.isArray(fields.prompt) ? fields.prompt[0] : fields.prompt;
    const effect = Array.isArray(fields.effect) ? fields.effect[0] : fields.effect;
    const aspectRatio = Array.isArray(fields.aspectRatio) ? fields.aspectRatio[0] : fields.aspectRatio;
    const duration = Array.isArray(fields.duration) ? fields.duration[0] : fields.duration;
    const style = Array.isArray(fields.style) ? fields.style[0] : fields.style;
    const motion = Array.isArray(fields.motion) ? fields.motion[0] : fields.motion;

    if (!effect || !aspectRatio || !duration) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    let imageBuffer = undefined;
    let imageName = undefined;
    let imageType = undefined;
    
    if (files.image) {
      const file = Array.isArray(files.image) ? files.image[0] : files.image;
      if (file && file.filepath) {
        imageBuffer = fs.readFileSync(file.filepath);
        imageName = file.originalFilename || 'image.jpg';
        imageType = file.mimetype || 'image/jpeg';
      }
    }

    const result = await vadooAPI.generateVideo({
      prompt: prompt || undefined,
      image: imageBuffer,
      imageName,
      imageType,
      effect,
      aspectRatio,
      duration: parseInt(duration),
      style: style || undefined,
      motion: motion || undefined,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error in generate-video API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}