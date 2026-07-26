function Card({titulo, valor}) {

return (

<div style={{
background:"#172033",
padding:"20px",
borderRadius:"15px",
flex:"1",
minWidth:"220px",
color:"white"
}}>

<h3>{titulo}</h3>

<h1>{valor}</h1>

</div>

)

}

export default Card;