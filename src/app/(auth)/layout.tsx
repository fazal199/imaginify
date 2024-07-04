import React from 'react'

type LayoutProps = {children : React.ReactNode}
const Layout = ({children} : LayoutProps) => {
  return (
    <div className='h-screen w-screen flex justify-center items-center'>
     {children}
    </div>
  )
}

export default Layout
