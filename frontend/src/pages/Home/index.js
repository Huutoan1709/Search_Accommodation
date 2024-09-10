import React, { useEffect, useState } from "react";
import axios from "axios";

function Home() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await axios("http://127.0.0.1:8000/post/");
        setData(result.data);
      } catch (err) {
        setError(err.message);
      }
    };

    fetchData();
  }, []);

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div>
      {data &&
        Array.isArray(data.results) &&
        data.results.map((item) => (
          <div key={item.id}>
            <p>ID: {item.id}</p>
            <p>Title: {item.title}</p>
            <p>Content: {item.content}</p>
            <p>User: {item.user}</p>
            <p>Created At: {item.created_at}</p>
            <p>Is Approved: {item.is_approved.toString()}</p>
            <p>Room:</p>
            <ul>
              <li>Price: {item.room.price}</li>
              <li>Ward: {item.room.ward}</li>
              <li>District: {item.room.district}</li>
              <li>City: {item.room.city}</li>
              <li>Other Address: {item.room.other_address}</li>
              <li>Area: {item.room.area}</li>
              <li>Landlord: {item.room.landlord}</li>
            </ul>
            <p>Images:</p>
            <ul>
              {item.images.map((image, index) => (
                <li key={index}>Image URL: {image.url}</li>
              ))}
            </ul>
          </div>
        ))}
    </div>
  );
}

export default Home;
