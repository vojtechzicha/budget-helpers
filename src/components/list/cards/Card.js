import React from 'react'

const Card = ({ title, subtitle = null, border = null, children }) => (
  <div className={`card ${border !== null && `border-${border}`}`}>
    <div className="card-body">
      <h5 className="card-title">{title}</h5>
      {subtitle !== null && <h6 className="card-subtitle mb-2 text-muted">{subtitle}</h6>}
      {children}
    </div>
  </div>
)

export default Card
