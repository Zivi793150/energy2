import React, { useRef, useEffect } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';

const ChatWindow = ({ isOpen, onClose, messages, sendMessage, inputValue, setInputValue, currentStep }) => {
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (inputValue.trim()) {
      sendMessage(inputValue);
      setInputValue('');
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <StyledChatWindow
          initial={{ opacity: 0, y: 20, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.8 }}
          transition={{ duration: 0.3 }}
        >
          <ChatHeader>
            <div>
              <h3>Поддержка клиентов</h3>
              <span>Мы всегда на связи</span>
            </div>
            <CloseButton onClick={onClose}>
              <svg viewBox="0 0 24 24" width="24" height="24">
                <path fill="currentColor" d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
              </svg>
            </CloseButton>
          </ChatHeader>

          <MessagesContainer>
            {messages.map((msg, index) => (
              <MessageBubble
                key={index}
                isUser={msg.isUser}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * (index % 5) }}
              >
                {msg.isUser ? (
                  <span>{msg.text}</span>
                ) : (
                  <>
                    {msg.options ? (
                      <OptionsContainer>
                        <p>{msg.text}</p>
                        <OptionsButtons>
                          {msg.options.map((option, idx) => (
                            <OptionButton
                              key={idx}
                              onClick={() => sendMessage(option.text, option.value)}
                              whileHover={{ scale: 1.03 }}
                              whileTap={{ scale: 0.98 }}
                            >
                              {option.text}
                            </OptionButton>
                          ))}
                        </OptionsButtons>
                      </OptionsContainer>
                    ) : (
                      <span>{msg.text}</span>
                    )}
                  </>
                )}
              </MessageBubble>
            ))}
            <div ref={messagesEndRef} />
            
            {currentStep === 'operator_connecting' && (
              <OperatorConnecting>
                <div className="typing">
                  <div className="dot"></div>
                  <div className="dot"></div>
                  <div className="dot"></div>
                </div>
                <p>Соединяем с оператором...</p>
              </OperatorConnecting>
            )}
          </MessagesContainer>

          <ChatForm onSubmit={handleSubmit}>
            <ChatInput
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Введите сообщение..."
              disabled={currentStep === 'operator_connecting'}
            />
            <SendButton 
              type="submit" 
              disabled={!inputValue.trim() || currentStep === 'operator_connecting'}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <svg viewBox="0 0 24 24" width="24" height="24">
                <path fill="currentColor" d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
              </svg>
            </SendButton>
          </ChatForm>
        </StyledChatWindow>
      )}
    </AnimatePresence>
  );
};

const StyledChatWindow = styled(motion.div)`
  position: fixed;
  bottom: 100px;
  right: 30px;
  width: 380px;
  height: 550px;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 5px 40px rgba(0, 0, 0, 0.16);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  z-index: 1000;
`;

const ChatHeader = styled.div`
  background: linear-gradient(135deg, #4dc7d9 0%, #66a6ff 100%);
  color: white;
  padding: 15px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;

  h3 {
    margin: 0;
    font-size: 18px;
    font-weight: 600;
  }

  span {
    font-size: 13px;
    opacity: 0.8;
  }
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0.8;
  transition: all 0.2s;
  border-radius: 50%;

  &:hover {
    opacity: 1;
    background: rgba(255, 255, 255, 0.2);
  }
`;

const MessagesContainer = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  background: #f7f8fb;
  display: flex;
  flex-direction: column;
  gap: 15px;

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background-color: rgba(0, 0, 0, 0.2);
    border-radius: 20px;
  }
`;

const MessageBubble = styled(motion.div)`
  max-width: 80%;
  padding: 12px 16px;
  border-radius: 18px;
  font-size: 14px;
  line-height: 1.4;
  word-break: break-word;
  
  ${props => props.isUser ? `
    align-self: flex-end;
    background: linear-gradient(135deg, #4dc7d9 0%, #66a6ff 100%);
    color: white;
    border-bottom-right-radius: 4px;
  ` : `
    align-self: flex-start;
    background: white;
    color: #333;
    border-bottom-left-radius: 4px;
    box-shadow: 0 2px 5px rgba(0,0,0,0.05);
  `}
`;

const OptionsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;

  p {
    margin: 0 0 5px 0;
  }
`;

const OptionsButtons = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const OptionButton = styled(motion.button)`
  background: #f0f2f5;
  border: none;
  padding: 8px 12px;
  border-radius: 12px;
  font-size: 13px;
  cursor: pointer;
  text-align: left;
  transition: all 0.2s;
  color: #333;
  font-weight: 500;

  &:hover {
    background: #e4e6ea;
    color: #4dc7d9;
  }
`;

const ChatForm = styled.form`
  display: flex;
  padding: 15px;
  border-top: 1px solid #eee;
  background: white;
`;

const ChatInput = styled.input`
  flex: 1;
  border: 1px solid #e2e2e2;
  border-radius: 20px;
  padding: 10px 15px;
  font-size: 14px;
  outline: none;
  background: #f7f8fb;
  transition: all 0.2s;

  &:focus {
    border-color: #4dc7d9;
    box-shadow: 0 0 0 2px rgba(77, 199, 217, 0.1);
  }

  &:disabled {
    background: #f0f0f0;
    cursor: not-allowed;
  }
`;

const SendButton = styled(motion.button)`
  background: linear-gradient(135deg, #4dc7d9 0%, #66a6ff 100%);
  color: white;
  border: none;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  margin-left: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;

  &:disabled {
    background: #e0e0e0;
    cursor: not-allowed;
  }

  svg {
    width: 20px;
    height: 20px;
  }
`;

const OperatorConnecting = styled.div`
  align-self: flex-start;
  background: white;
  padding: 12px 16px;
  border-radius: 18px;
  border-bottom-left-radius: 4px;
  margin-top: 10px;
  box-shadow: 0 2px 5px rgba(0,0,0,0.05);
  display: flex;
  flex-direction: column;
  gap: 8px;

  p {
    margin: 0;
    font-size: 14px;
    color: #666;
  }

  .typing {
    display: flex;
    gap: 5px;
  }

  .dot {
    width: 8px;
    height: 8px;
    background: #66a6ff;
    border-radius: 50%;
    opacity: 0.8;
    animation: pulse 1.5s infinite;
  }

  .dot:nth-child(2) {
    animation-delay: 0.2s;
  }

  .dot:nth-child(3) {
    animation-delay: 0.4s;
  }

  @keyframes pulse {
    0%, 100% {
      opacity: 0.4;
    }
    50% {
      opacity: 1;
    }
  }
`;

export default ChatWindow; 