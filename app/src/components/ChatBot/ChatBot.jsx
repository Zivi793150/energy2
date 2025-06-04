import React, { useState, useEffect } from 'react';
import ChatButton from './ChatButton';
import ChatWindow from './ChatWindow';
import { getBotResponse, simulateOperatorResponse } from '../../utils/chatBotService';

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [currentStep, setCurrentStep] = useState('start');
  const [inputValue, setInputValue] = useState('');
  const [operatorType, setOperatorType] = useState(null);

  // Инициализация чата при первом открытии
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      // Получаем начальное сообщение бота
      const initialResponse = getBotResponse('start');
      
      setMessages([
        {
          text: initialResponse.message,
          isUser: false,
          options: initialResponse.options
        }
      ]);
    }
  }, [isOpen, messages.length]);

  // Обработка перехода к соединению с оператором
  useEffect(() => {
    if (currentStep === 'operator_connecting' && operatorType) {
      // Имитация задержки перед ответом оператора
      const timer = setTimeout(() => {
        const operatorMessage = simulateOperatorResponse(operatorType);
        
        setMessages(prev => [...prev, {
          text: operatorMessage,
          isUser: false
        }]);
        
        setCurrentStep('operator_chat');
      }, 3000); // Задержка 3 секунды
      
      return () => clearTimeout(timer);
    }
  }, [currentStep, operatorType]);

  // Обработка отправки сообщения пользователем
  const handleSendMessage = (text, value) => {
    // Добавляем сообщение пользователя
    setMessages(prev => [...prev, { text, isUser: true }]);

    // Если выбрана опция из списка, используем её значение
    const nextStep = value || text;

    // Получаем ответ от бота на основе выбора пользователя
    const botResponse = getBotResponse(nextStep);

    // Проверяем, нужно ли соединить с оператором
    if (botResponse.next === 'operator_connecting') {
      setOperatorType(botResponse.operator);
      setCurrentStep('operator_connecting');
    } else {
      setCurrentStep(nextStep);
    }
    
    // Добавляем ответ бота с небольшой задержкой
    setTimeout(() => {
      setMessages(prev => [...prev, {
        text: botResponse.message,
        isUser: false,
        options: botResponse.options
      }]);
    }, 500);
  };

  // Обработка переключения видимости чата
  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      <ChatButton onClick={toggleChat} isOpen={isOpen} />
      <ChatWindow 
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        messages={messages}
        sendMessage={handleSendMessage}
        inputValue={inputValue}
        setInputValue={setInputValue}
        currentStep={currentStep}
      />
    </>
  );
};

export default ChatBot; 