import React from 'react'

const DynamicContentRenderer = ({ data }) => {
  const renderItem = (item, index) => {
    if (typeof item === 'string') {
      return (
        <div key={index} className="text-item">
          <p>{item}</p>
        </div>
      )
    }

    if (Array.isArray(item)) {
      return (
        <div key={index} className="array-item">
          <h3>Mảng dữ liệu:</h3>
          <ul className="array-list">
            {item.map((subItem, subIndex) => (
              <li key={subIndex}>{JSON.stringify(subItem, null, 2)}</li>
            ))}
          </ul>
        </div>
      )
    }

    if (item && typeof item === 'object') {
      return (
        <div key={index} className="object-item">
          <div className="object-content">
            {item.url_image && (
              <div className="image-container">
                <img src={item.url_image} alt={item.title || 'Hình ảnh'} />
              </div>
            )}
            {item.title && <h3 className="object-title">{item.title}</h3>}
            <div className="object-details">
              <pre>{JSON.stringify(item, null, 2)}</pre>
            </div>
          </div>
        </div>
      )
    }

    return (
      <div key={index} className="unknown-item">
        Kiểu dữ liệu không xác định: {typeof item}
      </div>
    )
  }

  return (
    <div className="dynamic-content">
      {Array.isArray(data)
        ? data.map((item, index) => renderItem(item, index))
        : renderItem(data, 0)}
    </div>
  )
}

export default DynamicContentRenderer
