import React from 'react'

const IconFrame = ({title, src, alt, icon: Icon}) => {
  return (
      <div className='flex flex-col items-center justify-center gap-2 p-1 text-center cursor-pointer rounded transition-colors hover:bg-yellow-100 active:bg-yellow-200'>
        {Icon ? (
          <Icon className='w-3 h-3 text-gray-700' />
        ) : (
          <img src={src} alt={alt} className='w-6 h-6' />
        )}
        <p className='w-12 text-xs font-semibold text-gray-700'>{title}</p>
      </div>
  )
}

export default IconFrame

















