import useContextPro from "../../hooks/useContextPro"

function Home() {

  const{state: { user}, logout} = useContextPro();
  return (
    <div>
      <h1 className="text-3xl font-bold underline">Welcome, {user?.username}!</h1>
      <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" onClick={logout}>Logout</button>
    </div>
  )
}

export default Home