import React, { useEffect, useState } from 'react';
import { SplineScene } from './spline';
import { Card } from './card';
import { Spotlight } from './spotlight';
import { motion } from 'framer-motion';
import './AboutUs.css';

const sponsors = [
  { src: '/sponsors/Red_bull.png', alt: 'Red Bull' },
  { src: '/sponsors/nvidia.jpeg', alt: 'Nvidia' },
  { src: '/sponsors/valorant.jpg', alt: 'Valorant' },
  { src: '/sponsors/CS2.jpg', alt: 'CS2' },
  { src: '/sponsors/Dota2.png', alt: 'Dota 2' },
  { src: '/sponsors/Intel.png', alt: 'Intel' },
  { src: '/sponsors/AMD.jpg', alt: 'AMD' },
  { src: '/sponsors/Razerjpg.jpg', alt: 'Razer' },
];

function SponsorsMarquee() {
  return (
    <div className="sponsors-marquee">
      <div className="marquee-track">
        {sponsors.concat(sponsors).map((s, i) => (
          <div className="sponsor-logo" key={i}>
            <img src={s.src} alt={s.alt} loading="lazy" />
          </div>
        ))}
      </div>
    </div>
  );
}

const stats = [
  { number: '10K+', label: 'Довольных клиентов' },
  { number: '500+', label: 'Игровых продуктов' },
  { number: '24/7', label: 'Поддержка' },
  { number: '50+', label: 'Страны доставки' },
];

const AboutUs = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <div className="about-us-container">
      {/* Большая надпись и подзаголовок */}
      <div className="aboutus-header-block">
        <h1 className="aboutus-title">О нас</h1>
        <p className="aboutus-lead">Мы вдохновляем на победы и объединяем людей вокруг энергии и технологий.</p>
      </div>
      {/* Hero Section with 3D Robot */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20 }}
        transition={{ duration: 0.8 }}
        className="hero-section"
      >
        <Card className="robot-section">
          <Spotlight
            className="-top-40 left-0 md:left-60 md:-top-20"
            fill="#4ecdc4"
            size={400}
          />
          <div className="flex flex-col h-full">
            <div className="flex-1 p-8 relative z-10 flex flex-col justify-start">
              <motion.h2
                className="text-4xl md:text-5xl font-bold aboutus-robot-title"
                style={{ 
                  background: 'linear-gradient(45deg, #333, #666)', 
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  textShadow: '0 1px 2px rgba(255,255,255,0.3)'
                }}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: isVisible ? 1 : 0, x: isVisible ? 0 : -20 }}
                transition={{ delay: 0.3, duration: 0.8 }}
              >
                {/* Можно оставить пустым или удалить */}
              </motion.h2>
              <motion.p 
                className="mt-4 text-xl"
                style={{ color: 'rgba(0,0,0,0.6)', textShadow: '0 1px 1px rgba(255,255,255,0.5)' }}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: isVisible ? 1 : 0, x: isVisible ? 0 : -20 }}
                transition={{ delay: 0.5, duration: 0.8 }}
              >
                {/* Можно оставить пустым или удалить */}
              </motion.p>
            </div>
            <div className="robot-container">
              <SplineScene 
                scene="https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode"
                className="w-full h-full"
              />
            </div>
          </div>
        </Card>
      </motion.div>
      {/* Stats Section */}
      <motion.div 
        className="stats-section"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20 }}
        transition={{ delay: 0.7, duration: 0.8 }}
      >
        {stats.map((stat, index) => (
          <motion.div 
            key={index} 
            className="stat-item"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: isVisible ? 1 : 0, scale: isVisible ? 1 : 0.8 }}
            transition={{ delay: 0.9 + index * 0.2, duration: 0.5 }}
          >
            <h3 className="stat-number">{stat.number}</h3>
            <p className="stat-label">{stat.label}</p>
          </motion.div>
        ))}
      </motion.div>
      {/* Бегущая строка спонсоров */}
      <SponsorsMarquee />
    </div>
  );
};

export default AboutUs; 