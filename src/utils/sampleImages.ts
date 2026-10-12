export interface SampleImageData {
  title: string;
  filename: string;
  path: string;
  width: number;
  height: number;
  sizeBytes: number;
}

export const SAMPLE_IMAGES: SampleImageData[] = [
  {
    title: 'Modern Architecture',
    filename: 'architecture_pavilion.jpg',
    path: '/src/assets/images/sample_architecture_1791810611399.jpg',
    width: 1024,
    height: 768,
    sizeBytes: 840_000,
  },
  {
    title: 'Autumn Wildlife',
    filename: 'autumn_wildlife_fox.jpg',
    path: '/src/assets/images/sample_wildlife_1791810623975.jpg',
    width: 1024,
    height: 768,
    sizeBytes: 920_000,
  },
  {
    title: 'Artisan Workshop',
    filename: 'artisan_craftsman.jpg',
    path: '/src/assets/images/sample_portrait_1791810635602.jpg',
    width: 1024,
    height: 768,
    sizeBytes: 980_000,
  },
];
