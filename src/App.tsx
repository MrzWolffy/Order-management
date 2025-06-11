import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <form>
        <input type="text" placeholder='Name product' name='search' className='search-box' />
      </form>
      <br />
      <div className="product-container"></div>
      <br />
      <form>
      <fieldset className='name-container'>
          <legend>Customer name</legend>
          <input type="text" placeholder='Name' />
          <input type="text" placeholder='SureName' />
        </fieldset>
      <fieldset className='address-container'>
          <legend>Address</legend>
          <input type="text" placeholder='Street' />
          <input type="text" placeholder='City' />
          <input type="text" placeholder='State/province/area' />
          <input type="text" placeholder='Zip code' />
        </fieldset>
        
      </form>
      <button>Confirm Order</button>
      <br />
      <div className="copy-wrapper">
<div className="text-copy-box">

      </div>
      <button>Copy Text</button>
      </div>
      
      <br />
      <br />
      {/* <button>Payment Success</button> */}
      <button>Clear</button>
    </>
  )
}

export default App
