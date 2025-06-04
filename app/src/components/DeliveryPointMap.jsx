import React, { useEffect, useState, useRef } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';

// Фиктивные данные для пунктов выдачи (в реальном приложении должны приходить с сервера)
const DELIVERY_POINTS = [
  {
    id: 1,
    name: 'СДЭК - ТЦ Гагаринский',
    address: 'ул. Гагарина, 35, оф. 23',
    type: 'cdek',
    position: [55.7522, 37.6156],
    schedule: 'Пн-Пт: 10:00-20:00, Сб-Вс: 10:00-18:00',
    rating: 4.7
  },
  {
    id: 2,
    name: 'Почта России №127325',
    address: 'ул. Ленина, 45',
    type: 'post',
    position: [55.7539, 37.6208],
    schedule: 'Пн-Пт: 9:00-20:00, Сб: 9:00-18:00, Вс: выходной',
    rating: 4.1
  },
  {
    id: 3,
    name: 'Пункт выдачи OZON',
    address: 'пр. Мира, 78',
    type: 'ozon',
    position: [55.7558, 37.6173],
    schedule: 'Ежедневно: 9:00-22:00',
    rating: 4.8
  },
  {
    id: 4,
    name: 'Пункт выдачи Wildberries',
    address: 'ул. Тверская, 15',
    type: 'wildberries',
    position: [55.7547, 37.6084],
    schedule: 'Ежедневно: 10:00-22:00',
    rating: 4.6
  },
  {
    id: 5,
    name: 'СДЭК - ТЦ Метрополис',
    address: 'Ленинградское ш., 16А, стр. 1',
    type: 'cdek',
    position: [55.7510, 37.6120],
    schedule: 'Пн-Вс: 10:00-22:00',
    rating: 4.5
  },
  {
    id: 6,
    name: 'Пункт выдачи OZON - Таганская',
    address: 'ул. Таганская, 24/5',
    type: 'ozon',
    position: [55.7420, 37.6546],
    schedule: 'Ежедневно: 8:00-22:00',
    rating: 4.7
  },
  {
    id: 7,
    name: 'Почта России - Арбат',
    address: 'ул. Арбат, 37',
    type: 'post',
    position: [55.7480, 37.5913],
    schedule: 'Пн-Пт: 8:00-20:00, Сб: 9:00-18:00, Вс: выходной',
    rating: 4.0
  },
  {
    id: 8,
    name: 'СДЭК - ТЦ Европейский',
    address: 'пл. Киевского вокзала, 2',
    type: 'cdek',
    position: [55.7439, 37.5660],
    schedule: 'Пн-Вс: 10:00-22:00',
    rating: 4.8
  },
  {
    id: 9,
    name: 'Wildberries - Кутузовский',
    address: 'Кутузовский пр-т, 22',
    type: 'wildberries',
    position: [55.7453, 37.5536],
    schedule: 'Ежедневно: 9:00-21:00',
    rating: 4.6
  },
  {
    id: 10,
    name: 'СДЭК - Сокольники',
    address: 'ул. Сокольническая, 9/14',
    type: 'cdek',
    position: [55.7895, 37.6745],
    schedule: 'Пн-Пт: 10:00-20:00, Сб-Вс: 10:00-18:00',
    rating: 4.5
  },
  {
    id: 11,
    name: 'Почта России - Бауманская',
    address: 'ул. Бауманская, 58/25',
    type: 'post',
    position: [55.7715, 37.6751],
    schedule: 'Пн-Пт: 8:00-20:00, Сб: 9:00-18:00, Вс: выходной',
    rating: 4.2
  },
  {
    id: 12,
    name: 'Пункт выдачи OZON - Беляево',
    address: 'ул. Профсоюзная, 104',
    type: 'ozon',
    position: [55.6423, 37.5235],
    schedule: 'Ежедневно: 10:00-22:00',
    rating: 4.6
  },
  {
    id: 13,
    name: 'Wildberries - Аэропорт',
    address: 'Ленинградский пр-т, 62А',
    type: 'wildberries',
    position: [55.8024, 37.5372],
    schedule: 'Ежедневно: 9:00-22:00',
    rating: 4.7
  },
  {
    id: 14,
    name: 'СДЭК - Марьино',
    address: 'ул. Люблинская, 165',
    type: 'cdek',
    position: [55.6506, 37.7449],
    schedule: 'Пн-Вс: 10:00-20:00',
    rating: 4.4
  },
  {
    id: 15,
    name: 'Почта России - Строгино',
    address: 'Строгинский б-р, 26',
    type: 'post',
    position: [55.8036, 37.4010],
    schedule: 'Пн-Пт: 8:00-20:00, Сб: 9:00-18:00, Вс: выходной',
    rating: 4.1
  },
  {
    id: 16,
    name: 'СДЭК - Химки',
    address: 'Ленинградское ш., 71Г',
    type: 'cdek',
    position: [55.8961, 37.4349],
    schedule: 'Пн-Вс: 10:00-21:00',
    rating: 4.6
  },
  {
    id: 17,
    name: 'Wildberries - Мытищи',
    address: 'Олимпийский пр-т, 36А',
    type: 'wildberries',
    position: [55.9174, 37.7681],
    schedule: 'Ежедневно: 9:00-22:00',
    rating: 4.7
  },
  {
    id: 18,
    name: 'Пункт выдачи OZON - Красногорск',
    address: 'ул. Ленина, 33',
    type: 'ozon',
    position: [55.8288, 37.3211],
    schedule: 'Ежедневно: 9:00-21:00',
    rating: 4.5
  },
  {
    id: 19,
    name: 'Почта России - Балашиха',
    address: 'Шоссе Энтузиастов, 52',
    type: 'post',
    position: [55.7986, 37.9584],
    schedule: 'Пн-Пт: 8:00-20:00, Сб: 9:00-18:00, Вс: выходной',
    rating: 4.2
  },
  {
    id: 20,
    name: 'СДЭК - Одинцово',
    address: 'Можайское ш., 67',
    type: 'cdek',
    position: [55.6735, 37.2843],
    schedule: 'Пн-Вс: 10:00-20:00',
    rating: 4.4
  },
  {
    id: 21,
    name: 'Пункт выдачи OZON - Зеленоград',
    address: 'Панфиловский пр-т, 30',
    type: 'ozon',
    position: [55.9997, 37.2147],
    schedule: 'Ежедневно: 10:00-21:00',
    rating: 4.7
  },
  {
    id: 22,
    name: 'Wildberries - Люберцы',
    address: 'Октябрьский пр-т, 27',
    type: 'wildberries',
    position: [55.6790, 37.8948],
    schedule: 'Ежедневно: 9:00-22:00',
    rating: 4.6
  }
];

const DeliveryPointMap = ({ onSelectPoint, selectedPoint }) => {
  const [mapLoaded, setMapLoaded] = useState(false);
  const [isMapModalOpen, setIsMapModalOpen] = useState(false);
  const [selectedDeliveryPoint, setSelectedDeliveryPoint] = useState(selectedPoint || null);
  const [hoveredPoint, setHoveredPoint] = useState(null);
  const mapRef = useRef(null);
  const ymapsRef = useRef(null);
  const markersRef = useRef([]);

  // Загрузка API Яндекс Карт
  useEffect(() => {
    if (!mapLoaded) {
      const script = document.createElement('script');
      script.src = 'https://api-maps.yandex.ru/2.1/?apikey=ВАШ_API_КЛЮЧ&lang=ru_RU';
      script.async = true;
      script.onload = () => {
        window.ymaps.ready(() => {
          setMapLoaded(true);
          ymapsRef.current = window.ymaps;
        });
      };
      document.body.appendChild(script);
    }
  }, [mapLoaded]);

  // Инициализация карты после загрузки API
  useEffect(() => {
    if (mapLoaded && isMapModalOpen && ymapsRef.current) {
      initMap();
    }
  }, [mapLoaded, isMapModalOpen]);

  // Инициализация карты с маркерами пунктов выдачи
  const initMap = () => {
    if (!mapRef.current) return;

    const map = new ymapsRef.current.Map(mapRef.current, {
      center: [55.7922, 37.6156],
      zoom: 10,
      controls: ['zoomControl', 'geolocationControl', 'searchControl']
    });

    // Создаем метки для всех пунктов доставки
    DELIVERY_POINTS.forEach(point => {
      const marker = new ymapsRef.current.Placemark(
        point.position,
        {
          balloonContentHeader: point.name,
          balloonContentBody: `
            <div>
              <p>${point.address}</p>
              <p><strong>Режим работы:</strong> ${point.schedule}</p>
              <p><strong>Рейтинг:</strong> ${point.rating}</p>
            </div>
          `,
          balloonContentFooter: `
            <button id="select-point-${point.id}" style="
              background: linear-gradient(135deg, #4dc7d9 0%, #66a6ff 100%);
              border: none;
              color: white;
              padding: 8px 16px;
              border-radius: 6px;
              cursor: pointer;
              font-weight: 500;">Выбрать этот пункт</button>
          `,
          hintContent: point.name
        },
        {
          preset: getMarkerPreset(point.type),
        }
      );

      marker.events.add('click', () => {
        // Открыть балун с информацией о пункте
        map.balloon.open(point.position, {
          contentHeader: point.name,
          contentBody: `
            <div>
              <p>${point.address}</p>
              <p><strong>Режим работы:</strong> ${point.schedule}</p>
              <p><strong>Рейтинг:</strong> ${point.rating}</p>
            </div>
          `,
          contentFooter: `
            <button id="select-point-${point.id}" style="
              background: linear-gradient(135deg, #4dc7d9 0%, #66a6ff 100%);
              border: none;
              color: white;
              padding: 8px 16px;
              border-radius: 6px;
              cursor: pointer;
              font-weight: 500;">Выбрать этот пункт</button>
          `
        });

        // Добавим обработчик для кнопки выбора пункта после открытия балуна
        setTimeout(() => {
          const selectButton = document.getElementById(`select-point-${point.id}`);
          if (selectButton) {
            selectButton.addEventListener('click', () => {
              handleSelectPoint(point);
              map.balloon.close();
            });
          }
        }, 100);
      });

      map.geoObjects.add(marker);
      markersRef.current.push({ marker, point });
    });

    // Добавляем список пунктов выдачи рядом с картой
    return () => {
      map.destroy();
      markersRef.current = [];
    };
  };

  // Получаем стиль маркера в зависимости от типа пункта выдачи
  const getMarkerPreset = (type) => {
    switch (type) {
      case 'cdek':
        return 'islands#blueDeliveryIcon';
      case 'post':
        return 'islands#darkBluePostIcon';
      case 'ozon':
        return 'islands#blueShoppingIcon';
      case 'wildberries':
        return 'islands#violetShoppingIcon';
      default:
        return 'islands#blueIcon';
    }
  };

  // Обработчик выбора пункта выдачи
  const handleSelectPoint = (point) => {
    setSelectedDeliveryPoint(point);
    setIsMapModalOpen(false);
    if (onSelectPoint) {
      onSelectPoint(point);
    }
  };

  // Получаем иконку для пункта выдачи
  const getDeliveryIcon = (type) => {
    switch (type) {
      case 'cdek':
        return '📦';
      case 'post':
        return '✉️';
      case 'ozon':
        return '🔵';
      case 'wildberries':
        return '🟣';
      default:
        return '📍';
    }
  };

  return (
    <Container>
      {selectedDeliveryPoint ? (
        <SelectedPointContainer
          onClick={() => setIsMapModalOpen(true)}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <PointIcon>{getDeliveryIcon(selectedDeliveryPoint.type)}</PointIcon>
          <PointInfo>
            <PointName>{selectedDeliveryPoint.name}</PointName>
            <PointAddress>{selectedDeliveryPoint.address}</PointAddress>
          </PointInfo>
          <ChangeButton>Изменить</ChangeButton>
        </SelectedPointContainer>
      ) : (
        <SelectPointButton
          onClick={() => setIsMapModalOpen(true)}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2C8.13 2 5 5.13 5 9C5 14.25 12 22 12 22C12 22 19 14.25 19 9C19 5.13 15.87 2 12 2ZM12 11.5C10.62 11.5 9.5 10.38 9.5 9C9.5 7.62 10.62 6.5 12 6.5C13.38 6.5 14.5 7.62 14.5 9C14.5 10.38 13.38 11.5 12 11.5Z" fill="currentColor"/>
          </svg>
          Выбрать пункт выдачи
        </SelectPointButton>
      )}

      <AnimatePresence>
        {isMapModalOpen && (
          <MapModal
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <MapOverlay onClick={() => setIsMapModalOpen(false)} />
            <MapContainer
              initial={{ scale: 0.8, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: 50 }}
              transition={{ type: 'spring', damping: 25 }}
            >
              <MapHeader>
                <MapTitle>Выберите пункт выдачи</MapTitle>
                <CloseButton onClick={() => setIsMapModalOpen(false)}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M19 6.41L17.59 5L12 10.59L6.41 5L5 6.41L10.59 12L5 17.59L6.41 19L12 13.41L17.59 19L19 17.59L13.41 12L19 6.41Z" fill="currentColor"/>
                  </svg>
                </CloseButton>
              </MapHeader>

              <MapContent>
                <YandexMap ref={mapRef} />
                <PointsList>
                  <PointListTitle>Пункты выдачи заказов</PointListTitle>
                  {DELIVERY_POINTS.map(point => (
                    <PointItem 
                      key={point.id}
                      onClick={() => handleSelectPoint(point)}
                      onMouseEnter={() => setHoveredPoint(point.id)}
                      onMouseLeave={() => setHoveredPoint(null)}
                      isHovered={hoveredPoint === point.id}
                      whileHover={{ x: 5 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <PointIcon>{getDeliveryIcon(point.type)}</PointIcon>
                      <PointItemInfo>
                        <PointName>{point.name}</PointName>
                        <PointAddress>{point.address}</PointAddress>
                        <PointSchedule>{point.schedule}</PointSchedule>
                      </PointItemInfo>
                    </PointItem>
                  ))}
                </PointsList>
              </MapContent>
            </MapContainer>
          </MapModal>
        )}
      </AnimatePresence>
    </Container>
  );
};

const Container = styled.div`
  margin: 20px 0;
`;

const SelectPointButton = styled(motion.button)`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 15px 20px;
  background: white;
  border: 2px dashed #66a6ff;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 500;
  color: #4dc7d9;
  cursor: pointer;
  transition: all 0.2s;
  width: 100%;
  justify-content: center;

  svg {
    width: 24px;
    height: 24px;
  }

  &:hover {
    background: #f0f8ff;
  }
`;

const SelectedPointContainer = styled(motion.div)`
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 15px 20px;
  background: white;
  border: 2px solid #e0e9ff;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    border-color: #66a6ff;
    background: #f0f8ff;
  }
`;

const PointIcon = styled.div`
  font-size: 24px;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f0f8ff;
  border-radius: 50%;
  flex-shrink: 0;
`;

const PointInfo = styled.div`
  flex: 1;
`;

const PointName = styled.div`
  font-weight: 600;
  color: #333;
  margin-bottom: 4px;
`;

const PointAddress = styled.div`
  font-size: 14px;
  color: #666;
`;

const PointSchedule = styled.div`
  font-size: 12px;
  color: #888;
  margin-top: 4px;
`;

const ChangeButton = styled.div`
  padding: 6px 12px;
  background: linear-gradient(135deg, #4dc7d9 0%, #66a6ff 100%);
  color: white;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
`;

const MapModal = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
`;

const MapOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
`;

const MapContainer = styled(motion.div)`
  position: relative;
  width: 90%;
  max-width: 1000px;
  height: 80vh;
  max-height: 700px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  z-index: 1;
`;

const MapHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid #eee;
`;

const MapTitle = styled.h2`
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: #333;
`;

const CloseButton = styled.button`
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  color: #666;
  transition: all 0.2s;

  &:hover {
    background: #f0f0f0;
    color: #333;
  }
`;

const MapContent = styled.div`
  display: flex;
  flex: 1;
  overflow: hidden;
`;

const YandexMap = styled.div`
  flex: 1;
  height: 100%;
`;

const PointsList = styled.div`
  width: 350px;
  padding: 20px;
  overflow-y: auto;
  background: #f7f9ff;
  border-left: 1px solid #eee;

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background-color: #ddd;
    border-radius: 20px;
  }
`;

const PointListTitle = styled.h3`
  margin: 0 0 15px 0;
  font-size: 16px;
  font-weight: 600;
  color: #333;
`;

const PointItem = styled(motion.div)`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border-radius: 10px;
  cursor: pointer;
  margin-bottom: 10px;
  background: ${props => props.isHovered ? '#e0e9ff' : 'white'};
  transition: all 0.2s;

  &:hover {
    background: #e0e9ff;
  }
`;

const PointItemInfo = styled.div`
  flex: 1;
`;

export default DeliveryPointMap; 