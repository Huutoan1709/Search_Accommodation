import axios from 'axios';
import React from 'react';

// Get API key from environment variables
const API_KEY = process.env.REACT_APP_GEMINI_API_KEY;
if (!API_KEY) {
    console.error('Missing Gemini API key in environment variables');
}

const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;

// Hàm để làm sạch văn bản và loại bỏ emoji
const cleanText = (text) => {
    return text
        // Loại bỏ emoji và ký tự đặc biệt
        .replace(/[\u{1F300}-\u{1F9FF}]|[\u{2700}-\u{27BF}]|[\u{1F600}-\u{1F64F}]/gu, '')
        // Loại bỏ khoảng trắng thừa
        .replace(/\s+/g, ' ')
        // Loại bỏ khoảng trắng giữa các thẻ HTML
        .replace(/>\s+</g, '><')
        .trim();
};

/**
 * Generates content description for a room listing using Gemini
 * @param {Object} roomDetails - Details of the room
 * @param {Object} amenitiesMap - Map of amenity IDs to names
 * @returns {Promise<string>} Generated description
 */
const generateContent = async (roomDetails, amenitiesMap = {}) => {
    if (!roomDetails) {
        throw new Error('Room details are required');
    }

    try {
        const amenitiesString = roomDetails.amenities
            ?.map(id => amenitiesMap[id])
            .filter(Boolean)
            .join(', ');

        const prompt = `Là một chuyên gia bất động sản, hãy viết bài mô tả phòng theo yêu cầu sau:

Quy định format:
1. Chỉ sử dụng các thẻ HTML cơ bản: p, strong, ul, li
2. KHÔNG sử dụng emoji hoặc ký tự đặc biệt
3. Viết ngắn gọn, súc tích, dễ đọc
4. Tập trung vào các điểm nổi bật
5. Phần vị trí cần nhấn mạnh tiện ích xung quanh
6. Sử dụng các từ khóa thu hút như: "Cực kỳ", "Tuyệt vời", "Lý tưởng"

Thông tin phòng:
- Loại: ${roomDetails.room_type?.name}
- Địa chỉ: ${roomDetails.other_address}, ${roomDetails.ward}, ${roomDetails.district}, ${roomDetails.city}
- Giá: ${roomDetails.price} triệu/tháng
- Diện tích: ${roomDetails.area}m2
- Tiện nghi: ${amenitiesString}

Cấu trúc bài viết:
<p><strong>THÔNG TIN TỔNG QUAN</strong></p>
<ul><li>Thông tin cơ bản về phòng và giá</li></ul>

<p><strong>VỊ TRÍ THUẬN TIỆN</strong></p>
<ul><li>Vị trí và tiện ích xung quanh</li></ul>

<p><strong>TIỆN NGHI ĐẦY ĐỦ</strong></p>
<ul><li>Chi tiết các tiện nghi</li></ul>

<p><strong>ĐIỂM NỔI BẬT</strong></p>
<ul><li>3-4 ưu điểm quan trọng nhất</li></ul>

<p><strong>AN NINH & DỊCH VỤ</strong></p>
<ul><li>Thông tin về an ninh và các dịch vụ đi kèm</li></ul>

<p><strong>LIÊN HỆ NGAY</strong></p>
<p>Thông tin liên hệ và lời mời gọi xem phòng</p>`;

        const response = await axios.post(API_URL, {
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
                temperature: 0.7,
                maxOutputTokens: 800,
                topP: 0.8,
                topK: 40,
            }
        });

        let generatedContent = response.data.candidates[0].content.parts[0].text;
        
        // Làm sạch nội dung
        generatedContent = cleanText(generatedContent);
        
        // Bọc trong div đơn giản
        return `<div>${generatedContent}</div>`;

    } catch (error) {
        console.error('Error generating content:', error);
        throw new Error('Không thể tạo nội dung. Vui lòng thử lại sau.');
    }
};

export default generateContent;