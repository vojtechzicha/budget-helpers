import React, { Component } from 'react'
import { Router, Route, withRouter } from 'react-router-dom'

import ListScreen, { DefaultListScreen } from './components/list'
import BudgetScreen from './components/budget/BudgetScreen'
import Login from './components/Login'
import Auth from './Auth'
import history from './history'

const auth = new Auth()

const handleAuthentication = (nextState, replace) => {
  if (/access_token|id_token|error/.test(nextState.location.hash)) {
    auth.handleAuthentication()
  }
}

const Callback = () => <div>Loading...</div>

const ScrollToTop = withRouter(
  class extends Component {
    componentDidUpdate(prevProps) {
      if (this.props.location !== prevProps.location) {
        window.scrollTo(0, 0)
      }
    }

    render() {
      return this.props.children
    }
  }
)

class App extends Component {
  fetch = (component, action, options = {}, headers = {}) => {
    return fetch(`${process.env.REACT_APP_SERVER_URI}api/${component}/v1/${action}`, {
      ...options,
      headers: new Headers({
        ...headers,
        Authorization: `Bearer ${auth.getToken()}`
      })
    })
  }

  render() {
    return (
      <Router history={history}>
        <ScrollToTop>
          <div className="App">
            <Route exact path="/budget" render={props => (auth.isAuthenticated() ? <BudgetScreen {...props} /> : <Login auth={auth} />)} />
            <Route
              exact
              path="/item/:key"
              render={props => (auth.isAuthenticated() ? <ListScreen {...props} fetch={this.fetch} /> : <Login auth={auth} />)}
            />
            <Route
              exact
              path="/"
              render={props => (auth.isAuthenticated() ? <DefaultListScreen {...props} fetch={this.fetch} /> : <Login auth={auth} />)}
            />
            <Route
              exact
              path="/callback"
              render={props => {
                handleAuthentication(props)
                return <Callback {...props} />
              }}
            />
          </div>
        </ScrollToTop>
      </Router>
    )
  }
}

export default App
