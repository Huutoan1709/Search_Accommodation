import React, { useState } from 'react';
import axios from 'axios';
import { FaCommentDots, FaTimes, FaPaperPlane } from 'react-icons/fa';

const ChatBot = () => {
    const [question, setQuestion] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { 
            type: 'answer', 
            text: 'Xin chào! Tôi có thể giúp gì cho bạn?',
            timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
        }
    ]);

    const API_KEY = 'AIzaSyCBPja5XKspahQL_sh7nWDOEng2dEEwnVM';
    const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${API_KEY}`;

    const handleSubmit = async () => {
        if (!question.trim()) return;
        
        const newMessages = [...messages, { 
            type: 'question', 
            text: question,
            timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
        }];
        setMessages(newMessages);
        
        try {
            const response = await axios.post(API_URL, {
                contents: [{ parts: [{ text: question }] }],
            });
            const answer = response.data.candidates[0].content.parts[0].text;
            setMessages([...newMessages, { 
                type: 'answer', 
                text: answer,
                timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
            }]);
        } catch (error) {
            console.error('Error:', error);
            setMessages([...newMessages, { 
                type: 'answer', 
                text: 'Xin lỗi, đã có lỗi xảy ra!',
                timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
            }]);
        }
        setQuestion('');
    };

    const MessageBubble = ({ msg }) => (
        <div className={`flex w-full ${msg.type === 'question' ? 'justify-end' : 'justify-start'} mb-4`}>
            <div className="flex flex-col" style={{ maxWidth: '75%' }}>
                {msg.type === 'answer' && (
                    <div className="text-lg text-gray-500 mb-1 ml-2 font-bold">AI</div>
                )}
                <div
                    className={`relative p-3 rounded-[20px] shadow-sm
                        ${msg.type === 'question' 
                            ? 'bg-red-500 text-white border-2 border-red-200' 
                            : 'bg-gray-100 text-gray-800 border-2 border-gray-200'
                        }`}
                >
                    <div className="break-words whitespace-pre-wrap text-xl">
                        {msg.text}
                    </div>
                    <div className={`text-[10px] ${msg.type === 'question' ? 'text-red-200' : 'text-gray-500'} mt-1`}>
                        {msg.timestamp}
                    </div>
                </div>
                
            </div>
        </div>
    );

    return (
        <div className="fixed bottom-36 right-8 z-[9999]"> {/* Thay đổi bottom và z-index */}
            {!isOpen ? (
                <button
                    className="bg-red-500 p-4 rounded-full text-white shadow-lg hover:bg-red-600 transition-colors"
                    onClick={() => setIsOpen(true)}
                >
                    <FaCommentDots size={24} />
                </button>
            ) : (
                <div className="bg-white shadow-lg rounded-lg w-[380px] h-[450px] flex flex-col overflow-hidden border border-gray-300">
                    {/* Header */}
                    <div className="flex items-center justify-between bg-red-600 text-white p-3 h-[60px] flex-shrink-0 rounded-t-lg">
                        <h1 className="text-xl font-semibold">Chat Support</h1>
                        <button
                            className="hover:text-gray-200 transition"
                            onClick={() => setIsOpen(false)}    
                        >
                            <FaTimes size={20} />
                        </button>
                    </div>
                
                    {/* Messages container */}
                    <div className="flex-1 overflow-hidden"> {/* Add overflow-hidden */}
                        <div className="h-full overflow-y-auto px-4 py-2"> {/* Add h-full and change padding */}
                            {messages.map((msg, index) => (
                                <MessageBubble key={index} msg={msg} />
                            ))}
                        </div>
                    </div>
                
                    {/* Input container */}
                    <div className="border-t border-gray-200 p-3 bg-gray-100 rounded-b-lg">
                        <div className="flex items-center gap-2">
                            <input
                                type="text"
                                className="flex-1 p-2 border border-gray-300 rounded-lg focus:outline-none focus:border-red-500"
                                placeholder="Nhập câu hỏi của bạn..."
                                value={question}
                                onChange={(e) => setQuestion(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                            />
                            <button
                                className="bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors flex-shrink-0"
                                onClick={handleSubmit}
                            >
                                <FaPaperPlane />
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ChatBot;
