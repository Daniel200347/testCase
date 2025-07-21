import React from 'react';
import {library} from "@fortawesome/fontawesome-svg-core";
import {fas} from "@fortawesome/free-solid-svg-icons";
import Sidebar from "./components/Sidebar";

library.add(fas);

export default class App extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            theme: 'light',
        };
        this.toggleTheme = this.toggleTheme.bind(this);
    }

    componentDidMount() {
        document.body.className = this.state.theme;
    }

    componentDidUpdate(prevProps, prevState) {
        if (prevState.theme !== this.state.theme) {
            document.body.className = this.state.theme;
        }
    }

    toggleTheme() {
        this.setState(prevState => ({
            theme: prevState.theme === 'light' ? 'dark' : 'light',
        }));
    }

    render() {
        return (
            <Sidebar color={this.state.theme} onToggleTheme={this.toggleTheme}/>
        );
    }
}
