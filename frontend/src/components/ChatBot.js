import React, { useState } from 'react';
import axios from 'axios';
import { FaCommentDots, FaTimes, FaPaperPlane } from 'react-icons/fa';

const ChatBot = () => {
    const [question, setquestion] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([{ type: 'answer', text: 'Xin chào! Tôi có thể giúp gì cho bạn?' }]);

    async function getAnswer() {
        if (!question.trim()) return;
        const newMessages = [...messages, { type: 'question', text: question }];
        setMessages(newMessages);
        try {
            const response = await axios.post(
                'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=AIzaSyDrtkuW3HZeIIIXF6UQxpkzL-KN_FGeAqg',
                {
                    contents: [{ parts: [{ text: question }] }],
                },
            );
            const answer = response.data.candidates[0].content.parts[0].text;
            setMessages([...newMessages, { type: 'answer', text: answer }]);
        } catch (error) {
            console.error('Error fetching answer:', error);
            setMessages([...newMessages, { type: 'answer', text: 'Error fetching answer' }]);
        }
        setquestion('');
    }

    const isTextLong = (text) => {
        return text.length > 80;
    };

    return (
        <div className="fixed bottom-40 right-8 z-50">
            {/* Chat Icon */}
            {!isOpen && (
                <button
                    className="bg-red-500 p-4 rounded-full text-white shadow-lg hover:bg-red-600 focus:outline-none"
                    onClick={() => setIsOpen(true)}
                >
                    <FaCommentDots size={24} />
                </button>
            )}
            {/* Chat Form */}
            {isOpen && (
                <div className="bg-white shadow-lg rounded-lg p-4 relative w-[300px] h-[400px] flex flex-col justify-between">
                    <div className="flex items-center justify-between border-b border-orange-300 pb-2">
                        <h1 className="text-red-600 text-[14px] font-semibold">Chat Support</h1>
                        <button
                            className="text-gray-500 hover:text-gray-700 focus:outline-none"
                            onClick={() => setIsOpen(false)}
                        >
                            <FaTimes size={20} />
                        </button>
                    </div>

                    {/* Chat Messages */}
                    <div className="mt-4 space-y-4 mb-4 max-h-[260px] overflow-y-auto flex-grow pr-2 scrollbar-hide">
                        {messages.map((msg, index) => (
                            <div
                                key={index}
                                className={`relative p-3 rounded-lg shadow-sm ${
                                    msg.type === 'question'
                                        ? 'bg-red-500 text-white text-right self-end'
                                        : 'bg-gray-100 text-gray-800 text-left self-start'
                                }`}
                                style={{
                                    display: 'inline-block',
                                    borderRadius: '20px',
                                    border: msg.type === 'question' ? '2px solid #ffcccb' : '2px solid #ccc',
                                    marginBottom: '15px',
                                    maxWidth: isTextLong(msg.text) ? '80%' : 'fit-content',
                                    padding: '10px',
                                    wordBreak: 'break-word',
                                    marginLeft: msg.type === 'question' ? 'auto' : '0',
                                    marginRight: msg.type === 'question' ? '0' : 'auto',
                                }}
                            >
                                <p className="m-0">{msg.text}</p>
                            </div>
                        ))}
                    </div>

                    {/* Input Area */}
                    <div className="flex items-center space-x-2 mt-2">
                        <input
                            type="text"
                            className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none"
                            placeholder="Enter your question..."
                            value={question}
                            onChange={(e) => setquestion(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && getAnswer()}
                        />
                        <button
                            className="bg-red-500 text-white p-2 rounded-full hover:bg-red-600 focus:outline-none"
                            onClick={getAnswer}
                        >
                            <FaPaperPlane />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ChatBot;
