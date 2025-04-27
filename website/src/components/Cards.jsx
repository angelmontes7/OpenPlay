import React from 'react'
import CardItem from './CardItem'
import './Cards.css'

function Cards() {
  return (
    <div className='cards'>
        <h1>Play all different types of sports!</h1>
        <div className="cards__container">
            <div className="cards__wrapper">
            <ul className="cards__items">
                <CardItem 
                    src="images/soccer-1.jpg" 
                    text="Discover top soccer fields and kick off your next big match!" 
                    label="Soccer" 
                    path="/services" 
                />
                <CardItem 
                    src="images/basketball-1.jpg" 
                    text="Find the best courts near you and shoot your shot today!" 
                    label="Basketball" 
                    path="/services" 
                />
            </ul>
            <ul className="cards__items">
                <CardItem 
                    src="images/football-1.jpg" 
                    text="Hit the gridiron—find nearby football fields and start the game!" 
                    label="Football" 
                    path="/services" 
                />
                <CardItem 
                    src="images/tennis-1.jpg" 
                    text="Serve up some fun—book your next tennis match with ease!" 
                    label="Tennis" 
                    path="/services" 
                />
                <CardItem 
                    src="images/baseball-1.jpg" 
                    text="Step up to the plate—explore baseball fields around you!" 
                    label="Baseball" 
                    path="/services" 
                />
            </ul>
            </div>
        </div>
    </div>
  )
}

export default Cards