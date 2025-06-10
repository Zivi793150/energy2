import React, { useState, useRef, useEffect } from 'react';
import { motion, useInView, useAnimation, useScroll, useTransform } from 'framer-motion';
import './VideoFeature.css';

const VideoFeature = ({ videoSrc, title, caption, index }) => {
  const [isHovered, setIsHovered] = useState(false);
  const videoRef = useRef(null);
  const containerRef = useRef(null);
  const isInView = useInView(containerRef, { once: false, amount: 0.3 });
  const controls = useAnimation();
  
  // Добавляем эффект параллакса при прокрутке
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });
  
  // Создаем различные эффекты параллакса для разных индексов
  const yOffset = useTransform(
    scrollYProgress, 
    [0, 1], 
    [index % 2 === 0 ? 50 : -50, index % 2 === 0 ? -50 : 50]
  );
  
  const scale = useTransform(
    scrollYProgress,
    [0, 0.5, 1],
    [0.95, 1.05, 0.95]
  );
  
  const rotation = useTransform(
    scrollYProgress,
    [0, 1],
    [index % 2 === 0 ? -8 : 8, index % 2 === 0 ? 8 : -8]
  );

  useEffect(() => {
    if (isInView) {
      controls.start('visible');
    } else {
      controls.start('hidden');
    }
  }, [isInView, controls]);

  // Автовоспроизведение видео при загрузке компонента
  useEffect(() => {
    if (videoRef.current && isInView) {
      videoRef.current.play().catch(e => {
        console.log('Автовоспроизведение предотвращено браузером:', e);
      });
    }
  }, [isInView, videoSrc]);

  // Генерация градиентного фона вместо видео
  const getGradientBackground = (index) => {
    const gradients = [
      'linear-gradient(135deg, #1e88e5 0%, #37ffff 100%)',
      'linear-gradient(135deg, #4a0072 0%, #1e88e5 100%)',
      'linear-gradient(135deg, #003c8f 0%, #5eb8ff 100%)'
    ];
    return gradients[index % gradients.length];
  };

  // Анимированный фоновый элемент для плейсхолдера
  const PlaceholderContent = () => (
    <div className="placeholder-content" 
         style={{ background: getGradientBackground(index) }}>
      <motion.div 
        className="placeholder-icon"
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ 
          opacity: 1, 
          scale: [1, 1.05, 1],
          rotate: [0, 5, 0, -5, 0] 
        }}
        transition={{ 
          duration: 4, 
          repeat: Infinity,
          repeatType: 'loop'
        }}
      >
        {index === 0 ? (
          <svg viewBox="0 0 24 24" fill="white">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z"/>
          </svg>
        ) : index === 1 ? (
          <svg viewBox="0 0 24 24" fill="white">
            <path d="M20 8h-3V4H3c-1.1 0-2 .9-2 2v11h2c0 1.66 1.34 3 3 3s3-1.34 3-3h6c0 1.66 1.34 3 3 3s3-1.34 3-3h2v-5l-3-4zm-7 1h4v3h-4V9zM9 19c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm10 0c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1z"/>
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" fill="white">
            <path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z"/>
          </svg>
        )}
      </motion.div>
    </div>
  );

  const containerVariants = {
    hidden: { 
      opacity: 0, 
      y: 50,
    },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.8,
        ease: [0.25, 0.1, 0.25, 1],
        delay: index * 0.2
      }
    }
  };

  const glowVariants = {
    normal: {
      opacity: 0.4,
      scale: 1
    },
    hover: {
      opacity: 0.8,
      scale: 1.05,
      transition: { duration: 0.3 }
    }
  };

  // Рамки для футуристического дизайна
  const Borders = () => (
    <div className="video-borders">
      <div className="border top-left"></div>
      <div className="border top-right"></div>
      <div className="border bottom-left"></div>
      <div className="border bottom-right"></div>
    </div>
  );

  // Анимированная маска для видео
  const clipPathVariants = {
    hidden: { clipPath: 'polygon(10% 10%, 90% 10%, 90% 90%, 10% 90%)' },
    visible: { 
      clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)',
      transition: {
        duration: 1,
        ease: "easeOut",
        delay: 0.5 + index * 0.2
      }
    }
  };

  return (
    <motion.div 
      ref={containerRef}
      className="video-feature-container"
      variants={containerVariants}
      initial="hidden"
      animate={controls}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{ 
        y: yOffset,
        scale: scale,
        rotateY: rotation 
      }}
    >
      <div className="video-wrapper">
        <Borders />
        <motion.div 
          className="video-glow"
          variants={glowVariants}
          animate={isHovered ? 'hover' : 'normal'}
        />
        <motion.div
          className="video-mask"
          variants={clipPathVariants}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
        >
          {videoSrc ? (
            <video 
              ref={videoRef}
              src={videoSrc}
              className="video-feature"
              loop
              muted
              playsInline
              autoPlay
            />
          ) : (
            <PlaceholderContent />
          )}
        </motion.div>
      </div>
    </motion.div>
  );
};

export default VideoFeature; 