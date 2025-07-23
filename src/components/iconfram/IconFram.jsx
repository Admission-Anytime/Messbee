import React from 'react'
import './IconFram.scss'


const IconFrame = ({title,src,alt}) => {
  return (
   
      <div className='iconbox' >
      <img src={src} alt={alt} />
      <p>{title}</p>
    </div>
   
  )
}

export default IconFrame