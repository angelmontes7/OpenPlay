import React from 'react';
import { Link } from 'react-router-dom';
import './Button.css'

const Styles = ['btn--primary', 'btn--outline']

const Sizes = ['btn--medium', 'btn--large'];

export const Button = ({children, type, onClick, buttonStyle, buttonSize}) => {
    const checkButtonStyle = Styles.includes(buttonStyle) ? buttonStyle : Styles[0]
    const checkButtonSize = Sizes.includes(buttonSize) ? buttonSize : Sizes[0]

    return (
        <Link to='/sign-up' className='btn-mobile'>
            <button className={`btn ${checkButtonStyle} ${checkButtonSize}`} onClick={onClick} type={type}>
                {children}
            </button>
        </Link>
    )
};