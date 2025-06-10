'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, useScroll, useTransform, useInView } from 'framer-motion';
import { Link } from 'react-router-dom';
import './Main.css';
import ProductStrip from './ProductStrip';
import ReviewSlider from './ReviewSlider';
import VideoFeature from './VideoFeature';
import { API_URL } from '../utils/config';
import FloatingPaths from './FloatingPaths';

const FeaturedSection = ({ alignment, title, text, icons, index, videoInfo }) => {
    const ref = React.useRef(null);
    const isInView = useInView(ref, { once: false, amount: 0.2 });
    const { scrollYProgress } = useScroll({
        target: ref,
        offset: ["start end", "end start"]
    });
    
    // Create parallax effect based on scroll position
    const y = useTransform(
        scrollYProgress, 
        [0, 1], 
        [50, -50]
    );
    
    const variants = {
        hidden: { 
            opacity: 0, 
            x: alignment === 'left' ? -70 : 70
        },
        visible: { 
            opacity: 1, 
            x: 0,
            transition: {
                duration: 0.6,
                delay: 0.05,
                ease: [0.25, 0.1, 0.25, 1]
            }
        }
    };

    const iconVariants = {
        hidden: { opacity: 0, y: 20, scale: 0.8 },
        visible: i => ({
            opacity: 1,
            y: 0,
            scale: 1,
            transition: {
                duration: 0.5,
                delay: 0.5 + i * 0.1,
                ease: [0.25, 0.1, 0.25, 1]
            }
        }),
        hover: {
            scale: 1.2,
            y: -5,
            transition: {
                duration: 0.2,
                ease: "easeOut"
            }
        }
    };

    return (
        <section ref={ref} className={`feature-section ${alignment} feature-with-video ${alignment}`}>
            <motion.div 
                className="feature-content"
                initial="hidden"
                animate={isInView ? "visible" : "hidden"}
                variants={variants}
                style={{ y }}
                whileHover={{
                    boxShadow: "0 15px 35px rgba(30, 136, 229, 0.25)",
                    transform: "translateY(-8px)"
                }}
            >
                <motion.div
                    className="feature-glow"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: isInView ? 0.2 : 0 }}
                    transition={{ duration: 0.8 }}
                />
                <h2 className="feature-title">{title}</h2>
                <p className="feature-text">{text}</p>
                <div className="feature-icons">
                    {icons.map((icon, i) => (
                        <motion.div
                            key={i}
                            className="icon-container"
                            custom={i}
                            initial="hidden"
                            animate={isInView ? "visible" : "hidden"}
                            whileHover="hover"
                            variants={iconVariants}
                        >
                            <img 
                                src={icon.src} 
                                alt={icon.alt} 
                                className="feature-icon"
                            />
                            <motion.div 
                                className="icon-shadow"
                                animate={isInView ? { opacity: 0.4 } : { opacity: 0 }}
                                transition={{ duration: 0.6, delay: 0.5 + i * 0.1 }}
                            />
                        </motion.div>
                    ))}
                </div>
            </motion.div>
            
            {videoInfo && (
                <VideoFeature 
                    videoSrc={videoInfo.src} 
                    title={videoInfo.title} 
                    caption={videoInfo.caption}
                    index={index}
                />
            )}
        </section>
    );
};

const Main = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { scrollYProgress } = useScroll();
    const opacity = useTransform(scrollYProgress, [0, 0.15], [1, 0]);
    const scale = useTransform(scrollYProgress, [0, 0.15], [1, 0.95]);
    const y = useTransform(scrollYProgress, [0, 0.15], [0, -40]);
    const titleContainerRef = React.useRef(null);
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const mainRef = React.useRef(null);
    const [containerHeight, setContainerHeight] = useState(0);

    const titleText = "THE ENERGY LAB";
    const titleChars = titleText.split("");
    
    // Mouse follow effect for the title
    const handleMouseMove = (e) => {
        if (!titleContainerRef.current) return;
        
        const { clientX, clientY } = e;
        const { left, top, width, height } = titleContainerRef.current.getBoundingClientRect();
        
        const x = (clientX - left) / width - 0.5;
        const y = (clientY - top) / height - 0.5;
        
        setMousePosition({ x, y });
    };

    const sectionData = [
        {
            title: "Надежные партнеры",
            text: "Мы сотрудничаем только с крупнейшими и проверенными поставщиками энергетических напитков, гарантируя высокое качество и оригинальность продукции.",
            icons: [],
            alignment: "left",
            videoInfo: {
                src: "/videos/Monster.mp4",
                title: "Наши партнеры",
                caption: "Экскурсия по производству энергетических напитков нашего ключевого партнера Monster Energy."
            }
        },
        {
            title: "Оперативная доставка",
            text: "Благодаря нашей логистической сети, мы обеспечиваем быструю и надежную доставку энергетиков прямо к вашей двери в любую точку страны.",
            icons: [],
            alignment: "right",
            videoInfo: {
                src: "/videos/Burn.mp4", 
                title: "Доставка без промедлений",
                caption: "Наша служба доставки работает 24/7, чтобы ваш заказ прибыл точно в срок."
            }
        },
        {
            title: "Выгодные цены",
            text: "Мы предлагаем самые конкурентоспособные цены на рынке энергетических напитков, а также регулярные акции и скидки для наших постоянных клиентов.",
            icons: [
                { src: "/images/%.png", alt: "Скидка" },
                { src: "/images/present.png", alt: "Подарок" },
                { src: "/images/promo.png", alt: "Промокод" }
            ],
            alignment: "left",
            videoInfo: {
                src: "/videos/Volt.mp4",
                title: "Выгода с каждой покупкой",
                caption: "Узнайте о нашей программе лояльности и как получить максимальную выгоду от покупок."
            }
        }
    ];

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                setLoading(true);
                console.log('Загрузка популярных товаров...');
                
                // Используем кэширование в sessionStorage
                const cachedProducts = sessionStorage.getItem('topProducts');
                const cacheTimestamp = sessionStorage.getItem('topProductsTimestamp');
                const now = Date.now();
                
                // Если есть кэш и он не старше 5 минут, используем его
                if (cachedProducts && cacheTimestamp && (now - parseInt(cacheTimestamp)) < 300000) {
                    console.log('Используем кэшированные данные');
                    setProducts(JSON.parse(cachedProducts));
                    setLoading(false);
                    return;
                }
                
                // Загружаем популярные товары
                const response = await fetch(`${API_URL}/products/top-rated?limit=10`);
                console.log('Статус ответа:', response.status);
                
                if (!response.ok) {
                    throw new Error(`Ошибка при загрузке данных: ${response.status}`);
                }
                
                const data = await response.json();
                console.log(`Получено ${data.products?.length || 0} популярных товаров`);
                
                // Сохраняем в кэш
                sessionStorage.setItem('topProducts', JSON.stringify(data.products));
                sessionStorage.setItem('topProductsTimestamp', now.toString());
                
                setProducts(data.products || []);
            } catch (err) {
                console.error('Ошибка при загрузке товаров:', err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        
        fetchProducts();
    }, []);

    useEffect(() => {
        function updateHeight() {
            if (mainRef.current) {
                setContainerHeight(mainRef.current.offsetHeight);
            }
        }
        updateHeight();
        window.addEventListener('resize', updateHeight);
        window.addEventListener('scroll', updateHeight);
        return () => {
            window.removeEventListener('resize', updateHeight);
            window.removeEventListener('scroll', updateHeight);
        };
    }, []);

    return (
        <div className="main-container" style={{position: 'relative'}} ref={mainRef}>
            {/* Анимированный фон только для главной страницы */}
            <div style={{position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none', height: '100%'}}>
                <FloatingPaths position={0.8} height={containerHeight} />
                <FloatingPaths position={-0.8} height={containerHeight} />
                <FloatingPaths position={0.3} height={containerHeight} />
            </div>
            <div className="content">
                {/* Hero section with fade effect on scroll */}
                <motion.div 
                    className="hero-section" 
                    style={{ opacity, y, scale }}
                >
                    <motion.div 
                        className="title-3d-container"
                        ref={titleContainerRef}
                        onMouseMove={handleMouseMove}
                        style={{
                            transform: `rotateX(${mousePosition.y * 10}deg) rotateY(${mousePosition.x * 10}deg)`
                        }}
                    >
                        <motion.h1 className="hero-title">
                            {titleChars.map((char, index) => (
                                <motion.span
                                    key={index}
                                    initial={{ opacity: 0, y: -20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{
                                        duration: 0.4,
                                        delay: 0.05 * index,
                                        ease: [0.2, 0.65, 0.3, 0.9]
                                    }}
                                    whileHover={{
                                        y: -5,
                                        color: "#37ffff",
                                        transition: { duration: 0.1 }
                                    }}
                                    style={{
                                        textShadow: `
                                            ${mousePosition.x * 5}px ${mousePosition.y * 5}px 5px rgba(30, 136, 229, 0.5),
                                            ${mousePosition.x * 10}px ${mousePosition.y * 10}px 10px rgba(30, 136, 229, 0.3),
                                            ${mousePosition.x * 15}px ${mousePosition.y * 15}px 20px rgba(30, 136, 229, 0.2)
                                        `
                                    }}
                                >
                                    {char === " " ? "\u00A0" : char}
                                </motion.span>
                            ))}
                        </motion.h1>
                    </motion.div>
                    <motion.p 
                        className="hero-subtitle"
                        initial={{ opacity: 0, y: 20, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ 
                            duration: 0.7, 
                            delay: 0.5,
                            ease: [0.2, 0.65, 0.3, 0.9]
                        }}
                    >
                        Ваш источник энергии
                    </motion.p>
                </motion.div>

                {/* Featured sections with alternating layout */}
                <div className="features-container">
                    {sectionData.map((section, index) => (
                        <FeaturedSection 
                            key={index}
                            title={section.title}
                            text={section.text}
                            icons={section.icons}
                            alignment={section.alignment}
                            index={index}
                            videoInfo={section.videoInfo}
                        />
                    ))}
                </div>
            </div>
            
            <motion.h1 
                className="best-title"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
            >
                Лучшие позиции
            </motion.h1>
            
            {/* Ленте продуктов, которая теперь показывает популярные товары */}
            {!loading && !error && products.length > 0 && (
                <div className="popular-products-section">
                    <ProductStrip
                        products={products}
                        title="Популярные товары"
                    />
                </div>
            )}
            
            {loading && <div style={{textAlign: 'center', margin: '30px'}}>Загрузка товаров...</div>}
            {error && <div style={{color: 'red', textAlign: 'center', margin: '30px'}}>{error}</div>}
            
            {/* Лента отзывов */}
            <ReviewSlider />
        </div>
    );
};

export default Main;