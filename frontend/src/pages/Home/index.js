import React, { useEffect, useState } from "react";
import API, { endpoints } from "../../API";
import "./HomeStyle.scss";

function Home() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await API.get(endpoints["post"], {
          params: { page: currentPage },
        });
        setData(result.data.results);
        setTotalPages(result.data.total_pages);
      } catch (err) {
        setError(err.message);
      }
    };

    fetchData();
  }, [currentPage]);

  const handlePageChange = (page) => {
    if (page > 0 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div>
      {/* Header */}
      <header className="header">
        <div className="header-logo">
          <img src="Logomotel.jpg" alt="Logo" />
          <span></span>
        </div>
        <nav className="header-nav">
          <a href="#" className="active">
            Phòng trọ
          </a>
          <a href="#">Nhà đất cho thuê</a>
          <a href="#">Tin tức</a>
          <a href="#">Thông Báo</a>
          <a href="#">Hỗ Trợ</a>
        </nav>
        <div className="header-icons">
          <button>❤</button>
          <button className="post-button">Đăng nhập</button>
          <button className="post-button">Đăng ký</button>
          <button className="post-button">Đăng tin</button>
        </div>
      </header>

      {/* Main Content */}
      <div className="content">
        <div className="container">
          <h2>Tất cả phòng trên toàn quốc</h2>
          {data && data.length > 0 ? (
            <div className="listings">
              {data.map((item) => (
                <div key={item.id} className="listing-card">
                  <img
                    src={item.images[0]?.url}
                    alt={item.title}
                    className="listing-image"
                  />
                  <div className="listing-details">
                    <h3>{item.title}</h3>
                    <p>{item.description}</p>
                    <p>Giá: {item.room.price} Triệu/Tháng</p>
                    <p>Diện tích: {item.room.area} m²</p>
                    <p>Loại phòng: {item.room.room_type}</p>
                    <p>Ngày đăng: {item.created_at}</p>
                    <p>
                      Địa chỉ: {item.room.district}, {item.room.city}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p>No listings available</p>
          )}

          {/* Pagination */}
          <div className="pagination">
            <button onClick={() => handlePageChange(currentPage - 1)}>
              Previous
            </button>
            <span>
              Page {currentPage} of {totalPages}
            </span>
            <button onClick={() => handlePageChange(currentPage + 1)}>
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;
