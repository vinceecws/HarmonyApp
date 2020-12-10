import React from 'react';
import { Link } from 'react-router-dom'
import { Dropdown, ButtonGroup, Image, Button } from 'react-bootstrap'
import { icon_profile_image } from '../graphics';
import { mainScreens } from '../const'

class AccountLink extends React.Component {

    handleLogOutAccount = () => {
        this.props.axiosWrapper.axiosGet('/auth/logout', (function(res, data) {
            if (data.success) {
                this.props.handleLogOut()
                this.props.history.push("/login")
            }
            
        }).bind(this), true)
    }

    render() {
        if (this.props.auth) {
            return (
                <Dropdown id="tab-component-account-link-container" as={ButtonGroup}>
                    <Button id="tab-component-account-link-button">
                        <div onClick={() => this.props.switchScreen(mainScreens.PROFILE, this.props.user._id)}>
                            <Image id="tab-component-account-link-image" src={this.props.user.image ? this.props.user.image : icon_profile_image} />
                        </div>
                    </Button>
                    <Dropdown.Toggle split id="tab-component-account-link-dropdown-button" />
                    <Dropdown.Menu id="tab-component-account-link-dropdown-menu">
                        <Dropdown.Item as={Button} onClick={() => this.props.switchScreen(mainScreens.PROFILE, this.props.user._id)}>
                            Profile
                        </Dropdown.Item>
                        <Dropdown.Item as={Button} onClick={() => this.props.switchScreen(mainScreens.SETTINGS)}>
                            Settings
                        </Dropdown.Item>
                        <Dropdown.Item as={Button} onClick={(e) => this.handleLogOutAccount(e)}>
                            Log Out
                        </Dropdown.Item>
                    </Dropdown.Menu>
                </Dropdown>
            )
        }
        else {
            return (
                <Link id="tab-component-login-button" className="subtitle color-accented" to="/login">Login/Sign-Up</Link>
            )
        }
    }

}

export default AccountLink;