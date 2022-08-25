import React from 'react';
import {Btn} from '../../components/Controls/Button/Button';
import History from '../../routes/History';
class Login extends React.Component {

    // this method is only to trigger route guards , remove and use your own logic
    handleLogin = () => {
        localStorage.setItem('token','token');
        History.push('/')
    }

    render(){
        return(
            <div className="container my-5">
                <h1>Login Page</h1>
                <Btn text='Login' handleClick={this.handleLogin}/>
            </div>
        )
    }
}


export default Login;