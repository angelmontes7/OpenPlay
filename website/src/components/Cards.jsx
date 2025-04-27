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
                    <CardItem src="images/img-1.jpg" text="Explore different soccer fields near you!" label="Soccer" path='/services'/>

                </ul>
            </div>
        </div>
    </div>
  )
}

export default Cards