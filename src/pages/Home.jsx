import Header from '../components/Header/Header.jsx'
import { useState, useEffect} from 'react';


function Home({children}) {

  function hasCookieKey(key) {
    const cookies = document.cookie.split('; ');
    return cookies.some(cookie => cookie.startsWith(`${key}=`));
  }
  
  const [hasKey, setHasKey] = useState(false);
  
  useEffect(() => {
    const keyExists = hasCookieKey("accessToken");
    setHasKey(keyExists);
  }, []);
  
  return (
    <div>
     <Header/>
     <main>{children}</main>
    </div>
  )
}

export default Home
// component tell font render as html tag  .. for seo
// variant it looks like h1,h2... tag not for ender as h1 ... not for seo

//