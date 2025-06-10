import React from 'react';
import { motion } from 'framer-motion';
import './Main.css';

function FloatingPaths({ position, height = 1080 }) {
    const svgHeight = Math.max(height, 1080); // Минимум 1080 для красоты
    const paths = Array.from({ length: 48 }, (_, i) => {
        const startX = -(800 - i * 15 * position);
        const startY = -(200 + i * 10);
        const control1X = -(600 - i * 15 * position);
        const control1Y = -(100 + i * 10);
        const control2X = -(400 - i * 15 * position);
        const control2Y = 300 - i * 10;
        const endPoint1X = 200 - i * 15 * position;
        const endPoint1Y = 600 - i * 10;
        const control3X = 1000 - i * 15 * position;
        const control3Y = 800 - i * 10;
        const control4X = 1500 - i * 15 * position;
        const control4Y = 1200 - i * 10;
        const endPoint2X = 1800 - i * 15 * position;
        const endPoint2Y = 1500 - i * 10;
        return {
            id: i,
            d: `M${startX} ${startY} C${control1X} ${control1Y} ${control2X} ${control2Y} ${endPoint1X} ${endPoint1Y} C${control3X} ${control3Y} ${control4X} ${control4Y} ${endPoint2X} ${endPoint2Y}`,
            width: 0.4 + i * 0.02,
        };
    });
    return (
        <div className="absolute inset-0 pointer-events-none full-page-paths" style={{height: '100%'}}>
            <svg
                className="w-full h-full"
                width="100%"
                height={svgHeight}
                viewBox={`0 0 1920 ${svgHeight}`}
                preserveAspectRatio="none"
                fill="none"
            >
                <title>Background Paths</title>
                {paths.map((path) => (
                    <motion.path
                        key={path.id}
                        d={path.d}
                        stroke="#1e88e5"
                        strokeWidth={path.width}
                        strokeOpacity={0.1 + path.id * 0.015}
                        initial={{ pathLength: 0.3, opacity: 0.7 }}
                        animate={{
                            pathLength: 1,
                            opacity: [0.3, 0.6, 0.3],
                            pathOffset: [0, 1, 0],
                        }}
                        transition={{
                            duration: 25 + Math.random() * 15,
                            repeat: Number.POSITIVE_INFINITY,
                            ease: "linear",
                        }}
                    />
                ))}
            </svg>
        </div>
    );
}

export default FloatingPaths; 