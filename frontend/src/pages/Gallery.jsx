import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Filter, Camera, Music, Users, Settings, ChevronLeft, ChevronRight, Eye } from 'lucide-react';

const Gallery = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedImage, setSelectedImage] = useState(null);
  const [visibleImages, setVisibleImages] = useState(8);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const observerRef = useRef();

  // Gallery data with Unsplash images
  const galleryData = [
    // Studios Category
    { id: 1, category: 'studios', src: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&h=600&fit=crop', alt: 'Recording Studio A', title: 'Studio A - Main Recording' },
    { id: 2, category: 'studios', src: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=800&h=600&fit=crop', alt: 'Vocal Booth', title: 'Isolation Vocal Booth' },
    { id: 3, category: 'studios', src: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=600&fit=crop', alt: 'Control Room', title: 'Control Room Setup' },
    { id: 4, category: 'studios', src: 'https://images.unsplash.com/photo-1519892300165-cb5542fb47c7?w=800&h=600&fit=crop', alt: 'Studio B', title: 'Studio B - Tracking Room' },
    { id: 5, category: 'studios', src: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&h=600&fit=crop&sat=1.2', alt: 'Live Room', title: 'Live Recording Space' },
    { id: 6, category: 'studios', src: 'https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=800&h=600&fit=crop', alt: 'Studio Overview', title: 'Studio Complex Overview' },
    
    // Equipment Category
    { id: 7, category: 'equipment', src: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&h=600&fit=crop&hue=30', alt: 'Professional Microphone', title: 'Vintage Neumann U67' },
    { id: 8, category: 'equipment', src: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=600&fit=crop&hue=60', alt: 'Mixing Console', title: 'SSL 4000 Series Console' },
    { id: 9, category: 'equipment', src: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=800&h=600&fit=crop&hue=90', alt: 'Studio Monitors', title: 'Yamaha NS-10M Monitors' },
    { id: 10, category: 'equipment', src: 'https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=800&h=600&fit=crop&hue=120', alt: 'Guitar Collection', title: 'Studio Guitar Collection' },
    { id: 11, category: 'equipment', src: 'https://images.unsplash.com/photo-1519892300165-cb5542fb47c7?w=800&h=600&fit=crop&hue=150', alt: 'Keyboard Setup', title: 'Vintage Keyboard Array' },
    { id: 12, category: 'equipment', src: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&h=600&fit=crop&hue=180', alt: 'Drum Kit', title: 'Professional Drum Kit' },
    
    // Live Sessions Category
    { id: 13, category: 'live', src: 'https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=800&h=600&fit=crop&sat=1.5', alt: 'Band Recording', title: 'Live Band Session' },
    { id: 14, category: 'live', src: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=800&h=600&fit=crop&sat=1.5', alt: 'Vocalist Recording', title: 'Live Vocal Recording' },
    { id: 15, category: 'live', src: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=600&fit=crop&sat=1.5', alt: 'Group Session', title: 'Collaborative Session' },
    { id: 16, category: 'live', src: 'https://images.unsplash.com/photo-1519892300165-cb5542fb47c7?w=800&h=600&fit=crop&sat=1.5', alt: 'Performance', title: 'Live Performance Capture' },
    { id: 17, category: 'live', src: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&h=600&fit=crop&contrast=1.2', alt: 'Recording Session', title: 'Intensive Recording Session' },
    { id: 18, category: 'live', src: 'https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=800&h=600&fit=crop&contrast=1.2', alt: 'Band Practice', title: 'Band Rehearsal Session' },
    
    // Behind Scenes Category
    { id: 19, category: 'behind', src: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=800&h=600&fit=crop&brightness=0.8', alt: 'Engineer at Work', title: 'Sound Engineer in Action' },
    { id: 20, category: 'behind', src: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=600&fit=crop&brightness=0.8', alt: 'Setting Up', title: 'Session Setup Process' },
    { id: 21, category: 'behind', src: 'https://images.unsplash.com/photo-1519892300165-cb5542fb47c7?w=800&h=600&fit=crop&brightness=0.8', alt: 'Team Discussion', title: 'Creative Team Meeting' },
    { id: 22, category: 'behind', src: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&h=600&fit=crop&brightness=0.8', alt: 'Break Time', title: 'Behind the Scenes Break' },
    { id: 23, category: 'behind', src: 'https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=800&h=600&fit=crop&brightness=0.8', alt: 'Late Night Session', title: 'Late Night Recording' },
    { id: 24, category: 'behind', src: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=800&h=600&fit=crop&brightness=0.9', alt: 'Studio Life', title: 'Daily Studio Life' }
  ];

  const categories = [
    { id: 'all', name: 'All Photos', icon: Camera, count: galleryData.length },
    { id: 'studios', name: 'Studios', icon: Music, count: galleryData.filter(img => img.category === 'studios').length },
    { id: 'equipment', name: 'Equipment', icon: Settings, count: galleryData.filter(img => img.category === 'equipment').length },
    { id: 'live', name: 'Live Sessions', icon: Users, count: galleryData.filter(img => img.category === 'live').length },
    { id: 'behind', name: 'Behind Scenes', icon: Filter, count: galleryData.filter(img => img.category === 'behind').length }
  ];

  const filteredImages = selectedCategory === 'all' 
    ? galleryData 
    : galleryData.filter(img => img.category === selectedCategory);

  const displayedImages = filteredImages.slice(0, visibleImages);

  const openLightbox = (image, index) => {
    setSelectedImage(image);
    setCurrentImageIndex(index);
  };

  const closeLightbox = () => {
    setSelectedImage(null);
  };

  const navigateImage = (direction) => {
    const newIndex = direction === 'next' 
      ? (currentImageIndex + 1) % filteredImages.length
      : currentImageIndex === 0 ? filteredImages.length - 1 : currentImageIndex - 1;
    
    setCurrentImageIndex(newIndex);
    setSelectedImage(filteredImages[newIndex]);
  };

  const loadMore = () => {
    setVisibleImages(prev => Math.min(prev + 8, filteredImages.length));
  };

  // Lazy loading setup
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const img = entry.target;
            if (img.dataset.src) {
              img.src = img.dataset.src;
              img.classList.remove('opacity-0');
              img.classList.add('opacity-100');
              observer.unobserve(img);
            }
          }
        });
      },
      { threshold: 0.1 }
    );

    observerRef.current = observer;
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    setVisibleImages(8);
  }, [selectedCategory]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!selectedImage) return;
      
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') navigateImage('prev');
      if (e.key === 'ArrowRight') navigateImage('next');
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [selectedImage, currentImageIndex]);

  const LazyImage = ({ src, alt, title, className, onClick }) => {
    const imgRef = useRef();

    useEffect(() => {
      if (imgRef.current && observerRef.current) {
        observerRef.current.observe(imgRef.current);
      }
    }, []);

    return (
      <img
        ref={imgRef}
        data-src={src}
        alt={alt}
        title={title}
        className={`opacity-0 transition-opacity duration-500 ${className}`}
        onClick={onClick}
        loading="lazy"
      />
    );
  };

  return (
    <div className="min-h-screen bg-light-bg dark:bg-dark-bg pt-20">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-black/50"></div>
        <div 
          className="relative h-96 bg-cover bg-center bg-fixed"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=1920&h=800&fit=crop')`
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-transparent"></div>
          <div className="relative z-10 flex items-center justify-center h-full text-center text-white">
            <div className="max-w-4xl mx-auto px-6">
              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-white to-purple-300 bg-clip-text text-transparent"
              >
                Studio Gallery
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-xl md:text-2xl text-gray-200 max-w-2xl mx-auto leading-relaxed"
              >
                Explore our world-class recording facilities, cutting-edge equipment, and creative sessions
              </motion.p>
            </div>
          </div>
        </div>
      </div>

      {/* Gallery Content */}
      <div className="max-w-7xl mx-auto px-6 py-16">
        {/* Category Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-12"
        >
          <div className="flex flex-wrap gap-4 justify-center">
            {categories.map((category) => {
              const IconComponent = category.icon;
              return (
                <motion.button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`
                    group flex items-center gap-3 px-6 py-4 rounded-2xl font-medium transition-all duration-300
                    glass border border-light-border dark:border-dark-border hover:border-light-primary dark:hover:border-dark-primary
                    ${selectedCategory === category.id
                      ? 'bg-gradient-to-r from-light-primary to-light-accent dark:from-dark-primary dark:to-dark-accent text-white shadow-lg shadow-light-primary/25 dark:shadow-dark-primary/25'
                      : 'text-light-text dark:text-dark-text hover:bg-light-surface-variant dark:hover:bg-dark-surface-variant'
                    }
                  `}
                >
                  <IconComponent className={`w-5 h-5 ${selectedCategory === category.id ? 'text-white' : ''}`} />
                  <span className={selectedCategory === category.id ? 'text-white font-semibold' : ''}>{category.name}</span>
                  <span className={`
                    px-2 py-1 rounded-full text-xs font-bold
                    ${selectedCategory === category.id 
                      ? 'bg-white/20' 
                      : 'bg-light-primary/20 dark:bg-dark-primary/20 text-light-primary dark:text-dark-primary'
                    }
                  `}>
                    {category.count}
                  </span>
                </motion.button>
              );
            })}
          </div>
        </motion.div>

        {/* Gallery Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
        >
          {displayedImages.map((image, index) => (
            <motion.div
              key={image.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.05 }}
              className="group relative overflow-hidden rounded-2xl glass border border-light-border dark:border-dark-border hover:border-light-primary dark:hover:border-dark-primary transition-all duration-500 hover:scale-105 hover:shadow-2xl cursor-pointer"
              onClick={() => openLightbox(image, index)}
            >
              <div className="aspect-square relative overflow-hidden">
                <LazyImage
                  src={image.src}
                  alt={image.alt}
                  title={image.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="absolute bottom-4 left-4 right-4 text-white">
                    <h3 className="font-bold text-lg mb-1">{image.title}</h3>
                    <p className="text-sm text-gray-300 capitalize">{image.category.replace('_', ' ')}</p>
                  </div>
                </div>
                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center">
                    <Eye className="w-5 h-5 text-white" />
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Load More Button */}
        {visibleImages < filteredImages.length && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-center mt-12"
          >
            <motion.button
              onClick={loadMore}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-4 bg-light-primary dark:bg-dark-primary text-white font-bold rounded-2xl hover:opacity-90 transition-all duration-300 shadow-lg"
            >
              Load More Photos ({filteredImages.length - visibleImages} remaining)
            </motion.button>
          </motion.div>
        )}
      </div>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/95 backdrop-blur-md z-50 flex items-center justify-center p-4"
            onClick={closeLightbox}
          >
            <div className="relative max-w-5xl w-full max-h-screen flex items-center justify-center">
              {/* Close Button */}
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                onClick={closeLightbox}
                className="absolute top-6 right-6 z-10 w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-all duration-300"
              >
                <X className="w-6 h-6" />
              </motion.button>

              {/* Navigation Buttons */}
              {filteredImages.length > 1 && (
                <>
                  <motion.button
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      navigateImage('prev');
                    }}
                    className="absolute left-6 z-10 w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-all duration-300"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </motion.button>
                  <motion.button
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      navigateImage('next');
                    }}
                    className="absolute right-6 z-10 w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-all duration-300"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </motion.button>
                </>
              )}

              {/* Image */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                className="relative max-w-full max-h-full"
                onClick={(e) => e.stopPropagation()}
              >
                <img
                  src={selectedImage.src}
                  alt={selectedImage.alt}
                  className="max-w-full max-h-screen object-contain rounded-2xl shadow-2xl"
                />
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6 rounded-b-2xl"
                >
                  <h2 className="text-white text-2xl font-bold mb-2">{selectedImage.title}</h2>
                  <p className="text-gray-300 capitalize">{selectedImage.category.replace('_', ' ')} • {currentImageIndex + 1} of {filteredImages.length}</p>
                </motion.div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stats Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="glass border-t border-light-border dark:border-dark-border"
      >
        <div className="max-w-7xl mx-auto px-6 py-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div className="text-light-text dark:text-dark-text">
              <div className="text-3xl md:text-4xl font-bold text-light-primary dark:text-dark-primary mb-2">6</div>
              <div className="text-light-text-muted dark:text-dark-text-muted">Recording Studios</div>
            </div>
            <div className="text-light-text dark:text-dark-text">
              <div className="text-3xl md:text-4xl font-bold text-light-accent dark:text-dark-accent mb-2">12</div>
              <div className="text-light-text-muted dark:text-dark-text-muted">Equipment Sets</div>
            </div>
            <div className="text-light-text dark:text-dark-text">
              <div className="text-3xl md:text-4xl font-bold text-blue-500 mb-2">18</div>
              <div className="text-light-text-muted dark:text-dark-text-muted">Live Sessions</div>
            </div>
            <div className="text-light-text dark:text-dark-text">
              <div className="text-3xl md:text-4xl font-bold text-green-500 mb-2">6</div>
              <div className="text-light-text-muted dark:text-dark-text-muted">Behind Scenes</div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Gallery;