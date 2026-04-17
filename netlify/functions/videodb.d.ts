// External module type declarations for Netlify functions
// These provide minimal typing for modules without official TypeScript definitions

declare module 'videodb' {
  interface VideoDBSDK {
    connect(config: { apiKey: string; baseURL?: string }): VideoDBConnection;
    get_collection(id: string): Promise<Collection>;
    create_collection(id: string, name: string): Promise<Collection>;
  }

  interface VideoDBConnection {
    get_collection(id: string): Promise<Collection>;
    create_collection(id: string, name: string): Promise<Collection>;
  }

  interface Collection {
    generate_voice(config: { text: string; voice_name?: string }): Promise<Asset>;
    generate_image(config: { prompt: string }): Promise<Asset>;
    create_timeline(): Timeline;
  }

  interface Asset {
    id: string;
    url: string;
  }

  interface Timeline {
    add_inline(asset: Asset): void;
    add_overlay(start: number, asset: Asset): void;
    generate_stream(): Promise<{ url: string }>;
  }

  const videodb: VideoDBSDK;
  export = videodb;
}

declare module 'node-fetch' {
  export default function fetch(url: string, options?: RequestInit): Promise<Response>;
}
