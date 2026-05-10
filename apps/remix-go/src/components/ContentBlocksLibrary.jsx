import React, { useState, useMemo, useCallback } from 'react';
import { observer } from 'mobx-react-lite';
import clsx from 'clsx';
import {
  LayoutGrid, Type, Image, Star, Users, DollarSign, Mail, Layout,
  Heading, AlignLeft, Quote, Video, Images, ListChecks, Lightbulb,
  TrendingUp, MessageSquare, Building, Table, CreditCard, Newspaper,
  ArrowUpDown, Minus, Columns, Search, GripVertical, Play
} from 'lucide-react';

const iconMap = {
  'fa-th': LayoutGrid,
  'fa-font': Type,
  'fa-image': Image,
  'fa-star': Star,
  'fa-users': Users,
  'fa-dollar-sign': DollarSign,
  'fa-envelope': Mail,
  'fa-th-large': Layout,
  'fa-heading': Heading,
  'fa-paragraph': AlignLeft,
  'fa-quote-left': Quote,
  'fa-video': Video,
  'fa-images': Images,
  'fa-list-check': ListChecks,
  'fa-lightbulb': Lightbulb,
  'fa-chart-line': TrendingUp,
  'fa-comments': MessageSquare,
  'fa-building': Building,
  'fa-table': Table,
  'fa-credit-card': CreditCard,
  'fa-newspaper': Newspaper,
  'fa-arrows-alt-v': ArrowUpDown,
  'fa-minus': Minus,
  'fa-columns': Columns,
  'fa-search': Search,
  'fa-grip-vertical': GripVertical,
  'fa-play': Play
};

const categories = [
  { id: 'all', name: 'All Blocks', icon: 'fa-th' },
  { id: 'text', name: 'Text', icon: 'fa-font' },
  { id: 'media', name: 'Media', icon: 'fa-image' },
  { id: 'features', name: 'Features', icon: 'fa-star' },
  { id: 'social', name: 'Social Proof', icon: 'fa-users' },
  { id: 'pricing', name: 'Pricing', icon: 'fa-dollar-sign' },
  { id: 'forms', name: 'Forms', icon: 'fa-envelope' },
  { id: 'layout', name: 'Layout', icon: 'fa-th-large' }
];

const contentBlocks = [
  {
    id: 'heading-block',
    name: 'Heading Block',
    category: 'text',
    icon: 'fa-heading',
    description: 'Large heading with optional subheading',
    tags: ['heading', 'title', 'text'],
    component: 'HeadingBlock',
    defaultProps: {
      level: 'h1',
      text: 'Your Amazing Headline',
      subheading: 'Add a compelling subheading here',
      alignment: 'center'
    }
  },
  {
    id: 'paragraph-block',
    name: 'Paragraph Block',
    category: 'text',
    icon: 'fa-paragraph',
    description: 'Rich text paragraph with formatting options',
    tags: ['paragraph', 'text', 'content'],
    component: 'ParagraphBlock',
    defaultProps: {
      text: 'This is a sample paragraph. You can add your own content here and format it with bold, italic, and other styling options.',
      alignment: 'left'
    }
  },
  {
    id: 'quote-block',
    name: 'Quote Block',
    category: 'text',
    icon: 'fa-quote-left',
    description: 'Pull quote or testimonial quote',
    tags: ['quote', 'testimonial', 'text'],
    component: 'QuoteBlock',
    defaultProps: {
      quote: '"This is an amazing product that changed my life."',
      author: 'John Doe',
      position: 'CEO, Company Inc.',
      alignment: 'center'
    }
  },
  {
    id: 'image-block',
    name: 'Image Block',
    category: 'media',
    icon: 'fa-image',
    description: 'Single image with caption and styling options',
    tags: ['image', 'photo', 'media'],
    component: 'ImageBlock',
    defaultProps: {
      src: '/placeholder-image.jpg',
      alt: 'Descriptive alt text',
      caption: 'Image caption (optional)',
      size: 'medium',
      rounded: false
    }
  },
  {
    id: 'video-block',
    name: 'Video Block',
    category: 'media',
    icon: 'fa-video',
    description: 'Embedded video with controls',
    tags: ['video', 'media', 'embed'],
    component: 'VideoBlock',
    defaultProps: {
      src: 'https://example.com/video.mp4',
      poster: '/video-poster.jpg',
      autoplay: false,
      controls: true,
      loop: false
    }
  },
  {
    id: 'gallery-block',
    name: 'Image Gallery',
    category: 'media',
    icon: 'fa-images',
    description: 'Grid of multiple images',
    tags: ['gallery', 'images', 'grid'],
    component: 'GalleryBlock',
    defaultProps: {
      images: [
        { src: '/image1.jpg', alt: 'Image 1' },
        { src: '/image2.jpg', alt: 'Image 2' },
        { src: '/image3.jpg', alt: 'Image 3' }
      ],
      columns: 3,
      lightbox: true
    }
  },
  {
    id: 'feature-list',
    name: 'Feature List',
    category: 'features',
    icon: 'fa-list-check',
    description: 'List of features with icons',
    tags: ['features', 'list', 'icons'],
    component: 'FeatureListBlock',
    defaultProps: {
      features: [
        { icon: 'fa-check', title: 'Feature One', description: 'Description of feature one' },
        { icon: 'fa-star', title: 'Feature Two', description: 'Description of feature two' },
        { icon: 'fa-heart', title: 'Feature Three', description: 'Description of feature three' }
      ],
      layout: 'grid',
      columns: 3
    }
  },
  {
    id: 'icon-feature',
    name: 'Icon Feature',
    category: 'features',
    icon: 'fa-lightbulb',
    description: 'Single feature with large icon',
    tags: ['feature', 'icon', 'highlight'],
    component: 'IconFeatureBlock',
    defaultProps: {
      icon: 'fa-rocket',
      title: 'Amazing Feature',
      description: 'This feature will blow your mind with its capabilities.',
      buttonText: 'Learn More',
      buttonUrl: '#'
    }
  },
  {
    id: 'stats-counter',
    name: 'Stats Counter',
    category: 'features',
    icon: 'fa-chart-line',
    description: 'Animated counters for statistics',
    tags: ['stats', 'numbers', 'counter'],
    component: 'StatsCounterBlock',
    defaultProps: {
      stats: [
        { number: 1000, suffix: '+', label: 'Happy Customers' },
        { number: 500, suffix: 'K', label: 'Downloads' },
        { number: 99, suffix: '%', label: 'Satisfaction' }
      ],
      animated: true
    }
  },
  {
    id: 'testimonial-slider',
    name: 'Testimonial Slider',
    category: 'social',
    icon: 'fa-comments',
    description: 'Rotating testimonials carousel',
    tags: ['testimonial', 'reviews', 'social'],
    component: 'TestimonialSliderBlock',
    defaultProps: {
      testimonials: [
        {
          quote: '"Amazing product that exceeded expectations!"',
          author: 'Sarah Johnson',
          position: 'Marketing Director',
          avatar: '/avatar1.jpg'
        },
        {
          quote: '"Best investment we\'ve made this year."',
          author: 'Mike Chen',
          position: 'CEO',
          avatar: '/avatar2.jpg'
        }
      ],
      autoplay: true,
      showDots: true
    }
  },
  {
    id: 'logo-wall',
    name: 'Logo Wall',
    category: 'social',
    icon: 'fa-building',
    description: 'Grid of company logos',
    tags: ['logos', 'brands', 'trust'],
    component: 'LogoWallBlock',
    defaultProps: {
      logos: [
        { src: '/logo1.png', alt: 'Company 1' },
        { src: '/logo2.png', alt: 'Company 2' },
        { src: '/logo3.png', alt: 'Company 3' }
      ],
      grayscale: true,
      columns: 4
    }
  },
  {
    id: 'social-proof-numbers',
    name: 'Social Proof Numbers',
    category: 'social',
    icon: 'fa-users',
    description: 'Large numbers showing social proof',
    tags: ['numbers', 'social', 'trust'],
    component: 'SocialProofNumbersBlock',
    defaultProps: {
      items: [
        { number: '10M', label: 'Users Worldwide' },
        { number: '4.9', label: 'Average Rating', suffix: '/5' },
        { number: '24/7', label: 'Customer Support' }
      ],
      layout: 'horizontal'
    }
  },
  {
    id: 'pricing-table',
    name: 'Pricing Table',
    category: 'pricing',
    icon: 'fa-table',
    description: 'Multi-column pricing comparison',
    tags: ['pricing', 'plans', 'comparison'],
    component: 'PricingTableBlock',
    defaultProps: {
      plans: [
        {
          name: 'Basic',
          price: '$9',
          period: 'month',
          features: ['Feature 1', 'Feature 2', 'Feature 3'],
          buttonText: 'Get Started',
          popular: false
        },
        {
          name: 'Pro',
          price: '$29',
          period: 'month',
          features: ['Everything in Basic', 'Advanced Feature', 'Priority Support'],
          buttonText: 'Go Pro',
          popular: true
        }
      ],
      highlightPopular: true
    }
  },
  {
    id: 'pricing-card',
    name: 'Pricing Card',
    category: 'pricing',
    icon: 'fa-credit-card',
    description: 'Single pricing plan card',
    tags: ['pricing', 'plan', 'card'],
    component: 'PricingCardBlock',
    defaultProps: {
      name: 'Professional Plan',
      price: '$19',
      period: 'month',
      features: ['Feature 1', 'Feature 2', 'Feature 3', 'Feature 4'],
      buttonText: 'Choose Plan',
      buttonUrl: '#',
      popular: false
    }
  },
  {
    id: 'contact-form',
    name: 'Contact Form',
    category: 'forms',
    icon: 'fa-envelope',
    description: 'Contact form with multiple fields',
    tags: ['contact', 'form', 'lead'],
    component: 'ContactFormBlock',
    defaultProps: {
      fields: [
        { type: 'text', name: 'name', label: 'Full Name', required: true },
        { type: 'email', name: 'email', label: 'Email Address', required: true },
        { type: 'textarea', name: 'message', label: 'Message', required: true }
      ],
      submitText: 'Send Message',
      submitUrl: '#'
    }
  },
  {
    id: 'newsletter-signup',
    name: 'Newsletter Signup',
    category: 'forms',
    icon: 'fa-newspaper',
    description: 'Email newsletter subscription form',
    tags: ['newsletter', 'email', 'signup'],
    component: 'NewsletterSignupBlock',
    defaultProps: {
      title: 'Stay Updated',
      description: 'Get the latest news and updates delivered to your inbox.',
      placeholder: 'Enter your email address',
      buttonText: 'Subscribe',
      privacyText: 'We respect your privacy.'
    }
  },
  {
    id: 'spacer-block',
    name: 'Spacer',
    category: 'layout',
    icon: 'fa-arrows-alt-v',
    description: 'Empty space between blocks',
    tags: ['spacer', 'space', 'layout'],
    component: 'SpacerBlock',
    defaultProps: {
      height: '50px',
      backgroundColor: 'transparent'
    }
  },
  {
    id: 'divider-block',
    name: 'Divider',
    category: 'layout',
    icon: 'fa-minus',
    description: 'Visual separator line',
    tags: ['divider', 'separator', 'line'],
    component: 'DividerBlock',
    defaultProps: {
      style: 'solid',
      color: '#e9ecef',
      thickness: '1px',
      width: '100%'
    }
  },
  {
    id: 'columns-block',
    name: 'Columns Layout',
    category: 'layout',
    icon: 'fa-columns',
    description: 'Multi-column content layout',
    tags: ['columns', 'layout', 'grid'],
    component: 'ColumnsBlock',
    defaultProps: {
      columns: 2,
      gap: '20px',
      responsive: true
    }
  }
];

function ContentBlocksLibrary({ onBlockSelect, onDragStart, onDragEnd, className }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [draggedBlock, setDraggedBlock] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  const categoryCounts = useMemo(() => {
    const counts = {};
    categories.forEach(cat => {
      if (cat.id === 'all') {
        counts[cat.id] = contentBlocks.length;
      } else {
        counts[cat.id] = contentBlocks.filter(b => b.category === cat.id).length;
      }
    });
    return counts;
  }, []);

  const filteredBlocks = useMemo(() => {
    let filtered = contentBlocks;

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(block => block.category === selectedCategory);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(block =>
        block.name.toLowerCase().includes(query) ||
        block.description.toLowerCase().includes(query) ||
        block.tags.some(tag => tag.toLowerCase().includes(query)) ||
        block.category.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [selectedCategory, searchQuery]);

  const handleDragStart = useCallback((e, block) => {
    setDraggedBlock(block);
    setIsDragging(true);
    e.dataTransfer.setData('application/json', JSON.stringify(block));
    e.dataTransfer.effectAllowed = 'copy';

    if (onDragStart) {
      onDragStart(block);
    }
  }, [onDragStart]);

  const handleDragEnd = useCallback(() => {
    setIsDragging(false);
    setDraggedBlock(null);

    if (onDragEnd) {
      onDragEnd();
    }
  }, [onDragEnd]);

  const handleBlockClick = useCallback((block) => {
    if (onBlockSelect) {
      onBlockSelect(block);
    }
  }, [onBlockSelect]);

  const getIcon = (iconName) => {
    const IconComponent = iconMap[iconName];
    return IconComponent ? <IconComponent size={18} /> : null;
  };

  return (
    <div className={clsx('flex flex-col h-full bg-gray-50', className)}>
      <div className="p-5 bg-white border-b border-gray-200 flex justify-between items-center">
        <h2 className="text-2xl font-semibold text-gray-900 m-0">Content Blocks</h2>
        <div className="relative w-64">
          <input
            type="text"
            placeholder="Search blocks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
        </div>
      </div>

      <div className="flex px-5 bg-white border-b border-gray-200 overflow-x-auto gap-0">
        {categories.map(category => (
          <button
            key={category.id}
            className={clsx(
              'px-4 py-3 border-none bg-none text-gray-600 text-sm cursor-pointer flex items-center gap-2 border-b-2 border-transparent transition-all whitespace-nowrap shrink-0 hover:text-blue-500 hover:bg-gray-50',
              selectedCategory === category.id && 'text-blue-500 border-b-blue-500 bg-gray-50'
            )}
            onClick={() => setSelectedCategory(category.id)}
          >
            {getIcon(category.icon)}
            <span className="font-medium">{category.name}</span>
            <span className="text-xs opacity-70">({categoryCounts[category.id]})</span>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-4 p-5 flex-1 overflow-y-auto">
        {filteredBlocks.map(block => (
          <div
            key={block.id}
            className={clsx(
              'bg-white border-2 border-gray-200 rounded-lg p-4 cursor-grab flex flex-col relative transition-all duration-300 select-none hover:border-blue-500 hover:shadow-lg hover:-translate-y-0.5 active:cursor-grabbing',
              draggedBlock?.id === block.id && 'opacity-50 -rotate-2'
            )}
            draggable
            onDragStart={(e) => handleDragStart(e, block)}
            onDragEnd={handleDragEnd}
            onClick={() => handleBlockClick(block)}
          >
            <div className="w-10 h-10 bg-blue-500 text-white rounded-lg flex items-center justify-center text-lg mb-3">
              {getIcon(block.icon)}
            </div>

            <div className="flex-1">
              <h3 className="m-0 mb-2 text-base font-semibold text-gray-900">{block.name}</h3>
              <p className="m-0 mb-3 text-sm text-gray-600 leading-relaxed">{block.description}</p>
              <div className="flex gap-1.5 flex-wrap">
                {block.tags.slice(0, 2).map(tag => (
                  <span key={tag} className="bg-gray-200 text-gray-700 px-2 py-0.5 rounded-full text-xs">
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            <div className="absolute top-3 right-3">
              <button
                className="p-1 border-none bg-none text-gray-600 cursor-grab rounded hover:text-gray-700 hover:bg-gray-100"
                title="Drag to add to page"
              >
                <GripVertical size={16} />
              </button>
            </div>

            <div className="absolute inset-0 bg-blue-500/90 text-white flex items-center justify-center font-medium opacity-0 transition-opacity duration-200 pointer-events-none rounded-md hover:opacity-100">
              Drag to add
            </div>
          </div>
        ))}
      </div>

      {filteredBlocks.length === 0 && (
        <div className="flex flex-col items-center justify-center p-16 text-gray-600 text-center">
          <Search size={48} className="mb-4 opacity-50" />
          <h3 className="m-0 mb-2 text-lg">No blocks found</h3>
          <p className="m-0 text-sm">Try adjusting your search or category filter</p>
        </div>
      )}
    </div>
  );
}

export default observer(ContentBlocksLibrary);
