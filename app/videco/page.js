import VidecoApp from '../../src/apps/videco';

export default function VidecoPage() {
  return <VidecoApp apiKey={process.env.NEXT_PUBLIC_MUAPI_KEY} />;
}