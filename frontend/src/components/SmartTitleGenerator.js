import axios from 'axios';

const API_KEY = process.env.REACT_APP_GEMINI_API_KEY;
if (!API_KEY) {
    console.error('Missing Gemini API key in environment variables');
}

const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;

/**
 * Generates an attractive title for a room listing using Gemini
 * @param {Object} roomDetails - Details of the room
 * @returns {Promise<string>} Generated title
 */
const generateTitle = async (roomDetails) => {
    if (!roomDetails) {
        throw new Error('Room details are required');
    }

    try {
        const prompt = `Là chuyên gia bất động sản, hãy tạo tiêu đề hấp dẫn cho phòng cho thuê với các yêu cầu::
Loại: ${roomDetails.room_type?.name}
Địa chỉ: ${roomDetails.district}, ${roomDetails.city}
Giá: ${roomDetails.price} triệu
Diện tích: ${roomDetails.area}m2

Yêu cầu:
- Độ dài tối đa 100 ký tự
- Format: Cho thuê [Loại phòng] [Diện tích]m2 [địa chỉ] - [Từ khóa hấp dẫn]
- Chỉ trả về duy nhất 1 tiêu đề
- Không thêm dấu ngoặc kép hay giải thích
- Sử dụng các từ khóa hấp dẫn như: "Cực kỳ", "Tuyệt vời", "Lý tưởng" , "Không chung chủ", "View đẹp","Thoáng mát"
- Đảm bảo SEO friendly
Ví dụ: "Cho thuê phòng trọ cao cấp 25m2 tại Quận 1, full nội thất, view đẹp"`;

        const response = await axios.post(API_URL, {
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
                temperature: 0.7, // Giảm độ ngẫu nhiên
                maxOutputTokens: 100, // Giới hạn độ dài output
                topP: 0.7,
                topK: 40,
            }
        });

        let title = response.data.candidates[0].content.parts[0].text;
        
        // Clean up the title
        title = title
            .replace(/["']/g, '')
            .replace(/\n/g, '')
            .replace(/^["']|["']$/g, '') // Xóa dấu ngoặc kép ở đầu và cuối
            .trim();

        return title;

    } catch (error) {
        console.error('Error generating title:', error);
        
        if (error.response?.status === 401) {
            throw new Error('API key không hợp lệ. Vui lòng kiểm tra lại.');
        }

        throw new Error('Không thể tạo tiêu đề. Vui lòng thử lại.');
    }
};

export default generateTitle;